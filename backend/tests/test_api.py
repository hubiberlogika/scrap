from app import create_app
from models import db, Property


def test_scrape_and_update():
    app = create_app()
    client = app.test_client()

    # Ensure DB is empty
    with app.app_context():
        db.session.query(Property).delete()
        db.session.commit()

    # Trigger scrape with a test caption via special username 'test:' prefix
    caption = 'Rumah Minimalis di Bandung. Harga 750jt. Luas 150 m2. SHM.'
    res = client.post('/scrape', json={'accounts': [f'test:{caption}']})
    assert res.status_code == 200
    data = res.get_json()
    assert data['count'] == 1

    # Fetch properties
    res = client.get('/properties')
    assert res.status_code == 200
    props = res.get_json()
    assert len(props) >= 1
    prop = props[0]

    # Update property via PUT
    update_payload = {'address': 'Jl. Cempaka No.1', 'land_area': '150 m2'}
    res = client.put(f"/properties/{prop['id']}", json=update_payload)
    assert res.status_code == 200
    updated = res.get_json()
    assert updated['address'] == 'Jl. Cempaka No.1'
    assert '150' in (updated.get('land_area') or '')


if __name__ == '__main__':
    try:
        test_scrape_and_update()
        print('INTEGRATION TESTS PASSED')
    except AssertionError as e:
        print('INTEGRATION TESTS FAILED:', e)
    except Exception as e:
        print('ERROR RUNNING INTEGRATION TESTS:', e)
