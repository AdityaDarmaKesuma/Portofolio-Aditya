'use client';
/* =====================================================================
   Portofolio — komponen utama. Konten dibaca dari data/portfolio.json.
   Mode Edit (upload sertifikat / ganti gambar) ada di lib/editor.js dan
   hanya dimuat saat alamat dibuka dengan ?edit
   ===================================================================== */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, iconHTML } from '@/lib/icons';
import { PFContext, esc, pad, setTheme, usePF, useReducedMotion } from './context';
import { About, Certificates, Contact, Experience, Footer, Gallery, Hero, Projects, Skills } from './Sections';

const NAV = [
  ['home', 'Beranda'], ['about', 'Tentang'], ['experience', 'Pengalaman'],
  ['projects', 'Proyek'], ['certificates', 'Sertifikat'], ['skills', 'Keahlian'],
];

export default function Portfolio({ initialData }) {
  const [data, setData] = useState(initialData);
  const blobs = useRef({});
  const reduced = useReducedMotion();
  const [lb, setLb] = useState(null);           // { items, i }
  const lbOpener = useRef(null);
  const [project, setProject] = useState(null); // index proyek di modal
  const projOpener = useRef(null);
  const [toastState, setToastState] = useState(null);

  const asset = useCallback((p) => (p && blobs.current[p]) || p || '', []);
  const toast = useCallback((msg, icon = 'check') => setToastState({ msg, icon, k: Date.now() }), []);

  useEffect(() => {
    if (!toastState) return undefined;
    const t = setTimeout(() => setToastState(null), 2600);
    return () => clearTimeout(t);
  }, [toastState]);

  const openLightbox = useCallback((items, i, opener) => {
    if (!items.length) return;
    lbOpener.current = opener || document.activeElement;
    setLb({ items, i: Math.max(0, i) });
  }, []);
  const openProject = useCallback((i, opener) => {
    projOpener.current = opener;
    setProject(i);
  }, []);

  /* ---------- Mode Edit ---------- */
  useEffect(() => {
    let edit = false;
    const params = new URLSearchParams(location.search);
    try {
      if (params.has('edit')) localStorage.setItem('pf-edit', '1');
      edit = localStorage.getItem('pf-edit') === '1';
    } catch (_) { edit = params.has('edit'); }
    if (!edit) return undefined;

    let cancelled = false;
    window.PORTFOLIO = JSON.parse(JSON.stringify(initialData));
    window.PF = {
      blobs: blobs.current,
      asset,
      toast,
      esc,
      icon: iconHTML,
      render: () => setData(JSON.parse(JSON.stringify(window.PORTFOLIO))),
    };
    import('@/lib/editor')
      .then(async ({ boot, mount }) => {
        if (cancelled) return;
        await boot();
        window.PF.render();
        mount();
      })
      .catch((err) => console.error('Mode Edit gagal dimuat:', err));
    return () => { cancelled = true; };
  }, [initialData, asset, toast]);

  /* ---------- Animasi muncul saat discroll ---------- */
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal:not([data-in]), [data-reveal]:not([data-in])')];
    const show = (el) => { el.setAttribute('data-in', ''); el.dispatchEvent(new Event('revealed')); };
    if (reduced || data !== initialData || !('IntersectionObserver' in window)) {
      els.forEach(show); // render ulang (Mode Edit) langsung tampil
      return undefined;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      show(en.target);
      io.unobserve(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data, initialData, reduced]);

  const ctx = useMemo(() => ({ data, asset, toast, reduced, openLightbox, openProject, lbOpen: !!lb }),
    [data, asset, toast, reduced, openLightbox, openProject, lb]);

  return (
    <PFContext.Provider value={ctx}>
      <a className="skip" href="#about">Lewati ke konten</a>
      <Chrome name={data.profile.name} />
      <main>
        <Hero />
        <About />
        <Experience />
        <Gallery />
        <Projects />
        <Certificates />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <Lightbox state={lb} setState={setLb} opener={lbOpener} />
      <ProjectModal index={project} onClose={() => { setProject(null); projOpener.current?.focus({ preventScroll: true }); }} />
      <div className={`toast${toastState ? ' is-show' : ''}`} role="status" aria-live="polite">
        {toastState && <><Icon name={toastState.icon} /><span>{toastState.msg}</span></>}
      </div>
    </PFContext.Provider>
  );
}

