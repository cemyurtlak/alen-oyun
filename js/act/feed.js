/* =========================================================
   YEMEK ZAMANI — katı yiyeceklere oyunla alıştırma
   • Çocuk bir yiyeceğe dokunur → yiyecek uçar, kedi ağzını açar "Aaam!",
     çiğner ("ham ham ham", çıtır sesler), "Mmm, çok lezzetli!" der.
   • "Birlikte çiğneyelim": aç → ısır → çiğne → yut adımlarını gösterir (model olma).
   • "Ben de yedim!": çocuk gerçek bir lokma yiyince ebeveyn basar → büyük kutlama.
   ========================================================= */
G.activities.feed = () => {
  const { $, $$, rand, shuffle, wait, TR, EN, esc } = G;
  const id = G.newFlow();
  const CHARS = [
    { tr: 'Kedi', en: 'Kitty', face: '🐱', open: '🙀', chew: '😸', love: '😻', full: '😽', snd: 'catHappy' },
    { tr: 'Köpek', en: 'Puppy', face: '🐶', open: '🐶', chew: '🐶', love: '🐶', full: '🐶', snd: 'dog' },
    { tr: 'Panda', en: 'Panda', face: '🐼', open: '🐼', chew: '🐼', love: '🐼', full: '🐼' },
    { tr: 'Ayı', en: 'Bear', face: '🐻', open: '🐻', chew: '🐻', love: '🐻', full: '🐻', snd: 'bear' }
  ];
  let ch = CHARS[0], tummy = 0, busy = false;
  const FULL = 5;

  const root = G.screen('feed', G.topbar(`${pic('🍽️', 'title-ic')} Yemek Zamanı <small>Meal Time</small>`) + `
    <div class="char-pick">${CHARS.map((c, i) => `<button class="cp ${i === 0 ? 'on' : ''}" data-i="${i}">${pic(c.face)}${c.tr}</button>`).join('')}</div>
    <div class="feed-stage">
      <div class="bubble-say" id="say"></div>
      <div class="eater" id="eater">${pic(ch.face)}</div>
      <div class="bib"></div>
      <div class="tummy"><div class="tummy-fill" id="tf"></div><span>${pic('💖')}</span></div>
      <div class="table"></div>
    </div>
    <div class="tray" id="tray"></div>
    <div class="feed-ctrl">
      <button class="dbtn" id="chew">${pic('😋')}<small>Birlikte çiğneyelim</small></button>
      <button class="dbtn big" id="ate">${pic('🥳')}<small>${esc(G.childName())} de yedi!</small></button>
    </div>`);
  G.bindHome(root);

  const eater = $('#eater');
  const face = (e) => { eater.innerHTML = pic(e); };
  function say(t) { const b = $('#say'); b.textContent = t; G.anim(b, 'show'); }

  function fillTray() {
    const foods = shuffle(FOODS).slice(0, 6);
    $('#tray').innerHTML = foods.map((f, i) => `<button class="food" data-i="${FOODS.indexOf(f)}" style="animation-delay:${i * 0.06}s">${pic(f.emoji)}</button>`).join('');
    $$('#tray .food').forEach(b => b.onclick = () => feed(b, FOODS[+b.dataset.i]));
  }

  async function feed(btn, food) {
    if (busy) return;
    busy = true;
    const fid = G.newFlow();
    Sounds.tap();
    // yiyeceği karakterin ağzına uçur
    const from = btn.getBoundingClientRect(), to = eater.getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'flyfood';
    fly.innerHTML = pic(food.emoji);
    fly.style.left = from.left + 'px';
    fly.style.top = from.top + 'px';
    fly.style.width = from.width + 'px';
    document.body.appendChild(fly);
    btn.style.visibility = 'hidden';
    Speech.seq([{ t: food.tr + '!', l: TR }, 120, { t: food.en + '!', l: EN }]);
    face(ch.open);
    eater.classList.add('open');
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height * 0.62 - from.top - from.height / 2}px) scale(.55)`;
    });
    await wait(750);
    fly.remove();
    if (!G.alive(fid)) { busy = false; return; }
    // çiğneme
    eater.classList.remove('open');
    face(ch.chew);
    eater.classList.add('chewing');
    say('Ham ham ham!');
    for (let i = 0; i < 6; i++) { if (!G.alive(fid)) { busy = false; return; } Sounds.crunch(); await wait(230); }
    if (!G.alive(fid)) { busy = false; return; }
    eater.classList.remove('chewing');
    Sounds.gulp();
    face(ch.love);
    G.anim(eater, 'jump');
    G.burstAt(eater, ['💖', '✨', '⭐'], 12);
    tummy = Math.min(FULL, tummy + 1);
    $('#tf').style.height = (tummy / FULL * 100) + '%';
    if (ch.snd) AnimalSounds.play(ch.snd);
    say('Mmm! Çok lezzetli!');
    await Speech.seq([{ t: 'Mmmm! Çok lezzetli!', l: TR, pitch: 1.5 }, 150, { t: 'Yummy!', l: EN, pitch: 1.5 }]);
    if (!G.alive(fid)) { busy = false; return; }
    if (tummy >= FULL) {
      face(ch.full);
      say('Karnım doydu!');
      await G.celebrate({ big: true, extra: [{ t: 'Karnım doydu!', l: TR }, { t: "I'm full!", l: EN },
        300, { t: `Şimdi sıra sende ${G.childName()}! Sen de bir lokma ye!`, l: TR }] });
      tummy = 0;
      $('#tf').style.height = '0%';
      fillTray();
    } else {
      btn.style.visibility = '';
      const nf = rand(FOODS);
      btn.dataset.i = FOODS.indexOf(nf);
      btn.innerHTML = pic(nf.emoji);
      G.anim(btn, 'pop-in');
      btn.onclick = () => feed(btn, nf);
      if (tummy === 2) await Speech.seq([{ t: 'Sen de ye! Ham!', l: TR, pitch: 1.4 }]);
    }
    face(ch.face);
    busy = false;
  }

  // Ağzını aç → ısır → çiğne → yut (çocuğa model olma)
  async function chewTogether() {
    if (busy) return;
    busy = true;
    const cid = G.newFlow();
    const steps = [
      async () => { face(ch.open); eater.classList.add('open'); say('Ağzını aç: Aaaa!'); await Speech.seq([{ t: 'Ağzını aç! Aaaaa!', l: TR, pitch: 1.3 }, { t: 'Open wide!', l: EN }]); eater.classList.remove('open'); },
      async () => { face(ch.chew); G.anim(eater, 'nod'); Sounds.crunch(); say('Isır: Hap!'); await Speech.seq([{ t: 'Isır! Hap!', l: TR, pitch: 1.3 }, { t: 'Bite!', l: EN }]); },
      async () => { eater.classList.add('chewing'); say('Çiğne, çiğne, çiğne!'); for (let i = 0; i < 3; i++) { Sounds.crunch(); await wait(200); }
        await Speech.seq([{ t: 'Çiğne, çiğne, çiğne!', l: TR, pitch: 1.3 }, { t: 'Chew chew chew!', l: EN }]); eater.classList.remove('chewing'); },
      async () => { Sounds.gulp(); face(ch.love); G.anim(eater, 'jump'); say('Yut: Gulp!'); await Speech.seq([{ t: 'Yut! Gulp!', l: TR, pitch: 1.3 }, { t: 'Swallow!', l: EN }]); }
    ];
    for (const s of steps) { if (!G.alive(cid)) break; await s(); await wait(400); }
    if (G.alive(cid)) await G.celebrate({ extra: [{ t: 'Sen de yapabilirsin!', l: TR }] });
    face(ch.face);
    busy = false;
  }

  $('#chew').onclick = () => { Sounds.tap(); chewTogether(); };
  $('#ate').onclick = () => {
    G.newFlow();
    busy = false;
    face(ch.love);
    G.anim(eater, 'jump');
    G.celebrate({ big: true, extra: [{ t: `Aferin ${G.childName()}! Kocaman bir lokma yedin!`, l: TR }, 200, { t: 'You ate it! Great job!', l: EN }] });
    G.confetti(80);
  };
  $$('.cp', root).forEach(b => b.onclick = () => {
    Sounds.tap();
    ch = CHARS[+b.dataset.i];
    face(ch.face);
    $$('.cp', root).forEach(x => x.classList.toggle('on', x === b));
    G.anim(eater, 'pop-in');
  });
  eater.onclick = () => { G.anim(eater, 'wiggle'); if (ch.snd) AnimalSounds.play(ch.snd); };

  fillTray();
  say('Karnım aç!');
  Speech.seq([{ t: 'Karnım çok aç!', l: TR, pitch: 1.5 }, 150, { t: "I'm hungry!", l: EN, pitch: 1.5 }, 200,
    { t: 'Bana yemek verir misin?', l: TR, pitch: 1.5 }]);
};
