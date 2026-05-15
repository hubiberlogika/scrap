Backend (Flask) for Scrapper Home

Quick start:

1. Create virtualenv and install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the app

```bash
python app.py
```

Notes:
- `scraper.py` is currently a stub. Implement actual scraping logic with care.
- Database is SQLite `properties.db` by default.

Integration tests (quick):

1. Ensure dependencies are installed (see setup above).

```bash
cd backend
source .venv/bin/activate
python -m tests.test_api
```

This will run a simple test using Flask's test client to exercise `/scrape`, `/properties`, and `/properties/<id>` endpoints.
