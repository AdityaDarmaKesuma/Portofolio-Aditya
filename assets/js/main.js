/* =====================================================================
   Portofolio — rendering & interaksi.
   Semua konten dibaca dari data.js (window.PORTFOLIO).
   Mode Edit (upload sertifikat / ganti gambar) ada di editor.js dan
   hanya dimuat saat alamat dibuka dengan ?edit
   ===================================================================== */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const data = () => window.PORTFOLIO;
  const isPdf = (p) => /\.pdf(\?|#|$)/i.test(p || '');
  const ext = (url) => (/^(https?:|mailto:)/.test(url) && !url.startsWith('mailto:') ? ' target="_blank" rel="noopener"' : '');

  /* ---------- Ikon (gaya Lucide) ---------- */
  const ICONS = {
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowUpRight: '<path d="M7 7h10v10M7 17 17 7"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevUp: '<path d="m18 15-6-6-6 6"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    zoom: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5M22 10v6"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
  };
  const BRANDS = {
    linkedin: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
    github: 'M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3',
    whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.41z',
  };
  function icon(name, cls = '') {
    if (BRANDS[name]) return `<svg class="i i--fill ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${BRANDS[name]}"/></svg>`;
    return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }
  const socialIcon = (t) => ({ linkedin: 'linkedin', github: 'github', email: 'mail', whatsapp: 'whatsapp', phone: 'phone' }[t] || 'arrowUpRight');

  /* API kecil yang juga dipakai editor.js */
  const PF = (window.PF = {
    blobs: {},
    asset: (p) => (p && PF.blobs[p]) || p || '',
    render: renderAll,
    toast,
    icon,
    esc,
    rendered: false,
  });

  /* =================================================================
     RENDER
     ================================================================= */
  function renderAll() {
    const d = data();
    if (!d) return;
    if (d.site?.title) document.title = d.site.title;
    const desc = $('meta[name="description"]');
    if (desc && d.site?.description) desc.content = d.site.description;
    $('#navLogo').textContent = d.profile.name.split(' ').slice(0, 2).join(' ');

    renderHero();
    renderAbout();
    renderExperience();
    renderGallery();
    renderProjects();
    renderCertificates();
    renderSkills();
    renderContact();
    renderFooter();
    initReveal();
    PF.rendered = true;
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    const p = data().profile;
    const wm = esc(p.watermark || '');
    $('#hero').innerHTML = `
      <div class="hero__marquee" aria-hidden="true"><div class="hero__marquee-track"><span>${wm}</span><span>${wm}</span></div></div>
      <div class="hero__grid">
        <div class="hero__title">
          <span class="badge"><span class="badge__dot">${icon('cap')}</span>${esc(p.badge)}</span>
          <h1><span>${esc(p.greeting)}</span><span class="hero__name">${esc(p.firstName)}</span><span class="sr-only">${esc(p.name)}</span></h1>
          <div class="hero__ctas">
            <a class="btn btn--primary" href="#contact">Mari Diskusi ${icon('arrow', 'i-arrow')}</a>
            <a class="btn btn--ghost" href="${esc(PF.asset(p.cv))}" target="_blank" rel="noopener">${icon('download')} Unduh CV</a>
          </div>
          <p class="hero__roles"><span class="pulse" aria-hidden="true"></span><span id="typed" aria-hidden="true"></span><span class="caret" aria-hidden="true"></span><span class="sr-only">${esc((p.roles || []).join(', '))}</span></p>
        </div>
        <div class="hero__follow">
          <h3>Ikuti Saya</h3>
          <div class="socials">${(p.socials || []).map((s) => `<a class="social" href="${esc(s.url)}"${ext(s.url)} aria-label="${esc(s.label)}" title="${esc(s.label)}">${icon(socialIcon(s.type))}</a>`).join('')}</div>
          <p>${esc(p.tagline)}</p>
        </div>
        <p class="hero__intro">${esc(p.intro)}</p>
        <p class="hero__headline">${(p.headline || []).map((h) => `<span>${esc(h)}</span>`).join('')}</p>
        <div class="hero__photo"><div class="hero__photo-inner"><img src="${esc(PF.asset(p.photo))}" alt="Foto ${esc(p.name)}" fetchpriority="high" data-edit="profile.photo"></div></div>
      </div>`;
    startTyping(p.roles || []);
  }

  let typeTimer;
  function startTyping(roles) {
    clearTimeout(typeTimer);
    const el = $('#typed');
    if (!el || !roles.length) return;
    if (reduced) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, del = false;
    const tick = () => {
      const word = roles[r];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      let wait = del ? 32 : 68;
      if (!del && c >= word.length) { del = true; wait = 1900; }
      else if (del && c <= 0) { del = false; r = (r + 1) % roles.length; wait = 380; }
      typeTimer = setTimeout(tick, wait);
    };
    tick();
  }

  /* ---------- Tentang + carousel + statistik ---------- */
  function renderAbout() {
    const d = data(), a = d.about, p = d.profile;
    const photos = a.photos || [];
    const [first, ...rest] = a.paragraphs || [];
    const statVal = (s) => (s.auto ? (d[s.auto] || []).length : Number(s.value) || 0);
    const fmt = (s) => statVal(s).toFixed(s.decimals || 0) + (s.suffix || '');

    $('#aboutCard').innerHTML = `
      <div class="about__top">
        <div class="carousel reveal" id="aboutCarousel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Galeri foto tentang saya">
          ${photos.map((ph, i) => `
            <figure class="slide${ph.cutout ? ' slide--cutout' : ''}${i === 0 ? ' is-active' : ''}" aria-hidden="${i !== 0}">
              <img src="${esc(PF.asset(ph.src))}" alt="${esc(ph.caption)}"${ph.position ? ` style="object-position:${esc(ph.position)}"` : ''} ${i ? 'loading="lazy"' : ''} decoding="async" draggable="false" data-edit="about.photos.${i}.src">
            </figure>`).join('')}
          <div class="carousel__bars">${photos.map((_, i) => `<button class="carousel__bar" type="button" aria-label="Tampilkan foto ${i + 1}"></button>`).join('')}</div>
          <div class="carousel__foot">
            <p class="carousel__cap" aria-live="polite"></p>
            <div class="carousel__nav">
              <button type="button" data-dir="-1" aria-label="Foto sebelumnya">${icon('chevLeft')}</button>
              <button type="button" data-dir="1" aria-label="Foto berikutnya">${icon('chevRight')}</button>
            </div>
          </div>
        </div>
        <div class="about__text reveal" style="--d:.1s">
          <span class="eyebrow">Tentang Saya</span>
          <h2>${esc(a.title)}</h2>
          <p>${esc(first)}</p>
          ${rest.length ? `<div class="about__more" id="aboutMore"><div>${rest.map((t) => `<p>${esc(t)}</p>`).join('')}</div></div>` : ''}
          <div class="about__actions">
            ${rest.length ? `<button class="btn btn--primary" type="button" id="aboutToggle" aria-expanded="false" aria-controls="aboutMore"><span>Baca Selengkapnya</span>${icon('chevDown')}</button>` : ''}
            <a class="btn btn--ghost" href="${esc(PF.asset(p.cv))}" target="_blank" rel="noopener">${icon('download')} Unduh CV</a>
          </div>
        </div>
      </div>
      <div class="stats${PF.rendered ? ' in' : ''}" id="stats" data-reveal>
        ${(d.stats || []).map((s) => `
          <div class="stat">
            <div class="stat__num" data-count="${statVal(s)}" data-decimals="${s.decimals || 0}" data-suffix="${esc(s.suffix || '')}">${PF.rendered ? esc(fmt(s)) : '0' + esc(s.suffix || '')}</div>
            <div class="stat__label">${esc(s.label)}</div>
          </div>`).join('')}
      </div>`;
    initCarousel($('#aboutCarousel'));
  }

  let carouselIO;
  function initCarousel(el, interval = 5500) {
    const slides = $$('.slide', el), bars = $$('.carousel__bar', el), cap = $('.carousel__cap', el);
    const photos = data().about.photos || [];
    const n = slides.length;
    if (!n) return;
    let i = 0, hover = false, offscreen = false, sx = null, moved = false;
    el.style.setProperty('--dur', interval + 'ms');

    const go = (to) => {
      slides[i].classList.remove('is-active');
      slides[i].setAttribute('aria-hidden', 'true');
      i = (to + n) % n;
      slides[i].classList.add('is-active');
      slides[i].setAttribute('aria-hidden', 'false');
      bars.forEach((b, k) => { b.classList.remove('is-current'); b.classList.toggle('is-done', k < i); });
      void bars[i].offsetWidth; // restart animasi bar
      bars[i].classList.add(reduced ? 'is-done' : 'is-current');
      cap.innerHTML = `<small>${pad(i + 1)} / ${pad(n)}</small>${esc(photos[i]?.caption || '')}`;
    };
    const setPaused = () => el.classList.toggle('is-paused', hover || offscreen);

    bars.forEach((b, k) => {
      b.addEventListener('click', (e) => { e.stopPropagation(); go(k); });
      b.addEventListener('animationend', (e) => { if (e.target === b && !reduced) go(i + 1); });
    });
    $$('[data-dir]', el).forEach((btn) => btn.addEventListener('click', (e) => { e.stopPropagation(); go(i + Number(btn.dataset.dir)); }));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'Enter' && e.target === el) openLightbox(photos.map(photoItem), i, el);
    });
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hover = true; setPaused(); } });
    el.addEventListener('pointerleave', () => { hover = false; setPaused(); });
    el.addEventListener('pointerdown', (e) => { sx = e.clientX; moved = false; });
    el.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) { moved = true; go(i + (dx < 0 ? 1 : -1)); }
    });
    slides.forEach((s, k) => s.addEventListener('click', () => { if (!moved) openLightbox(photos.map(photoItem), k, el); }));

    carouselIO?.disconnect();
    carouselIO = new IntersectionObserver(([en]) => { offscreen = !en.isIntersecting; setPaused(); });
    carouselIO.observe(el);
    go(0);
  }
  const photoItem = (ph) => ({ src: PF.asset(ph.src), title: ph.caption, caption: '' });

  function countUp() {
    $$('#stats .stat__num').forEach((el) => {
      const to = parseFloat(el.dataset.count) || 0, dec = +el.dataset.decimals || 0, suf = el.dataset.suffix || '';
      const fmt = (v) => v.toFixed(dec) + suf;
      if (reduced) { el.textContent = fmt(to); return; }
      const t0 = performance.now(), dur = 1700;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Pengalaman & pendidikan ---------- */
  function renderExperience() {
    const d = data();
    $('#timeline').innerHTML = (d.experience || []).map((x, i) => `
      <li class="xp reveal${i === 0 ? ' is-open' : ''}" style="--d:${i * 0.06}s">
        <button class="xp__head" type="button" aria-expanded="${i === 0}" aria-controls="xp-${i}">
          <span class="xp__icon">${icon('briefcase')}</span>
          <span>
            <span class="xp__role">${esc(x.role)}</span>
            <span class="xp__company">${esc(x.company)}</span>
            <span class="chip-date xp__mobile-date">${esc(x.period)}</span>
          </span>
          <span class="xp__right"><span class="chip-date">${esc(x.period)}</span>${icon('chevDown', 'xp__chev')}</span>
        </button>
        <div class="xp__body" id="xp-${i}"><div><div class="xp__content">
          <ul class="xp__points">${(x.points || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${x.tags?.length ? `<div class="tags">${x.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        </div></div></div>
      </li>`).join('');

    const score = (s) => {
      const m = String(s || '').match(/([\d.,]+)\s*\/\s*([\d.,]+)/);
      return m ? `${esc(m[1])} <small>/ ${esc(m[2])} IPK</small>` : esc(s);
    };
    $('#education').innerHTML = (d.education || []).map((e) => `
      <div class="edu reveal">
        <div class="edu__icon">${icon('cap')}</div>
        <span class="edu__label">Pendidikan</span>
        <h3>${esc(e.degree)}</h3>
        <p class="edu__school">${esc(e.school)}</p>
        <div class="edu__row"><span class="chip-date">${esc(e.period)}</span>${e.score ? `<span class="edu__score">${score(e.score)}</span>` : ''}</div>
        <p>${esc(e.description)}</p>
      </div>`).join('') + `
      <div class="avail reveal" style="--d:.1s">
        <p class="avail__status"><span class="pulse" aria-hidden="true"></span>Terbuka untuk peluang baru</p>
        <p>Siap berkontribusi sebagai Network Engineer, DevOps Engineer, atau Software Engineer.</p>
        <a class="btn btn--soft btn--sm" href="${esc(PF.asset(d.profile.cv))}" target="_blank" rel="noopener">${icon('download')} Unduh CV</a>
      </div>`;
  }

  /* ---------- Galeri (strip carousel) ---------- */
  function renderGallery() {
    const g = data().gallery || [];
    $('#stripTrack').innerHTML = g.map((it, i) => `
      <button class="strip__item" type="button" data-i="${i}" aria-label="Lihat foto: ${esc(it.title)}">
        <img src="${esc(PF.asset(it.src))}" alt="${esc(it.title)}" loading="lazy" decoding="async" draggable="false" data-edit="gallery.${i}.src">
        <span class="strip__zoom">${icon('zoom')}</span>
        <span class="strip__meta"><strong>${esc(it.title)}</strong><span>${esc(it.caption)}</span></span>
      </button>`).join('');
    $('#stripTrack').scrollLeft = 0;
    strip.update();
  }
  const galleryItems = () => (data().gallery || []).map((g) => ({ src: PF.asset(g.src), title: g.title, caption: g.caption }));

  const strip = { update() {} };
  function initStrip() {
    const wrap = $('#strip'), track = $('#stripTrack'), bar = $('#stripBar'), count = $('#stripCount');
    const items = () => $$('.strip__item', track);
    const padL = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let cur = 0, hover = false, inView = false, down = null, moved = false;

    strip.update = () => {
      const list = items(), max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 1;
      bar.style.width = `${Math.max(6, ratio * 100)}%`;
      let best = Infinity;
      list.forEach((el, k) => {
        const dist = Math.abs(el.offsetLeft - padL() - track.scrollLeft);
        if (dist < best) { best = dist; cur = k; }
      });
      if (max > 0 && ratio > 0.985) cur = list.length - 1;
      count.textContent = `${pad(list.length ? cur + 1 : 0)} / ${pad(list.length)}`;
    };
    const step = (dir) => {
      const list = items(), max = track.scrollWidth - track.clientWidth;
      if (!list.length) return;
      if (dir > 0 && track.scrollLeft >= max - 4) return track.scrollTo({ left: 0 });
      if (dir < 0 && track.scrollLeft <= 4) return track.scrollTo({ left: max });
      const next = list[Math.min(list.length - 1, Math.max(0, cur + dir))];
      track.scrollTo({ left: next.offsetLeft - padL() });
    };

    $('#stripPrev').addEventListener('click', () => step(-1));
    $('#stripNext').addEventListener('click', () => step(1));
    track.addEventListener('scroll', () => requestAnimationFrame(strip.update), { passive: true });
    addEventListener('resize', strip.update);
    track.addEventListener('load', strip.update, true);

    // geser dengan mouse (drag)
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: track.scrollLeft };
      moved = false;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = down.left - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = null;
      if (moved) { track.classList.remove('is-dragging'); strip.update(); step(0); }
    });
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      const it = e.target.closest('.strip__item');
      if (it) openLightbox(galleryItems(), +it.dataset.i, it);
    }, true);
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });

    // putar otomatis saat terlihat dan tidak disentuh
    wrap.addEventListener('pointerenter', () => { hover = true; });
    wrap.addEventListener('pointerleave', () => { hover = false; });
    wrap.addEventListener('focusin', () => { hover = true; });
    wrap.addEventListener('focusout', () => { hover = false; });
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: 0.4 }).observe(wrap);
    if (!reduced) setInterval(() => { if (inView && !hover && !down && !document.hidden && $('#lb').hidden) step(1); }, 4200);
  }

  /* ---------- Proyek ---------- */
  function renderProjects() {
    $('#projectGrid').innerHTML = (data().projects || []).map((p, i) => `
      <button class="project reveal" type="button" data-i="${i}" style="--d:${(i % 3) * 0.08}s" aria-label="Detail proyek ${esc(p.title)}">
        <img src="${esc(PF.asset(p.image))}" alt="" loading="lazy" decoding="async" data-edit="projects.${i}.image">
        <span class="project__body">
          <span class="project__top"><span class="project__title">${esc(p.title)}</span><span class="project__year">${esc(p.year)}</span></span>
          <span class="project__cat">${esc(p.category)}</span>
          <span class="project__more"><span>
            <span class="project__desc">${esc(p.description)}</span>
            ${p.tags?.length ? `<span class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>` : ''}
            <span class="project__cta">Lihat detail ${icon('arrowUpRight')}</span>
          </span></span>
        </span>
      </button>`).join('');
  }

  function openProject(i, opener) {
    const p = data().projects[i], m = $('#projectModal');
    if (!p) return;
    m.innerHTML = `
      <div class="modal__media">
        <img src="${esc(PF.asset(p.image))}" alt="${esc(p.title)}">
        <button class="icon-btn modal__close" type="button" aria-label="Tutup">${icon('x')}</button>
      </div>
      <div class="modal__body">
        <div class="modal__meta"><span>${esc(p.category)}</span><span aria-hidden="true">•</span><span>${esc(p.year)}</span></div>
        <h3 id="pmTitle">${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        ${p.highlights?.length ? `<ul class="highlights">${p.highlights.map((h) => `<li>${icon('checkCircle')}<span>${esc(h)}</span></li>`).join('')}</ul>` : ''}
        ${p.tags?.length ? `<div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        ${p.link ? `<a class="btn btn--primary modal__link" href="${esc(p.link)}" target="_blank" rel="noopener">Kunjungi Proyek ${icon('arrowUpRight')}</a>` : ''}
      </div>`;
    $('.modal__close', m).addEventListener('click', () => m.close());
    m.addEventListener('close', () => opener?.focus({ preventScroll: true }), { once: true });
    m.showModal();
  }

  /* ---------- Sertifikat ---------- */
  const CERT_LIMIT = 8;
  const certState = { cat: 'Semua', q: '', all: false };

  function renderCertificates() {
    const certs = data().certificates || [];
    const cats = ['Semua', ...new Set(certs.map((c) => c.category).filter(Boolean))];
    if (!cats.includes(certState.cat)) certState.cat = 'Semua';
    $('#certChips').innerHTML = cats.map((c) => {
      const n = c === 'Semua' ? certs.length : certs.filter((x) => x.category === c).length;
      const on = c === certState.cat;
      return `<button class="chip${on ? ' is-active' : ''}" type="button" role="tab" aria-selected="${on}" data-cat="${esc(c)}">${esc(c)} <small>${n}</small></button>`;
    }).join('');
    renderCertGrid();
  }

  function filteredCerts() {
    const q = certState.q.trim().toLowerCase();
    return (data().certificates || [])
      .map((c, i) => ({ ...c, _i: i }))
      .filter((c) => (certState.cat === 'Semua' || c.category === certState.cat)
        && (!q || [c.title, c.issuer, c.description, c.category, c.date].join(' ').toLowerCase().includes(q)));
  }

  function renderCertGrid() {
    const list = filteredCerts();
    const showAll = certState.all || certState.q.trim();
    const shown = showAll ? list : list.slice(0, CERT_LIMIT);
    $('#certGrid').innerHTML = shown.length ? shown.map((c, k) => `
      <button class="cert" type="button" data-i="${c._i}" style="--i:${k % 12}" aria-label="Lihat sertifikat ${esc(c.title)}">
        <span class="cert__media">
          ${isPdf(c.image) && !c.thumb
            ? `<span class="cert__pdf" data-edit="certificates.${c._i}.image">${icon('file')}PDF</span>`
            : `<img src="${esc(PF.asset(c.thumb || c.image))}" alt="" loading="lazy" decoding="async" data-edit="certificates.${c._i}.image">`}
          <span class="cert__view">${icon('zoom')}</span>
        </span>
        <span class="cert__body">
          <span class="cert__issuer">${esc(c.issuer)}</span>
          <span class="cert__title">${esc(c.title)}</span>
          ${c.description ? `<span class="cert__desc">${esc(c.description)}</span>` : ''}
          ${c.date ? `<span class="cert__date">${icon('calendar')}${esc(c.date)}</span>` : ''}
        </span>
      </button>`).join('')
      : `<p class="empty">Tidak ada sertifikat yang cocok dengan “${esc(certState.q)}”${certState.cat !== 'Semua' ? ` di kategori “${esc(certState.cat)}”` : ''}.</p>`;

    const more = $('#certMoreWrap');
    more.hidden = !!certState.q.trim() || list.length <= CERT_LIMIT;
    $('#certMore').innerHTML = certState.all
      ? `Tampilkan Lebih Sedikit ${icon('chevUp')}`
      : `Tampilkan Semua (${list.length}) ${icon('chevDown')}`;
  }
  const certItem = (c) => ({
    src: PF.asset(c.image),
    thumb: PF.asset(c.thumb || c.image),
    title: c.title,
    caption: [c.issuer, c.date].filter(Boolean).join(' · '),
    link: c.link,
    pdf: isPdf(c.image),
  });

  /* ---------- Keahlian ---------- */
  const LEVELS = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const skillState = { group: 'Semua' };

  function renderSkills() {
    const groups = data().skills || [];
    const tabs = [{ group: 'Semua', icon: 'grid' }, ...groups];
    if (!tabs.some((t) => t.group === skillState.group)) skillState.group = 'Semua';
    $('#skillTabs').innerHTML = '<span class="tabs__ink" aria-hidden="true"></span>' + tabs.map((t) => {
      const on = t.group === skillState.group;
      return `<button class="tab${on ? ' is-active' : ''}" type="button" role="tab" aria-selected="${on}" data-group="${esc(t.group)}">${icon(t.icon || 'code')}${esc(t.group)}</button>`;
    }).join('');
    renderSkillGrid();
    requestAnimationFrame(moveInk);
  }

  function renderSkillGrid() {
    const items = (data().skills || [])
      .flatMap((g) => g.items.map((it) => ({ ...it, group: g.group, icon: g.icon })))
      .filter((it) => skillState.group === 'Semua' || it.group === skillState.group);
    $('#skillGrid').innerHTML = items.map((s, k) => {
      const lv = LEVELS[s.level] || 2;
      return `
      <div class="skill" style="--i:${k % 16}">
        <div class="skill__top"><span class="skill__name">${esc(s.name)}</span><span class="skill__group" title="${esc(s.group)}">${icon(s.icon || 'code')}</span></div>
        <div class="skill__level"><span>${esc(s.level)}</span><span class="meter" role="img" aria-label="Level ${lv} dari 4">${[1, 2, 3, 4].map((n) => `<i class="${n <= lv ? 'on' : ''}" style="--s:${n}"></i>`).join('')}</span></div>
      </div>`;
    }).join('');
  }

  function moveInk() {
    const tabs = $('#skillTabs'), act = $('.tab.is-active', tabs), ink = $('.tabs__ink', tabs);
    if (!act || !ink) return;
    ink.style.width = act.offsetWidth + 'px';
    ink.style.transform = `translateX(${act.offsetLeft}px)`;
  }

  /* ---------- Kontak & footer ---------- */
  function renderContact() {
    const p = data().profile, c = data().contact || {};
    const rows = [
      { ico: 'mail', label: 'Email', value: p.email, href: `mailto:${p.email}`, copy: p.email },
      p.phone && { ico: 'phone', label: 'Telepon / WhatsApp', value: p.phone, href: p.whatsapp ? `https://wa.me/${p.whatsapp}` : `tel:${p.phone}`, copy: p.phone },
      ...(p.socials || []).filter((s) => ['linkedin', 'github'].includes(s.type))
        .map((s) => ({ ico: s.type, label: s.label, value: s.url.replace(/^https?:\/\/(www\.)?/, ''), href: s.url })),
    ].filter(Boolean);

    $('#contactInfo').innerHTML = `
      <span class="eyebrow">Kontak</span>
      <h2>${esc(c.title)}</h2>
      <p class="contact__text">${esc(c.text)}</p>
      <div class="contact__ctas">
        <a class="btn btn--white" href="mailto:${esc(p.email)}">${icon('mail')} Kirim Email</a>
        ${p.whatsapp ? `<a class="btn btn--line-white" href="https://wa.me/${esc(p.whatsapp)}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>` : ''}
      </div>
      <ul class="contact__list">
        ${rows.map((r) => `
          <li class="contact__row">
            <span class="contact__ico">${icon(r.ico)}</span>
            <div><small>${esc(r.label)}</small><a href="${esc(r.href)}"${ext(r.href)}>${esc(r.value)}</a></div>
            ${r.copy
              ? `<button class="copy-btn" type="button" data-copy="${esc(r.copy)}" aria-label="Salin ${esc(r.label)}">${icon('copy')}</button>`
              : `<a class="copy-btn" href="${esc(r.href)}" target="_blank" rel="noopener" aria-label="Buka ${esc(r.label)}">${icon('arrowUpRight')}</a>`}
          </li>`).join('')}
      </ul>`;
  }

  function renderFooter() {
    const p = data().profile;
    $('#footer').innerHTML = `
      <span>© ${new Date().getFullYear()} ${esc(p.name)}. Dibuat dengan sepenuh hati.</span>
      <nav class="footer__links" aria-label="Tautan footer">
        ${(p.socials || []).filter((s) => s.type !== 'whatsapp').map((s) => `<a href="${esc(s.url)}"${ext(s.url)}>${esc(s.label)}</a>`).join('')}
        <a href="#home">Ke atas ↑</a>
      </nav>`;
  }

  /* =================================================================
     LIGHTBOX
     ================================================================= */
  const LB = { items: [], i: 0, opener: null };

  function openLightbox(items, i, opener) {
    if (!items.length) return;
    LB.items = items;
    LB.opener = opener || document.activeElement;
    $('#lbThumbs').innerHTML = items.length > 1
      ? items.map((it, k) => `<button type="button" data-k="${k}" aria-label="Gambar ${k + 1}">${it.pdf && !it.thumb ? icon('file') : `<img src="${esc(it.thumb || it.src)}" alt="" loading="lazy">`}</button>`).join('')
      : '';
    $('#lb').hidden = false;
    root.style.overflow = 'hidden';
    showLB(Math.max(0, i));
    $('#lbClose').focus({ preventScroll: true });
  }

  function showLB(i) {
    const n = LB.items.length;
    LB.i = (i + n) % n;
    const it = LB.items[LB.i], frame = $('#lbFrame');
    frame.classList.remove('is-zoomed');
    frame.innerHTML = it.pdf
      ? `<iframe src="${esc(it.src)}" title="${esc(it.title)}"></iframe>`
      : `<img src="${esc(it.src)}" alt="${esc(it.title)}" draggable="false">`;
    $('#lbTitle').textContent = it.title || '';
    $('#lbCaption').textContent = it.caption || '';
    const link = $('#lbLink');
    link.hidden = !it.link;
    if (it.link) link.href = it.link;
    $('#lbCount').textContent = `${pad(LB.i + 1)} / ${pad(n)}`;
    $('#lbOpen').href = it.src;
    $('#lbZoom').hidden = !!it.pdf;
    $('#lbPrev').hidden = $('#lbNext').hidden = n < 2;
    const thumbs = $('#lbThumbs');
    $$('button', thumbs).forEach((b, k) => {
      b.classList.toggle('is-active', k === LB.i);
      if (k === LB.i) thumbs.scrollTo({ left: b.offsetLeft - thumbs.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
    });
  }

  function closeLB() {
    $('#lb').hidden = true;
    $('#lbFrame').innerHTML = '';
    root.style.overflow = '';
    LB.opener?.focus?.({ preventScroll: true });
  }

  function initLightbox() {
    const lb = $('#lb'), frame = $('#lbFrame');
    const toggleZoom = (e) => {
      const img = $('img', frame);
      if (!img) return;
      if (e && e.clientX) {
        const r = img.getBoundingClientRect();
        img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      } else img.style.transformOrigin = '50% 50%';
      frame.classList.toggle('is-zoomed');
    };
    $('#lbClose').addEventListener('click', closeLB);
    $('#lbPrev').addEventListener('click', () => showLB(LB.i - 1));
    $('#lbNext').addEventListener('click', () => showLB(LB.i + 1));
    $('#lbZoom').addEventListener('click', () => toggleZoom());
    $('#lbThumbs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showLB(+b.dataset.k); });

    let sx = null, swiped = false;
    frame.addEventListener('pointerdown', (e) => { sx = e.clientX; swiped = false; });
    frame.addEventListener('pointerup', (e) => {
      if (sx == null || frame.classList.contains('is-zoomed')) { sx = null; return; }
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50 && LB.items.length > 1) { swiped = true; showLB(LB.i + (dx < 0 ? 1 : -1)); }
    });
    frame.addEventListener('click', (e) => {
      if (swiped) return;
      if (e.target.tagName === 'IMG') toggleZoom(e);
      else if (e.target === frame) closeLB();
    });
    frame.addEventListener('mousemove', (e) => {
      if (!frame.classList.contains('is-zoomed')) return;
      const img = $('img', frame), r = frame.getBoundingClientRect();
      if (img) img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    });

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') showLB(LB.i + 1);
      else if (e.key === 'ArrowLeft') showLB(LB.i - 1);
      else if (e.key === 'Tab') { // jaga fokus tetap di lightbox
        const f = $$('button:not([hidden]), a[href], iframe', lb).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* =================================================================
     TERMINAL
     ================================================================= */
  function initTerminal() {
    const out = $('#termOut'), form = $('#termForm'), input = $('#termInput'), body = $('#termBody');
    const hist = [];
    let hi = 0;
    const sections = { about: '#about', experience: '#experience', gallery: '#gallery', projects: '#projects', certificates: '#certificates', skills: '#skills', contact: '#contact' };
    const print = (html, cls = '') => {
      const d = document.createElement('div');
      if (cls) d.className = cls;
      d.innerHTML = html;
      out.appendChild(d);
      body.scrollTop = body.scrollHeight;
    };
    const list = (rows) => rows.map((r) => `  <span class="term__hl">›</span> ${r}`).join('\n');

    const C = {
      help: () => '<span class="term__hl">Perintah yang tersedia:</span>\n' + [
        ['whoami', 'siapa saya'], ['about', 'ringkasan profil'], ['experience', 'riwayat pekerjaan'],
        ['skills', 'daftar keahlian'], ['certs', 'daftar sertifikat'], ['projects', 'proyek utama'],
        ['contact', 'info kontak'], ['cv', 'buka CV (PDF)'], ['goto <bagian>', 'lompat ke bagian halaman'],
        ['theme [light|dark]', 'ganti tema'], ['ls', 'daftar bagian'], ['date', 'tanggal & waktu'],
        ['echo <teks>', 'tampilkan teks'], ['clear', 'bersihkan layar'],
      ].map(([c, d]) => `  <span class="term__hl">${esc(c.padEnd(20))}</span><span class="term__muted">${d}</span>`).join('\n'),
      whoami: () => { const p = data().profile; return `<span class="term__ok">${esc(p.name)}</span>\n${esc((p.roles || []).join(' · '))}`; },
      about: () => esc(data().about.paragraphs?.[0] || ''),
      experience: () => list((data().experience || []).map((x) => `${esc(x.role)} <span class="term__muted">— ${esc(x.company)} (${esc(x.period)})</span>`)),
      skills: () => (data().skills || []).map((g) => `<span class="term__ok">${esc(g.group)}</span>\n  ${esc(g.items.map((i) => i.name).join(', '))}`).join('\n'),
      certs: () => { const c = data().certificates || []; return `<span class="term__ok">${c.length} sertifikat</span>\n` + list(c.map((x) => `${esc(x.title)} <span class="term__muted">— ${esc(x.issuer)}</span>`)); },
      projects: () => list((data().projects || []).map((x) => `${esc(x.title)} <span class="term__muted">(${esc(x.year)}) ${esc(x.category)}</span>`)),
      contact: () => {
        const p = data().profile;
        return [`email    : ${esc(p.email)}`, `telepon  : ${esc(p.phone)}`, ...(p.socials || []).filter((s) => /^https?:/.test(s.url)).map((s) => `${esc(s.label.toLowerCase().padEnd(9))}: ${esc(s.url)}`)].join('\n');
      },
      cv: () => { window.open(PF.asset(data().profile.cv), '_blank', 'noopener'); return '<span class="term__ok">Membuka CV…</span>'; },
      goto: ([s]) => {
        const target = sections[(s || '').toLowerCase()];
        if (!target) return `Gunakan: goto <span class="term__hl">${Object.keys(sections).join(' | ')}</span>`;
        $(target).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        return `<span class="term__ok">Menuju ${esc(s)}…</span>`;
      },
      theme: ([t]) => {
        const next = t === 'light' || t === 'dark' ? t : root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
        return `<span class="term__ok">Tema diganti ke ${next}.</span>`;
      },
      ls: () => Object.keys(sections).map((s) => `<span class="term__hl">${s}/</span>`).join('  '),
      date: () => esc(new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })),
      echo: (args) => esc(args.join(' ')),
      clear: () => { out.innerHTML = ''; return ''; },
      sudo: () => '<span class="term__warn">Akses ditolak.</span> Hubungi saya untuk akses penuh ;)',
      halo: () => 'Halo juga! Ketik <span class="term__hl">help</span> untuk mulai.',
    };
    Object.assign(C, { tentang: C.about, pengalaman: C.experience, exp: C.experience, keahlian: C.skills, sertifikat: C.certs, proyek: C.projects, kontak: C.contact, hello: C.halo, hi: C.halo, cls: C.clear });

    const run = (line) => {
      const raw = line.trim();
      print(`<span class="term__cmd"><b>guest@portfolio:~$</b> ${esc(raw)}</span>`);
      if (!raw) return;
      hist.push(raw);
      hi = hist.length;
      const [cmd, ...args] = raw.split(/\s+/);
      const fn = C[cmd.toLowerCase()];
      if (!fn) { print(`<span class="term__warn">perintah tidak ditemukan: ${esc(cmd)}</span> — ketik <span class="term__hl">help</span>`); return; }
      const res = fn(args);
      if (res) print(res);
    };

    print('<span class="term__ok">Selamat datang di terminal Aditya!</span>');
    print('<span class="term__muted">Ketik</span> <span class="term__hl">help</span> <span class="term__muted">untuk melihat daftar perintah.</span>');

    form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
      else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
      else if (e.key === 'Tab' && input.value.trim()) {
        const match = Object.keys(C).filter((k) => k.startsWith(input.value.trim().toLowerCase()));
        if (match.length) { e.preventDefault(); input.value = match.length === 1 ? match[0] + ' ' : input.value; if (match.length > 1) print(`<span class="term__muted">${match.join('  ')}</span>`); }
      }
    });
    body.addEventListener('click', () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
  }

  /* =================================================================
     TEMA, NAVIGASI, & HAL UMUM
     ================================================================= */
  function setTheme(next, e) {
    const apply = () => {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pf-theme', next); } catch (_) { /* mode privat */ }
      $('meta[name="theme-color"]').content = next === 'dark' ? '#05080f' : '#eceff4';
      requestAnimationFrame(moveInk);
    };
    if (!document.startViewTransition || reduced) return apply();
    const x = e && e.detail ? e.clientX : innerWidth - 80;
    const y = e && e.detail ? e.clientY : 44;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => {});
  }

  let toastT;
  function toast(msg, ico = 'check') {
    const t = $('#toast');
    t.innerHTML = `${icon(ico)}<span>${esc(msg)}</span>`;
    t.classList.add('is-show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('is-show'), 2600);
  }

  async function copyText(s) {
    try { await navigator.clipboard.writeText(s); return true; } catch (_) {
      const ta = Object.assign(document.createElement('textarea'), { value: s });
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  let revealIO;
  function initReveal() {
    const els = $$('.reveal:not(.in), [data-reveal]:not(.in)');
    if (PF.rendered) { // render ulang (Mode Edit): langsung tampil tanpa animasi masuk
      els.forEach((el) => { el.style.transition = 'none'; el.classList.add('in'); });
      requestAnimationFrame(() => els.forEach((el) => { el.style.transition = ''; }));
      return;
    }
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      if (!PF.rendered) countUp();
      return;
    }
    revealIO ||= new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
      if (en.target.id === 'stats') countUp();
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => revealIO.observe(el));
  }

  function initChrome() {
    const nav = $('#nav'), progress = $('#progress'), toTop = $('#toTop'), burger = $('#burger');

    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const y = scrollY, h = root.scrollHeight - innerHeight;
      nav.classList.toggle('is-scrolled', y > 8);
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      toTop.classList.toggle('is-show', y > 700);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

    const setMenu = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    };
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    $$('#navLinks a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    const links = $$('#navLinks a');
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const a = byId.get(en.target.id);
      if (!en.isIntersecting || !a) return;
      links.forEach((l) => l.classList.toggle('is-active', l === a));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => io.observe(s));

    $('#themeToggle').addEventListener('click', (e) => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', e));
    matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
      let saved = null;
      try { saved = localStorage.getItem('pf-theme'); } catch (_) { saved = null; }
      if (!saved) root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });

    addEventListener('resize', () => requestAnimationFrame(moveInk));
    document.fonts?.ready.then(moveInk);
  }

  function initParallax() {
    if (reduced || !matchMedia('(pointer: fine)').matches) return;
    const hero = $('#hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      const inner = $('.hero__photo-inner', hero), mq = $('.hero__marquee', hero);
      if (inner) inner.style.transform = `translate(${dx * -16}px, ${dy * -8}px)`;
      if (mq) mq.style.transform = `translate(${dx * 28}px, ${dy * 12}px)`;
    });
    hero.addEventListener('pointerleave', () => {
      const inner = $('.hero__photo-inner', hero), mq = $('.hero__marquee', hero);
      if (inner) inner.style.transform = '';
      if (mq) mq.style.transform = '';
    });
  }

  /* Event yang cukup dipasang sekali (konten di dalamnya boleh dirender ulang) */
  function bindOnce() {
    $('#aboutCard').addEventListener('click', (e) => {
      const btn = e.target.closest('#aboutToggle');
      if (!btn) return;
      const open = $('#aboutMore').classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('span').textContent = open ? 'Tutup' : 'Baca Selengkapnya';
      btn.querySelector('svg').style.transform = open ? 'rotate(180deg)' : '';
    });

    $('#timeline').addEventListener('click', (e) => {
      const head = e.target.closest('.xp__head');
      if (!head) return;
      const open = head.parentElement.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
    });

    $('#projectGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.project');
      if (card) openProject(+card.dataset.i, card);
    });
    $('#projectModal').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

    $('#certChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      certState.cat = chip.dataset.cat;
      certState.all = false;
      $$('.chip', e.currentTarget).forEach((c) => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-selected', String(on)); });
      renderCertGrid();
    });
    let searchT;
    $('#certSearch').addEventListener('input', (e) => {
      clearTimeout(searchT);
      searchT = setTimeout(() => { certState.q = e.target.value; renderCertGrid(); }, 120);
    });
    $('#certMore').addEventListener('click', () => {
      certState.all = !certState.all;
      renderCertGrid();
      if (!certState.all) $('#certificates').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
    $('#certGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.cert');
      if (!card) return;
      const list = filteredCerts();
      openLightbox(list.map(certItem), list.findIndex((c) => c._i === +card.dataset.i), card);
    });

    $('#skillTabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      skillState.group = tab.dataset.group;
      $$('.tab', e.currentTarget).forEach((t) => { const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); });
      moveInk();
      renderSkillGrid();
    });

    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      if (await copyText(btn.dataset.copy)) {
        toast(`${btn.dataset.copy} disalin`);
        const old = btn.innerHTML;
        btn.innerHTML = icon('check');
        setTimeout(() => { btn.innerHTML = old; }, 1600);
      }
    });
  }

  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });

  async function boot() {
    let edit = false;
    const params = new URLSearchParams(location.search);
    try {
      if (params.has('edit')) localStorage.setItem('pf-edit', '1');
      edit = localStorage.getItem('pf-edit') === '1';
    } catch (_) { edit = params.has('edit'); }

    initChrome();
    bindOnce();
    initStrip();
    initLightbox();
    initTerminal();
    initParallax();

    if (edit) {
      try {
        await loadScript('assets/js/editor.js');
        await window.PFEditor.boot();
      } catch (err) { console.error('Mode Edit gagal dimuat:', err); }
    }
    renderAll();
    if (edit && window.PFEditor) window.PFEditor.mount();
  }

  boot();
})();
