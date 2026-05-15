from flask import Blueprint, jsonify, request, abort
from models import db, Property, Agent, ScrapeLog, ScrapeJob
from datetime import datetime
import scraper as scraper_module
from sqlalchemy import func
import threading

bp = Blueprint('api', __name__)


# ─── DASHBOARD ────────────────────────────────────────────────────────────────
@bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    total_properties = Property.query.count()
    total_agents = Agent.query.count()
    recent_properties = Property.query.order_by(Property.scraped_at.desc()).limit(5).all()
    return jsonify({
        'total_properties': total_properties,
        'total_agents': total_agents,
        'recent_properties': [p.to_dict() for p in recent_properties],
    })


# ─── PROPERTIES ───────────────────────────────────────────────────────────────
@bp.route('/properties', methods=['GET'])
def get_properties():
    agent = request.args.get('agent')
    search = request.args.get('search', '').lower()
    q = Property.query
    if agent:
        q = q.filter(Property.agent_name == agent)
    if search:
        q = q.filter(Property.title.ilike(f'%{search}%') | Property.location.ilike(f'%{search}%'))
    props = q.order_by(Property.scraped_at.desc()).all()
    return jsonify([p.to_dict() for p in props])


@bp.route('/properties/<int:prop_id>', methods=['PUT'])
def update_property(prop_id):
    prop = Property.query.get(prop_id)
    if not prop:
        abort(404)
    data = request.json or {}
    editable = ['address', 'land_area', 'building_condition', 'documents', 'property_type', 'year_built', 'description']
    for key in editable:
        if key in data:
            setattr(prop, key, data[key])
    db.session.commit()
    return jsonify(prop.to_dict())


@bp.route('/properties/<int:prop_id>', methods=['DELETE'])
def delete_property(prop_id):
    prop = Property.query.get(prop_id)
    if not prop:
        abort(404)
    db.session.delete(prop)
    db.session.commit()
    return jsonify({'deleted': True})


@bp.route('/properties/all', methods=['DELETE'])
def delete_all_properties():
    count = Property.query.delete()
    db.session.commit()
    return jsonify({'deleted': count})


# ─── AGENTS ───────────────────────────────────────────────────────────────────
@bp.route('/agents', methods=['GET'])
def get_agents():
    agents = Agent.query.all()
    return jsonify([a.to_dict() for a in agents])


@bp.route('/agents', methods=['POST'])
def create_agent():
    data = request.json or {}
    name = data.get('name')
    if not name:
        abort(400, 'name is required')
    agent = Agent(
        name=name,
        instagram_handle=data.get('instagram_handle'),
        email=data.get('email'),
        phone=data.get('phone'),
    )
    db.session.add(agent)
    db.session.commit()
    return jsonify(agent.to_dict())


@bp.route('/agents/<int:agent_id>', methods=['PUT'])
def update_agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        abort(404)
    data = request.json or {}
    if 'name' in data:
        agent.name = data['name']
    if 'instagram_handle' in data:
        agent.instagram_handle = data['instagram_handle']
    if 'email' in data:
        agent.email = data['email']
    if 'phone' in data:
        agent.phone = data['phone']
    db.session.commit()
    return jsonify(agent.to_dict())


@bp.route('/agents/<int:agent_id>', methods=['DELETE'])
def delete_agent(agent_id):
    agent = Agent.query.get(agent_id)
    if not agent:
        abort(404)
    db.session.delete(agent)
    db.session.commit()
    return jsonify({'deleted': True})


# ─── SCRAPE QUEUE ─────────────────────────────────────────────────────────────
def _run_scrape_job(job_id: int, app):
    """Worker function that runs in a background thread."""
    with app.app_context():
        job = ScrapeJob.query.get(job_id)
        if not job:
            return

        # Mark as running
        job.status = 'running'
        job.updated_at = datetime.utcnow()
        db.session.commit()

        try:
            results = scraper_module.scrape_accounts([job.username], limit=job.limit)
            saved = 0

            for item in results:
                p = Property(
                    title=item.get('title'),
                    price=item.get('price'),
                    location=item.get('location'),
                    land_area=item.get('land_area'),
                    building_area=item.get('building_area'),
                    bedrooms=item.get('bedrooms'),
                    bathrooms=item.get('bathrooms'),
                    floors=item.get('floors'),
                    electricity=item.get('electricity'),
                    water_source=item.get('water_source'),
                    documents=item.get('documents'),
                    property_type=item.get('property_type'),
                    agent_phone=item.get('agent_phone'),
                    agent_name=item.get('agent_name'),
                    post_url=item.get('post_url'),
                    description=item.get('description'),
                    scraped_at=item.get('scraped_at') or datetime.utcnow(),
                )
                db.session.add(p)
                saved += 1

            db.session.commit()

            job.status = 'done'
            job.total_found = len(results)
            job.total_saved = saved
            job.message = f'Berhasil menyimpan {saved} listing dari @{job.username}'
            job.updated_at = datetime.utcnow()
            db.session.commit()

            # Also log to ScrapeLog
            log = ScrapeLog(
                accounts_scraped=job.username,
                properties_found=saved,
                status='success',
            )
            db.session.add(log)
            db.session.commit()

        except Exception as e:
            job.status = 'error'
            job.message = str(e)
            job.updated_at = datetime.utcnow()
            db.session.commit()


@bp.route('/scrape/queue', methods=['POST'])
def enqueue_scrape():
    """Add a new scrape job to the queue and return immediately."""
    from flask import current_app
    body = request.json or {}
    accounts = body.get('accounts') or []
    limit = int(body.get('limit', 10))

    if not isinstance(accounts, list) or len(accounts) == 0:
        return jsonify({'error': 'accounts harus berupa list yang tidak kosong'}), 400

    jobs = []
    for username in accounts:
        username = username.strip()
        if not username:
            continue
        job = ScrapeJob(username=username, limit=limit, status='pending')
        db.session.add(job)
        db.session.flush()  # get the ID without full commit

        app = current_app._get_current_object()
        t = threading.Thread(target=_run_scrape_job, args=(job.id, app), daemon=True)
        t.start()
        jobs.append(job)

    db.session.commit()
    return jsonify({
        'queued': len(jobs),
        'jobs': [j.to_dict() for j in jobs],
    })


@bp.route('/scrape/jobs', methods=['GET'])
def get_jobs():
    """Get all scrape jobs, latest first."""
    jobs = ScrapeJob.query.order_by(ScrapeJob.created_at.desc()).limit(50).all()
    return jsonify([j.to_dict() for j in jobs])


@bp.route('/scrape/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Poll the status of a single job."""
    job = ScrapeJob.query.get(job_id)
    if not job:
        abort(404)
    return jsonify(job.to_dict())


@bp.route('/scrape/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = ScrapeJob.query.get(job_id)
    if not job:
        abort(404)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'deleted': True})


# ─── LEGACY SYNC SCRAPE (kept for backward compat) ────────────────────────────
@bp.route('/scrape', methods=['POST'])
def trigger_scrape():
    """Legacy sync endpoint — redirects to queue."""
    return enqueue_scrape()


@bp.route('/scrape/verify', methods=['POST'])
def verify_scrape():
    body = request.json or {}
    accounts = body.get('accounts') or []
    if not isinstance(accounts, list):
        return jsonify({'error': 'accounts should be a list of usernames'}), 400
    try:
        results = scraper_module.verify_accounts(accounts)
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/scrape-logs', methods=['GET'])
def get_scrape_logs():
    logs = ScrapeLog.query.order_by(ScrapeLog.scraped_at.desc()).all()
    return jsonify([l.to_dict() for l in logs])
