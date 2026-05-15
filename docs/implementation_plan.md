# Plan Implementasi Aplikasi Scraping Data Instagram untuk Listing Property

## Overview
Implementasi akan menggunakan arsitektur full-stack dengan backend Python untuk scraping dan API, frontend React untuk UI responsif mobile-first, dan database SQLite/PostgreSQL.

## Teknologi Stack
- **Backend:** Python 3.9+, Flask (untuk API), SQLAlchemy (ORM), Instaloader (scraping IG).
- **Frontend:** React 18+, Tailwind CSS (mobile-first responsive), Axios (API calls).
- **Database:** SQLite (dev), PostgreSQL (prod) via SQLAlchemy.
- **Lainnya:** Docker (containerization), Git (version control), pytest (testing).

## Struktur Folder Proyek
```
/scrapper-home/
├── backend/
│   ├── app.py (Flask app)
│   ├── models.py (Database models)
│   ├── scraper.py (Scraping logic)
│   ├── routes.py (API endpoints)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ (Table, EditModal, Filter)
│   │   ├── pages/ (HomePage)
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── docs/ (dokumentasi)
├── Dockerfile
└── README.md
```

## Langkah Implementasi

### 1. Setup Environment (1 hari)
- Buat virtual environment Python dan install dependencies (Flask, SQLAlchemy, Instaloader, etc.).
- Setup React app dengan `npx create-react-app frontend`.
- Install Tailwind CSS di frontend.
- Buat Dockerfile untuk containerization.

### 2. Backend Development (1-2 minggu)
- **Database Setup:** Definisikan model `Property` di `models.py` dengan schema lengkap. Gunakan SQLAlchemy untuk migration.
- **Scraping Module (`scraper.py`):** 
  - Fungsi untuk login IG (jika perlu) dan fetch posting dari akun target.
  - Parse caption menggunakan regex untuk ekstrak field (harga, lokasi, dll.).
  - Filter berdasarkan agen (cari pola nama agen).
  - Simpan ke DB.
- **API Routes (`routes.py`):** 
  - GET /properties: Fetch data dengan filter agen.
  - PUT /properties/<id>: Update field editable.
  - POST /scrape: Trigger scraping manual.
- **App.py:** Integrasi semua komponen, CORS untuk frontend.

### 3. Frontend Development (1 minggu)
- **Komponen Utama:**
  - `PropertyTable`: Tabel responsif (gunakan table untuk desktop, cards untuk mobile).
  - `FilterDropdown`: Dropdown untuk pilih agen.
  - `EditModal`: Modal dengan form untuk edit field (address, land_area, dll.).
- **Mobile-First Design:** 
  - Gunakan Tailwind breakpoints (sm:, md:, lg:) untuk responsivitas.
  - Pada mobile: Tabel menjadi list cards dengan scroll horizontal untuk kolom banyak.
- **Integrasi API:** Fetch data on load, handle edit via PUT request.

### 4. Testing dan Integration (3-5 hari)
- Unit tests: Test scraper parsing, API endpoints.
- Integration: End-to-end test scraping → DB → UI.
- Manual testing: Validasi edit dan filter pada mobile/desktop.

### 5. Deployment (2-3 hari)
- Build Docker image.
- Deploy backend ke Heroku/VPS, frontend ke Netlify/Vercel.
- Setup CI/CD dengan GitHub Actions.

## Risiko dan Mitigasi
- Scraping IG: Gunakan proxy dan delay untuk hindari ban; monitor logs.
- Parsing Error: Fallback ke manual edit jika parsing gagal.
- Performance: Paginate data di API untuk tabel besar.

## Timeline Detail
- Minggu 1: Setup dan Backend MVP (scraper + DB).
- Minggu 2: Frontend UI dan integrasi.
- Minggu 3: Testing, polish, deployment.

## Progress Update

- [In progress] Project scaffold created for backend (Flask app, models, routes, scraper stub, requirements).
- Next: Implement parsing logic in `scraper.py` and add unit tests for parsing and API endpoints.

Files added:
- backend/app.py
- backend/models.py
- backend/routes.py
- backend/scraper.py (stub)
- backend/requirements.txt
- backend/README.md

## Progress Update

### Backend Implementation
- [x] Project scaffold created: Flask app, models, routes, scraper stub
- [x] SQLAlchemy models for Property table with all fields
- [x] API endpoints: GET /properties (with agent filter), PUT /properties/<id>, POST /scrape
- [x] Scraper parsing module with regex patterns for price, location, land area, year built, documents
- [x] Unit tests for caption parsing (verified passing)
- [x] Integration tests using Flask test client (requires dependency install to run locally)

Files:
- backend/app.py, backend/models.py, backend/routes.py, backend/scraper.py
- backend/tests/test_scraper.py, backend/tests/test_api.py
- backend/requirements.txt, backend/README.md

### Frontend Implementation (React + Tailwind CSS)
- [x] React 18 setup with Parcel bundler
- [x] Tailwind CSS 3 configured for mobile-first responsive design
- [x] Components:
  - **Navbar**: Sticky header with branding
  - **FilterSection**: Agent dropdown + Refresh button (responsive layout)
  - **PropertyCard**: Mobile expandable details, desktop grid layout with hover effects
  - **EditModal**: Full-screen on mobile (slide-up), centered on desktop with 8 editable fields
  - **LoadingSpinner**: Spinner with label
  - **ErrorBanner**: Fixed error messages with dismiss
- [x] App.js with full state management:
  - Fetch properties on mount and filter change
  - Extract agents dynamically from data
  - Error handling with user feedback
  - Loading states across all async operations
- [x] Mobile-first CSS using Tailwind breakpoints (sm:, md:, lg:)

Files:
- frontend/package.json (updated with Tailwind), tailwind.config.js, postcss.config.js
- frontend/src/index.css (Tailwind imports)
- frontend/src/App.js, frontend/src/index.js, frontend/src/index.html
- frontend/src/components/: Navbar.jsx, FilterSection.jsx, PropertyCard.jsx, EditModal.jsx, LoadingSpinner.jsx, ErrorBanner.jsx
- frontend/README.md

### Next Steps for Deployment
- [ ] Docker containerization (Dockerfile for backend and frontend)
- [ ] Environment variables (.env) for API_BASE URLs
- [ ] CI/CD pipeline (GitHub Actions) for automated tests and deployment
- [ ] Cloud deployment (Heroku, Vercel, or similar)