/* =========================================================
   YUMURTA SÜRPRİZİ — renkli yumurtalara dokun, çatlasın,
   içinden civciv, ördek yavrusu, kedi... çıksın!
   Her dokunuşta yumurtanın rengi söylenir (renk öğrenme).
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

  let hatched = 0;

  function makeEggs() {
    hatched = 0;
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
      el._c = cols[i]; el._k = kids[i]; el._taps = 0;
      el.onclick = () => tapEgg(el);
    });
  }

  async function tapEgg(el) {
    if (el.classList.contains('hatched') || el._busy) return;
    const c = el._c;
    el._taps++;
    if (el._taps <= 2) {
      G.anim(el, 'wobble');
      Sounds.crunch();
      el.querySelector('.crack path').setAttribute('d', CRACK[el._taps]);
      Speech.cancel();
      Speech.seq([{ t: `${c.tr} yumurta!`, l: TR }, 100, { t: `${c.en} egg!`, l: EN }]);
      return;
    }
    el._busy = true;
    Speech.cancel(); // önceki konuşmayı sustur (akışı bozmadan)
    el.classList.add('hatched');
    Sounds.pop();
    Sounds.crunch();
    G.burstAt(el, ['✨', '⭐'], 12);
    const k = el._k;
    await wait(500);
    if (k.snd) AnimalSounds.play(k.snd);
    await Speech.seq([{ t: `Sürpriz! ${k.tr}!`, l: TR, pitch: 1.4 }, 150, { t: `A ${k.en.toLowerCase()}!`, l: EN, pitch: 1.4 }]);
    hatched++;
    if (hatched >= 3 && G.alive(id)) {
      hatched = 0;
      await G.celebrate({ extra: [{ t: 'Yeni yumurtalar geliyor!', l: TR }, { t: 'More eggs!', l: EN }] });
      makeEggs();
    }
  }

  makeEggs();
  Speech.seq([{ t: 'Yumurtalara dokun!', l: TR, pitch: 1.3 }, 150, { t: 'Tap the eggs!', l: EN, pitch: 1.3 }, 150,
    { t: 'İçinden ne çıkacak?', l: TR, pitch: 1.3 }]);
};
