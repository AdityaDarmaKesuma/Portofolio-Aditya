# Portofolio — Aditya Darma Kesuma

Website portofolio statis (HTML + CSS + JavaScript, tanpa build) dengan tema terang/gelap,
font **Manrope**, carousel gambar, dan **Mode Edit** untuk upload sertifikat & ganti gambar
langsung dari browser.

## Struktur folder

```
portfolio/
├── index.html              ← kerangka halaman (jarang perlu diubah)
├── data.js                 ← SEMUA ISI WEBSITE ada di sini (teks, gambar, sertifikat)
├── vercel.json             ← pengaturan deploy Vercel (situs statis)
└── assets/
    ├── css/style.css       ← tampilan & warna tema
    ├── js/main.js          ← interaksi (carousel, lightbox, filter, terminal, tema)
    ├── js/editor.js        ← Mode Edit (hanya dimuat saat ?edit)
    ├── img/profile/        ← foto hero & foto "tentang"
    ├── img/about/          ← foto carousel "Tentang Saya"
    ├── img/gallery/        ← foto "Dokumentasi Kegiatan"
    ├── img/projects/       ← gambar proyek
    ├── certificates/       ← gambar sertifikat (+ thumbs/ untuk versi kecil)
    └── files/              ← CV (PDF)
```

## Menjalankan di komputer

Klik dua kali `index.html` — langsung terbuka di browser. Tidak perlu install apa pun.

## Deploy ke Vercel

1. Upload isi folder `portfolio/` ke repository GitHub (boleh menimpa repo lama).
2. Di Vercel: **Add New → Project → pilih repo** → Deploy.
   Kalau memakai project Vercel lama (yang sebelumnya Next.js), `vercel.json` sudah
   mengatur Framework Preset menjadi **Other**, jadi tidak perlu build command.

## Menambah sertifikat — cara mudah (Mode Edit)

1. Buka website Anda dengan tambahan `?edit` di belakang alamat, contoh:
   `https://portofolio-aditya-darma.vercel.app/?edit`
2. Klik tombol **Mode Edit** di kiri bawah.
3. Tab **Sertifikat** → seret file sertifikat (JPG/PNG/WebP/PDF) ke kotak upload,
   isi nama, penerbit, kategori, tanggal → **Tambah sertifikat**.
   Gambar otomatis dikompres ke WebP + dibuatkan thumbnail.
4. Tab **Terbitkan** → **Unduh ZIP Pembaruan**.
5. Ekstrak ZIP, salin `data.js` dan folder `assets` ke folder proyek (pilih *Replace*).
6. Commit & push ke GitHub → Vercel memperbarui website otomatis.

Di Mode Edit Anda juga bisa:
- **Mengganti gambar apa pun**: arahkan kursor ke gambar di halaman → klik **Ganti gambar**.
- Menambah / menghapus / mengurutkan foto carousel dan dokumentasi (tab **Gambar**).
- Mengedit, menghapus, dan mengurutkan sertifikat.
- Mengganti file CV.

Perubahan tersimpan otomatis di browser Anda (tidak hilang saat refresh) sampai Anda
menerbitkannya. Pengunjung biasa tidak pernah melihat panel ini. Klik
**Keluar dari Mode Edit** untuk kembali ke tampilan normal.

## Menambah sertifikat — cara manual

1. Simpan gambar di `assets/certificates/`, misal `ccna.webp`.
2. Buka `data.js`, tambahkan di bagian paling atas daftar `"certificates"`:

```js
{ "title": "CCNA", "issuer": "Cisco", "description": "Cisco Certified Network Associate",
  "category": "Jaringan", "date": "Okt 2026 – Okt 2029",
  "image": "assets/certificates/ccna.webp", "thumb": "", "link": "" },
```

- `category` dipakai untuk tombol filter; kategori baru otomatis muncul.
- `thumb` boleh kosong (gambar utama dipakai).
- `link` (opsional) = tautan verifikasi, tampil di pratinjau sertifikat.
- Angka "Sertifikasi Resmi" di bagian statistik ikut bertambah otomatis.

## Mengubah teks lain

Semua teks (nama, peran, pengalaman, proyek, keahlian, kontak) ada di `data.js`.
Level keahlian: `Beginner`, `Intermediate`, `Advanced`, atau `Expert`.

## Mengubah warna tema

Buka `assets/css/style.css`, bagian paling atas (`:root` untuk tema terang dan
`:root[data-theme="dark"]` untuk tema gelap). Warna aksen utama: `--accent`.

## Fitur interaktif

- Tema terang/gelap (mengikuti sistem, tersimpan, transisi lingkaran)
- Carousel foto otomatis dengan indikator progres, geser (swipe), dan tombol
- Carousel "Dokumentasi Kegiatan" yang bisa digeser/drag + autoplay
- Lightbox dengan zoom, navigasi keyboard (← → Esc), thumbnail, swipe
- Filter & pencarian sertifikat, tombol "Tampilkan semua"
- Filter keahlian dengan indikator geser
- Angka statistik beranimasi, teks peran mengetik otomatis
- Accordion pengalaman kerja, modal detail proyek
- Terminal interaktif (ketik `help`), salin email/telepon sekali klik
- Responsif untuk ponsel, tablet, dan desktop
