import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800/80">
      <div className="text-2xl font-extrabold tracking-tighter text-white">
        <Link href="/">PORTOFOLIO</Link>
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <Link
          href="#about"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Tentang Saya
        </Link>
        <Link
          href="#projects"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Proyek
        </Link>

        {/* Tombol Unduh CV Murni <a> tanpa memanggil komponen Button */}
        <a
          href="/CV_Aditya_Darma_Kesuma.pdf"
          download="CV_Aditya_Darma_Kesuma.pdf"
          className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
        >
          Unduh CV
        </a>
      </div>
    </nav>
  );
}
