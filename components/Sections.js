'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon, socialIcon } from '@/lib/icons';
import { copyText, esc, extProps, isPdf, pad, setTheme, usePF } from './context';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* =====================================================================
   HERO
   ===================================================================== */
function useTyping(roles, reduced) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!roles?.length) return undefined;
    if (reduced) { setText(roles[0]); return undefined; }
    let r = 0, c = 0, del = false, t;
    const tick = () => {
      const word = roles[r];
      c += del ? -1 : 1;
      setText(word.slice(0, c));
      let wait = del ? 32 : 68;
      if (!del && c >= word.length) { del = true; wait = 1900; }
      else if (del && c <= 0) { del = false; r = (r + 1) % roles.length; wait = 380; }
      t = setTimeout(tick, wait);
    };
    tick();
    return () => clearTimeout(t);
  }, [roles, reduced]);
  return text;
}

export function Hero() {
  const { data, asset, reduced } = usePF();
  const p = data.profile;
  const typed = useTyping(p.roles, reduced);
  const heroRef = useRef(null), photoRef = useRef(null), marqueeRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (reduced || !matchMedia('(pointer: fine)').matches) return undefined;
    const move = (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      photoRef.current.style.transform = `translate(${dx * -16}px, ${dy * -8}px)`;
      marqueeRef.current.style.transform = `translate(${dx * 28}px, ${dy * 12}px)`;
    };
    const leave = () => { photoRef.current.style.transform = ''; marqueeRef.current.style.transform = ''; };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', leave);
    return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); };
  }, [reduced]);

  return (
    <section id="home" className="wrap">
      <div className="card hero" ref={heroRef}>
        <div className="hero__marquee" aria-hidden="true" ref={marqueeRef}>
          <div className="hero__marquee-track"><span>{p.watermark}</span><span>{p.watermark}</span></div>
        </div>
        <div className="hero__grid">
          <div className="hero__title">
            <span className="badge"><span className="badge__dot"><Icon name="cap" /></span>{p.badge}</span>
            <h1><span>{p.greeting}</span><span className="hero__name">{p.firstName}</span><span className="sr-only">{p.name}</span></h1>
            <div className="hero__ctas">
              <a className="btn btn--primary" href="#contact">Mari Diskusi <Icon name="arrow" className="i-arrow" /></a>
              <a className="btn btn--ghost" href={asset(p.cv)} target="_blank" rel="noopener"><Icon name="download" /> Unduh CV</a>
            </div>
            <p className="hero__roles">
              <span className="pulse" aria-hidden="true" />
              <span aria-hidden="true">{typed}</span>
              <span className="caret" aria-hidden="true" />
              <span className="sr-only">{(p.roles || []).join(', ')}</span>
            </p>
          </div>
          <div className="hero__follow">
            <h3>Ikuti Saya</h3>
            <div className="socials">
              {(p.socials || []).map((s) => (
                <a key={s.url} className="social" href={s.url} {...extProps(s.url)} aria-label={s.label} title={s.label}><Icon name={socialIcon(s.type)} /></a>
              ))}
            </div>
            <p>{p.tagline}</p>
          </div>
          <p className="hero__intro">{p.intro}</p>
          <p className="hero__headline">{(p.headline || []).map((h) => <span key={h}>{h}</span>)}</p>
          <div className="hero__photo">
            <div className="hero__photo-inner" ref={photoRef}>
              <img src={asset(p.photo)} alt={`Foto ${p.name}`} fetchpriority="high" data-edit="profile.photo" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   TENTANG + CAROUSEL + STATISTIK
   ===================================================================== */
function Carousel({ photos, interval = 5500 }) {
  const { asset, reduced, openLightbox } = usePF();
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const ref = useRef(null);
  const sw = useRef({ x: null, moved: false });
  const n = photos.length;
  const go = useCallback((to) => setI(((to % n) + n) % n), [n]);
  const items = () => photos.map((ph) => ({ src: asset(ph.src), title: ph.caption, caption: '' }));

  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  useEffect(() => {
    const io = new IntersectionObserver(([en]) => setOffscreen(!en.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  if (!n) return null;
  return (
    <div
      className={`carousel reveal${hover || offscreen ? ' is-paused' : ''}`}
      ref={ref}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galeri foto tentang saya"
      style={{ '--dur': `${interval}ms` }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => { sw.current = { x: e.clientX, moved: false }; }}
      onPointerUp={(e) => {
        if (sw.current.x == null) return;
        const dx = e.clientX - sw.current.x;
        sw.current.x = null;
        if (Math.abs(dx) > 40) { sw.current.moved = true; go(i + (dx < 0 ? 1 : -1)); }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(i - 1);
        if (e.key === 'ArrowRight') go(i + 1);
        if (e.key === 'Enter' && e.target === e.currentTarget) openLightbox(items(), i, ref.current);
      }}
    >
      {photos.map((ph, k) => (
        <figure key={k} className={`slide${ph.cutout ? ' slide--cutout' : ''}${k === i ? ' is-active' : ''}`} aria-hidden={k !== i}
          onClick={() => { if (!sw.current.moved) openLightbox(items(), k, ref.current); }}>
          <img src={asset(ph.src)} alt={ph.caption} style={ph.position ? { objectPosition: ph.position } : undefined}
            loading={k ? 'lazy' : undefined} decoding="async" draggable="false" data-edit={`about.photos.${k}.src`} />
        </figure>
      ))}
      <div className="carousel__bars">
        {photos.map((_, k) => (
          <button key={k} type="button" aria-label={`Tampilkan foto ${k + 1}`}
            className={`carousel__bar${k < i || (reduced && k === i) ? ' is-done' : ''}${k === i && !reduced ? ' is-current' : ''}`}
            onClick={(e) => { e.stopPropagation(); go(k); }}
            onAnimationEnd={() => { if (k === i && !reduced) go(i + 1); }} />
        ))}
      </div>
      <div className="carousel__foot">
        <p className="carousel__cap" aria-live="polite"><small>{pad(i + 1)} / {pad(n)}</small>{photos[i]?.caption}</p>
        <div className="carousel__nav">
          <button type="button" aria-label="Foto sebelumnya" onClick={(e) => { e.stopPropagation(); go(i - 1); }}><Icon name="chevLeft" /></button>
          <button type="button" aria-label="Foto berikutnya" onClick={(e) => { e.stopPropagation(); go(i + 1); }}><Icon name="chevRight" /></button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, decimals, suffix, label, start }) {
  const { reduced } = usePF();
  const [v, setV] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!start) return undefined;
    if (done.current || reduced) { setV(value); return undefined; }
    done.current = true;
    const t0 = performance.now(), dur = 1700;
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      setV(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, value, reduced]);
  return (
    <div className="stat">
      <div className="stat__num">{v.toFixed(decimals || 0)}{suffix}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export function About() {
  const { data, asset } = usePF();
  const a = data.about, [first, ...rest] = a.paragraphs || [];
  const [more, setMore] = useState(false);
  const [counting, setCounting] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    const on = () => setCounting(true);
    if (el.hasAttribute('data-in')) on();
    el.addEventListener('revealed', on);
    return () => el.removeEventListener('revealed', on);
  }, []);

  return (
    <section id="about" className="wrap">
      <div className="card about">
        <div className="about__top">
          <Carousel photos={a.photos || []} />
          <div className="about__text reveal" style={{ '--d': '.1s' }}>
            <span className="eyebrow">Tentang Saya</span>
            <h2>{a.title}</h2>
            <p>{first}</p>
            {!!rest.length && (
              <div className={`about__more${more ? ' is-open' : ''}`} id="aboutMore">
                <div>{rest.map((t) => <p key={t}>{t}</p>)}</div>
              </div>
            )}
            <div className="about__actions">
              {!!rest.length && (
                <button className="btn btn--primary" type="button" aria-expanded={more} aria-controls="aboutMore" onClick={() => setMore((m) => !m)}>
                  <span>{more ? 'Tutup' : 'Baca Selengkapnya'}</span>
                  <svg className="i" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: more ? 'rotate(180deg)' : undefined }}><path d="m6 9 6 6 6-6" /></svg>
                </button>
              )}
              <a className="btn btn--ghost" href={asset(data.profile.cv)} target="_blank" rel="noopener"><Icon name="download" /> Unduh CV</a>
            </div>
          </div>
        </div>
        <div className="stats" data-reveal ref={statsRef}>
          {(data.stats || []).map((s) => (
            <Stat key={s.label} label={s.label} suffix={s.suffix || ''} decimals={s.decimals}
              value={s.auto ? (data[s.auto] || []).length : Number(s.value) || 0} start={counting} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   PENGALAMAN & PENDIDIKAN
   ===================================================================== */
export function Experience() {
  const { data, asset } = usePF();
  const [open, setOpen] = useState(() => new Set([0]));
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const score = (s) => {
    const m = String(s || '').match(/([\d.,]+)\s*\/\s*([\d.,]+)/);
    return m ? <>{m[1]} <small>/ {m[2]} IPK</small></> : s;
  };

  return (
    <section id="experience" className="wrap">
      <div className="card panel">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">Pengalaman & Pendidikan</span>
            <h2>Perjalanan karier yang dibangun dari lapangan</h2>
          </div>
          <p>Pengalaman langsung menangani jaringan skala besar, mengajar, hingga instalasi sistem keamanan. Klik setiap kartu untuk melihat detailnya.</p>
        </div>
        <div className="xp-layout">
          <ol className="timeline">
            {(data.experience || []).map((x, i) => (
              <li key={x.role + x.period} className="reveal" style={{ '--d': `${i * 0.06}s` }}>
                <div className={`xp${open.has(i) ? ' is-open' : ''}`}>
                  <button className="xp__head" type="button" aria-expanded={open.has(i)} aria-controls={`xp-${i}`} onClick={() => toggle(i)}>
                    <span className="xp__icon"><Icon name="briefcase" /></span>
                    <span>
                      <span className="xp__role">{x.role}</span>
                      <span className="xp__company">{x.company}</span>
                      <span className="chip-date xp__mobile-date">{x.period}</span>
                    </span>
                    <span className="xp__right"><span className="chip-date">{x.period}</span><Icon name="chevDown" className="xp__chev" /></span>
                  </button>
                  <div className="xp__body" id={`xp-${i}`}>
                    <div>
                      <div className="xp__content">
                        <ul className="xp__points">{(x.points || []).map((t) => <li key={t}>{t}</li>)}</ul>
                        {!!x.tags?.length && <div className="tags">{x.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <aside className="xp-aside">
            {(data.education || []).map((e) => (
              <div className="edu reveal" key={e.degree}>
                <div className="edu__icon"><Icon name="cap" /></div>
                <span className="edu__label">Pendidikan</span>
                <h3>{e.degree}</h3>
                <p className="edu__school">{e.school}</p>
                <div className="edu__row"><span className="chip-date">{e.period}</span>{e.score && <span className="edu__score">{score(e.score)}</span>}</div>
                <p>{e.description}</p>
              </div>
            ))}
            <div className="avail reveal" style={{ '--d': '.1s' }}>
              <p className="avail__status"><span className="pulse" aria-hidden="true" />Terbuka untuk peluang baru</p>
              <p>Siap berkontribusi sebagai Network Engineer, DevOps Engineer, atau Software Engineer.</p>
              <a className="btn btn--soft btn--sm" href={asset(data.profile.cv)} target="_blank" rel="noopener"><Icon name="download" /> Unduh CV</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   DOKUMENTASI KEGIATAN (strip carousel)
   ===================================================================== */
export function Gallery() {
  const { data, asset, reduced, openLightbox, lbOpen } = usePF();
  const g = data.gallery || [];
  const trackRef = useRef(null), wrapRef = useRef(null);
  const [count, setCount] = useState(0);
  const [ratio, setRatio] = useState(0);
  const st = useRef({ cur: 0, hover: false, inView: false, down: null, moved: false });
  const lbRef = useRef(lbOpen);
  lbRef.current = lbOpen;

  const padL = () => parseFloat(getComputedStyle(trackRef.current).paddingLeft) || 0;
  const items = () => [...trackRef.current.querySelectorAll('.strip__item')];

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const list = items(), max = track.scrollWidth - track.clientWidth;
    const r = max > 0 ? track.scrollLeft / max : 1;
    let best = Infinity, cur = 0;
    list.forEach((el, k) => { const d = Math.abs(el.offsetLeft - padL() - track.scrollLeft); if (d < best) { best = d; cur = k; } });
    if (max > 0 && r > 0.985) cur = list.length - 1;
    st.current.cur = cur;
    setCount(cur);
    setRatio(r);
  }, []);

  const step = useCallback((dir) => {
    const track = trackRef.current, list = items(), max = track.scrollWidth - track.clientWidth;
    if (!list.length) return;
    if (dir > 0 && track.scrollLeft >= max - 4) { track.scrollTo({ left: 0 }); return; }
    if (dir < 0 && track.scrollLeft <= 4) { track.scrollTo({ left: max }); return; }
    const next = list[Math.min(list.length - 1, Math.max(0, st.current.cur + dir))];
    track.scrollTo({ left: next.offsetLeft - padL() });
  }, []);

  useEffect(() => {
    const track = trackRef.current, wrap = wrapRef.current, s = st.current;
    const onScroll = () => requestAnimationFrame(update);
    const onMove = (e) => {
      if (!s.down) return;
      const dx = e.clientX - s.down.x;
      if (!s.moved && Math.abs(dx) > 6) { s.moved = true; track.classList.add('is-dragging'); }
      if (s.moved) track.scrollLeft = s.down.left - dx;
    };
    const onUp = () => {
      if (!s.down) return;
      s.down = null;
      if (s.moved) { track.classList.remove('is-dragging'); update(); step(0); }
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('load', update, true);
    addEventListener('resize', update);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
    const io = new IntersectionObserver(([en]) => { s.inView = en.isIntersecting; }, { threshold: 0.4 });
    io.observe(wrap);
    const timer = reduced ? null : setInterval(() => {
      if (s.inView && !s.hover && !s.down && !document.hidden && !lbRef.current) step(1);
    }, 4200);
    update();
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('load', update, true);
      removeEventListener('resize', update);
      removeEventListener('pointermove', onMove);
      removeEventListener('pointerup', onUp);
      io.disconnect();
      clearInterval(timer);
    };
  }, [reduced, step, update]);

  useEffect(() => { update(); }, [g.length, update]);

  const galleryItems = () => g.map((it) => ({ src: asset(it.src), title: it.title, caption: it.caption }));

  return (
    <section id="gallery" className="wrap">
      <div className="card panel">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">Dokumentasi Kegiatan</span>
            <h2>Momen di balik pekerjaan</h2>
          </div>
          <div className="strip-controls">
            <span className="strip-count">{pad(g.length ? count + 1 : 0)} / {pad(g.length)}</span>
            <button className="icon-btn icon-btn--outline" type="button" aria-label="Foto sebelumnya" onClick={() => step(-1)}><Icon name="chevLeft" /></button>
            <button className="icon-btn icon-btn--outline" type="button" aria-label="Foto berikutnya" onClick={() => step(1)}><Icon name="chevRight" /></button>
          </div>
        </div>
        <div className="strip reveal" ref={wrapRef}
          onPointerEnter={() => { st.current.hover = true; }} onPointerLeave={() => { st.current.hover = false; }}
          onFocus={() => { st.current.hover = true; }} onBlur={() => { st.current.hover = false; }}>
          <div
            className="strip__track"
            ref={trackRef}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse' || e.button !== 0) return;
              st.current.down = { x: e.clientX, left: trackRef.current.scrollLeft };
              st.current.moved = false;
            }}
            onClickCapture={(e) => {
              if (st.current.moved) { e.preventDefault(); e.stopPropagation(); st.current.moved = false; }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
            }}
          >
            {g.map((it, i) => (
              <button key={i} className="strip__item" type="button" aria-label={`Lihat foto: ${it.title}`}
                onClick={(e) => openLightbox(galleryItems(), i, e.currentTarget)}>
                <img src={asset(it.src)} alt={it.title} loading="lazy" decoding="async" draggable="false" data-edit={`gallery.${i}.src`} />
                <span className="strip__zoom"><Icon name="zoom" /></span>
                <span className="strip__meta"><strong>{it.title}</strong><span>{it.caption}</span></span>
              </button>
            ))}
          </div>
          <div className="strip__progress"><span style={{ width: `${Math.max(6, ratio * 100)}%` }} /></div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   PROYEK
   ===================================================================== */
export function Projects() {
  const { data, asset, openProject } = usePF();
  return (
    <section id="projects" className="wrap">
      <div className="card panel">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">Proyek</span>
            <h2>Mewujudkan ide menjadi solusi nyata</h2>
          </div>
          <p>Kumpulan proyek yang mencerminkan proses berpikir, pemecahan masalah, dan hasil yang terukur.</p>
        </div>
        <div className="projects">
          {(data.projects || []).map((p, i) => (
            <button key={i} className="project reveal" type="button" style={{ '--d': `${(i % 3) * 0.08}s` }}
              aria-label={`Detail proyek ${p.title}`} onClick={(e) => openProject(i, e.currentTarget)}>
              <img src={asset(p.image)} alt="" loading="lazy" decoding="async" data-edit={`projects.${i}.image`} />
              <span className="project__body">
                <span className="project__top"><span className="project__title">{p.title}</span><span className="project__year">{p.year}</span></span>
                <span className="project__cat">{p.category}</span>
                <span className="project__more">
                  <span>
                    <span className="project__desc">{p.description}</span>
                    {!!p.tags?.length && <span className="tags">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</span>}
                    <span className="project__cta">Lihat detail <Icon name="arrowUpRight" /></span>
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   SERTIFIKAT
   ===================================================================== */
const CERT_LIMIT = 8;

export function Certificates() {
  const { data, asset, openLightbox, reduced } = usePF();
  const certs = data.certificates || [];
  const [cat, setCat] = useState('Semua');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [all, setAll] = useState(false);

  useEffect(() => { const t = setTimeout(() => setQuery(q), 120); return () => clearTimeout(t); }, [q]);

  const cats = useMemo(() => ['Semua', ...new Set(certs.map((c) => c.category).filter(Boolean))], [certs]);
  const activeCat = cats.includes(cat) ? cat : 'Semua';
  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    return certs.map((c, i) => ({ ...c, _i: i })).filter((c) => (activeCat === 'Semua' || c.category === activeCat)
      && (!s || [c.title, c.issuer, c.description, c.category, c.date].join(' ').toLowerCase().includes(s)));
  }, [certs, activeCat, query]);
  const searching = !!query.trim();
  const shown = all || searching ? list : list.slice(0, CERT_LIMIT);
  const item = (c) => ({ src: asset(c.image), thumb: asset(c.thumb || c.image), title: c.title, caption: [c.issuer, c.date].filter(Boolean).join(' · '), link: c.link, pdf: isPdf(c.image) });

  return (
    <section id="certificates" className="wrap">
      <div className="card panel">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">Pelatihan & Sertifikasi</span>
            <h2>Kompetensi yang tervalidasi</h2>
          </div>
          <p>Sertifikasi resmi dari lembaga industri dan pemerintah. Klik sertifikat untuk melihat ukuran penuh.</p>
        </div>
        <div className="cert-toolbar reveal">
          <div className="chips" role="tablist" aria-label="Filter kategori sertifikat">
            {cats.map((c) => {
              const n = c === 'Semua' ? certs.length : certs.filter((x) => x.category === c).length;
              return (
                <button key={c} type="button" role="tab" aria-selected={c === activeCat} className={`chip${c === activeCat ? ' is-active' : ''}`}
                  onClick={() => { setCat(c); setAll(false); }}>
                  {c} <small>{n}</small>
                </button>
              );
            })}
          </div>
          <label className="search">
            <Icon name="search" />
            <input type="search" placeholder="Cari sertifikat…" aria-label="Cari sertifikat" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <div className="cert-grid" data-reveal>
          {shown.length ? shown.map((c, k) => (
            <button key={c._i} className="cert" type="button" style={{ '--i': k % 12 }} aria-label={`Lihat sertifikat ${c.title}`}
              onClick={(e) => openLightbox(list.map(item), list.findIndex((x) => x._i === c._i), e.currentTarget)}>
              <span className="cert__media">
                {isPdf(c.image) && !c.thumb
                  ? <span className="cert__pdf" data-edit={`certificates.${c._i}.image`}><Icon name="file" />PDF</span>
                  : <img src={asset(c.thumb || c.image)} alt="" loading="lazy" decoding="async" data-edit={`certificates.${c._i}.image`} />}
                <span className="cert__view"><Icon name="zoom" /></span>
              </span>
              <span className="cert__body">
                <span className="cert__issuer">{c.issuer}</span>
                <span className="cert__title">{c.title}</span>
                {c.description && <span className="cert__desc">{c.description}</span>}
                {c.date && <span className="cert__date"><Icon name="calendar" />{c.date}</span>}
              </span>
            </button>
          )) : (
            <p className="empty">Tidak ada sertifikat yang cocok dengan “{query}”{activeCat !== 'Semua' ? ` di kategori “${activeCat}”` : ''}.</p>
          )}
        </div>
        {!searching && list.length > CERT_LIMIT && (
          <div className="cert-more">
            <button className="btn btn--ghost" type="button" onClick={() => {
              setAll((a) => !a);
              if (all) document.getElementById('certificates').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
            }}>
              {all ? <>Tampilkan Lebih Sedikit <Icon name="chevUp" /></> : <>Tampilkan Semua ({list.length}) <Icon name="chevDown" /></>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* =====================================================================
   KEAHLIAN
   ===================================================================== */
const LEVELS = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

export function Skills() {
  const { data } = usePF();
  const groups = data.skills || [];
  const [group, setGroup] = useState('Semua');
  const tabsRef = useRef(null), inkRef = useRef(null);
  const tabs = [{ group: 'Semua', icon: 'grid' }, ...groups];
  const active = tabs.some((t) => t.group === group) ? group : 'Semua';
  const items = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.group, icon: g.icon })))
    .filter((it) => active === 'Semua' || it.group === active);

  const moveInk = useCallback(() => {
    const act = tabsRef.current?.querySelector('.tab.is-active'), ink = inkRef.current;
    if (!act || !ink) return;
    ink.style.width = `${act.offsetWidth}px`;
    ink.style.transform = `translateX(${act.offsetLeft}px)`;
  }, []);
  useIsoLayoutEffect(() => { moveInk(); }, [active, groups.length, moveInk]);
  useEffect(() => {
    addEventListener('resize', moveInk);
    addEventListener('pf-theme', moveInk);
    document.fonts?.ready.then(moveInk);
    return () => { removeEventListener('resize', moveInk); removeEventListener('pf-theme', moveInk); };
  }, [moveInk]);

  return (
    <section id="skills" className="wrap">
      <div className="card panel">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">Tech Stack & Keahlian</span>
            <h2>Alat yang saya gunakan setiap hari</h2>
          </div>
          <p>Dari konfigurasi router hingga pipeline deployment dan antarmuka web.</p>
        </div>
        <div className="tabs reveal" role="tablist" aria-label="Filter keahlian" ref={tabsRef}>
          <span className="tabs__ink" aria-hidden="true" ref={inkRef} />
          {tabs.map((t) => (
            <button key={t.group} type="button" role="tab" aria-selected={t.group === active}
              className={`tab${t.group === active ? ' is-active' : ''}`} onClick={() => setGroup(t.group)}>
              <Icon name={t.icon || 'code'} />{t.group}
            </button>
          ))}
        </div>
        <div className="skill-grid" data-reveal>
          {items.map((s, k) => {
            const lv = LEVELS[s.level] || 2;
            return (
              <div className="skill" key={s.group + s.name} style={{ '--i': k % 16 }}>
                <div className="skill__top"><span className="skill__name">{s.name}</span><span className="skill__group" title={s.group}><Icon name={s.icon || 'code'} /></span></div>
                <div className="skill__level">
                  <span>{s.level}</span>
                  <span className="meter" role="img" aria-label={`Level ${lv} dari 4`}>
                    {[1, 2, 3, 4].map((n) => <i key={n} className={n <= lv ? 'on' : ''} style={{ '--s': n }} />)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   KONTAK + TERMINAL
   ===================================================================== */
function CopyButton({ value, label }) {
  const { toast } = usePF();
  const [ok, setOk] = useState(false);
  return (
    <button className="copy-btn" type="button" aria-label={`Salin ${label}`} onClick={async () => {
      if (await copyText(value)) {
        toast(`${value} disalin`);
        setOk(true);
        setTimeout(() => setOk(false), 1600);
      }
    }}>
      <Icon name={ok ? 'check' : 'copy'} />
    </button>
  );
}

const SECTIONS = { about: 'about', experience: 'experience', gallery: 'gallery', projects: 'projects', certificates: 'certificates', skills: 'skills', contact: 'contact' };

function Terminal() {
  const pf = usePF();
  const pfRef = useRef(pf);
  pfRef.current = pf;
  const [lines, setLines] = useState([
    { html: '<span class="term__ok">Selamat datang di terminal Aditya!</span>' },
    { html: '<span class="term__muted">Ketik</span> <span class="term__hl">help</span> <span class="term__muted">untuk melihat daftar perintah.</span>' },
  ]);
  const [value, setValue] = useState('');
  const hist = useRef([]), hi = useRef(0);
  const bodyRef = useRef(null), inputRef = useRef(null);

  useEffect(() => { bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines]);

  const commands = useMemo(() => {
    const D = () => pfRef.current.data;
    const list = (rows) => rows.map((r) => `  <span class="term__hl">›</span> ${r}`).join('\n');
    const C = {
      help: () => '<span class="term__hl">Perintah yang tersedia:</span>\n' + [
        ['whoami', 'siapa saya'], ['about', 'ringkasan profil'], ['experience', 'riwayat pekerjaan'],
        ['skills', 'daftar keahlian'], ['certs', 'daftar sertifikat'], ['projects', 'proyek utama'],
        ['contact', 'info kontak'], ['cv', 'buka CV (PDF)'], ['goto <bagian>', 'lompat ke bagian halaman'],
        ['theme [light|dark]', 'ganti tema'], ['ls', 'daftar bagian'], ['date', 'tanggal & waktu'],
        ['echo <teks>', 'tampilkan teks'], ['clear', 'bersihkan layar'],
      ].map(([c, d]) => `  <span class="term__hl">${esc(c.padEnd(20))}</span><span class="term__muted">${d}</span>`).join('\n'),
      whoami: () => { const p = D().profile; return `<span class="term__ok">${esc(p.name)}</span>\n${esc((p.roles || []).join(' · '))}`; },
      about: () => esc(D().about.paragraphs?.[0] || ''),
      experience: () => list((D().experience || []).map((x) => `${esc(x.role)} <span class="term__muted">— ${esc(x.company)} (${esc(x.period)})</span>`)),
      skills: () => (D().skills || []).map((g) => `<span class="term__ok">${esc(g.group)}</span>\n  ${esc(g.items.map((i) => i.name).join(', '))}`).join('\n'),
      certs: () => { const c = D().certificates || []; return `<span class="term__ok">${c.length} sertifikat</span>\n` + list(c.map((x) => `${esc(x.title)} <span class="term__muted">— ${esc(x.issuer)}</span>`)); },
      projects: () => list((D().projects || []).map((x) => `${esc(x.title)} <span class="term__muted">(${esc(x.year)}) ${esc(x.category)}</span>`)),
      contact: () => {
        const p = D().profile;
        return [`email    : ${esc(p.email)}`, `telepon  : ${esc(p.phone)}`, ...(p.socials || []).filter((s) => /^https?:/.test(s.url)).map((s) => `${esc(s.label.toLowerCase().padEnd(9))}: ${esc(s.url)}`)].join('\n');
      },
      cv: () => { window.open(pfRef.current.asset(D().profile.cv), '_blank', 'noopener'); return '<span class="term__ok">Membuka CV…</span>'; },
      goto: ([s]) => {
        const id = SECTIONS[(s || '').toLowerCase()];
        if (!id) return `Gunakan: goto <span class="term__hl">${Object.keys(SECTIONS).join(' | ')}</span>`;
        document.getElementById(id).scrollIntoView({ behavior: pfRef.current.reduced ? 'auto' : 'smooth' });
        return `<span class="term__ok">Menuju ${esc(s)}…</span>`;
      },
      theme: ([t]) => {
        const next = t === 'light' || t === 'dark' ? t : document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next, null, pfRef.current.reduced);
        return `<span class="term__ok">Tema diganti ke ${next}.</span>`;
      },
      ls: () => Object.keys(SECTIONS).map((s) => `<span class="term__hl">${s}/</span>`).join('  '),
      date: () => esc(new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })),
      echo: (args) => esc(args.join(' ')),
      clear: () => null,
      sudo: () => '<span class="term__warn">Akses ditolak.</span> Hubungi saya untuk akses penuh ;)',
      halo: () => 'Halo juga! Ketik <span class="term__hl">help</span> untuk mulai.',
    };
    return Object.assign(C, { tentang: C.about, pengalaman: C.experience, exp: C.experience, keahlian: C.skills, sertifikat: C.certs, proyek: C.projects, kontak: C.contact, hello: C.halo, hi: C.halo, cls: C.clear });
  }, []);

  const run = (line) => {
    const raw = line.trim();
    const echo = { html: `<span class="term__cmd"><b>guest@portfolio:~$</b> ${esc(raw)}</span>` };
    if (!raw) { setLines((l) => [...l, echo]); return; }
    hist.current.push(raw);
    hi.current = hist.current.length;
    const [cmd, ...args] = raw.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn === commands.clear) { setLines([]); return; }
    const out = fn ? fn(args) : `<span class="term__warn">perintah tidak ditemukan: ${esc(cmd)}</span> — ketik <span class="term__hl">help</span>`;
    setLines((l) => [...l, echo, ...(out ? [{ html: out }] : [])]);
  };

  return (
    <div className="term reveal">
      <div className="term__bar">
        <span className="term__dots"><i /><i /><i /></span>
        <span className="term__title">guest@aditya-portfolio:~</span>
      </div>
      <div className="term__body" ref={bodyRef} onClick={() => { if (!getSelection().toString()) inputRef.current.focus({ preventScroll: true }); }}>
        <div className="term__out">
          {lines.map((l, k) => <div key={k} dangerouslySetInnerHTML={{ __html: l.html }} />)}
        </div>
        <form className="term__line" autoComplete="off" onSubmit={(e) => { e.preventDefault(); run(value); setValue(''); }}>
          <label htmlFor="termInput" className="term__prompt">guest@portfolio:~$</label>
          <input id="termInput" ref={inputRef} spellCheck="false" autoCapitalize="off" placeholder="ketik 'help'…" value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              const h = hist.current;
              if (e.key === 'ArrowUp' && h.length) { e.preventDefault(); hi.current = Math.max(0, hi.current - 1); setValue(h[hi.current]); }
              else if (e.key === 'ArrowDown' && h.length) { e.preventDefault(); hi.current = Math.min(h.length, hi.current + 1); setValue(h[hi.current] || ''); }
              else if (e.key === 'Tab' && value.trim()) {
                const match = Object.keys(commands).filter((k) => k.startsWith(value.trim().toLowerCase()));
                if (!match.length) return;
                e.preventDefault();
                if (match.length === 1) setValue(`${match[0]} `);
                else setLines((l) => [...l, { html: `<span class="term__muted">${match.join('  ')}</span>` }]);
              }
            }} />
        </form>
      </div>
    </div>
  );
}

export function Contact() {
  const { data } = usePF();
  const p = data.profile, c = data.contact || {};
  const rows = [
    { ico: 'mail', label: 'Email', value: p.email, href: `mailto:${p.email}`, copy: p.email },
    p.phone && { ico: 'phone', label: 'Telepon / WhatsApp', value: p.phone, href: p.whatsapp ? `https://wa.me/${p.whatsapp}` : `tel:${p.phone}`, copy: p.phone },
    ...(p.socials || []).filter((s) => ['linkedin', 'github'].includes(s.type))
      .map((s) => ({ ico: s.type, label: s.label, value: s.url.replace(/^https?:\/\/(www\.)?/, ''), href: s.url })),
  ].filter(Boolean);

  return (
    <section id="contact" className="wrap">
      <div className="contact">
        <div className="contact__info reveal">
          <span className="eyebrow">Kontak</span>
          <h2>{c.title}</h2>
          <p className="contact__text">{c.text}</p>
          <div className="contact__ctas">
            <a className="btn btn--white" href={`mailto:${p.email}`}><Icon name="mail" /> Kirim Email</a>
            {p.whatsapp && <a className="btn btn--line-white" href={`https://wa.me/${p.whatsapp}`} target="_blank" rel="noopener"><Icon name="whatsapp" /> WhatsApp</a>}
          </div>
          <ul className="contact__list">
            {rows.map((r) => (
              <li className="contact__row" key={r.label}>
                <span className="contact__ico"><Icon name={r.ico} /></span>
                <div><small>{r.label}</small><a href={r.href} {...extProps(r.href)}>{r.value}</a></div>
                {r.copy
                  ? <CopyButton value={r.copy} label={r.label} />
                  : <a className="copy-btn" href={r.href} target="_blank" rel="noopener" aria-label={`Buka ${r.label}`}><Icon name="arrowUpRight" /></a>}
              </li>
            ))}
          </ul>
        </div>
        <Terminal />
      </div>
    </section>
  );
}

export function Footer() {
  const { data } = usePF();
  const p = data.profile;
  return (
    <footer className="wrap footer">
      <span>© {new Date().getFullYear()} {p.name}. Dibuat dengan sepenuh hati.</span>
      <nav className="footer__links" aria-label="Tautan footer">
        {(p.socials || []).filter((s) => s.type !== 'whatsapp').map((s) => <a key={s.url} href={s.url} {...extProps(s.url)}>{s.label}</a>)}
        <a href="#home">Ke atas ↑</a>
      </nav>
    </footer>
  );
}