/* =====================================================================
   NAVBAR, PROGRESS BAR, TEMA, TOMBOL KE ATAS
   ===================================================================== */
function Chrome({ name }) {
  const { reduced } = usePF();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const navRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      setScrolled(y > 8);
      setProgress(h > 0 ? (y / h) * 100 : 0);
      setShowTop(y > 700);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const ids = new Set(NAV.map(([id]) => id));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting && ids.has(en.target.id)) setActive(en.target.id);
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (e.composedPath().includes(navRef.current)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onScheme = (e) => {
      let saved = null;
      try { saved = localStorage.getItem('pf-theme'); } catch (_) { saved = null; }
      if (!saved) document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', onScheme);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener?.('change', onScheme);
    };
  }, []);

  const toggleTheme = (e) => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next, e, reduced);
  };

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`} ref={navRef}>
        <div className="nav__bar">
          <a href="#home" className="nav__logo">{name.split(' ').slice(0, 2).join(' ')}</a>
          <nav className="nav__links" id="navLinks" aria-label="Navigasi utama">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={() => setOpen(false)}>{label}</a>
            ))}
          </nav>
          <div className="nav__actions">
            <button className="icon-btn theme-toggle" type="button" aria-label="Ganti tema terang/gelap" onClick={toggleTheme}>
              <Icon name="sun" className="i-sun" />
              <Icon name="moon" className="i-moon" />
            </button>
            <a href="#contact" className="btn btn--primary btn--sm nav__cta">Hubungi Saya</a>
            <button className="icon-btn nav__burger" type="button" aria-label={open ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={open} aria-controls="navLinks" onClick={() => setOpen((o) => !o)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <button className={`to-top${showTop ? ' is-show' : ''}`} type="button" aria-label="Kembali ke atas"
        onClick={() => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
        <Icon name="arrowUp" />
      </button>
    </>
  );
}

/* =====================================================================
   LIGHTBOX (sertifikat & galeri)
   ===================================================================== */
function Lightbox({ state, setState, opener }) {
  const frameRef = useRef(null);
  const thumbsRef = useRef(null);
  const boxRef = useRef(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const swipe = useRef({ x: null, swiped: false });
  const n = state?.items.length || 0;
  const it = state ? state.items[state.i] : null;

  const go = useCallback((d) => setState((s) => (s ? { ...s, i: (s.i + d + s.items.length) % s.items.length } : s)), [setState]);
  const close = useCallback(() => {
    setState(null);
    opener.current?.focus?.({ preventScroll: true });
  }, [setState, opener]);

  useEffect(() => { setZoom(false); setOrigin('50% 50%'); }, [state?.i, state?.items]);

  useEffect(() => {
    if (!state) return undefined;
    document.documentElement.style.overflow = 'hidden';
    boxRef.current?.querySelector('[data-close]')?.focus({ preventScroll: true });
    return () => { document.documentElement.style.overflow = ''; };
  }, [!!state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = thumbsRef.current?.children[state?.i];
    if (t) thumbsRef.current.scrollTo({ left: t.offsetLeft - thumbsRef.current.clientWidth / 2 + t.offsetWidth / 2, behavior: 'smooth' });
  }, [state?.i]);

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') { // jaga fokus tetap di lightbox
        const f = [...boxRef.current.querySelectorAll('button, a[href], iframe')].filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [state, close, go]);

  const originAt = (e, el) => {
    const r = el.getBoundingClientRect();
    return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };

  return (
    <div className="lb" id="lb" role="dialog" aria-modal="true" aria-label="Pratinjau gambar" hidden={!state} ref={boxRef}>
      {state && (
        <>
          <div className="lb__top">
            <span className="lb__count">{pad(state.i + 1)} / {pad(n)}</span>
            <div className="lb__actions">
              {!it.pdf && (
                <button className="icon-btn icon-btn--glass" type="button" aria-label="Perbesar" onClick={() => { setOrigin('50% 50%'); setZoom((z) => !z); }}>
                  <Icon name="zoom" />
                </button>
              )}
              <a className="icon-btn icon-btn--glass" href={it.src} target="_blank" rel="noopener" aria-label="Buka file asli"><Icon name="external" /></a>
              <button className="icon-btn icon-btn--glass" type="button" aria-label="Tutup" data-close onClick={close}><Icon name="x" /></button>
            </div>
          </div>
          <div className="lb__stage">
            <button className="lb__nav lb__prev" type="button" aria-label="Sebelumnya" hidden={n < 2} onClick={() => go(-1)}><Icon name="chevLeft" /></button>
            <div
              className={`lb__frame${zoom ? ' is-zoomed' : ''}`}
              ref={frameRef}
              onPointerDown={(e) => { swipe.current = { x: e.clientX, swiped: false }; }}
              onPointerUp={(e) => {
                const { x } = swipe.current;
                swipe.current.x = null;
                if (x == null || zoom) return;
                const dx = e.clientX - x;
                if (Math.abs(dx) > 50 && n > 1) { swipe.current.swiped = true; go(dx < 0 ? 1 : -1); }
              }}
              onClick={(e) => {
                if (swipe.current.swiped) return;
                if (e.target.tagName === 'IMG') { setOrigin(originAt(e, e.target)); setZoom((z) => !z); }
                else if (e.target === e.currentTarget) close();
              }}
              onMouseMove={(e) => { if (zoom) setOrigin(originAt(e, e.currentTarget)); }}
            >
              {it.pdf
                ? <iframe key={it.src} src={it.src} title={it.title} />
                : <img key={it.src} src={it.src} alt={it.title} draggable="false" style={{ transformOrigin: origin }} />}
            </div>
            <button className="lb__nav lb__next" type="button" aria-label="Berikutnya" hidden={n < 2} onClick={() => go(1)}><Icon name="chevRight" /></button>
          </div>
          <div className="lb__bottom">
            <div className="lb__meta">
              <strong>{it.title}</strong>
              <span>{it.caption}</span>
              {it.link && <a className="lb__link" href={it.link} target="_blank" rel="noopener">Verifikasi sertifikat ↗</a>}
            </div>
            {n > 1 && (
              <div className="lb__thumbs" ref={thumbsRef}>
                {state.items.map((t, k) => (
                  <button key={k} type="button" className={k === state.i ? 'is-active' : ''} aria-label={`Gambar ${k + 1}`}
                    onClick={() => setState((s) => ({ ...s, i: k }))}>
                    {t.pdf && !t.thumb ? <Icon name="file" /> : <img src={t.thumb || t.src} alt="" loading="lazy" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* =====================================================================
   MODAL DETAIL PROYEK
   ===================================================================== */
function ProjectModal({ index, onClose }) {
  const ref = useRef(null);
  const { data, asset } = usePF();
  const p = index == null ? null : data.projects[index];

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) d.showModal();
    if (!p && d.open) d.close();
  }, [p]);

  return (
    <dialog className="modal" aria-labelledby="pmTitle" ref={ref} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) ref.current.close(); }}>
      {p && (
        <>
          <div className="modal__media">
            <img src={asset(p.image)} alt={p.title} />
            <button className="icon-btn modal__close" type="button" aria-label="Tutup" onClick={() => ref.current.close()}><Icon name="x" /></button>
          </div>
          <div className="modal__body">
            <div className="modal__meta"><span>{p.category}</span><span aria-hidden="true">•</span><span>{p.year}</span></div>
            <h3 id="pmTitle">{p.title}</h3>
            <p>{p.description}</p>
            {!!p.highlights?.length && (
              <ul className="highlights">
                {p.highlights.map((h) => <li key={h}><Icon name="checkCircle" /><span>{h}</span></li>)}
              </ul>
            )}
            {!!p.tags?.length && <div className="tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}
            {p.link && <a className="btn btn--primary modal__link" href={p.link} target="_blank" rel="noopener">Kunjungi Proyek <Icon name="arrowUpRight" /></a>}
          </div>
        </>
      )}
    </dialog>
  );
}
