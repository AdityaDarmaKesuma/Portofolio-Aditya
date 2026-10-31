/* =====================================================================
   PENGATURAN WEBSITE — ubah teks tampilan, menu, warna & perilaku di sini.
   ---------------------------------------------------------------------
   - Isi konten (profil, pengalaman, proyek, sertifikat, keahlian) tetap
     di data/portfolio.json.
   - Setelah mengubah file ini, simpan; saat `npm run dev` halaman akan
     memuat ulang otomatis.
   - Teks di dalam tanda kutip boleh diganti bebas. Jangan hapus koma.
   ===================================================================== */

const siteConfig = {
  /* ---------- Navbar ---------- */
  navbar: {
    logo: "PORTOFOLIO", // teks logo di kiri atas
    ctaLabel: "Hubungi Saya", // tombol di kanan atas
    ctaHref: "#contact",
    // Menu: [id bagian, label]. Hapus baris untuk menyembunyikan menu.
    // id yang tersedia: home, about, experience, gallery, projects, certificates, skills, contact
    links: [
      ["home", "Beranda"],
      ["about", "Tentang"],
      ["experience", "Pengalaman"],
      ["projects", "Proyek"],
      ["certificates", "Sertifikat"],
      ["skills", "Keahlian"],
    ],
  },

  /* ---------- Warna aksen (tombol, link, highlight) ---------- */
  colors: {
    light: { accent: "#1d4ed8", accentHover: "#2a5df0" },
    dark: { accent: "#3d6dff", accentHover: "#5b85ff" },
  },

  /* ---------- Tombol umum ---------- */
  buttons: {
    discuss: "Mari Diskusi",
    downloadCV: "Unduh CV",
    readMore: "Baca Selengkapnya",
    readLess: "Tutup",
    sendEmail: "Kirim Email",
    whatsapp: "WhatsApp",
  },

  /* ---------- Judul tiap bagian ---------- */
  sections: {
    hero: { followTitle: "Ikuti Saya" },
    about: { eyebrow: "Tentang Saya" },
    experience: {
      eyebrow: "Pengalaman & Pendidikan",
      title: "Perjalanan karier yang dibangun dari lapangan",
      text: "Pengalaman langsung menangani jaringan skala besar, mengajar, hingga instalasi sistem keamanan. Klik setiap kartu untuk melihat detailnya.",
      educationLabel: "Pendidikan",
      availability: {
        show: true,
        status: "Terbuka untuk peluang baru",
        text: "Siap berkontribusi sebagai Network Engineer, DevOps Engineer, atau Software Engineer.",
      },
    },
    gallery: {
      eyebrow: "Dokumentasi Kegiatan",
      title: "Momen di balik pekerjaan",
    },
    projects: {
      eyebrow: "Proyek",
      title: "Mewujudkan ide menjadi solusi nyata",
      text: "Kumpulan proyek yang mencerminkan proses berpikir, pemecahan masalah, dan hasil yang terukur.",
      detailLabel: "Lihat detail",
      visitLabel: "Kunjungi Proyek",
    },
    certificates: {
      eyebrow: "Pelatihan & Sertifikasi",
      title: "Kompetensi yang tervalidasi",
      text: "Sertifikasi resmi dari lembaga industri dan pemerintah. Klik sertifikat untuk melihat ukuran penuh.",
      allLabel: "Semua",
      searchPlaceholder: "Cari sertifikat…",
    },
    skills: {
      eyebrow: "Tech Stack & Keahlian",
      title: "Alat yang saya gunakan setiap hari",
      text: "Dari konfigurasi router hingga pipeline deployment dan antarmuka web.",
    },
    contact: { eyebrow: "Kontak" },
  },

  /* ---------- Footer ---------- */
  footer: {
    text: "Dibuat dengan sepenuh hati.", // tampil setelah "© tahun Nama."
    backToTop: "Ke atas ↑",
  },

  /* ---------- Perilaku ---------- */
  settings: {
    certificatesShown: 8, // jumlah sertifikat sebelum tombol "Tampilkan Semua"
    aboutCarouselMs: 5500, // jeda ganti foto carousel "Tentang Saya" (milidetik)
    galleryAutoplayMs: 4200, // jeda geser otomatis dokumentasi (0 = mati)
    showTerminal: true, // terminal interaktif di bagian Kontak
  },
};

export default siteConfig;
