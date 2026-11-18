/* =========================================================
   YUMURTA SÜRPRİZİ — renkli yumurtalara dokun, çatlasın,
   içinden civciv, ördek yavrusu, kedi... çıksın!
   Tek dokunuşta çatlar; yavrunun gerçek sesi ve adı duyulur.
   Art arda dokununca sesler sıraya girer, atlanmaz.
   ========================================================= */
G.activities.eggs = () => {
  const { $, $$, rand, shuffle, wait, TR, EN } = G;
  const id = G.newFlow();
  const BABIES_IN = [
    { tr: 'Civciv', en: 'Chick', emoji: '🐤', snd: 'chick' },
    { tr: 'Civciv', en: 'Chick', emoji: '🐥', snd: 'chick' },
    { tr: 'Ördek', en: 'Duck', emoji: '🦆', snd: 'duck' },
    { tr: 'Kedi', en: 'Kitty', emoji: '🐱', snd: 'kitten' },
    { tr: 'Kuş', en: 'Bird', emoji: '🐦', snd: 'bird' },
    { tr: 'Baykuş', en: 'Owl', emoji: '🦉', snd: 'owl' },
    { tr: 'Köpek', en: 'Puppy', emoji: '🐶', snd: 'dog' },
    { tr: 'Kurbağa', en: 'Frog', emoji: '🐸', snd: 'frog' }
  ];
  AnimalSounds.preload(BABIES_IN.map(x => x.snd).filter(Boolean)); // ilk dokunuşta gecikme olmasın
  const CRACK = [
    '',
    'M38 46 L46 52 L42 58 L52 60',
    'M38 46 L46 52 L42 58 L52 60 L58 54 L66 60 L62 66'
  ];

  const root = G.screen('eggs', G.topbar(`${pic('🐣', 'title-ic')} Yumurta Sürprizi <small>Egg Surprise</small>`) + `
    <div class="egg-scene">
      <div class="barn-sky"></div>
      ${pic('☀️', 'egg-deco e1')}${pic('☁️', 'egg-deco e2')}${pic('🐔', 'egg-deco e3')}${pic('🌻', 'egg-deco e4')}
      <div class="hay"></div>
      <div class="egg-row" id="row"></div>
    </div>`);
  G.bindHome(root);

  let hatched = 0, round = 0;

  function makeEggs() {
    hatched = 0;
    round++;
    const cols = shuffle(COLORS.filter(c => c.key !== 'black')).slice(0, 3);
    const kids = shuffle(BABIES_IN).slice(0, 3);
    $('#row').innerHTML = cols.map((c, i) => `
      <button class="egg" data-i="${i}" style="animation-delay:${i * 0.15}s">
        <div class="baby-in">${pic(kids[i].emoji)}</div>
        <div class="egg-half bottom"><img src="${tintSrc('egg', c.key)}" alt="" draggable="false"></div>
        <div class="egg-half top"><img src="${tintSrc('egg', c.key)}" alt="" draggable="false"></div>
        <svg class="crack" viewBox="0 0 100 100"><path d="" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <div class="nest-cup"></div>
      </button>`).join('');
    $$('.egg', root).forEach((el, i) => {
      el._c = cols[i]; el._k = kids[i];
      el.onclick = () => tapEgg(el);
    });
  }

  /* Sesler sıraya girer: art arda dokununca hiçbir ses kesilmez ya da atlanmaz.
     Her turda en fazla 3 yavru sesi + kutlama sıraya girer; tur değişince eski turun bekleyen sesleri atlanır
     (yeni yumurtalarda alakasız ses çıkmasın). Kutlama/yeni tur adımı her zaman eklenir → oyun asla takılmaz. */
  let queue = Promise.resolve(), pending = 0, introOn = true;
  function enqueue(job, force) {
    if (pending >= 5 && !force) return;
    pending++;
    queue = queue.then(async () => {
      try { if (G.alive(id)) await job(); } catch (e) { /* yoksay */ }
      pending--;
    });
  }
  const announce = (k, r) => async () => {
    if (r !== round) return; // eski turun sesi: atla
    if (k.snd) await AnimalSounds.play(k.snd);
    if (!G.alive(id)) return;
    await Speech.seq([{ t: `Sürpriz! ${k.tr}!`, l: TR, pitch: 1.4 }, 150, { t: `A ${k.en.toLowerCase()}!`, l: EN, pitch: 1.4 }]);
  };

  // Tek dokunuşta çatlar ve içinden yavru çıkar
  function tapEgg(el) {
    // ilk dokunuşta açılış konuşmasını kes (sonrakiler sıraya girer, kesilmez)
    if (introOn) { introOn = false; Speech.cancel(); }
    const k = el._k;
    if (el.classList.contains('hatched')) {
      // çıkmış yavruya dokununca sesi ve adı yine duyulsun
      G.anim(el.querySelector('.baby-in'), 'wiggle');
      if (pending === 0) enqueue(announce(k, round)); // yalnızca sessizken (sıra birikmesin)
      return;
    }
    el.querySelector('.crack path').setAttribute('d', CRACK[2]);
    el.classList.add('hatched');
    Sounds.pop();
    Sounds.crunch();
    G.burstAt(el, ['✨', '⭐'], 12);
    enqueue(announce(k, round), true);
    hatched++;
    if (hatched >= 3) {
      hatched = 0;
      const r = round;
      enqueue(async () => {
        if (r !== round) return;
        // kutlama sırasında dokunulamasın, yeni yumurtalar mutlaka gelsin
        $$('.egg', root).forEach(e => { e.onclick = null; });
        await Promise.race([G.celebrate({ extra: [{ t: 'Yeni yumurtalar geliyor!', l: TR }, { t: 'More eggs!', l: EN }] }), wait(6000)]);
        if (G.alive(id) && r === round) makeEggs();
      }, true);
    }
  }

  makeEggs();
  Speech.seq([{ t: 'Yumurtalara dokun!', l: TR, pitch: 1.3 }, 150, { t: 'Tap the eggs!', l: EN, pitch: 1.3 }, 150,
    { t: 'İçinden ne çıkacak?', l: TR, pitch: 1.3 }]).then(() => { introOn = false; });
};
