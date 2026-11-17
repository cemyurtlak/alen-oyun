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

  /* ---------- Başla ---------- */
  function renderStart() {
    G.newFlow();
    const root = G.screen('start', `
      <h1 class="rainbow-title big">${G.rainbowText(G.genitive(G.childName()))}<br>${G.rainbowText('Oyunu')}</h1>
      <div class="start-friends">
        <span style="--i:0">${pic('🐱')}</span><span style="--i:1">${pic('🦈')}</span>
        <span style="--i:2">${pic('🐥')}</span><span style="--i:3">${pic('🐶')}</span><span style="--i:4">${pic('🚗')}</span>
      </div>
      <button class="big-play" id="play" aria-label="Başla"><span>▶</span></button>
      <p class="hint">Başlamak için dokun · Tap to start</p>`);
    $('#play', root).onclick = () => {
      Sounds.init();
      Sounds.fanfare();
      if (Settings.get('autoFull')) G.toggleFullscreen(true);
      renderHome(true);
    };
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
    const learnTiles = CATEGORIES.map((c, i) => tile(i, c.icon, c.tr, c.en, `data-cat="${i}"`)).join('');
    const actTiles = ACTIVITIES.map((a, i) => tile(i + 3, a.icon, a.tr, a.en, `data-act="${a.id}"`)).join('');
    const root = G.screen('home', `
      <div class="topbar">
        <button class="icon-btn small" id="gear" title="Ayarlar için basılı tutun" aria-label="Ayarlar">⚙️</button>
        <h1 class="home-title">${G.rainbowText(G.genitive(G.childName()) + ' Oyunu')}</h1>
        <button class="icon-btn small" id="full" title="Tam ekran" aria-label="Tam ekran">⛶</button>
      </div>
      <div class="home-scroll">
        <h2 class="section-title">${pic('🎮')} Oyunlar <small>Games</small></h2>
        <div class="tiles">${actTiles}</div>
        <h2 class="section-title">${pic('📖')} Öğrenelim <small>Let's Learn</small></h2>
        <div class="tiles">${learnTiles}</div>
      </div>`);
    $$('[data-cat]', root).forEach(b => b.onclick = () => { Sounds.tap(); Learn.open(CATEGORIES[+b.dataset.cat]); });
    $$('[data-act]', root).forEach(b => b.onclick = () => {
      Sounds.tap();
      const fn = G.activities[b.dataset.act];
      if (fn) fn(); else G.toast('Yakında!');
    });
    G.longPress($('#gear'), 800, openSettings, () => G.toast('Ayarlar için ⚙️ düğmesine basılı tutun'));
    $('#full').onclick = () => G.toggleFullscreen();

    if (greet) {
      const n = G.childName();
      Speech.seq([{ t: `Merhaba ${n}!`, l: TR, pitch: 1.3 }, 150, { t: `Hello ${n}!`, l: EN, pitch: 1.3 }]);
      if (Speech.supported) {
        setTimeout(() => {
          if (G.alive(id) && !Speech.hasLang('tr')) G.toast('⚠️ Bu cihazda Türkçe ses bulunamadı. Ayarlara bakın.', 4000);
        }, 1800);
      }
    }
  }
  G.goHome = () => renderHome(false);

  /* ---------- Ebeveyn ayarları (⚙️ basılı tutunca) ---------- */
  function voiceOptions(lang, key) {
    const list = Speech.listVoices(lang);
    const cur = Settings.get(key) || '';
    if (!list.length) return `<option value="">(ses bulunamadı)</option>`;
    return `<option value="">Otomatik</option>` + list.map(v =>
      `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
  }

  function openSettings() {
    G.newFlow();
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    const noTr = Speech.supported && !Speech.hasLang('tr');
    const sel = (id, vals, cur, label) => `<select id="${id}">${vals.map(v => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label ? label(v) : v}</option>`).join('')}</select>`;
    wrap.innerHTML = `
      <div class="panel">
        <h2>⚙️ Ebeveyn Ayarları</h2>
        ${!Speech.supported ? '<p class="warn">Bu tarayıcı sesli okumayı desteklemiyor. Chrome veya Edge kullanın.</p>' : ''}
        ${noTr ? '<p class="warn">Türkçe ses bulunamadı. Windows: Ayarlar → Saat ve dil → Konuşma → Türkçe ses ekleyin. Android: Google metin okuma ayarlarından Türkçe indirin.</p>' : ''}
        <label>Çocuğun adı <input id="sName" maxlength="20" value="${esc(G.childName())}"></label>
        <label>Seçenek sayısı ${sel('sOpt', [2, 3, 4], Settings.get('optionCount'))}</label>
        <label>Bir turdaki soru sayısı ${sel('sQ', [3, 5, 8, 10], Settings.get('questionCount'))}</label>
        <label>Bir grupta kaç öğe öğretilsin ${sel('sG', [3, 4, 5, 6, 8, 30], Settings.get('groupSize'), v => v === 30 ? 'Hepsi' : v)}</label>
        <label>Konuşma hızı <input type="range" id="sRate" min="0.6" max="1.2" step="0.05" value="${Settings.get('rate')}"></label>
        <label>Soru sırası
          <select id="sOrd"><option value="1" ${Settings.get('enFirst') ? 'selected' : ''}>Önce İngilizce, sonra Türkçe</option>
          <option value="0" ${!Settings.get('enFirst') ? 'selected' : ''}>Önce Türkçe, sonra İngilizce</option></select></label>
        <label class="check"><input type="checkbox" id="sFull" ${Settings.get('autoFull') ? 'checked' : ''}> Başlarken tam ekran aç</label>
        <label>Türkçe ses <select id="sVTr">${voiceOptions('tr', 'voiceTr')}</select></label>
        <label>İngilizce ses <select id="sVEn">${voiceOptions('en', 'voiceEn')}</select></label>
        <div class="row">
          <button id="tTr">🔊 Türkçe dene</button>
          <button id="tEn">🔊 İngilizce dene</button>
        </div>
        <p class="note">Kendi sesinizi kullanmak için <b>sounds</b> klasörüne yeah.mp3, alkis.mp3, hayir.mp3;
          gerçek hayvan sesleri için <b>sounds/animals</b> klasörüne cat.mp3, dog.mp3, cow.mp3 gibi dosyalar koyabilirsiniz.</p>
        <button class="close" id="sClose">Kaydet ve kapat</button>
      </div>`;
    document.body.appendChild(wrap);
    const save = () => {
      Settings.set('childName', ($('#sName').value || 'Alen').trim() || 'Alen');
      Settings.set('optionCount', +$('#sOpt').value);
      Settings.set('questionCount', +$('#sQ').value);
      Settings.set('groupSize', +$('#sG').value);
      Settings.set('rate', +$('#sRate').value);
      Settings.set('enFirst', $('#sOrd').value === '1');
      Settings.set('autoFull', $('#sFull').checked);
      Settings.set('voiceTr', $('#sVTr').value);
      Settings.set('voiceEn', $('#sVEn').value);
    };
    $('#tTr').onclick = () => { save(); Speech.cancel(); Speech.say(`Merhaba ${G.childName()}! Hangisi kırmızı?`, TR); };
    $('#tEn').onclick = () => { save(); Speech.cancel(); Speech.say(`Hello ${G.childName()}! Which one is red?`, EN); };
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
