# Plan Pengembangan Aplikasi Scraping Data Instagram untuk Listing Property

## Tujuan Aplikasi
Aplikasi ini akan mengambil data posting listing penjualan property dari akun Instagram agen property tertentu, memfilter berdasarkan agen, dan menyajikan data dalam tabel listing yang mudah dibaca. Fokus pada ekstraksi informasi seperti harga, lokasi, deskripsi, dan detail properti lainnya dari posting.

## Tantangan Utama
- **Keterbatasan Instagram:** API resmi Instagram terbatas untuk akun bisnis; scraping unofficial dapat melanggar Terms of Service (TOS). Gunakan library seperti Instaloader atau Selenium dengan hati-hati, dan pertimbangkan alternatif seperti API resmi jika memungkinkan.
- **Keamanan dan Etika:** Pastikan scraping tidak berlebihan (rate limiting) dan patuhi hukum privasi data.
- **Parsing Data:** Posting IG sering berupa gambar/teks; perlu OCR atau NLP untuk ekstrak informasi terstruktur dari caption dan gambar.
- **Filter Agen:** Identifikasi posting berdasarkan tag agen atau pola tertentu dalam caption.

## Fase Pengembangan
1. **Fase 1: Research dan Setup (1-2 minggu)**
   - Analisis struktur posting IG agen property (contoh: format caption dengan harga, lokasi, dll.).
   - Pilih library scraping: Instaloader (untuk metadata), Selenium (untuk browser automation), atau BeautifulSoup untuk parsing HTML.
   - Setup environment: Python 3.8+, virtual environment, dependencies (requests, pandas, etc.).
   - Evaluasi risiko legal dan alternatif (misalnya, integrasi dengan API IG jika agen memiliki akun bisnis).

2. **Fase 2: Development Backend (2-3 minggu)**
   - Implementasi scraper: Login ke IG (jika perlu), ambil posting dari akun target, ekstrak data (caption, gambar, timestamp).
   - Parsing data: Gunakan regex/NLP untuk ekstrak field seperti harga, lokasi, tipe properti.
   - Filter berdasarkan agen: Cari pola dalam caption (misalnya, nama agen atau hashtag).
   - Simpan ke database: Struktur data untuk penyimpanan sementara atau persistent.

3. **Fase 3: Development Frontend dan Integrasi (1-2 minggu)**
   - Buat UI tabel listing: Tampilkan data dalam tabel dengan kolom (harga, lokasi, deskripsi, agen).
   - Tambahkan filter: Dropdown untuk pilih agen tertentu.
   - Integrasi backend-frontend: API untuk fetch data dari database.

4. **Fase 4: Testing dan Deployment (1 minggu)**
   - Unit testing: Test scraper pada akun dummy, validasi parsing.
   - Integration testing: End-to-end flow dari scraping ke tabel.
   - Deployment: Host di server lokal/cloud (misalnya, Heroku atau VPS), dengan monitoring untuk rate limits.
   - Dokumentasi: README dengan setup dan penggunaan.

## Teknologi yang Digunakan
- **Backend:** Python (Flask/Django) untuk scraper dan API.
- **Scraping:** Instaloader atau Selenium untuk akses IG.
- **Database:** SQLite untuk development, PostgreSQL untuk production (schema sederhana: tabel properties dengan field id, title, price, location, description, agent_id).
- **Frontend:** React atau HTML/CSS/JS sederhana untuk tabel.
- **Lainnya:** Pandas untuk data processing, OCR (Tesseract) jika perlu ekstrak dari gambar.

## Timeline Estimasi
- Total: 5-8 minggu, tergantung kompleksitas parsing.
- Iterasi: Mulai dengan MVP (scraper dasar + tabel statis), lalu tambah filter dan UI.

## Desain Aplikasi

### Arsitektur Tingkat Tinggi
- **Komponen Utama:**
  - **Scraper Module:** Mengambil data dari IG, parse, dan simpan ke DB.
  - **Database:** Menyimpan data posting yang difilter.
  - **API Layer:** Endpoint untuk fetch data dari DB.
  - **Frontend:** UI tabel dengan filter.

- **Flow Data:**
  1. Scraper mengakses IG akun agen → Ekstrak posting → Parse field → Filter berdasarkan agen → Simpan ke DB.
  2. Frontend request data via API → Tampilkan dalam tabel.

### Schema Database
Tabel utama: `properties`
- `id` (Primary Key, Integer)
- `title` (String, dari caption posting)
- `price` (String/Float, ekstrak dari caption)
- `location` (String, lokasi properti)
- `address` (String, alamat lengkap - bisa diedit)
- `land_area` (String, luas tanah, e.g., "200 m²" - bisa diedit)
- `building_condition` (String, kondisi bangunan, e.g., "Baru/Renovasi" - bisa diedit)
- `documents` (Text, dokumen properti, e.g., "SHM, IMB" - bisa diedit)
- `property_type` (String, tipe properti, e.g., "Rumah/Apartemen" - dll, bisa diedit)
- `year_built` (Integer, tahun bangun - dll, bisa diedit)
- `description` (Text, deskripsi lengkap)
- `agent_name` (String, nama agen untuk filter)
- `post_url` (String, link ke posting IG)
- `scraped_at` (Timestamp, waktu scraping)

Field tambahan ini akan diisi otomatis dari parsing IG jika tersedia, atau kosong dan bisa diedit manual melalui aplikasi.

### UI/UX Desain
- **Halaman Utama:** Tabel diperluas dengan kolom tambahan: Title, Price, Location, Address, Land Area, Building Condition, Documents, Property Type, Year Built, Agent, Actions.
- **Filter:** Tetap dropdown "Pilih Agen" dan tombol "Refresh Data".
- **Fitur Edit:** Tambah kolom "Actions" dengan tombol "Edit" per row. Klik edit membuka modal/form inline untuk edit field yang bisa diubah (address, land_area, dll.). Simpan perubahan ke database.
- **Responsif:** Tabel scrollable horizontal untuk mobile.
- **Mockup Sederhana:**
  ```
  +-----------------------------------+
  | Filter Agen: [Dropdown] | [Refresh]
  +-----------------------------------+
  | Title | Price | Location | Address | Land Area | Building Condition | Documents | Property Type | Year Built | Agent | [Edit] |
  |-------|-------|----------|---------|-----------|---------------------|-----------|---------------|------------|-------|--------|
  | Rumah A | 500jt | Jakarta | [Kosong] | [Kosong] | [Kosong] | [Kosong] | [Kosong] | [Kosong] | Agen X | [Edit] |
  | Apart B | 300jt | Bandung | Jl. ABC | 150 m² | Renovasi | SHM | Apartemen | 2020 | Agen Y | [Edit] |
  +-----------------------------------+
  ```
  - Field kosong dari IG bisa diisi via edit modal (form dengan input fields untuk setiap kolom yang bisa diedit).

### Pertimbangan Keamanan
- Enkripsi credentials IG (jika login diperlukan).
- Rate limiting pada scraper untuk hindari ban.
- Validasi input pada filter untuk cegah SQL injection.

### Pertimbangan Tambahan
- **Validasi Edit:** Pastikan input valid (e.g., land_area sebagai string dengan unit, year_built sebagai integer).
- **Backup Data:** Simpan versi asli dari IG dan versi edited terpisah untuk audit.
- **Integrasi:** Backend API perlu endpoint PUT untuk update record.