import { Manrope } from 'next/font/google';
import data from '@/data/portfolio.json';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

export const metadata = {
  metadataBase: new URL('https://portofolio-aditya-darma.vercel.app'),
  title: data.site.title,
  description: data.site.description,
  openGraph: {
    title: data.site.title,
    description: data.site.description,
    images: [data.profile.photo],
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%231d4ed8'/%3E%3Ctext x='32' y='43' font-family='Arial' font-size='30' font-weight='700' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eceff4',
};

/* Tema dipasang sebelum halaman tampil agar tidak berkedip */
const themeScript = `(function(){var t=null;try{t=localStorage.getItem('pf-theme')}catch(e){}
var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme',d?'dark':'light');})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
