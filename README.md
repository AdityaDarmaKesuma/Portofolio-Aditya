# Portofolio — Aditya Darma Kesuma (Next.js)

Website portofolio berbasis **Next.js 14 (App Router)** dengan tema terang/gelap,
font **Manrope** (`next/font`, di-host sendiri), carousel gambar, dan **Mode Edit**
untuk upload sertifikat & ganti gambar langsung dari browser.

## Struktur folder

```
├── app/
│   ├── layout.js         ← font Manrope, metadata SEO, skrip tema
│   ├── page.js           ← halaman utama
│   └── globals.css       ← tampilan, animasi & warna tema
├── components/
│   ├── Portfolio.js      ← navbar, lightbox, modal proyek, pemuat Mode Edit
│   ├── Sections.js       ← semua bagian halaman (hero, tentang, sertifikat, dll.)
│   └── context.js        ← fungsi bantu bersama
├── lib/
│   ├── icons.js          ← ikon
│   └── editor.js         ← Mode Edit (hanya dimuat saat ?edit)
├── data/portfolio.json   ← SEMUA ISI WEBSITE (teks, gambar, sertifikat)
└── public/assets/        ← gambar, sertifikat, CV
```

## Menjalankan di komputer

Butuh [Node.js](https://nodejs.org) versi 18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Untuk versi produksi: `npm run build` lalu `npm start`.

## Deploy ke Vercel

1. Push folder ini ke repository GitHub (boleh menimpa repo lama).
2. Di Vercel: **Add New → Project → pilih repo**. Framework otomatis terdeteksi
   sebagai **Next.js** — langsung klik **Deploy**.

## Menambah sertifikat — cara mudah (Mode Edit)

1. Buka website dengan tambahan `?edit`, contoh `https://portofolio-aditya-darma.vercel.app/?edit`
   (atau `http://localhost:3000/?edit` saat `npm run dev`).
2. Klik **Mode Edit** di kiri bawah → tab **Sertifikat** → seret file (JPG/PNG/WebP/PDF),
   isi nama, penerbit, kategori, tanggal → **Tambah sertifikat**.
3. Tab **Terbitkan** → **Unduh ZIP Pembaruan**.
4. Ekstrak ZIP, salin folder `data` dan `public` ke folder proyek (pilih _Replace_).
5. Commit & push → Vercel build ulang otomatis.

Di Mode Edit Anda juga bisa mengganti gambar apa pun (arahkan kursor ke gambar →
**Ganti gambar**), mengatur foto carousel & dokumentasi, mengurutkan/menghapus
sertifikat, dan mengganti CV. Perubahan tersimpan otomatis di browser sampai
diterbitkan; pengunjung tidak pernah melihat panel ini.

## Menambah sertifikat — cara manual

1. Simpan gambar di `public/assets/certificates/`, misal `ccna.webp`.
2. Tambahkan di paling atas daftar `"certificates"` di `data/portfolio.json`:

```json
{ "title": "CCNA", "issuer": "Cisco", "description": "Cisco Certified Network Associate",
  "category": "Jaringan", "date": "Okt 2026 – Okt 2029",
  "image": "/assets/certificates/ccna.webp", "thumb": "", "link": "" },
```

- Path gambar diawali `/assets/...` (folder `public` tidak ditulis).
- `category` dipakai untuk tombol filter; kategori baru otomatis muncul.
- `thumb` boleh kosong; `link` (opsional) = tautan verifikasi.
- Angka "Sertifikasi Resmi" ikut bertambah otomatis.

## Pengaturan cepat (`site.config.js`)

File `site.config.js` di root proyek mengatur:

- **Navbar**: teks logo, tombol CTA, daftar menu (hapus baris = sembunyikan menu)
- **Warna aksen** untuk tema terang & gelap
- **Label tombol**: Unduh CV, Mari Diskusi, Kirim Email, dll.
- **Judul & deskripsi tiap bagian** (Pengalaman, Proyek, Sertifikat, Keahlian, dst.)
- **Footer**
- **Perilaku**: jumlah sertifikat awal, kecepatan carousel, autoplay galeri (`0` = mati), tampil/sembunyi terminal

## Mengubah teks & warna

- Semua teks ada di `data/portfolio.json`. Level keahlian: `Beginner`, `Intermediate`, `Advanced`, `Expert`.
- Warna tema di bagian atas `app/globals.css` (`:root` = terang, `:root[data-theme="dark"]` = gelap). Warna aksen: `--accent`.
