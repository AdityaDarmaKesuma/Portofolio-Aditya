"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeUp from "@/components/FadeUp";
import {
  Server,
  Terminal,
  Code2,
  Mail,
  Phone,
  Copy,
  Check,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  Camera,
  User,
  Cpu,
} from "lucide-react";

// Komponen Icon Manual
const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "all" | "network" | "devops" | "fullstack"
  >("all");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<
    Array<{ cmd: string; output: string }>
  >([
    {
      cmd: "welcome",
      output:
        "Selamat datang di terminal Aditya. Ketik 'help' untuk daftar perintah!",
    },
  ]);
  const [copied, setCopied] = useState(false);

  // --- TAMBAHAN KODE UNTUK MEMAKSA VIDEO PLAY ---
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Memaksa video untuk play saat komponen selesai dimuat
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Autoplay ditolak oleh browser:", error);
      });
    }
  }, []);
  // ----------------------------------------------

  const skills = [
    { name: "MikroTik (RouterOS)", category: "network", level: "Advanced" },
    { name: "Basic Configuration", category: "network", level: "Expert" },
    { name: "DHCP", category: "network", level: "Expert" },
    { name: "DNS", category: "network", level: "Expert" },
    { name: "Bridge", category: "network", level: "Expert" },
    { name: "Routing", category: "network", level: "Expert" },
    { name: "Web proxy", category: "network", level: "Intermediate" },
    { name: "Firewall", category: "network", level: "Expert" },
    { name: "Quality of Service", category: "network", level: "Expert" },
    { name: "Wireless", category: "network", level: "Expert" },
    { name: "OSPF", category: "network", level: "Expert" },
    { name: "VLAN", category: "network", level: "Expert" },
    { name: "Tunneling", category: "network", level: "Expert" },
    { name: "Port Knocking", category: "network", level: "Advanced" },
    { name: "Linux Sysadmin", category: "devops", level: "Intermediate" },
    { name: "Docker & Kubernetes", category: "devops", level: "Intermediate" },
    { name: "AWS", category: "devops", level: "Beginner" },
    { name: "Terraform & Ansible", category: "devops", level: "Intermediate" },
    { name: "Prometheus & Grafana", category: "devops", level: "Intermediate" },
    {
      name: "Jenkins CI/CD Pipeline",
      category: "devops",
      level: "Intermediate",
    },
    {
      name: "Version Control (Git)",
      category: "devops",
      level: "Intermediate",
    },
    { name: "ReactJS", category: "fullstack", level: "Intermediate" },
    { name: "Laravel (PHP)", category: "fullstack", level: "Intermediate" },
    { name: "UI/UX Design", category: "fullstack", level: "Intermediate" },
    { name: "PHP Native", category: "fullstack", level: "Intermediate" },
    { name: "HTML", category: "fullstack", level: "Advanced" },
    { name: "CSS", category: "fullstack", level: "Advanced" },
    { name: "JavaScript", category: "fullstack", level: "Intermediate" },
    { name: "Python", category: "fullstack", level: "Intermediate" },
  ];
  const filteredSkills =
    activeTab === "all"
      ? skills
      : skills.filter((s) => s.category === activeTab);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    let output = "";
    switch (cmd) {
      case "help":
        output = "Perintah: about, skills, certs, edu, clear";
        break;
      case "about":
        output =
          "Aditya Darma Kesuma - S1 Teknik Informatika. Fokus pada Network Infra, DevOps, dan Fullstack.";
        break;
      case "skills":
        output =
          "Network: MikroTik. DevOps: Jenkins. Fullstack: Laravel, ReactJS.";
        break;
      case "certs":
        output =
          "MTCNA, MTCRE, OCNA Wireless, BNSP Web & Network, Huawei AI Basic.";
        break;
      case "edu":
        output =
          "STT Terpadu Nurul Fikri - S1 Teknik Informatika (IPK: 3.84/4.00)";
        break;
      case "clear":
        setTerminalLogs([]);
        setTerminalInput("");
        return;
      default:
        output = `Perintah '${cmd}' tidak dikenali. Ketik 'help'.`;
    }
    setTerminalLogs((prev) => [...prev, { cmd: terminalInput, output }]);
    setTerminalInput("");
  };

  const copyEmail = () => {
    navigator.clipboard.writeText("adityadarmakesuma@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* --- 1. HERO SECTION --- */}
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Layer 1: VIDEO (z-0) agar tidak tenggelam ke belakang <main> */}
        <div className="absolute inset-0 z-0 w-full h-full bg-slate-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-70"
          >
            <source src="/bg-tech.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Layer 2: OVERLAY (z-10) untuk menggelapkan video */}
        <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-[3px]"></div>

        {/* Layer 3: KONTEN (z-20) agar teks dan foto berada paling depan */}
        <div className="relative z-20 flex flex-col-reverse md:flex-row items-center justify-between gap-12 w-full max-w-6xl p-6 md:p-12 mt-12 md:mt-0">
          <div className="flex-1 text-center md:text-left">
            <FadeUp>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm rounded-full bg-blue-900/40 text-blue-300 border border-blue-800/50 backdrop-blur-md"
              >
                Lulusan S1 Teknik Informatika
              </Badge>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
                Halo, saya <br className="hidden md:block" />
                <span className="text-blue-500">Aditya Darma Kesuma.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-300 mb-6 drop-shadow-md">
                Sysadmin/Network Engineer | DevOps Engineer | Fullstack
                Developer | UI/UX Designer
              </h2>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="text-base md:text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl drop-shadow-sm">
                Berfokus pada bidang jaringan, infrastruktur sistem, DevOps, dan
                pengembangan perangkat lunak, dengan ketertarikan pada solusi
                teknologi yang aman dan efisien.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#contact">
                  <Button
                    size="lg"
                    className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/30"
                  >
                    Hubungi Saya
                  </Button>
                </a>
                <a href="#experience">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 border-slate-700 text-slate-300 hover:bg-slate-800 backdrop-blur-sm bg-slate-900/50"
                  >
                    Lihat Portofolio
                  </Button>
                </a>
              </div>
            </FadeUp>
          </div>

          <FadeUp
            delay={0.3}
            className="flex-1 flex justify-center md:justify-end relative items-end"
          >
            {/* 1. Efek cahaya lembut (Glow) di belakang foto agar tidak mati dengan background gelap */}
            <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bg-white/10 blur-3xl -z-10 pointer-events-none" />

            {/* 2. Foto Transparan (Tanpa Frame Lingkaran) */}
            <img
              src="/foto-nobg.png"
              alt="Aditya Darma Kesuma"
              className="w-auto h-80 md:h-[400px] lg:h-[750px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500 ease-out"
            />
          </FadeUp>
        </div>
      </section>

      {/* (Lanjutan kode STATS BAR dan seterusnya di bawah sini biarkan seperti aslinya) */}

      {/* --- 2. STATS BAR --- */}
      <section className="w-full max-w-6xl -mt-12 z-20 px-6">
        <FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="text-center p-3 border-r border-slate-800 last:border-r-0">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-500 mb-1">
                3.84
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-medium">
                IPK Akademik
              </div>
            </div>
            <div className="text-center p-3 border-r border-slate-800 last:border-r-0">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-500 mb-1">
                10+
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-medium">
                Sertifikasi Resmi
              </div>
            </div>
            <div className="text-center p-3 border-r border-slate-800 last:border-r-0">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-500 mb-1">
                3+
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-medium">
                Proyek Utama
              </div>
            </div>
            <div className="text-center p-3">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-500 mb-1">
                100%
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-medium">
                Uptime Jaringan
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* --- 2. TENTANG SAYA --- */}
      <section id="about" className="w-full max-w-5xl mt-24 px-6 scroll-mt-24">
        <FadeUp>
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800/80 pb-4">
            <User className="w-8 h-8 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Tentang Saya
            </h2>
          </div>
        </FadeUp>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch justify-between">
          {/* Teks Deskripsi */}
          <div className="flex-1 flex flex-col justify-center">
            <FadeUp delay={0.1}>
              <div className="text-slate-400 text-base md:text-lg leading-relaxed space-y-4">
                <p>
                  Saya adalah lulusan{" "}
                  <strong className="text-slate-200">
                    S1 Teknik Informatika
                  </strong>{" "}
                  dari STT Terpadu Nurul Fikri dengan keahlian komprehensif di
                  bidang{" "}
                  <strong className="text-slate-200">
                    Infrastruktur Jaringan, Praktik DevOps, dan Rekayasa
                    Perangkat Lunak
                  </strong>
                  .
                </p>
                <p>
                  Berbekal rekam jejak pengalaman teknis secara langsung di
                  lapangan, saya terbiasa menangani{" "}
                  <em className="text-slate-300">deployment</em> jaringan skala
                  besar seperti SD-WAN & mesin ATM (bersama PT Telkom
                  Indonesia), melakukan manajemen server, hingga mengembangkan
                  website <em className="text-slate-300">full-stack</em>.
                </p>
                <p>
                  Dilengkapi dengan prinsip kerja yang kuat untuk selalu
                  memadukan keamanan infrastruktur yang kokoh dengan efisiensi
                  performa aplikasi. Berkomitmen tinggi dalam menghadirkan
                  solusi teknologi yang terukur, inovatif, dan memberikan dampak
                  penyelesaian masalah secara nyata bagi penggunanya.
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Kontainer Foto Proporsional (Tersusun Kemas di Bahagian Bawah) */}
          <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 flex justify-center md:justify-end">
            <FadeUp delay={0.2} className="w-full h-full">
              <div className="relative w-full h-full min-h-[350px] md:min-h-[380px] rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden flex items-end justify-center pt-6 px-4 shadow-xl">
                {/* Efek Cahaya Lembut di Belakang Foto */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                {/* Foto Cutout PNG Terikat Kemas di Dasar Bingkai */}
                <img
                  src="/foto-tentang-nobg.png"
                  alt="Aditya Darma Kesuma"
                  className="relative z-10 max-h-[320px] md:max-h-[350px] w-auto object-contain object-bottom hover:scale-105 transition-transform duration-500 ease-out drop-shadow-2xl"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* --- SECTION PENGALAMAN & PENDIDIKAN --- */}
      <section
        id="experience-education"
        className="w-full max-w-6xl mt-32 px-6 scroll-mt-24 mx-auto"
      >
        {/* Judul Section */}
        <FadeUp>
          <div className="border-b border-slate-800/80 pb-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
              Pengalaman & Pendidikan
            </h2>
          </div>
        </FadeUp>

        {/* Layout Grid 2 Kolom Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* ========================================= */}
          {/* KOLOM KIRI: PENGALAMAN KERJA              */}
          {/* ========================================= */}
          <div className="space-y-6">
            <FadeUp delay={0.1}>
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-7 h-7 text-white" />
                <h3 className="text-2xl font-bold text-white">
                  Pengalaman Kerja
                </h3>
              </div>
            </FadeUp>

            {/* Card Pengalaman 1 */}
            <FadeUp delay={0.2}>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-blue-400">
                      Field Engineer (ATM)
                    </h4>
                    <p className="text-slate-300 text-sm">
                      PT Telkom Indonesia
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs border border-slate-700 rounded-full text-slate-400 whitespace-nowrap">
                    Jul - Sep 2026
                  </span>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>
                    Melakukan instalasi, konfigurasi, dan aktivasi mesin ATM BRI
                    di berbagai lokasi penugasan untuk memastikan kesiapan
                    operasional perangkat 100%.
                  </li>
                  <li>
                    Menguji konektivitas jaringan dan integrasi sistem ATM
                    dengan server pusat guna menjamin kelancaran, stabilitas,
                    dan keamanan transaksi nasabah.
                  </li>
                  <li>
                    Menangani troubleshooting awal pada kendala perangkat keras
                    dan jaringan (on-site), serta menyusun dokumen Berita Acara
                    Instalasi (BAI) dan User Acceptance Test (UAT) secara
                    akurat.
                  </li>
                </ul>
              </div>
            </FadeUp>

            {/* Card Pengalaman 2 */}
            <FadeUp delay={0.3}>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-blue-400">
                      Field Engineer (SD-WAN)
                    </h4>
                    <p className="text-slate-300 text-sm">
                      PT Telkom Indonesia
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs border border-slate-700 rounded-full text-slate-400 whitespace-nowrap">
                    Jul 25 - Jul 26
                  </span>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>
                    Mengimplementasikan instalasi, migrasi dan aktivasi
                    perangkat SD-WAN secara langsung di berbagai gerai Alfamart
                    untuk mendukung pembaruan infrastruktur jaringan.
                  </li>
                  <li>
                    Mengeksekusi proses migrasi jaringan dengan perencanaan
                    matang, sehingga meminimalisir downtime operasional harian
                    toko.
                  </li>
                  <li>
                    Melakukan pengujian konektivitas, menyelesaikan permasalahan
                    WAN on-site, serta menyusun laporan teknis berkala terkait
                    status penyelesaian proyek migrasi.
                  </li>
                </ul>
              </div>
            </FadeUp>

            {/* Card Pengalaman 3 */}
            <FadeUp delay={0.4}>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-blue-400">
                      Instruktur MikroTik
                    </h4>
                    <p className="text-slate-300 text-sm">
                      LPK Darul Falah Foundation
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs border border-slate-700 rounded-full text-slate-400 whitespace-nowrap">
                    Apr 25 - Apr 26
                  </span>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>
                    Merancang dan memfasilitasi program pelatihan teknis
                    intensif selama 6 bulan untuk persiapan sertifikasi
                    internasional MikroTik bagi siswa SMK jurusan TKJ.
                  </li>
                  <li>
                    Menyampaikan kurikulum praktik (MTCNA, MTCRE, MTCTCE) yang
                    mencakup arsitektur jaringan, routing, manajemen bandwidth,
                    dan implementasi keamanan (firewall) pada RouterOS.
                  </li>
                  <li>
                    Mengevaluasi pemahaman siswa secara berkala, membantu mereka
                    mencapai kesiapan optimal untuk ujian sertifikasi resmi dan
                    program magang industri.
                  </li>
                </ul>
              </div>
            </FadeUp>

            {/* Card Pengalaman 4 */}
            <FadeUp delay={0.4}>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-blue-400">
                      CCTV Instalation
                    </h4>
                    <p className="text-slate-300 text-sm">Part Time</p>
                  </div>
                  <span className="inline-block px-3 py-1 text-xs border border-slate-700 rounded-full text-slate-400 whitespace-nowrap">
                    Jun 2024
                  </span>
                </div>
                <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
                  <li>
                    Melakukan survei lokasi, perancangan tata letak, dan
                    instalasi fisik perangkat sistem pengawasan CCTV secara
                    menyeluruh untuk memastikan cakupan pemantauan area yang
                    optimal.
                  </li>
                  <li>
                    Mengelola penarikan jalur kabel (cabling) dan terminasi
                    kelistrikan pada panel kontrol/DVR dengan standar kerapian
                    tinggi guna mencegah risiko gangguan arus pendek atau signal
                    loss.
                  </li>
                  <li>
                    Mengonfigurasi pengaturan jaringan pada Digital Video
                    Recorder (DVR) / Network Video Recorder (NVR) agar sistem
                    pengawasan dapat diakses dan dipantau secara real-time dari
                    jarak jauh.
                  </li>
                </ul>
              </div>
            </FadeUp>
          </div>

          {/* ========================================= */}
          {/* KOLOM KANAN: PENDIDIKAN & DOKUMENTASI     */}
          {/* ========================================= */}
          <div className="space-y-10">
            {/* --- Bagian Pendidikan --- */}
            <div>
              <FadeUp delay={0.1}>
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-7 h-7 text-white" />
                  <h3 className="text-2xl font-bold text-white">
                    Riwayat Pendidikan
                  </h3>
                </div>
              </FadeUp>

              {/* Card Pendidikan dengan Foto Wisuda */}
              <FadeUp delay={0.2}>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-lg hover:border-slate-700 transition-colors">
                  <h4 className="text-lg font-bold text-white mb-1">
                    S1 Teknik Informatika
                  </h4>
                  <p className="text-blue-400 text-sm mb-4">
                    STT Terpadu Nurul Fikri (2022 - 2026)
                  </p>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Lulus dengan IPK 3.84/4.00. Fokus pada jaringan komputer,
                    rekayasa perangkat lunak, dan infrastruktur sistem.
                  </p>

                  {/* Galeri 3 Foto Wisuda */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-700/50 group bg-slate-800/50">
                      <img
                        src="/fotowisuda1.JPG"
                        alt="Foto Wisuda 1"
                        className="w-full h-full object-cover  group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-700/50 group bg-slate-800/50">
                      <img
                        src="/fotowisuda2.JPG"
                        alt="Foto Wisuda 2"
                        className="w-full h-full object-cover  group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                    <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-700/50 group bg-slate-800/50">
                      <img
                        src="/fotowisuda3.JPG"
                        alt="Foto Wisuda 3"
                        className="w-full h-full object-cover  group-hover:scale-110 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* --- Bagian Dokumentasi Kegiatan --- */}
            <div>
              <FadeUp delay={0.3}>
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-7 h-7 text-white" />
                  <h3 className="text-2xl font-bold text-white">
                    Dokumentasi Kegiatan
                  </h3>
                </div>
              </FadeUp>

              <FadeUp delay={0.4}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/fotoatm.jpeg"
                      alt="Instalasi ATM"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      Instalasi ATM
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/fotoexisting.jpg"
                      alt="Instalasi SD WAN"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      Instalasi SD WAN
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/posterdff.png"
                      alt="Instruktur Mikrotik"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      Instruktur Mikrotik
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/Fotoinstalasi2.jpeg"
                      alt="Instruktur Mikrotik"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      CCTV Instalation
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/Fotoinstalasi3.jpeg"
                      alt="Instruktur Mikrotik"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      CCTV Instalation
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/40 hover:border-slate-600 transition-colors">
                    <img
                      src="/Fotoinstalasi1.jpeg"
                      alt="Instruktur Mikrotik"
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-slate-200">
                      CCTV Instalation
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION LISENSI & SERTIFIKASI --- */}
      <section
        id="certifications"
        className="w-full max-w-6xl mt-32 px-6 scroll-mt-24 mx-auto"
      >
        {/* Judul Section dengan Garis Pemisah */}
        <FadeUp>
          <div className="flex items-center justify-center gap-3 border-b border-slate-800/80 pb-6 mb-12">
            <Award className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
              Pelatihan & Sertifikasi
            </h2>
          </div>
        </FadeUp>

        {/* Grid 3 Kolom Card Sertifikat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "MTCNA (MikroTik)",
              issuer: "MikroTik Certified Network Associate",
              date: "Sep 2025 - Sep 2028",
              image: "/SertifikatMTCNA.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "MTCRE (MikroTik)",
              issuer: "MikroTik Certified Routing Engineer",
              date: "Sep 2025",
              image: "/SertifikatMTCRE.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "OCNA Wireless (TP-Link)",
              issuer: "Omada Certified Network Administrator",
              date: "Jun 2025",
              image: "/SertifikatOCNA.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "BNSP - Web Developer",
              issuer: "Junior Web Developer",
              date: "Jan 2025 – Jan 2028",
              image: "/SertifFullstack.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "BNSP - DevOps",
              issuer: "Junior Network Administrator",
              date: "Agus 2025 – Agus 2028",
              image: "/SertifDevops.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "Huawei",
              issuer: "Huawei ICT Academy | Overview of AI",
              date: "Agus 2025",
              image: "/SertifHuawei.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "Coursera",
              issuer: "AWS S3 Basics",
              date: "Jun 2024",
              image: "/SertifAWS.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "Aguna Course",
              issuer: "Python Fundamental",
              date: "Jul 2025",
              image: "/SertifPython.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "Aguna Course",
              issuer: "Virtual Machine Fundamental",
              date: "Jul 2025",
              image: "/SertifVM.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "Aguna Course",
              issuer: "Linux Fundamental",
              date: "Jul 2025",
              image: "/SertifLinux.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "ID-Networkers (IDN.ID)",
              issuer: "Cisco Basic",
              date: "Jun 2025",
              image: "/SertifCisco.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "ID-Networkers (IDN.ID)",
              issuer: "Basic Cyber Security",
              date: "Jun 2025",
              image: "/SertifCyber.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "ID-Networkers (IDN.ID)",
              issuer: "Network Simulation Pnetlab",
              date: "Feb 2024",
              image: "/SertifPnet.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "NF ACADEMY",
              issuer: "Studi Independen Fullstack Web Developer",
              date: "Sep 2024 - Des 2024",
              image: "/SertifWeb.jpg", // Ganti dengan nama file gambar kamu di public/
            },
            {
              title: "NF ACADEMY",
              issuer: "Studi Independen DevOps Engineer",
              date: "Feb 2025 - Jun 2025",
              image: "/SertifDevopsEngineer.jpg", // Ganti dengan nama file gambar kamu di public/
            },
          ].map((cert, idx) => (
            <FadeUp key={idx} delay={idx * 0.1}>
              <div className="group bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all duration-300 flex flex-col justify-between h-full">
                {/* Frame Gambar Presisi & Proporsional */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/50 p-2 flex items-center justify-center mb-4">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Deskripsi Teks */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{cert.issuer}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-medium">
                      {cert.date}
                    </span>
                    <span className="text-slate-500 font-mono">
                      Sertifikat Resmi
                    </span>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* --- 6. PROYEK UTAMA --- */}
      <section className="w-full max-w-6xl mt-32 px-6">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center tracking-tight border-b border-slate-800 pb-4 text-white">
            Pencapaian & Proyek
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8">
          <FadeUp delay={0.1} className="h-full">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500/50 transition-colors h-full flex flex-col group">
              <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                <img
                  src="/ProjectNetwork.jpg"
                  alt="Keamanan Jaringan"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200/1e293b/3b82f6?text=Foto+Proyek+1")
                  }
                />
              </div>
              <CardHeader>
                <ShieldCheck className="w-6 h-6 text-blue-500 mb-2" />
                <CardTitle className="text-lg">
                  Keamanan Jaringan (Tugas Akhir)
                </CardTitle>
                <Badge variant="secondary" className="w-fit bg-slate-800">
                  2026
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed flex-1">
                Mengembangkan keamanan jaringan berbasis{" "}
                <strong>Port Knocking bertingkat (TCP 1000, 2000, 3000)</strong>{" "}
                pada MikroTik. Berhasil 100% memblokir akses SSH tidak sah
                dengan beban prosesor stabil di 3%.
              </CardContent>
            </Card>
          </FadeUp>

          <FadeUp delay={0.2} className="h-full">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500/50 transition-colors h-full flex flex-col group">
              <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                <img
                  src="/Dev1.png"
                  alt="DevOps Pipeline"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200/1e293b/3b82f6?text=Foto+Proyek+2")
                  }
                />
              </div>
              <CardHeader>
                <Server className="w-6 h-6 text-blue-500 mb-2" />
                <CardTitle className="text-lg">
                  Optimalisasi DevOps (CI/CD)
                </CardTitle>
                <Badge variant="secondary" className="w-fit bg-slate-800">
                  2025
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed flex-1">
                Mengimplementasikan{" "}
                <strong>
                  Continuous Integration/Continuous Deployment (CI/CD)
                </strong>{" "}
                menggunakan Jenkins Pipeline as Code untuk version control dan
                pelacakan perubahan kode yang lebih efektif.
              </CardContent>
            </Card>
          </FadeUp>

          <FadeUp delay={0.3} className="h-full">
            <Card className="bg-slate-900 border-slate-800 overflow-hidden hover:border-blue-500/50 transition-colors h-full flex flex-col group">
              <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                <img
                  src="/Web1.png"
                  alt="Aplikasi Web"
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200/1e293b/3b82f6?text=Foto+Proyek+3")
                  }
                />
              </div>
              <CardHeader>
                <Code2 className="w-6 h-6 text-blue-500 mb-2" />
                <CardTitle className="text-lg">
                  Aplikasi Web "Cryptifybox"
                </CardTitle>
                <Badge variant="secondary" className="w-fit bg-slate-800">
                  2025
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 leading-relaxed flex-1">
                Mengembangkan aplikasi web untuk enkripsi & dekripsi data.
                Membangun backend dengan <strong>Laravel</strong> dan merancang
                antarmuka UI dinamis menggunakan <strong>ReactJS</strong>.
              </CardContent>
            </Card>
          </FadeUp>
        </div>
      </section>

      {/* --- 7. TECH STACK & KEAHLIAN --- */}
      <section className="w-full max-w-5xl mt-24 px-6">
        <FadeUp>
          <h2 className="text-3xl font-bold mb-4 text-center text-white">
            Tech Stack & Keahlian
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10 mt-6">
            {[
              { id: "all", label: "Semua" },
              { id: "network", label: "Network & Infra" },
              { id: "devops", label: "DevOps" },
              { id: "fullstack", label: "Web Dev" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-full px-5 py-2 text-sm ${activeTab === tab.id ? "bg-blue-600 hover:bg-blue-700 text-white border-none" : "border-slate-800 text-slate-400 hover:bg-slate-900"}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </FadeUp>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill, index) => (
            <FadeUp key={skill.name} delay={0.05 * index}>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                <span className="font-medium text-slate-200">{skill.name}</span>
                <Badge
                  variant="outline"
                  className="border-blue-900/50 bg-blue-950/30 text-blue-400 text-xs"
                >
                  {skill.level}
                </Badge>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* --- 8. KONTAK & TERMINAL --- */}
      <section
        id="contact"
        className="w-full max-w-5xl mt-24 mb-24 px-6 scroll-mt-24"
      >
        <div className="grid lg:grid-cols-2 gap-10">
          <FadeUp>
            <div className="h-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-8 shadow-2xl relative flex flex-col justify-center">
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Mari Berkolaborasi!
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Saya terbuka untuk peluang karir sebagai{" "}
                <strong className="text-blue-400">
                  Network Engineer, DevOps, atau Software Engineer
                </strong>
                .
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-slate-300">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span className="truncate">adityadarmakesuma@gmail.com</span>
                  <button
                    onClick={copyEmail}
                    className="text-xs bg-slate-800 p-1.5 rounded hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-slate-300">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>0821-7320-3372</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <a
                  href="https://linkedin.com/in/adityadarmakesuma"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-800 hover:bg-blue-600 rounded-full text-slate-200 transition-colors"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/AdityaDarmaKesuma"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-200 transition-colors"
                >
                  <GithubIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 font-mono text-sm flex flex-col">
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="text-xs text-slate-400 ml-2">
                    guest@aditya-portfolio:~
                  </span>
                </div>
                <Terminal className="w-4 h-4 text-slate-500" />
              </div>
              <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[350px]">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center space-x-2 text-blue-400">
                      <span>guest@portfolio:~$</span>
                      <span className="text-slate-100">{log.cmd}</span>
                    </div>
                    <div className="text-slate-400 pl-4 whitespace-pre-wrap">
                      {log.output}
                    </div>
                  </div>
                ))}
                <form
                  onSubmit={handleTerminalSubmit}
                  className="flex items-center space-x-2 text-blue-400 pt-2"
                >
                  <span>guest@portfolio:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="ketik 'help'..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-600 focus:ring-0 font-mono"
                  />
                </form>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
