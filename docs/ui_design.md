# Desain UI Aplikasi Scraping Property - Mobile-First dan Responsif

## Prinsip Desain
- **Mobile-First:** Design dimulai dari mobile (320px+), lalu scale ke tablet (768px+) dan desktop (1024px+).
- **Responsif:** Menggunakan Tailwind CSS untuk fluid layout, breakpoints, dan adaptive components.
- **Aksesibilitas:** High contrast, keyboard navigation, screen reader support.
- **Tema:** Clean, professional (warna biru/putih untuk real estate feel).

## Komponen UI Utama

### 1. Navbar/Header
- **Mobile:** Logo kecil di kiri, hamburger menu di kanan (expand ke sidebar).
- **Desktop:** Logo, menu horizontal (Home, About), tombol "Refresh Data".
- **Styling:** Fixed top, shadow, bg-blue-600.

### 2. Filter Section
- **Mobile:** Dropdown "Pilih Agen" penuh lebar, tombol "Refresh" di bawah.
- **Desktop:** Inline dropdown + button.
- **Interaksi:** On change, reload tabel via API.

### 3. Property Table/List
- **Mobile (320px-767px):** 
  - Tampilan card-based: Setiap property sebagai card dengan title, price, location di atas; detail lainnya collapsed (expandable).
  - Scroll horizontal untuk kolom banyak.
  - Tombol "Edit" per card.
- **Tablet (768px-1023px):** Hybrid table-cards, 2-3 kolom utama visible, sisanya hidden.
- **Desktop (1024px+):** Full table dengan semua kolom, sortable headers.
- **Kolom:** Title, Price, Location, Address, Land Area, Building Condition, Documents, Property Type, Year Built, Agent, Actions (Edit).
- **Styling:** Zebra stripes, hover effects, responsive font sizes (text-sm to text-lg).

### 4. Edit Modal
- **Mobile:** Full-screen modal dengan form stacked vertically.
- **Desktop:** Centered modal, form dalam grid 2 kolom.
- **Fields:** Input text untuk address, land_area, dll.; dropdown untuk building_condition, property_type.
- **Validasi:** Real-time feedback (e.g., required fields highlight red).
- **Actions:** Save (PUT API), Cancel.

### 5. Loading States dan Error Handling
- Skeleton loaders untuk tabel saat fetch data.
- Error toast/banner untuk API failures (e.g., "Gagal scrape data").

## Wireframe Sederhana

### Mobile View (Portrait)
```
[Navbar: Logo | ☰]

[Filter: Dropdown Agen ▼]
[Refresh Button]

[Card 1]
Title: Rumah A
Price: 500jt | Location: Jakarta
[Expand] → Address: -, Land Area: -, etc.
[Edit Button]

[Card 2]
...
```

### Desktop View
```
[Navbar: Logo | Home | About | Refresh]

Filter Agen: [Dropdown] [Refresh]

+-------------------------------------------------------------+
| Title | Price | Location | Address | Land Area | ... | Edit |
|-------|-------|----------|---------|-----------|-----|------|
| Rumah A| 500jt | Jakarta  | -       | -         | ... | [E]  |
+-------------------------------------------------------------+
```

## Teknologi UI
- **Framework:** React dengan hooks.
- **Styling:** Tailwind CSS (utility-first, responsive classes seperti `md:grid-cols-2`).
- **Komponen Library:** Headless UI untuk modal/dropdown (aksesibilitas built-in).
- **Icons:** Heroicons atau Lucide.

## Interaksi dan Animasi
- Smooth transitions pada expand cards (mobile).
- Fade-in untuk tabel load.
- Hover tooltips untuk kolom truncated.

## Testing UI
- Browser dev tools untuk responsive testing.
- Manual test pada device real (mobile, tablet).
- A11y audit dengan Lighthouse.