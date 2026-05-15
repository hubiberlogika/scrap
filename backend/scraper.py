"""Scraper module using instagrapi for Instagram data extraction.

Uses the Instagram private mobile API (simulates Android app),
which is far more reliable than the deprecated GraphQL endpoints.

Authentication priority:
  1. IG_SESSION_ID  - browser session cookie (recommended)
  2. IG_USERNAME + IG_PASSWORD - direct login
"""

import logging
import os
import re
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import unquote

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

try:
    from instagrapi import Client as InstagrapiClient
    from instagrapi.exceptions import LoginRequired, UserNotFound, PrivateAccount
except Exception:
    InstagrapiClient = None
    LoginRequired = Exception
    UserNotFound = Exception
    PrivateAccount = Exception


# ---------------------------------------------------------------------------
# Caption parser
# ---------------------------------------------------------------------------

def parse_caption(caption: str) -> Dict[str, Optional[str]]:
    if not caption:
        return {}

    # ---- Title: baris pertama caption ----
    lines = caption.strip().split('\n')
    title = lines[0].strip().lstrip('🏡🏠🏘✨💎🌟⭐').strip() if lines else None

    # ---- Harga ----
    price = None
    price_re = re.compile(
        r'(?:harga|best deal|only)[^\d]*([\d.,]+\s*(?:M|Jt|Juta|Milyar|Miliar|rb|ribu)(?:\s*\(Nego\))?)',
        re.IGNORECASE
    )
    m = price_re.search(caption)
    if not m:
        # Fallback: angka standalone seperti "4,8 M"
        m = re.search(r'(\d+[.,]\d*\s*(?:M|Jt|Juta|Milyar)(?:\s*\(Nego\))?)', caption, re.IGNORECASE)
    if m:
        price = m.group(1).strip()

    # ---- Luas Tanah ----
    land_area = None
    m = re.search(r'Luas\s+Tanah\s*[:\s]+(\d+[\s]*m2?)', caption, re.IGNORECASE)
    if m:
        land_area = m.group(1).strip()

    # ---- Luas Bangunan ----
    building_area = None
    m = re.search(r'Luas\s+Bangunan\s*[:\s]+(\d+[\s]*m2?)', caption, re.IGNORECASE)
    if m:
        building_area = m.group(1).strip()

    # ---- Kamar Tidur ----
    bedrooms = None
    m = re.search(r'Kamar\s+Tidur\s*[:\s]+([^\n,•\|]+)', caption, re.IGNORECASE)
    if m:
        bedrooms = m.group(1).strip()

    # ---- Kamar Mandi ----
    bathrooms = None
    m = re.search(r'Kamar\s+Mandi\s*[:\s]+([^\n,•\|]+)', caption, re.IGNORECASE)
    if m:
        bathrooms = m.group(1).strip()

    # ---- Lantai ----
    floors = None
    m = re.search(r'(\d+)\s+Lantai', caption, re.IGNORECASE)
    if m:
        floors = m.group(1) + ' Lantai'

    # ---- Listrik ----
    electricity = None
    m = re.search(r'Listrik\s*[:\s]*([\d.,]+\s*(?:VA|W|Watt|KW)?)', caption, re.IGNORECASE)
    if m:
        electricity = m.group(1).strip()

    # ---- Sumber Air ----
    water_source = None
    water_re = re.compile(r'(Air\s+(?:PDAM|PAM|Tanah|Sumur|Bersih)[^,\n]*)', re.IGNORECASE)
    wm = water_re.findall(caption)
    if wm:
        water_source = ', '.join(set(w.strip() for w in wm))

    # ---- Dokumen ----
    documents = None
    m = re.search(r'\b(SHM|AJB|IMB|HGB|SHGB)(?:\s+On\s+Hand)?\b', caption, re.IGNORECASE)
    if m:
        documents = m.group(0).upper()

    # ---- Lokasi ----
    location = None
    loc_patterns = [
        r'(?:Lokasi|Cluster|di)\s*[:\-]?\s*([A-Z][^\n,•\|]{3,50})',
        r'di\s+(BSD|Serpong|Tangerang|Gading|Alam\s+Sutera|Bintaro|Cireunde|Regensi[^,\n]+)',
    ]
    for pat in loc_patterns:
        lm = re.search(pat, caption, re.IGNORECASE)
        if lm:
            location = lm.group(1).strip()
            break

    # ---- Tipe Properti ----
    prop_type = 'Rumah'  # default untuk property0ne
    if re.search(r'\b(apartemen|apartment|apt)\b', caption, re.IGNORECASE):
        prop_type = 'Apartemen'
    elif re.search(r'\b(ruko|shophouse)\b', caption, re.IGNORECASE):
        prop_type = 'Ruko'
    elif re.search(r'\b(kavling|tanah|lahan)\b', caption, re.IGNORECASE):
        prop_type = 'Kavling/Tanah'

    # ---- Nama & No. HP Agen ----
    agent_phone = None
    agent_name_parsed = None
    
    # Mencari pola seperti: ▫️Galuh (0811‑1130‑582) atau • Yuni (0811...)
    # Tangkap apapun di dalam kurung asalkan mengandung setidaknya 8 karakter angka/hyphen
    pm = re.search(r'(?:▫️|•|\*|-)?\s*([A-Za-z\s]+?)\s*\(([\d\s\-\+‑\u202a\u202c]{8,})\)', caption)
    if pm:
        name_candidate = pm.group(1).strip()
        if len(name_candidate.split()) <= 3 and name_candidate.lower() not in ['hubungi', 'call', 'wa', 'm', 'juta', 'jt']:
            agent_name_parsed = name_candidate
            
        # Bersihkan nomor HP dari karakter unicode tak terlihat
        raw_phone = pm.group(2)
        clean_phone = re.sub(r'[^\d\+\-]', '', raw_phone)
        agent_phone = clean_phone

    return {
        'title': title,
        'price': price,
        'location': location,
        'land_area': land_area,
        'building_area': building_area,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'floors': floors,
        'electricity': electricity,
        'water_source': water_source,
        'documents': documents,
        'property_type': prop_type,
        'agent_phone': agent_phone,
        'agent_name_parsed': agent_name_parsed,
        'description': caption,
    }



