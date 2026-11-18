/* =========================================================
   Başla ekranı, ana sayfa ve ebeveyn ayarları
   ========================================================= */
(() => {
  const { $, $$, esc, TR, EN } = G;
  const TILE_COLORS = [
    ['#ff6b6b', '#ff9a8b'], ['#4dabf7', '#74c0fc'], ['#fcc419', '#ffe066'], ['#40c057', '#8ce99a'],
    ['#ff922b', '#ffc078'], ['#845ef7', '#b197fc'], ['#f06595', '#faa2c1'], ['#20c997', '#63e6be'],
    ['#339af0', '#a5d8ff'], ['#e64980', '#f783ac'], ['#7950f2', '#d0bfff'], ['#fd7e14', '#ffd8a8']
  ];

  /* ---------- Arka plan (gökyüzü, bulutlar, gökkuşağı) ---------- */
  function buildSky() {
    const sky = document.createElement('div');
    sky.className = 'sky';
    sky.innerHTML = `
      <div class="sun">${pic('☀️')}</div>
      <div class="rainbow-arc">${pic('🌈')}</div>
      <div class="cloud c1">${pic('☁️')}</div><div class="cloud c2">${pic('☁️')}</div><div class="cloud c3">${pic('☁️')}</div>
      <div class="bubble b1"></div><div class="bubble b2"></div><div class="bubble b3"></div>
      <div class="bubble b4"></div><div class="bubble b5"></div><div class="bubble b6"></div>
      <div class="hills"><div class="hill h1"></div><div class="hill h2"></div><div class="hill h3"></div></div>`;
    document.body.prepend(sky);
  }

  /* ---------- Başla: dil seçimi ---------- */
  function renderStart() {
    G.newFlow();
    const cur = Settings.get('lang') || 'tr';
    const root = G.screen('start', `
      <h1 class="rainbow-title big">${G.rainbowText(G.genitive(G.childName()))}<br>${G.rainbowText('Oyunu')}</h1>
      <div class="start-friends">
        <span style="--i:0">${pic('🐱')}</span><span style="--i:1">${pic('🦈')}</span>
        <span style="--i:2">${pic('🐥')}</span><span style="--i:3">${pic('🐶')}</span><span style="--i:4">${pic('🚗')}</span>
      </div>
      <div class="lang-pick">
        <button class="lang-btn ${cur === 'tr' ? 'on' : ''}" data-l="tr"><span class="flag tr"></span><b>Türkçe</b><small>Türkçe konuşsun</small></button>
        <button class="lang-btn ${cur === 'en' ? 'on' : ''}" data-l="en"><span class="flag en"></span><b>English</b><small>Speak English</small></button>
        <button class="lang-btn ${cur === 'both' ? 'on' : ''}" data-l="both"><span class="flag both"></span><b>İkisi · Both</b><small>Türkçe + English</small></button>
      </div>
      <button class="big-play" id="play" aria-label="Başla"><span>▶</span></button>`);
    $$('.lang-btn', root).forEach(b => b.onclick = () => {
      Sounds.init();
      Sounds.tap();
      Settings.set('lang', b.dataset.l);
      $$('.lang-btn', root).forEach(x => x.classList.toggle('on', x === b));
      start();
    });
    $('#play', root).onclick = () => { if (!Settings.get('lang')) Settings.set('lang', 'tr'); start(); };
    function start() {
      Sounds.init();
      Sounds.fanfare();
      if (Settings.get('autoFull')) G.toggleFullscreen(true);
      renderHome(true);
    }
  }

  /* ---------- Ana sayfa ---------- */
  function tile(i, icon, tr, en, attrs) {
    const [c1, c2] = TILE_COLORS[i % TILE_COLORS.length];
    return `<button class="tile" ${attrs} style="--c1:${c1};--c2:${c2};animation-delay:${i * 0.05}s">
      <span class="tile-icon">${pic(icon)}</span>
      <span class="tile-tr">${esc(tr)}</span>
      <span class="tile-en">${esc(en)}</span>
    </button>`;
  }

  function renderHome(greet) {
    const id = G.newFlow();
    // Tüm kartlar tek alanda; sıra ebeveyn/çocuk tarafından basılı tutup sürüklenerek değiştirilir ve kalıcı saklanır
    const all = [
      ...ACTIVITIES.map((a, i) => ({ key: 'act:' + a.id, html: (k) => tile(k + 3, a.icon, a.tr, a.en, `data-act="${a.id}" data-key="act:${a.id}"`) })),
      ...CATEGORIES.map((c, i) => ({ key: 'cat:' + c.id, html: (k) => tile(k, c.icon, c.tr, c.en, `data-cat="${i}" data-key="cat:${c.id}"`) }))
    ];
    const saved = Settings.get('homeOrder') || [];
    const rank = (k) => { const i = saved.indexOf(k); return i < 0 ? 1000 + all.findIndex(x => x.key === k) : i; };
    all.sort((a, b) => rank(a.key) - rank(b.key));
    const allTiles = all.map((x, k) => x.html(k)).join('');
    const root = G.screen('home', `
      <div class="topbar">
        <button class="icon-btn small" id="gear" title="Ayarlar için basılı tutun" aria-label="Ayarlar">⚙️</button>
        <h1 class="home-title">${G.rainbowText(G.genitive(G.childName()) + ' Oyunu')}</h1>
        <button class="icon-btn small" id="full" title="Tam ekran" aria-label="Tam ekran">⛶</button>
      </div>
      <div class="home-scroll">
        <div class="tiles" id="tiles">${allTiles}</div>
        <p class="order-hint">Kartların yerini değiştirmek için karta basılı tutup sürükleyin.</p>
      </div>`);
    enableReorder($('#tiles'));
    $$('[data-cat]', root).forEach(b => b.onclick = () => { if (b._dragged) return; Sounds.tap(); Learn.open(CATEGORIES[+b.dataset.cat]); });
    $$('[data-act]', root).forEach(b => b.onclick = () => {
      if (b._dragged) return;
      Sounds.tap();
      const fn = G.activities[b.dataset.act];
      if (fn) fn(); else G.toast('Yakında!');
    });
    G.longPress($('#gear'), 800, openSettings, () => G.toast('Ayarlar için ⚙️ düğmesine basılı tutun'));
    $('#full').onclick = () => G.toggleFullscreen();

    if (greet) {
      const n = G.childName();
      Speech.seq(G.both(`Merhaba ${n}!`, `Hello ${n}!`));
      void id;
    }
  }
  G.goHome = () => renderHome(false);

  // Açılıştan kısa süre sonra en sık çalan sesleri önceden yükle (kutlama, alkış, "hayır")
  setTimeout(() => {
    Sounds.preloadCommon();
    const pairs = [];
    PRAISE.concat(TRY_AGAIN).forEach(p => pairs.push([p.tr, 'tr-TR'], [p.en, 'en-US']));
    Speech.preload(pairs);
  }, 1500);

  /* Basılı tut → sürükle → bırak: kart sırası değişir, Settings.homeOrder'a kaydedilir.
     Basılı tutmadan kaydırmak sayfayı normal kaydırır. */
  function enableReorder(grid) {
    let pressT = null, drag = null, sx = 0, sy = 0;
    const tiles = () => [...grid.querySelectorAll('.tile')];
    const save = () => Settings.set('homeOrder', tiles().map(t => t.dataset.key));
    const blockTouch = (e) => { if (drag) e.preventDefault(); };
    document.addEventListener('touchmove', blockTouch, { passive: false });
    grid.addEventListener('contextmenu', (e) => e.preventDefault());
    grid.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.tile');
      if (!t) return;
      t._dragged = false;
      sx = e.clientX; sy = e.clientY;
      clearTimeout(pressT);
      pressT = setTimeout(() => {
        const r = t.getBoundingClientRect();
        const ghost = t.cloneNode(true);
        ghost.classList.add('tile-ghost');
        Object.assign(ghost.style, { width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px', animation: 'none' });
        document.body.appendChild(ghost);
        t.classList.add('tile-placeholder');
        drag = { t, ghost, ox: sx - r.left, oy: sy - r.top };
        t._dragged = true;
        try { navigator.vibrate && navigator.vibrate(30); } catch (er) { /* yoksay */ }
        Sounds.tap();
      }, 450);
    });
    const move = (e) => {
      if (!grid.isConnected) return cleanup();
      if (!drag) {
        if (pressT && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) { clearTimeout(pressT); pressT = null; }
        return;
      }
      e.preventDefault();
      drag.ghost.style.left = (e.clientX - drag.ox) + 'px';
      drag.ghost.style.top = (e.clientY - drag.oy) + 'px';
      // parmağın altındaki karta göre yer değiştir
      drag.ghost.style.visibility = 'hidden';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      drag.ghost.style.visibility = '';
      const over = under && under.closest('#tiles .tile');
      if (over && over !== drag.t) {
        const list = tiles();
        if (list.indexOf(over) > list.indexOf(drag.t)) over.after(drag.t); else over.before(drag.t);
      }
      // kenara yaklaşınca kaydır
      const sc = grid.closest('.home-scroll');
      if (sc) {
        const r = sc.getBoundingClientRect();
        if (e.clientY > r.bottom - 60) sc.scrollTop += 12; else if (e.clientY < r.top + 60) sc.scrollTop -= 12;
      }
    };
    const end = () => {
      if (!grid.isConnected) return cleanup();
      clearTimeout(pressT); pressT = null;
      if (!drag) return;
      drag.ghost.remove();
      drag.t.classList.remove('tile-placeholder');
      const t = drag.t;
      drag = null;
      save();
      setTimeout(() => { t._dragged = false; }, 300);
    };
    // ana sayfadan çıkınca dinleyiciler kaldırılır (birikmesin)
    function cleanup() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      document.removeEventListener('touchmove', blockTouch);
    }
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  /* ---------- Ebeveyn ayarları (⚙️ basılı tutunca) ---------- */
  function openSettings() {
    G.newFlow();
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    const sel = (id, vals, cur, label) => `<select id="${id}">${vals.map(v => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label ? label(v) : v}</option>`).join('')}</select>`;
    wrap.innerHTML = `
      <div class="panel">
        <h2>⚙️ Ebeveyn Ayarları</h2>
        <p class="note">${Speech.hasRecordings() ? '✅ Tüm konuşmalar ElevenLabs çocuk sesiyle (Piku) kayıtlı. Bilgisayar seslendirmesi kullanılmaz.' : '⚠️ Ses kayıtları yüklenemedi.'}</p>
        <label>Çocuğun adı <input id="sName" maxlength="20" value="${esc(G.childName())}"></label>
        <label>Seçenek sayısı ${sel('sOpt', [2, 3, 4], Settings.get('optionCount'))}</label>
        <label>Konuşma dili
          <select id="sLang">${[['tr', 'Sadece Türkçe'], ['en', 'Only English'], ['both', 'İkisi (Türkçe + English)']].map(([v, t]) => `<option value="${v}" ${v === (Settings.get('lang') || 'tr') ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label>İkisi seçiliyse sıra
          <select id="sOrd"><option value="1" ${Settings.get('enFirst') ? 'selected' : ''}>Önce İngilizce, sonra Türkçe</option>
          <option value="0" ${!Settings.get('enFirst') ? 'selected' : ''}>Önce Türkçe, sonra İngilizce</option></select></label>
        <label class="check"><input type="checkbox" id="sFull" ${Settings.get('autoFull') ? 'checked' : ''}> Başlarken tam ekran aç</label>
        <div class="row">
          <button id="tTr">🔊 Türkçe dene</button>
          <button id="tEn">🔊 İngilizce dene</button>
        </div>
        <button class="close" id="sClose">Kaydet ve kapat</button>
      </div>`;
    document.body.appendChild(wrap);
    const save = () => {
      Settings.set('childName', ($('#sName').value || 'Alen').trim() || 'Alen');
      Settings.set('optionCount', +$('#sOpt').value);
      Settings.set('enFirst', $('#sOrd').value === '1');
      Settings.set('lang', $('#sLang').value);
      Settings.set('autoFull', $('#sFull').checked);
    };
    $('#tTr').onclick = () => { save(); Speech.cancel(); Speech.say('Merhaba Alen!', TR); };
    $('#tEn').onclick = () => { save(); Speech.cancel(); Speech.say('Hello Alen!', EN); };
    $('#sClose').onclick = () => { save(); Speech.cancel(); wrap.remove(); renderHome(); };
  }

  /* ---------- Başlat ---------- */
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (document.hidden) Speech.cancel(); });
  window.addEventListener('load', () => {
    buildSky();
    renderStart();
  });
})();
