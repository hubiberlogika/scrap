# Aplikasi Scrapper Home - Quick Start

Aplikasi sudah berjalan di localhost dengan struktur full-stack:

## URLs

- **Frontend (React):** http://localhost:1234
- **Backend API (Flask):** http://localhost:5000
- **API Endpoints:**
  - GET /properties - Fetch properties (filter by ?agent=<name>)
  - PUT /properties/<id> - Update property fields
  - POST /scrape - Trigger scraping from Instagram accounts

## Fitur Aplikasi

### Backend
- Database SQLite dengan tabel `properties` (id, title, price, location, address, land_area, building_condition, documents, property_type, year_built, description, agent_name, post_url, scraped_at)
- Parser caption Instagram dengan regex untuk ekstrak: harga, lokasi, luas tanah, tahun bangun, dokumen
- API CORS-enabled untuk frontend

### Frontend (React + Tailwind CSS)
- **Mobile-First Design:** Responsive untuk smartphone (320px), tablet (768px), desktop (1024px+)
- **Komponen:**
  - PropertyCard: Expandable details pada mobile, grid layout di desktop
  - EditModal: Slide-up modal di mobile, centered di desktop
  - FilterSection: Dynamic agent dropdown (auto-extract dari data)
  - Navbar: Sticky header dengan branding
  - Error handling + loading states

## Data Testing (Local)

Untuk test scraping tanpa Instagram account, gunakan prefix "test:" di POST /scrape:

```bash
curl -X POST http://localhost:5000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "accounts": ["test:Rumah Minimalis di Jakarta. Harga 750jt. Luas 200 m2. SHM."]
  }'
```

Ini akan membuat property baru yang bisa diedit dan difilter di frontend.

## Next Steps (Opsional)

1. **Instagram Scraping Real:** 
   - Integrasikan Instaloader di `backend/scraper.py`
   - Handle Instagram TOS dan rate limiting
   - Setup proxy untuk batch scraping

2. **Deployment:**
   - Docker containerization
   - Cloud hosting (Heroku, AWS, Vercel)
   - Database PostgreSQL di production

3. **Enhancement:**
   - Pagination untuk tabel besar
   - Export ke CSV/Excel
   - Notifikasi real-time dengan WebSockets
   - Authentication & role-based access
