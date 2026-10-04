export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-16 w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Identitas & Lokasi */}
        <div className="text-center md:text-left">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">Aditya Darma Kesuma</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kota Depok, Jawa Barat</p>
        </div>

        {/* Tautan Kontak */}
        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a 
            href="mailto:adityadarmakesuma@gmail.com" 
            className="hover:text-blue-500 transition-colors"
          >
            Email
          </a>
          <a 
            href="https://linkedin.com/in/adityadarmakesuma" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-blue-500 transition-colors"
          >
            LinkedIn
          </a>
          <a 
            href="https://github.com/AdityaDarmaKesuma" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-blue-500 transition-colors"
          >
            GitHub
          </a>
        </div>

      </div>
    </footer>
  );
}