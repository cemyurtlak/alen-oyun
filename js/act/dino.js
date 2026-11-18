/* =========================================================
   DİNOZOR YUMURTALARI — şekil + renk öğretir.
   Her yumurtanın önünde, yumurtayla AYNI RENKTE bir şekil durur (daire, kare, üçgen, yıldız, kalp, dikdörtgen, oval).
   Şekle (ya da yumurtaya) dokununca rengi ve şekli söylenir ("Kırmızı! Üçgen!"),
   yumurta çatlar ve içinden dinozor çıkar. 3 yumurta açılınca kutlama, yeni yumurtalar.
   Sesler sıraya girer; tur değişince eski sesler atlanır, yeni tur adımı asla düşmez (Yumurta Sürprizi düzeni).
   ========================================================= */
G.activities.dino = () => {
  const { $, $$, rand, shuffle, wait, TR, EN } = G;
  const id = G.newFlow();
  const SHAPES = CATEGORIES.find(c => c.id === 'shapes').items;
  const EGG_COLORS = COLORS.filter(c => ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'].includes(c.key));
  const DINOS = ['🦕', '🦖'];
  const CRACK = 'M38 46 L46 52 L42 58 L52 60 L58 54 L66 60 L62 66';

  Speech.preload(SHAPES.map(s => [s.tr + '!', 'tr-TR']).concat(SHAPES.map(s => [s.en + '!', 'en-US']),
    EGG_COLORS.map(c => [c.tr + '!', 'tr-TR']), EGG_COLORS.map(c => [c.en + '!', 'en-US'])));

  const root = G.screen('eggs dino', G.topbar(`${pic('🦕', 'title-ic')} Dinozor Yumurtaları <small>Dino Eggs</small>`) + `
    <div class="egg-scene">
      <div class="barn-sky"></div>
      ${pic('🌋', 'egg-deco e1')}${pic('☁️', 'egg-deco e2')}${pic('🌿', 'egg-deco e3')}${pic('🌴', 'egg-deco e4')}
      <div class="hay"></div>
      <div class="egg-row" id="row"></div>
    </div>`);
  G.bindHome(root);

  let hatched = 0, round = 0;
  let queue = Promise.resolve(), pending = 0;
  function enqueue(job, force) {
    if (pending >= 5 && !force) return;
    pending++;
    queue = queue.then(async () => {
      try { if (G.alive(id)) await job(); } catch (e) { /* yoksay */ }
      pending--;
    });
  }

  function makeEggs() {
    hatched = 0;
    round++;
    const cols = shuffle(EGG_COLORS).slice(0, 3);
    const shapes = shuffle(SHAPES).slice(0, 3);
    $('#row').innerHTML = cols.map((c, i) => `
      <div class="dino-slot" style="animation-delay:${i * 0.15}s">
        <button class="egg" data-i="${i}">
          <div class="baby-in">${pic(rand(DINOS))}</div>
          <div class="egg-half bottom"><img src="${tintSrc('egg', c.key)}" alt="" draggable="false"></div>
          <div class="egg-half top"><img src="${tintSrc('egg', c.key)}" alt="" draggable="false"></div>
          <svg class="crack" viewBox="0 0 100 100"><path d="" stroke="#3a2a1a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div class="nest-cup"></div>
        </button>
        <button class="dino-shape" data-i="${i}">${G.shapeSvg({ shape: shapes[i].shape, color: c.hex })}</button>
      </div>`).join('');
    $$('.dino-slot', root).forEach((slot, i) => {
      const egg = slot.querySelector('.egg'), sh = slot.querySelector('.dino-shape');
      const info = { c: cols[i], s: shapes[i], egg, sh };
      egg.onclick = () => tap(info);
      sh.onclick = () => tap(info);
    });
  }

  const announce = (info, r) => async () => {
    if (r !== round) return; // eski turun sesi: atla
    await Speech.seq([...G.both(info.c.tr + '!', info.c.en + '!'), ...G.both(info.s.tr + '!', info.s.en + '!')]);
  };

  function tap(info) {
    const { egg, sh } = info;
    G.anim(sh, 'boom');
    if (egg.classList.contains('hatched')) {
      G.anim(egg.querySelector('.baby-in'), 'wiggle');
      if (pending === 0) enqueue(announce(info, round)); // yalnızca sessizken tekrar söyler
      return;
    }
    egg.querySelector('.crack path').setAttribute('d', CRACK);
    egg.classList.add('hatched');
    sh.classList.add('used');
    Sounds.crunch();
    G.burstAt(egg, ['✨', '⭐'], 12);
    enqueue(announce(info, round), true);
    hatched++;
    if (hatched >= 3) {
      hatched = 0;
      const r = round;
      enqueue(async () => {
        if (r !== round) return;
        $$('.egg, .dino-shape', root).forEach(e => { e.onclick = null; });
        await Promise.race([G.celebrate(), wait(4000)]);
        if (G.alive(id) && r === round) makeEggs();
      }, true);
    }
  }

  makeEggs();
};
