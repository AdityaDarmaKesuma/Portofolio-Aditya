/* =====================================================================
   MODE EDIT — upload sertifikat & ganti gambar langsung dari browser.
   ---------------------------------------------------------------------
   - Aktif hanya jika website dibuka dengan alamat ...?edit
   - Gambar otomatis diperkecil & dikompres ke WebP.
   - Perubahan tersimpan di browser ini (IndexedDB), belum online.
   - Tab "Terbitkan" -> Unduh ZIP (data/portfolio.json + gambar baru di
     public/assets) -> salin ke folder proyek -> commit & push -> Vercel
     membangun ulang website.
   ===================================================================== */
  const PF = window.PF;
  const { esc } = PF;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const EXTRA_ICONS = {
    edit: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5zM15 5l4 4"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    package: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
  };
  const ic = (name) => (EXTRA_ICONS[name]
    ? `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${EXTRA_ICONS[name]}</svg>`
    : PF.icon(name));


  /* ---------- Penyimpanan lokal (IndexedDB) ---------- */
  const idb = (() => {
    let dbp;
    const open = () => (dbp ||= new Promise((res, rej) => {
      const r = indexedDB.open('pf-editor', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('kv', mode);
        const req = fn(t.objectStore('kv'));
        t.oncomplete = () => res(req?.result);
        t.onerror = () => rej(t.error);
      });
    };
    return {
      get: (k) => tx('readonly', (s) => s.get(k)),
      set: (k, v) => tx('readwrite', (s) => s.put(v, k)),
      del: (k) => tx('readwrite', (s) => s.delete(k)),
    };
  })();

  /* ---------- Status ---------- */
  let original;          // isi data/portfolio.json yang sedang online
  let files = {};        // path -> Blob (file hasil upload yang belum diterbitkan)
  let savedAt = null;
  let tab = 'certs';
  let editing = null;    // index sertifikat yang sedang diedit
  let pending = null;    // File yang dipilih di form sertifikat
  let pendingURL = null;
  let panel, fab, replaceBtn, busyEl;

  const D = () => window.PORTFOLIO;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, val) => {
    const ks = path.split('.');
    const last = ks.pop();
    ks.reduce((o, k) => o[k], obj)[last] = val;
  };
  const slug = (s) => String(s || 'gambar').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'gambar';
  const uid = () => Date.now().toString(36).slice(-5);
  const fileName = (p) => String(p || '-').split('/').pop();
  const isPdf = (p) => /\.pdf(\?|#|$)/i.test(p || '');

  function addFile(path, blob) {
    if (PF.blobs[path]) URL.revokeObjectURL(PF.blobs[path]);
    files[path] = blob;
    PF.blobs[path] = URL.createObjectURL(blob);
  }

  /* Buang file upload yang sudah tidak dipakai di data */
  function prune() {
    const used = new Set();
    const walk = (v) => {
      if (typeof v === 'string') used.add(v);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(D());
    Object.keys(files).forEach((p) => {
      if (used.has(p)) return;
      delete files[p];
      if (PF.blobs[p]) { URL.revokeObjectURL(PF.blobs[p]); delete PF.blobs[p]; }
    });
  }

  const isDirty = () => Object.keys(files).length > 0 || JSON.stringify(D()) !== JSON.stringify(original);

  export async function boot() {
    original = clone(D());
    try {
      const saved = await idb.get('draft');
      if (saved?.data) {
        if (JSON.stringify(saved.data) === JSON.stringify(original)) {
          await idb.del('draft'); // draf sudah sama dengan versi online
        } else {
          window.PORTFOLIO = saved.data;
          savedAt = saved.savedAt || null;
          Object.entries(saved.files || {}).forEach(([p, b]) => addFile(p, b));
        }
      }
    } catch (err) { console.warn('Draf Mode Edit tidak bisa dibaca:', err); }
  }

  let saveT;
  async function save() {
    try {
      if (isDirty()) {
        await idb.set('draft', { data: D(), files, savedAt: Date.now() });
        savedAt = Date.now();
      } else {
        await idb.del('draft');
        savedAt = null;
      }
    } catch (err) {
      PF.toast('Gagal menyimpan draf: ' + err.message, 'x');
    }
    updateStatus();
  }

  /* Dipanggil setiap ada perubahan data */
  function commit(msg, { panel: redrawPanel = true } = {}) {
    prune();
    PF.render();
    if (redrawPanel) renderPanel();
    updateStatus();
    clearTimeout(saveT);
    saveT = setTimeout(save, 150);
    if (msg) PF.toast(msg);
  }

  /* ---------- Gambar: perkecil + kompres ---------- */
  async function loadBitmap(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (_) {
      return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.'));
        img.src = URL.createObjectURL(file);
      });
    }
  }

  async function processImage(file, maxSide, quality = 0.84) {
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return { blob: file, ext: 'pdf' };
    if (file.type === 'image/svg+xml') return { blob: file, ext: 'svg' };
    if (file.type === 'image/gif') return { blob: file, ext: 'gif' };
    const bmp = await loadBitmap(file);
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
    const k = Math.min(1, maxSide / Math.max(w, h));
    const c = document.createElement('canvas');
    c.width = Math.round(w * k);
    c.height = Math.round(h * k);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    const toBlob = (type, q) => new Promise((r) => c.toBlob(r, type, q));
    let blob = await toBlob('image/webp', quality), ext = 'webp';
    if (!blob || blob.type !== 'image/webp') { // browser lama tanpa encoder WebP
      const alpha = /png|webp/.test(file.type);
      blob = await toBlob(alpha ? 'image/png' : 'image/jpeg', quality);
      ext = alpha ? 'png' : 'jpg';
    }
    return { blob, ext };
  }

  const folderFor = (path) => (path.startsWith('certificates') ? '/assets/certificates'
    : path.startsWith('gallery') ? '/assets/img/gallery'
      : path.startsWith('projects') ? '/assets/img/projects'
        : path.startsWith('about') ? '/assets/img/about' : '/assets/img/profile');
  const maxFor = (path) => (path.startsWith('certificates') ? 1800 : path === 'profile.photo' ? 1400 : 1600);
  const hintFor = (path) => {
    const parent = getPath(D(), path.split('.').slice(0, -1).join('.'));
    return path === 'profile.photo' ? 'foto-profil' : parent?.title || parent?.caption || 'gambar';
  };

  /* Ganti gambar pada path data (mis. "gallery.2.src") dengan file baru */
  async function replaceImage(path, file, hint) {
    const { blob, ext } = await processImage(file, maxFor(path));
    const base = `${slug(hint || hintFor(path))}-${uid()}`;
    const dest = `${folderFor(path)}/${base}.${ext}`;
    addFile(dest, blob);
    setPath(D(), path, dest);
    if (/^certificates\.\d+\.image$/.test(path)) {
      const cert = getPath(D(), path.replace(/\.image$/, ''));
      if (ext === 'pdf') cert.thumb = '';
      else {
        const t = await processImage(file, 640, 0.76);
        const tp = `/assets/certificates/thumbs/${base}.${t.ext}`;
        addFile(tp, t.blob);
        cert.thumb = tp;
      }
    }
    return dest;
  }

  function pickFile(accept, multiple = false) {
    return new Promise((res) => {
      const input = Object.assign(document.createElement('input'), { type: 'file', accept, multiple });
      input.addEventListener('change', () => res(multiple ? [...input.files] : input.files[0] || null));
      input.click();
    });
  }

  function busy(on, text = 'Memproses gambar…') {
    busyEl.querySelector('span').textContent = text;
    busyEl.hidden = !on;
  }

  async function doReplace(path, file) {
    busy(true);
    try {
      await replaceImage(path, file);
      commit('Gambar diganti. Terbitkan lewat tab “Terbitkan”.');
    } catch (err) {
      PF.toast(err.message || 'Gagal memproses gambar', 'x');
    } finally { busy(false); }
  }

  /* ---------- ZIP sederhana (tanpa library) ---------- */
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };

  function makeZip(entries) {
    const enc = new TextEncoder();
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    const parts = [], central = [];
    let offset = 0;
    for (const { name, data } of entries) {
      const nm = enc.encode(name), crc = crc32(data), size = data.length;
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true);
      lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
      parts.push(lh, nm, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true);
      ch.setUint16(14, date, true); ch.setUint32(16, crc, true); ch.setUint32(20, size, true);
      ch.setUint32(24, size, true); ch.setUint16(28, nm.length, true); ch.setUint16(30, 0, true);
      ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true);
      ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(ch, nm);
      offset += 30 + nm.length + size;
    }
    const cdSize = central.reduce((s, p) => s + p.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(4, 0, true); end.setUint16(6, 0, true);
    end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true); end.setUint16(20, 0, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  const serialize = () => JSON.stringify(D(), null, 2) + '\n';
  const stamp = () => new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

  function download(blob, name) {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  async function exportZip() {
    prune();
    busy(true, 'Menyiapkan ZIP…');
    try {
      const entries = [{ name: 'data/portfolio.json', data: new TextEncoder().encode(serialize()) }];
      for (const [p, b] of Object.entries(files)) entries.push({ name: `public/${p.replace(/^\/+/, '')}`, data: new Uint8Array(await b.arrayBuffer()) });
      download(makeZip(entries), `pembaruan-portofolio-${stamp()}.zip`);
      PF.toast(`ZIP diunduh (${entries.length} file)`);
    } finally { busy(false); }
  }

  /* =================================================================
     UI PANEL
     ================================================================= */
  const html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstElementChild; };
  const thumbHTML = (p) => (isPdf(p) ? ic('file') : p ? `<img src="${esc(PF.asset(p))}" alt="" loading="lazy">` : ic('image'));
  const mini = (name, act, i, label, disabled = false, key = '') =>
    `<button class="pfe-mini" type="button" data-act="${act}" data-i="${i}"${key ? ` data-key="${key}"` : ''} aria-label="${label}" title="${label}"${disabled ? ' disabled' : ''}>${ic(name)}</button>`;

  export function mount() {
    document.documentElement.classList.add('pf-editing');
    document.head.appendChild(html(`<style>${CSS}</style>`));

    fab = html(`<button class="pfe-fab" type="button">${ic('edit')}<span>Mode Edit</span><span class="pfe-fab__dot" hidden></span></button>`);
    panel = html(`
      <aside class="pfe" aria-label="Panel Mode Edit">
        <header class="pfe__head">
          <div class="pfe__title"><span class="pfe__logo">${ic('edit')}</span><div><strong>Mode Edit</strong><small id="pfeStatus"></small></div></div>
          <button class="pfe__icon" type="button" data-act="close" aria-label="Tutup panel">${ic('x')}</button>
        </header>
        <nav class="pfe__tabs" role="tablist">
          <button type="button" role="tab" data-tab="certs">${ic('award')}Sertifikat</button>
          <button type="button" role="tab" data-tab="images">${ic('image')}Gambar</button>
          <button type="button" role="tab" data-tab="publish">${ic('upload')}Terbitkan</button>
        </nav>
        <div class="pfe__body" id="pfeBody"></div>
      </aside>`);
    replaceBtn = html(`<button class="pfe-replace" type="button" hidden>${ic('image')}Ganti gambar</button>`);
    busyEl = html('<div class="pfe-busy" hidden><div><i></i><span></span></div></div>');
    document.body.append(fab, panel, replaceBtn, busyEl);

    fab.addEventListener('click', () => togglePanel(true));
    panel.addEventListener('click', onPanelClick);
    panel.addEventListener('change', onPanelChange);
    panel.addEventListener('submit', onCertSubmit);
    panel.addEventListener('dragover', (e) => { const z = e.target.closest('.pfe-drop'); if (z) { e.preventDefault(); z.classList.add('is-over'); } });
    panel.addEventListener('dragleave', (e) => { const z = e.target.closest('.pfe-drop'); if (z) z.classList.remove('is-over'); });
    panel.addEventListener('drop', (e) => {
      const z = e.target.closest('.pfe-drop');
      if (!z) return;
      e.preventDefault();
      z.classList.remove('is-over');
      if (e.dataTransfer.files[0]) setPending(e.dataTransfer.files[0]);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('is-open') && $('#lb').hidden) togglePanel(false); });

    initReplaceButton();
    renderPanel();
    updateStatus();
    if (savedAt) PF.toast('Draf Mode Edit sebelumnya dimuat');
  }

  function togglePanel(open) {
    panel.classList.toggle('is-open', open);
    fab.hidden = open;
  }

  function updateStatus() {
    const dirty = isDirty(), n = Object.keys(files).length;
    const st = $('#pfeStatus');
    if (st) st.textContent = dirty ? `Belum diterbitkan · ${n} file baru · tersimpan otomatis` : 'Tidak ada perubahan';
    fab.querySelector('.pfe-fab__dot').hidden = !dirty;
  }

  function renderPanel() {
    const body = $('#pfeBody');
    const top = body.scrollTop;
    $$('.pfe__tabs button', panel).forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); });
    body.innerHTML = tab === 'certs' ? certsTab() : tab === 'images' ? imagesTab() : publishTab();
    body.scrollTop = top;
  }

  /* ---------- Tab: Sertifikat ---------- */
  function dropHTML() {
    if (pending) {
      const isImg = pending.type.startsWith('image/');
      return `${isImg ? `<img src="${pendingURL}" alt="">` : `<span class="pfe-drop__ico">${ic('file')}</span>`}
        <span><strong>${esc(pending.name)}</strong><small>${(pending.size / 1024).toFixed(0)} KB · klik untuk mengganti file</small></span>`;
    }
    const cur = editing != null ? D().certificates[editing] : null;
    if (cur) {
      return `<span class="pfe-thumb pfe-thumb--lg">${thumbHTML(cur.thumb || cur.image)}</span>
        <span><strong>File saat ini: ${esc(fileName(cur.image))}</strong><small>Klik / seret file baru untuk mengganti (opsional)</small></span>`;
    }
    return `<span class="pfe-drop__ico">${ic('upload')}</span>
      <span><strong>Seret & lepas file sertifikat di sini</strong><small>atau klik untuk memilih · JPG, PNG, WebP, atau PDF · otomatis dikompres</small></span>`;
  }

  function certsTab() {
    const certs = D().certificates || [];
    const cats = [...new Set(certs.map((c) => c.category).filter(Boolean))];
    const c = editing != null ? certs[editing] : {};
    return `
      <form class="pfe-card" id="pfeCertForm" novalidate>
        <h4>${editing != null ? `${ic('edit')} Edit sertifikat` : `${ic('plus')} Tambah sertifikat baru`}</h4>
        <label class="pfe-drop${pending ? ' has-file' : ''}" id="pfeDrop">
          <input type="file" accept="image/*,application/pdf" id="pfeCertFile" hidden>
          <span class="pfe-drop__inner" id="pfeDropInner">${dropHTML()}</span>
        </label>
        <div class="pfe-grid">
          <label class="pfe-field pfe-span"><span>Nama sertifikat *</span><input name="title" value="${esc(c.title || '')}" placeholder="contoh: CCNA" required></label>
          <label class="pfe-field"><span>Penerbit *</span><input name="issuer" value="${esc(c.issuer || '')}" placeholder="contoh: Cisco" required></label>
          <label class="pfe-field"><span>Kategori</span><input name="category" list="pfeCats" value="${esc(c.category || '')}" placeholder="pilih atau ketik baru"></label>
          <datalist id="pfeCats">${cats.map((x) => `<option value="${esc(x)}"></option>`).join('')}</datalist>
          <label class="pfe-field pfe-span"><span>Keterangan</span><input name="description" value="${esc(c.description || '')}" placeholder="contoh: Cisco Certified Network Associate"></label>
          <label class="pfe-field"><span>Tanggal / masa berlaku</span><input name="date" value="${esc(c.date || '')}" placeholder="Okt 2026 – Okt 2029"></label>
          <label class="pfe-field"><span>Link verifikasi</span><input name="link" type="url" value="${esc(c.link || '')}" placeholder="https://…"></label>
        </div>
        <div class="pfe-row">
          ${editing != null ? '<button class="pfe-btn" type="button" data-act="cert-cancel">Batal</button>' : ''}
          <button class="pfe-btn pfe-btn--primary" type="submit">${editing != null ? `${ic('check')} Simpan perubahan` : `${ic('plus')} Tambah sertifikat`}</button>
        </div>
      </form>
      <div class="pfe-sec"><h4>Daftar sertifikat <small>${certs.length}</small></h4><p class="pfe-hint">Urutan di sini sama dengan urutan di website. Sertifikat baru otomatis ditaruh paling atas.</p></div>
      <ul class="pfe-list">
        ${certs.map((x, i) => `
          <li class="pfe-item${editing === i ? ' is-editing' : ''}">
            <span class="pfe-thumb">${thumbHTML(x.thumb || x.image)}</span>
            <span class="pfe-item__text"><strong>${esc(x.title)}</strong><small>${esc(x.issuer)} · ${esc(x.category || 'Tanpa kategori')}</small></span>
            <span class="pfe-item__acts">
              ${mini('chevUp', 'cert-up', i, 'Naikkan', i === 0)}${mini('chevDown', 'cert-down', i, 'Turunkan', i === certs.length - 1)}${mini('edit', 'cert-edit', i, 'Edit')}${mini('trash', 'cert-del', i, 'Hapus')}
            </span>
          </li>`).join('')}
      </ul>`;
  }

  function setPending(file) {
    if (!file) return;
    if (!/^image\//.test(file.type) && file.type !== 'application/pdf') { PF.toast('File harus berupa gambar atau PDF', 'x'); return; }
    if (pendingURL) URL.revokeObjectURL(pendingURL);
    pending = file;
    pendingURL = URL.createObjectURL(file);
    const inner = $('#pfeDropInner');
    if (inner) { inner.innerHTML = dropHTML(); $('#pfeDrop').classList.add('has-file'); }
  }

  function resetCertForm() {
    editing = null;
    pending = null;
    if (pendingURL) URL.revokeObjectURL(pendingURL);
    pendingURL = null;
  }

  async function onCertSubmit(e) {
    if (e.target.id !== 'pfeCertForm') return;
    e.preventDefault();
    const f = new FormData(e.target);
    const val = (k) => String(f.get(k) || '').trim();
    if (!val('title') || !val('issuer')) { PF.toast('Nama sertifikat dan penerbit wajib diisi', 'x'); return; }
    if (editing == null && !pending) { PF.toast('Pilih file sertifikat terlebih dahulu', 'x'); return; }

    const certs = D().certificates;
    const fields = { title: val('title'), issuer: val('issuer'), description: val('description'), category: val('category') || 'Lainnya', date: val('date'), link: val('link') };
    const isNew = editing == null;
    let idx = editing;
    busy(true);
    try {
      if (isNew) { certs.unshift({ ...fields, image: '', thumb: '' }); idx = 0; }
      else Object.assign(certs[idx], fields);
      if (pending) await replaceImage(`certificates.${idx}.image`, pending, fields.title);
      resetCertForm();
      commit(isNew ? 'Sertifikat ditambahkan' : 'Sertifikat diperbarui');
      if (isNew) $('#certificates').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (isNew && !certs[0].image) certs.shift();
      PF.toast(err.message || 'Gagal memproses file', 'x');
    } finally { busy(false); }
  }

  /* ---------- Tab: Gambar ---------- */
  function slot(path, title, accept = 'image') {
    const p = getPath(D(), path);
    return `<div class="pfe-slot">
      <span class="pfe-thumb${path === 'profile.photo' ? ' pfe-thumb--tall' : ''}">${accept === 'pdf' ? ic('file') : thumbHTML(p)}</span>
      <div><strong>${esc(title)}</strong><small>${esc(fileName(p))}</small></div>
      <button class="pfe-btn pfe-btn--sm" type="button" data-act="${accept === 'pdf' ? 'cv-replace' : 'img-replace'}" data-path="${path}">${ic('upload')}Ganti</button>
    </div>`;
  }

  function listSection(key, title, hint, fields) {
    const arr = getPath(D(), key) || [];
    return `
      <div class="pfe-sec"><h4>${title} <small>${arr.length}</small></h4><p class="pfe-hint">${hint}</p></div>
      <ul class="pfe-list">
        ${arr.map((it, i) => `
          <li class="pfe-item pfe-item--media">
            <span class="pfe-thumb">${thumbHTML(it.src)}</span>
            <span class="pfe-item__fields">${fields.map((fd) => `<input class="pfe-input" data-key="${key}.${i}.${fd.k}" value="${esc(it[fd.k] || '')}" placeholder="${fd.ph}" aria-label="${fd.ph}">`).join('')}</span>
            <span class="pfe-item__acts pfe-item__acts--grid">
              ${mini('chevUp', 'list-up', i, 'Naikkan', i === 0, key)}${mini('chevDown', 'list-down', i, 'Turunkan', i === arr.length - 1, key)}${mini('image', 'list-img', i, 'Ganti gambar', false, key)}${mini('trash', 'list-del', i, 'Hapus', false, key)}
            </span>
          </li>`).join('')}
      </ul>
      <button class="pfe-btn pfe-btn--dashed" type="button" data-act="list-add" data-key="${key}">${ic('plus')}Tambah foto</button>`;
  }

  function imagesTab() {
    const d = D();
    return `
      <p class="pfe-tip">${ic('sparkle')}<span>Cara tercepat: arahkan kursor ke gambar mana pun di halaman, lalu klik tombol <b>Ganti gambar</b> yang muncul.</span></p>
      <div class="pfe-sec"><h4>Foto utama (Hero)</h4><p class="pfe-hint">Paling bagus PNG tanpa latar (transparan) dengan pose setengah badan.</p></div>
      ${slot('profile.photo', 'Foto profil')}
      ${listSection('about.photos', 'Carousel “Tentang Saya”', 'Foto berganti otomatis setiap beberapa detik.', [{ k: 'caption', ph: 'Keterangan foto' }])}
      ${listSection('gallery', 'Dokumentasi Kegiatan', 'Ditampilkan sebagai carousel yang bisa digeser.', [{ k: 'title', ph: 'Judul' }, { k: 'caption', ph: 'Keterangan' }])}
      <div class="pfe-sec"><h4>Gambar proyek</h4></div>
      ${(d.projects || []).map((p, i) => slot(`projects.${i}.image`, p.title)).join('')}
      <div class="pfe-sec"><h4>File CV</h4></div>
      ${slot('profile.cv', 'CV (PDF)', 'pdf')}`;
  }

  /* ---------- Tab: Terbitkan ---------- */
  function publishTab() {
    const dirty = isDirty(), n = Object.keys(files).length;
    return `
      <div class="pfe-status${dirty ? ' is-dirty' : ''}">
        ${dirty ? ic('alert') : ic('checkCircle')}
        <div>${dirty
          ? `<strong>Ada perubahan yang belum diterbitkan</strong><small>${n} file baru · hanya tersimpan di browser ini</small>`
          : '<strong>Tidak ada perubahan</strong><small>Tampilan sama dengan data yang online</small>'}</div>
      </div>
      <ol class="pfe-steps">
        <li><b>Unduh ZIP</b> — berisi <code>data/portfolio.json</code> dan gambar baru di <code>public/assets</code>.</li>
        <li><b>Ekstrak</b> ZIP, lalu salin folder <code>data</code> &amp; <code>public</code> ke folder proyek. Pilih <i>Replace / Timpa</i>.</li>
        <li><b>Commit &amp; push</b> ke GitHub. Vercel otomatis build ulang website dalam ±1–2 menit.</li>
      </ol>
      <button class="pfe-btn pfe-btn--primary pfe-btn--block" type="button" data-act="zip"${dirty ? '' : ' disabled'}>${ic('package')}Unduh ZIP Pembaruan</button>
      <button class="pfe-btn pfe-btn--block" type="button" data-act="datajs">${ic('download')}Unduh portfolio.json saja</button>
      <div class="pfe-sec"><h4>Lainnya</h4></div>
      <button class="pfe-btn pfe-btn--block pfe-btn--danger" type="button" data-act="discard"${dirty ? '' : ' disabled'}>${ic('reset')}Buang semua perubahan</button>
      <button class="pfe-btn pfe-btn--block" type="button" data-act="exit">${ic('logout')}Keluar dari Mode Edit</button>
      <p class="pfe-hint">Panel ini hanya muncul di browser Anda. Pengunjung tidak bisa melihat atau mengubah apa pun. Untuk masuk lagi, buka alamat website ditambah <code>?edit</code>.</p>`;
  }

  /* ---------- Event panel ---------- */
  async function onPanelClick(e) {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { tab = tabBtn.dataset.tab; renderPanel(); return; }
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, i = +b.dataset.i, key = b.dataset.key;
    const d = D();
    const certs = d.certificates;
    const swap = (arr, a, c) => { [arr[a], arr[c]] = [arr[c], arr[a]]; };

    switch (act) {
      case 'close': togglePanel(false); break;

      case 'cert-up': swap(certs, i, i - 1); if (editing === i) editing = i - 1; commit(); break;
      case 'cert-down': swap(certs, i, i + 1); if (editing === i) editing = i + 1; commit(); break;
      case 'cert-edit': resetCertForm(); editing = i; renderPanel(); $('#pfeBody').scrollTop = 0; break;
      case 'cert-cancel': resetCertForm(); renderPanel(); break;
      case 'cert-del':
        if (!confirm(`Hapus sertifikat “${certs[i].title}”?`)) return;
        certs.splice(i, 1);
        if (editing === i) resetCertForm(); else if (editing > i) editing -= 1;
        commit('Sertifikat dihapus');
        break;

      case 'img-replace': {
        const file = await pickFile('image/*');
        if (file) await doReplace(b.dataset.path, file);
        break;
      }
      case 'cv-replace': {
        const file = await pickFile('application/pdf');
        if (!file) return;
        const dest = `/assets/files/${slug(file.name.replace(/\.pdf$/i, ''))}.pdf`;
        addFile(dest, file);
        d.profile.cv = dest;
        commit('CV diganti');
        break;
      }
      case 'list-up': swap(getPath(d, key), i, i - 1); commit(); break;
      case 'list-down': swap(getPath(d, key), i, i + 1); commit(); break;
      case 'list-del': {
        const arr = getPath(d, key);
        if (!confirm('Hapus foto ini dari carousel?')) return;
        arr.splice(i, 1);
        commit('Foto dihapus');
        break;
      }
      case 'list-img': {
        const file = await pickFile('image/*');
        if (file) await doReplace(`${key}.${i}.src`, file);
        break;
      }
      case 'list-add': {
        const picked = await pickFile('image/*', true);
        if (!picked?.length) return;
        const arr = getPath(d, key);
        busy(true);
        try {
          for (const file of picked) {
            const label = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
            arr.push(key === 'gallery' ? { src: '', title: label, caption: '' } : { src: '', caption: label });
            await replaceImage(`${key}.${arr.length - 1}.src`, file, label);
          }
          commit(`${picked.length} foto ditambahkan`);
        } catch (err) {
          for (let k = arr.length - 1; k >= 0; k--) if (!arr[k].src) arr.splice(k, 1);
          PF.toast(err.message || 'Gagal menambah foto', 'x');
        } finally { busy(false); }
        break;
      }

      case 'zip': await exportZip(); break;
      case 'datajs':
        if (Object.keys(files).length && !confirm('Ada gambar baru yang tidak ikut di portfolio.json. Gunakan "Unduh ZIP" agar gambar ikut. Tetap unduh portfolio.json saja?')) return;
        download(new Blob([serialize()], { type: 'application/json' }), 'portfolio.json');
        break;
      case 'discard':
        if (!confirm('Buang semua perubahan dan kembali ke data yang online?')) return;
        window.PORTFOLIO = clone(original);
        resetCertForm();
        commit('Semua perubahan dibuang');
        break;
      case 'exit':
        if (isDirty() && !confirm('Perubahan tetap tersimpan sebagai draf di browser ini. Keluar dari Mode Edit?')) return;
        try { localStorage.removeItem('pf-edit'); } catch (_) { /* abaikan */ }
        location.href = location.pathname + location.hash;
        break;
      default: break;
    }
  }

  function onPanelChange(e) {
    if (e.target.id === 'pfeCertFile') { setPending(e.target.files[0]); return; }
    const k = e.target.dataset.key;
    if (k) { setPath(D(), k, e.target.value.trim()); commit('', { panel: false }); }
  }

  /* ---------- Tombol "Ganti gambar" yang melayang di atas gambar ---------- */
  function initReplaceButton() {
    let target = null, hideT;
    const show = (t) => {
      clearTimeout(hideT);
      target = t;
      const r = t.getBoundingClientRect();
      replaceBtn.style.left = `${Math.min(innerWidth - 150, Math.max(8, r.left + 12))}px`;
      replaceBtn.style.top = `${Math.min(innerHeight - 44, Math.max(76, r.top + 12))}px`;
      replaceBtn.hidden = false;
    };
    const hide = () => { clearTimeout(hideT); hideT = setTimeout(() => { replaceBtn.hidden = true; target = null; }, 300); };

    document.addEventListener('pointerover', (e) => {
      if (e.pointerType === 'touch') return;
      if (e.target.closest('.pfe-replace')) { clearTimeout(hideT); return; }
      const t = e.target.closest('[data-edit]');
      if (t && !panel.contains(t) && $('#lb').hidden) show(t);
    });
    document.addEventListener('pointerout', (e) => { if (e.target.closest('[data-edit], .pfe-replace')) hide(); });
    addEventListener('scroll', () => { replaceBtn.hidden = true; }, { passive: true });
    replaceBtn.addEventListener('click', async () => {
      if (!target) return;
      const path = target.dataset.edit;
      replaceBtn.hidden = true;
      const file = await pickFile(path.startsWith('certificates') ? 'image/*,application/pdf' : 'image/*');
      if (file) await doReplace(path, file);
    });
  }

  /* ---------- Gaya panel (hanya dimuat di Mode Edit) ---------- */
  const CSS = `
  .toast{z-index:700}
  .pf-editing [data-edit]{outline:2px dashed transparent;outline-offset:-3px;transition:outline-color .2s}
  .pf-editing [data-edit]:hover{outline-color:var(--accent)}
  .pfe-fab{position:fixed;left:20px;bottom:20px;z-index:390;display:inline-flex;align-items:center;gap:8px;height:46px;padding:0 18px;border-radius:999px;background:var(--text);color:var(--surface);font-weight:700;font-size:14px;box-shadow:var(--shadow-lg);transition:transform .2s}
  .pfe-fab:hover{transform:translateY(-2px)}
  .pfe-fab[hidden]{display:none}
  .pfe-fab__dot{width:9px;height:9px;border-radius:50%;background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.3)}
  .pfe-fab__dot[hidden]{display:none}
  .pfe{position:fixed;top:12px;right:12px;bottom:12px;z-index:400;width:min(440px,calc(100vw - 24px));display:flex;flex-direction:column;background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:24px;box-shadow:var(--shadow-lg);transform:translateX(calc(100% + 24px));visibility:hidden;transition:transform .45s cubic-bezier(.2,.8,.2,1),visibility .45s;font-size:14px;line-height:1.5}
  .pfe.is-open{transform:none;visibility:visible}
  .pfe__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 14px 12px 18px}
  .pfe__title{display:flex;align-items:center;gap:12px;min-width:0}
  .pfe__logo{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--accent);color:#fff;flex:none}
  .pfe__title strong{display:block;font-size:16px}
  .pfe__title small{display:block;color:var(--muted);font-size:12.5px}
  .pfe__icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:var(--muted)}
  .pfe__icon:hover{background:var(--surface-2);color:var(--text)}
  .pfe__tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:0 16px;padding:4px;border-radius:14px;background:var(--surface-2);border:1px solid var(--line)}
  .pfe__tabs button{height:36px;border-radius:10px;font-weight:600;font-size:13px;color:var(--muted);display:inline-flex;align-items:center;justify-content:center;gap:6px}
  .pfe__tabs button .i{width:15px;height:15px}
  .pfe__tabs button.is-active{background:var(--surface);color:var(--text);box-shadow:var(--shadow-sm),0 0 0 1px var(--line)}
  .pfe__body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}
  .pfe h4{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
  .pfe h4 .i{width:16px;height:16px;color:var(--accent)}
  .pfe h4 small{font-size:11.5px;padding:1px 8px;border-radius:999px;background:var(--surface-2);color:var(--muted)}
  .pfe-card{border:1px solid var(--line);border-radius:18px;padding:16px;background:linear-gradient(180deg,var(--sky-3),var(--surface));display:grid;gap:12px}
  .pfe-drop{display:block;padding:14px;border:1.5px dashed var(--line-strong);border-radius:14px;background:var(--surface);cursor:pointer;transition:border-color .2s,background-color .2s}
  .pfe-drop:hover,.pfe-drop.is-over{border-color:var(--accent);background:var(--accent-softer)}
  .pfe-drop.has-file{border-style:solid;border-color:var(--accent)}
  .pfe-drop__inner{display:flex;align-items:center;gap:14px}
  .pfe-drop__inner > span:last-child{min-width:0}
  .pfe-drop__ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);flex:none}
  .pfe-drop img{width:64px;height:48px;object-fit:contain;border-radius:6px;background:var(--surface-2);flex:none}
  .pfe-drop strong{display:block;font-size:13.5px;overflow-wrap:anywhere}
  .pfe-drop small{display:block;font-size:12px;color:var(--muted)}
  .pfe-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .pfe-span{grid-column:1/-1}
  .pfe-field{display:grid;gap:4px;min-width:0}
  .pfe-field span{font-size:12px;font-weight:600;color:var(--text-2)}
  .pfe-field input,.pfe-input{width:100%;height:38px;padding:0 12px;border-radius:10px;border:1px solid var(--line-strong);background:var(--surface);color:var(--text);font-size:13.5px;outline:none;transition:border-color .2s,box-shadow .2s}
  .pfe-field input:focus,.pfe-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
  .pfe-row{display:flex;justify-content:flex-end;gap:8px}
  .pfe-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:999px;border:1px solid var(--line-strong);background:var(--surface);font-weight:600;font-size:13.5px;transition:border-color .2s,color .2s,background-color .2s}
  .pfe-btn .i{width:16px;height:16px}
  .pfe-btn:hover{border-color:var(--accent);color:var(--accent)}
  .pfe-btn:disabled{opacity:.45;pointer-events:none}
  .pfe-btn--sm{height:34px;padding:0 12px;font-size:12.5px;flex:none}
  .pfe-btn--primary{background:var(--accent);border-color:var(--accent);color:#fff}
  .pfe-btn--primary:hover{background:var(--accent-hover);color:#fff}
  .pfe-btn--danger:hover{border-color:#ef4444;color:#ef4444}
  .pfe-btn--block{width:100%}
  .pfe-btn--dashed{border-style:dashed;width:100%}
  .pfe-sec{margin-top:6px;display:grid;gap:2px}
  .pfe-hint{font-size:12.5px;color:var(--muted);line-height:1.5}
  .pfe-list{display:grid;grid-template-columns:minmax(0,1fr);gap:6px}
  .pfe__body > *{min-width:0;flex-shrink:0}
  .pfe-item{display:flex;align-items:center;gap:10px;padding:8px;border-radius:14px;border:1px solid var(--line);background:var(--surface)}
  .pfe-item.is-editing{border-color:var(--accent);background:var(--accent-softer)}
  .pfe-thumb{width:52px;height:40px;border-radius:8px;overflow:hidden;background:var(--surface-2);flex:none;display:grid;place-items:center;color:var(--accent)}
  .pfe-thumb img{width:100%;height:100%;object-fit:cover}
  .pfe-thumb--tall{width:46px;height:62px}
  .pfe-thumb--tall img,.pfe-thumb--lg img{object-fit:contain}
  .pfe-thumb--lg{width:64px;height:48px}
  .pfe-item__text{flex:1;min-width:0}
  .pfe-item__text strong,.pfe-slot strong{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pfe-item__text small,.pfe-slot small{display:block;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pfe-item__acts{display:flex;gap:2px;flex:none}
  .pfe-item__acts--grid{display:grid;grid-template-columns:repeat(2,30px)}
  .pfe-mini{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:var(--muted)}
  .pfe-mini:hover{background:var(--surface-2);color:var(--text)}
  .pfe-mini[data-act$="del"]:hover{color:#ef4444}
  .pfe-mini:disabled{opacity:.3;pointer-events:none}
  .pfe-mini .i{width:15px;height:15px}
  .pfe-item--media{align-items:flex-start}
  .pfe-item--media .pfe-thumb{width:62px;height:62px}
  .pfe-item__fields{flex:1;min-width:0;display:grid;gap:6px}
  .pfe-item__fields .pfe-input{height:30px;font-size:12.5px;padding:0 10px}
  .pfe-slot{display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--line);border-radius:14px}
  .pfe-slot > div{flex:1;min-width:0}
  .pfe-status{display:flex;gap:12px;align-items:center;padding:14px;border-radius:14px;background:rgba(18,183,106,.1);border:1px solid rgba(18,183,106,.3)}
  .pfe-status > .i{color:#12b76a;width:22px;height:22px}
  .pfe-status.is-dirty{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.35)}
  .pfe-status.is-dirty > .i{color:#d97706}
  .pfe-status strong{display:block;font-size:13.5px}
  .pfe-status small{display:block;color:var(--muted);font-size:12px}
  .pfe-steps{counter-reset:s;display:grid;gap:10px;padding:4px 0;margin:0;list-style:none}
  .pfe-steps li{counter-increment:s;position:relative;padding-left:36px;font-size:13.5px;line-height:1.5;color:var(--text-2)}
  .pfe-steps li::before{content:counter(s);position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-weight:800;font-size:12px;display:grid;place-items:center}
  .pfe code{font-family:var(--mono);font-size:12px;padding:1px 6px;border-radius:6px;background:var(--surface-2);border:1px solid var(--line)}
  .pfe-tip{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:12px;background:var(--accent-softer);border:1px solid var(--accent-soft);color:var(--text-2);font-size:12.5px;line-height:1.5}
  .pfe-tip .i{color:var(--accent);margin-top:1px}
  .pfe-replace{position:fixed;z-index:350;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:999px;background:var(--accent);color:#fff;font-size:12.5px;font-weight:700;box-shadow:0 8px 20px -6px rgba(0,0,0,.45)}
  .pfe-replace .i{width:15px;height:15px}
  .pfe-replace[hidden]{display:none}
  .pfe-busy{position:fixed;inset:0;z-index:650;display:grid;place-items:center;background:rgba(5,8,15,.35);backdrop-filter:blur(2px)}
  .pfe-busy[hidden]{display:none}
  .pfe-busy > div{display:flex;align-items:center;gap:12px;padding:14px 20px;border-radius:999px;background:var(--surface);color:var(--text);font-weight:600;box-shadow:var(--shadow-lg)}
  .pfe-busy i{width:18px;height:18px;border-radius:50%;border:2.5px solid var(--accent-soft);border-top-color:var(--accent);animation:pfespin .8s linear infinite}
  @keyframes pfespin{to{transform:rotate(360deg)}}
  @media (max-width:640px){
    .pfe{top:auto;left:8px;right:8px;bottom:8px;width:auto;height:min(86svh,760px);transform:translateY(calc(100% + 24px))}
    .pfe-grid{grid-template-columns:1fr}
    .pfe-fab{left:14px;bottom:14px}
  }`;

