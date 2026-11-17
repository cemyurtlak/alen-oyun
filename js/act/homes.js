/* =========================================================
   HAYVAN EVLERİ — her hayvanı kendi yaşadığı yere taşı
   1) Önce tüm evler ve sakinleri tek tek tanıtılır
      ("Ördek gölde yaşar. The duck lives in the pond.")
   2) Sonra oyun: ortadaki hayvanı parmakla doğru eve sürükle
      (ya da eve dokun).
   ========================================================= */
G.activities.homes = () => {
  const { $, $$, esc, rand, shuffle, wait, TR, EN } = G;
  const all = HOMES.flatMap(h => h.animals.map(a => ({ ...a, home: h })));

  function homeHtml(h, i) {
    return `<div class="home-box" data-h="${h.id}" style="--hbg:${h.bg};animation-delay:${i * 0.08}s">
      <div class="home-art">${pic(h.icon, 'home-ic')}${h.deco.map((d, k) => pic(d, 'deco d' + k)).join('')}</div>
      <div class="home-name"><b>${esc(h.tr)}</b><small>${esc(h.en)}</small></div>
      <div class="residents"></div>
    </div>`;
  }

  /* ---------- 1) Tanıtım ---------- */
  function teach() {
    const id = G.newFlow();
    const root = G.screen('homes teach', G.topbar(`${pic('🏡', 'title-ic')} Hayvan Evleri <small>Animal Homes</small>`,
      `<button class="icon-btn" id="skip" aria-label="Oyuna geç">${pic('🎮')}</button>`) + `
      <div class="teach-stage" id="ts"></div>
      <div class="teach-caption" id="cap"></div>
      <button class="play-btn" id="go">${pic('🎮')} Oyna · Play</button>`);
    G.bindHome(root);
    $('#skip').onclick = $('#go').onclick = () => { Sounds.tap(); play(); };

    (async () => {
      if (!await Speech.seq([{ t: 'Hayvanlar nerede yaşar?', l: TR, pitch: 1.25 }, 200, { t: 'Where do animals live?', l: EN, pitch: 1.25 }])) return;
      for (const h of HOMES) {
        if (!G.alive(id)) return;
        $('#ts').innerHTML = homeHtml(h, 0);
        const box = $('#ts .home-box');
        G.anim(box, 'pop-in');
        $('#cap').innerHTML = `<b>${esc(h.tr)}</b> · ${esc(h.en)}`;
        if (!await Speech.seq([{ t: `Burası ${h.tr.toLocaleLowerCase('tr-TR')}.`, l: TR }, 150, { t: `This is the ${h.en.toLowerCase()}.`, l: EN }, 300])) return;
        for (const a of h.animals) {
          if (!G.alive(id)) return;
          const el = document.createElement('div');
          el.className = 'resident fly-in';
          el.innerHTML = pic(a.emoji);
          box.querySelector('.residents').appendChild(el);
          $('#cap').innerHTML = `<b>${esc(a.tr)} ${esc(h.trLoc)} yaşar.</b><small>The ${esc(a.en)} lives ${esc(h.enLoc)}.</small>`;
          if (a.snd) setTimeout(() => G.alive(id) && AnimalSounds.play(a.snd), 350);
          if (!await Speech.seq([{ t: `${a.tr} ${h.trLoc} yaşar.`, l: TR }, 150, { t: `The ${a.en} lives ${h.enLoc}.`, l: EN }, 600])) return;
        }
        await wait(400);
      }
      if (!G.alive(id)) return;
      $('#go').classList.add('glow');
      if (await Speech.seq([{ t: 'Şimdi oyun zamanı!', l: TR }, { t: "Let's play!", l: EN }, 300])) play();
    })();
  }

  /* ---------- 2) Oyun ---------- */
  let round = 0, total = 6, deck = [], cur = null, homesNow = [], lock = false, tries = 0;

  function play() {
    round = 0;
    total = Settings.get('questionCount') + 1;
    deck = shuffle(all);
    next();
  }

  function next() {
    if (round >= total) return finish();
    const id = G.newFlow();
    round++;
    lock = false;
    tries = 0;
    cur = deck[(round - 1) % deck.length];
    const others = shuffle(HOMES.filter(h => h !== cur.home)).slice(0, 2);
    homesNow = shuffle([cur.home, ...others]);
    const root = G.screen('homes play', `
      <div class="topbar">
        <button class="icon-btn" data-home aria-label="Ana sayfa">${pic('🏠')}</button>
        <div class="stars">${Array.from({ length: total }, (_, i) => `<span class="${i < round - 1 ? 'got' : ''}">${i < round - 1 ? pic('⭐') : '<i></i>'}</span>`).join('')}</div>
        <button class="icon-btn" id="again" aria-label="Tekrar">${pic('🔊')}</button>
      </div>
      <div class="question"><div class="q-line en">Where does the ${esc(cur.en)} live?</div><div class="q-line tr">${esc(cur.tr)} nerede yaşar?</div></div>
      <div class="drag-zone"><div class="draggable" id="ani">${pic(cur.emoji)}<span class="hand-hint">${pic('☝️')}</span></div></div>
      <div class="home-row">${homesNow.map(homeHtml).join('')}</div>`);
    G.bindHome(root);
    $('#again').onclick = () => ask();
    setupDrag($('#ani'));
    $$('.home-box', root).forEach(b => b.addEventListener('click', () => { if (!dragging) drop(b); }));
    ask();
    async function ask() {
      const aid = G.newFlow();
      if (cur.snd) AnimalSounds.play(cur.snd);
      await wait(cur.snd ? 900 : 0);
      if (G.alive(aid)) Speech.seq([{ t: `Where does the ${cur.en} live?`, l: EN }, 300, { t: `${cur.tr} nerede yaşar?`, l: TR }]);
    }
    void id;
  }

  let dragging = false;
  function setupDrag(el) {
    let sx = 0, sy = 0, pid = null;
    el.addEventListener('pointerdown', (e) => {
      if (lock) return;
      pid = e.pointerId;
      el.setPointerCapture(pid);
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      el.classList.add('grab');
      Sounds.tap();
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== pid) return;
      el.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) scale(1.1)`;
      $$('.home-box').forEach(b => {
        const r = b.getBoundingClientRect();
        b.classList.toggle('over', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      });
    });
    const end = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      el.classList.remove('grab');
      const over = $$('.home-box').find(b => {
        const r = b.getBoundingClientRect();
        return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      });
      $$('.home-box').forEach(b => b.classList.remove('over'));
      setTimeout(() => { dragging = false; }, 50);
      if (over) drop(over);
      else el.style.transform = '';
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  async function drop(box) {
    if (lock) return;
    const ani = $('#ani');
    const h = HOMES.find(x => x.id === box.dataset.h);
    if (h === cur.home) {
      lock = true;
      const id = G.newFlow();
      // hayvanı evin içine yerleştir
      const r1 = ani.getBoundingClientRect(), r2 = box.getBoundingClientRect();
      ani.style.transition = 'transform .45s cubic-bezier(.3,1.4,.5,1)';
      const base = ani.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
      const bx = base ? +base[1] : 0, by = base ? +base[2] : 0;
      ani.style.transform = `translate(${bx + (r2.left + r2.width / 2) - (r1.left + r1.width / 2)}px, ${by + (r2.top + r2.height * 0.55) - (r1.top + r1.height / 2)}px) scale(.55)`;
      box.classList.add('happy');
      if (cur.snd) setTimeout(() => AnimalSounds.play(cur.snd), 400);
      G.burstAt(box, ['⭐', '💖', '✨'], 14);
      await G.celebrate({ extra: [{ t: `${cur.tr} ${h.trLoc} yaşar!`, l: TR }, 150, { t: `The ${cur.en} lives ${h.enLoc}!`, l: EN }, 300] });
      if (G.alive(id)) next();
    } else {
      tries++;
      ani.style.transition = 'transform .4s ease';
      ani.style.transform = '';
      setTimeout(() => { ani.style.transition = ''; }, 420);
      G.anim(box, 'shake');
      await G.oops();
      if (tries >= 2) {
        const right = $(`.home-box[data-h="${cur.home.id}"]`);
        right && right.classList.add('hint');
      }
    }
  }

  function finish() {
    const id = G.newFlow();
    const root = G.screen('finish', `
      <div class="trophy">${pic('🏆')}</div>
      <h1 class="rainbow-title">${G.rainbowText('Aferin ' + G.childName() + '!')}</h1>
      <h2 class="sub">Every animal is home!</h2>
      <div class="finish-btns">
        <button class="fbtn" id="replay" style="--c1:#ff6b6b;--c2:#ff9a8b">${pic('🔁')}<small>Tekrar oyna</small></button>
        <button class="fbtn" id="relearn" style="--c1:#4dabf7;--c2:#74c0fc">${pic('📖')}<small>Tekrar öğren</small></button>
        <button class="fbtn" data-home style="--c1:#845ef7;--c2:#b197fc">${pic('🏠')}<small>Ana sayfa</small></button>
      </div>`);
    G.bindHome(root);
    $('#replay').onclick = () => { Sounds.tap(); play(); };
    $('#relearn').onclick = () => { Sounds.tap(); teach(); };
    G.celebrate({ big: true, extra: [{ t: 'Bütün hayvanlar evine gitti!', l: TR }] });
    void id;
  }

  teach();
};
