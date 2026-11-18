/* =========================================================
   Ortak altyapı (G): ekran yönetimi, efektler, sevinç/teselli,
   ortak görseller. Tüm ekran ve etkinlik dosyaları bunu kullanır.
   ========================================================= */
const G = (() => {
  const app = document.getElementById('app');
  const fx = document.getElementById('fx');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const TR = 'tr-TR', EN = 'en-US';
  const RAINBOW = ['#ff4d6d', '#ff9f1c', '#f9c80e', '#38b000', '#00b4d8', '#7b2cbf', '#f72585'];

  /* ---------- Akış kontrolü ----------
     Her ekran/etkinlik yeni bir akış başlatır; eski konuşmalar,
     döngüler ve zamanlayıcılar alive(id) false olunca kendini durdurur. */
  let flowId = 0;
  const cleanups = [];
  function newFlow() {
    Speech.cancel();
    return ++flowId;
  }
  const alive = (id) => id === flowId;
  // Ekrandan çıkarken çalışacak temizlik (müzik, mikrofon döngüsü vb.)
  function onLeave(fn) { cleanups.push(fn); }
  function leave() {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { /* yoksay */ } }
  }

  const childName = () => Settings.get('childName') || 'Alen';

  // Türkçe iyelik eki: Alen -> Alen'in, Ada -> Ada'nın
  function genitive(n) {
    const low = n.toLocaleLowerCase('tr-TR');
    const v = low.match(/[aeıioöuü]/g);
    const last = v ? v[v.length - 1] : 'e';
    const map = { a: 'ın', ı: 'ın', e: 'in', i: 'in', o: 'un', u: 'un', ö: 'ün', ü: 'ün' };
    let suf = map[last];
    if (/[aeıioöuü]$/.test(low)) suf = 'n' + suf;
    return n + "'" + suf;
  }

  function rainbowText(t) {
    return [...t].map((ch, i) => ch === ' ' ? ' ' :
      `<span style="color:${RAINBOW[i % RAINBOW.length]};animation-delay:${i * 0.08}s">${esc(ch)}</span>`).join('');
  }

  /* ---------- Ekran ---------- */
  function screen(cls, html, bg) {
    leave();
    app.innerHTML = `<div class="screen ${cls}" ${bg ? `style="--bg:${bg}"` : ''}>${html}</div>`;
    const root = app.firstElementChild;
    document.body.dataset.theme = cls.includes('ocean') ? 'ocean' : '';
    return root;
  }

  // Üst çubuk: ev düğmesi + başlık + (isteğe bağlı) sağ düğme
  function topbar(title, rightHtml = '<span class="icon-btn ghost"></span>') {
    return `<div class="topbar">
      <button class="icon-btn" data-home aria-label="Ana sayfa">${pic('🏠')}</button>
      <div class="title">${title}</div>
      ${rightHtml}
    </div>`;
  }
  function bindHome(root) {
    $$('[data-home]', root).forEach(b => b.onclick = () => { Sounds.tap(); G.goHome(); });
  }

  /* ---------- Efektler ---------- */
  function confetti(n = 80, opts = {}) {
    const emos = ['⭐', '🎉', '🎈', '💖', '✨', '🌟'];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      if (Math.random() < 0.28) {
        d.innerHTML = pic(rand(emos));
        d.classList.add('emo');
      } else {
        d.style.background = rand(RAINBOW);
        if (Math.random() < 0.5) d.style.borderRadius = '50%';
      }
      d.style.left = (opts.x != null ? opts.x + (Math.random() * 30 - 15) : Math.random() * 100) + 'vw';
      d.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
      d.style.setProperty('--rot', (Math.random() * 1080 - 540) + 'deg');
      d.style.animationDuration = (1.8 + Math.random() * 1.6) + 's';
      d.style.animationDelay = (Math.random() * 0.4) + 's';
      fx.appendChild(d);
      setTimeout(() => d.remove(), 4200);
    }
  }

  // Bir noktadan fışkıran yıldız/kalp patlaması
  function burst(x, y, emos = ['⭐', '✨', '💖'], n = 14) {
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'burst';
      d.innerHTML = pic(rand(emos));
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const r = 90 + Math.random() * 110;
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.setProperty('--tx', Math.cos(a) * r + 'px');
      d.style.setProperty('--ty', Math.sin(a) * r + 'px');
      fx.appendChild(d);
      setTimeout(() => d.remove(), 1100);
    }
  }
  function burstAt(el, emos, n) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, emos, n);
  }

  function toast(msg, ms = 2600) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), ms);
    setTimeout(() => t.remove(), ms + 500);
  }

  // CSS animasyonunu yeniden tetikle
  function anim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------- Dil yardımcıları ---------- */
  // İki dilli bir cümle çifti → seçili dile göre konuşma parçaları
  function both(tr, en, opts = {}) {
    const m = Speech.mode();
    if (m === 'tr') return [{ t: tr, l: TR, ...opts }];
    if (m === 'en') return [{ t: en, l: EN, ...opts }];
    return [{ t: tr, l: TR, ...opts }, 120, { t: en, l: EN, ...opts }];
  }
  const showTr = () => Speech.mode() !== 'en';
  // Ekranda gösterilecek metin (seçili dile göre)
  const tx = (tr, en) => Speech.mode() === 'en' ? en : (Speech.mode() === 'tr' ? tr : tr + ' · ' + en);
  const showEn = () => Speech.mode() !== 'tr';

  /* ---------- Sevinç / teselli ---------- */
  // Doğru cevap ya da başarı: müzik + alkış + konfeti + kısa "Yeeey! Aferin!"
  function celebrate(opts = {}) {
    Sounds.fanfare();
    Sounds.applause(opts.big ? 2.4 : 1.9);
    confetti(opts.big ? 130 : 75);
    const p = rand(PRAISE);
    const parts = [];
    if (Sounds.playFile('yeah')) parts.push(900);
    else parts.push(...both(p.tr, p.en));
    if (opts.extra) parts.push(200, ...opts.extra);
    return Speech.seq(parts);
  }

  // Yanlış cevap: kısa "Hayıııır!" + komik ses (beklemeden tekrar denenebilir)
  function oops() {
    const t = rand(TRY_AGAIN);
    if (Sounds.playFile('hayir')) return wait(900);
    Sounds.wrong();
    return Speech.seq([200, ...both(t.tr, t.en)]);
  }

  /* ---------- Görseller ---------- */
  function starPoints(cx, cy, R, r, n = 5) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R;
      const a = Math.PI / n * i - Math.PI / 2;
      pts.push((cx + rad * Math.cos(a)).toFixed(1) + ',' + (cy + rad * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  // Rengi koyulaştır (#rrggbb, 0..1)
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Parlak, gölgeli (3B görünümlü) şekil
  let shapeId = 0;
  function shapeSvg(it) {
    const id = 'sg' + (++shapeId);
    const c = it.color;
    const fill = `fill="url(#${id})"`;
    const body = {
      circle: `<circle cx="50" cy="50" r="42" ${fill}/>`,
      square: `<rect x="12" y="12" width="76" height="76" rx="12" ${fill}/>`,
      triangle: `<path d="M50 9 Q54 9 56 13 L92 82 Q94 90 86 90 L14 90 Q6 90 8 82 L44 13 Q46 9 50 9Z" ${fill}/>`,
      star: `<polygon points="${starPoints(50, 53, 46, 21)}" ${fill} stroke="${c}" stroke-width="6" stroke-linejoin="round"/>`,
      heart: `<path d="M50 88 C20 66 4 46 14 28 C24 10 44 13 50 30 C56 13 76 10 86 28 C96 46 80 66 50 88Z" ${fill}/>`,
      rect: `<rect x="4" y="26" width="92" height="48" rx="12" ${fill}/>`,
      oval: `<ellipse cx="50" cy="50" rx="45" ry="30" ${fill}/>`
    }[it.shape] || '';
    return `<svg viewBox="0 0 100 100" aria-hidden="true" class="shape-svg">
      <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#fff" stop-opacity=".85"/>
        <stop offset="18%" stop-color="${c}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${shade(c, 0.6)}" stop-opacity="1"/>
      </radialGradient></defs>
      <g filter="drop-shadow(0 6px 6px rgba(0,0,0,.25))">${body}</g>
    </svg>`;
  }

  /* Parmaklı eller: GERÇEK el fotoğrafları (Wikimedia Commons "Finger-counting to 5 from pointer",
     "Closed fist"), assets/img/real/hand_0..5.webp. n = açık parmak sayısı (0–10).
     1–5 tek el; 6–10 iki el (birinci el 5 parmak, ikinci el aynalanmış). */
  const handSrc = (k) => `assets/img/real/hand_${Math.max(0, Math.min(5, k))}.webp`;
  function handImg(k, mirror) {
    return `<img class="hand ${mirror ? 'mirror' : ''}" src="${handSrc(k)}" alt="" draggable="false">`;
  }
  function hands(n) {
    if (n <= 5) return `<div class="hands one">${handImg(n, false)}</div>`;
    return `<div class="hands two">${handImg(5, false)}${handImg(n - 5, true)}</div>`;
  }
  // Ellerdeki açık parmak sayısını canlı değiştir (fotoğraf değişir, küçük bir zıplama ile)
  function setFingers(container, n) {
    $$('.hand', container).forEach((h, hi) => {
      const src = handSrc(n - hi * 5);
      if (!h.src.endsWith(src)) {
        h.src = src;
        h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump');
      }
    });
  }
  // fotoğrafları önceden yükle (sayarken gecikme olmasın)
  for (let k = 0; k <= 5; k++) { const im = new Image(); im.src = handSrc(k); }

  // Bölüm öğesinin görseli
  function visual(it, cat) {
    switch (cat.type) {
      case 'number':
        return `<div class="vis num"><div class="digit" style="--c:${RAINBOW[(it.value - 1) % RAINBOW.length]}">${it.value}</div>${hands(it.value)}</div>`;
      case 'letter': {
        const col = RAINBOW[cat.items.indexOf(it) % RAINBOW.length];
        return `<div class="vis letter" style="--c:${col}">${esc(it.tr)}<small>${esc(it.tr.toLocaleLowerCase('tr-TR'))}</small></div>`;
      }
      case 'shape':
        return `<div class="vis shape">${shapeSvg(it)}</div>`;
      default:
        return `<div class="vis picture">${it.src ? picSrc(it.src) : pic(it.emoji)}</div>`;
    }
  }

  // Basılı tutma (ebeveyn ayarları için)
  function longPress(el, ms, onLong, onShort) {
    let timer = null, fired = false;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      fired = false;
      el.classList.add('pressing');
      timer = setTimeout(() => { fired = true; timer = null; el.classList.remove('pressing'); onLong(); }, ms);
    });
    el.addEventListener('pointerup', () => {
      el.classList.remove('pressing');
      if (timer) { clearTimeout(timer); timer = null; if (!fired && onShort) onShort(); }
    });
    el.addEventListener('pointerleave', () => { el.classList.remove('pressing'); if (timer) { clearTimeout(timer); timer = null; } });
  }

  function toggleFullscreen(force) {
    const d = document, el = d.documentElement;
    const isFull = !!(d.fullscreenElement || d.webkitFullscreenElement);
    try {
      if (force === true && isFull) return;
      if (!isFull) {
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) { const p = req.call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); }
      } else if (force !== true) {
        (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      }
    } catch (e) { /* desteklenmiyor */ }
  }

  return {
    app, fx, $, $$, esc, rand, shuffle, wait, TR, EN, RAINBOW,
    newFlow, alive, onLeave, leave, childName, genitive, rainbowText,
    screen, topbar, bindHome, confetti, burst, burstAt, toast, anim,
    celebrate, oops, both, tx, showTr, showEn, visual, hands, setFingers, shapeSvg, longPress, toggleFullscreen,
    goHome: () => {}, // home.js tarafından doldurulur
    activities: {}    // etkinlik dosyaları buraya kaydolur
  };
})();