# ---------------------------------------------------------------------------
# Username normaliser
# ---------------------------------------------------------------------------

def normalize_username(raw_username: str) -> str:
    raw = (raw_username or '').strip()
    if raw.startswith('test:'):
        return raw
    raw = raw.lstrip('@')
    raw = re.sub(r'^https?://(?:www\.)?instagram\.com/', '', raw, flags=re.IGNORECASE)
    raw = raw.split('/')[0]
    return raw  # preserve original case — Instagram handles it internally


# ---------------------------------------------------------------------------
# Client factory
# ---------------------------------------------------------------------------

_cached_client: Optional[object] = None


def get_client() -> object:
    """Return a logged-in instagrapi Client (cached for re-use)."""
    global _cached_client
    if _cached_client is not None:
        return _cached_client

    if InstagrapiClient is None:
        raise RuntimeError('instagrapi is not installed. Run: pip install instagrapi')

    cl = InstagrapiClient()
    cl.delay_range = [1, 3]  # polite random delay between requests

    session_id_raw = os.getenv('IG_SESSION_ID', '')
    ig_user = os.getenv('IG_USERNAME', '')
    ig_pass = os.getenv('IG_PASSWORD', '')
    is_placeholder_user = ig_user in ('', 'your_instagram_username')
    is_placeholder_pass = ig_pass in ('', 'your_instagram_password')

    session_id = unquote(session_id_raw) if session_id_raw else ''
    is_placeholder_session = session_id in ('', 'your_session_id_here')

    # -- Method 1: session cookie --
    if not is_placeholder_session:
        try:
            cl.login_by_sessionid(session_id)
            logger.info('instagrapi: logged in via session ID')
            _cached_client = cl
            return cl
        except Exception as e:
            logger.warning('instagrapi session login failed: %s. Trying password.', e)
            _cached_client = None
            cl = InstagrapiClient()
            cl.delay_range = [1, 3]

    # -- Method 2: username + password --
    if not is_placeholder_user and not is_placeholder_pass:
        session_file = f'.instagrapi_session_{ig_user}.json'
        try:
            if os.path.exists(session_file):
                cl.load_settings(session_file)
                cl.login(ig_user, ig_pass)
                logger.info('instagrapi: reused saved session for %s', ig_user)
            else:
                cl.login(ig_user, ig_pass)
                cl.dump_settings(session_file)
                logger.info('instagrapi: logged in as %s and saved session', ig_user)
            _cached_client = cl
            return cl
        except Exception as e:
            logger.warning('instagrapi password login failed: %s', e)
            _cached_client = None

    raise RuntimeError(
        'Tidak ada kredensial Instagram yang valid. '
        'Set IG_SESSION_ID atau IG_USERNAME+IG_PASSWORD di backend/.env'
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def verify_accounts(account_usernames: List[str]) -> Dict[str, List[Dict]]:
    """Verify that Instagram usernames exist without saving data."""
    normalized = [normalize_username(u) for u in account_usernames]
    results: Dict[str, List[Dict]] = {'verified': [], 'failed': []}

    # Handle test: entries immediately
    real_names = []
    for name in normalized:
        if name.startswith('test:'):
            results['verified'].append({'username': name, 'full_name': 'Test Account', 'is_private': False})
        else:
            real_names.append(name)

    if not real_names:
        return results

    cl = get_client()

    for username in real_names:
        if not username:
            results['failed'].append({'username': username, 'error': 'invalid username'})
            continue
        try:
            user = cl.user_info_by_username(username)
            results['verified'].append({
                'username': user.username,
                'full_name': user.full_name or username,
                'is_private': user.is_private,
            })
        except UserNotFound:
            results['failed'].append({'username': username, 'error': f'Profile {username} does not exist.'})
        except PrivateAccount:
            results['failed'].append({'username': username, 'error': 'Account is private.'})
        except Exception as e:
            logger.warning('Verification failed for %s: %s', username, e)
            results['failed'].append({'username': username, 'error': str(e)})

    return results


def scrape_accounts(account_usernames: List[str], limit: int = 20) -> List[Dict]:
    """Scrape recent posts for each account using instagrapi."""
    logger.info('scrape_accounts called: %s (limit=%s)', account_usernames, limit)
    results: List[Dict] = []

    normalized = [normalize_username(u) for u in account_usernames]

    # -- Test entries --
    for username in normalized:
        if username.startswith('test:'):
            sample_caption = username.split(':', 1)[1]
            parsed = parse_caption(sample_caption)
            parsed.update({
                'agent_name': 'Test Agent',
                'post_url': f'https://instagram.com/test',
                'scraped_at': datetime.utcnow(),
            })
            results.append(parsed)

    real_names = [u for u in normalized if not u.startswith('test:')]
    if not real_names:
        return results

    cl = get_client()

    for username in real_names:
        try:
            user = cl.user_info_by_username(username)
            if user.is_private:
                logger.warning('%s is private — skipping.', username)
                continue

            medias = cl.user_medias(user.pk, amount=limit)
            for media in medias:
                caption = media.caption_text or ''
                parsed = parse_caption(caption)
                
                # Gunakan nama agen spesifik dari caption jika ada (misal "Galuh" atau "Yuni")
                # Jika tidak ada, fallback ke username IG target
                final_agent_name = parsed.pop('agent_name_parsed', None)
                if not final_agent_name:
                    final_agent_name = f"@{username} ({user.full_name})" if user.full_name else f"@{username}"
                    
                parsed.update({
                    'agent_name': final_agent_name,
                    'post_url': f'https://www.instagram.com/p/{media.code}/',
                    'scraped_at': media.taken_at or datetime.utcnow(),
                })
                results.append(parsed)
            logger.info('Scraped %d posts from %s', len(medias), username)
        except Exception as e:
            logger.exception('Failed scraping %s: %s', username, e)

    return results
