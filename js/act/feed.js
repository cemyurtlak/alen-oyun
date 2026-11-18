/* =========================================================
   YEMEK ZAMANI — bir hayvan gelir, gerçek sesini çıkarır ve adı söylenir;
   çocuk tepsideki yiyeceklerden o hayvanın yediğini seçer
   (inek → ot, at → havuç, maymun → muz, köpek → kemik ...).
   Doğru: yiyecek hayvanın ağzına uçar, "Mmmm, çok lezzetli!" + hayvanın sesi.
   Yanlış: yiyecek sallanır. Hayvan konuşurken yanlış dokunuş konuşmayı kesmez.
   ========================================================= */
G.activities.feed = () => {
  const { $, $$, rand, shuffle, wait } = G;
  const id = G.newFlow();
  const MEALS = [
    { snd: 'cow', food: '🌿' }, { snd: 'horse', food: '🥕' }, { snd: 'monkey', food: '🍌' },
    { snd: 'chicken', food: '🌽' }, { snd: 'dog', food: '🦴' }, { snd: 'cat', food: '🐟' },
    { snd: 'bear', food: '🍯' }, { snd: 'frog', food: '🪰' }, { snd: 'bird', food: '🪱' },
    { snd: 'elephant', food: '🥜' }
  ].map(m => ({ ...m, a: ANIMALS.find(x => x.snd === m.snd) })).filter(m => m.a && imgSrc(m.a.emoji) && imgSrc(m.food));

  AnimalSounds.preload(MEALS.map(m => m.snd));
  Speech.preload(MEALS.map(m => [m.a.tr + '!', 'tr-TR']).concat(MEALS.map(m => [m.a.en + '!', 'en-US']),
    [['Mmmm! Çok lezzetli!', 'tr-TR'], ['Mmm! Yummy!', 'en-US'], ['Hayır, o değil!', 'tr-TR'], ['Nope, not that one!', 'en-US']]));

  const root = G.screen('feed2', G.topbar(`${pic('🍽️', 'title-ic')} Yemek Zamanı <small>Meal Time</small>`,
    `<div class="counter" id="cnt"><b>0</b>${pic('🍽️')}</div>`) + `
    <div class="meal-stage">
      <div class="meal-animal" id="animal"></div>
      <div class="meal-table"></div>
    </div>
    <div class="meal-tray" id="tray"></div>`);
  G.bindHome(root);

  let cur = null, last = null, locked = false, asking = 0, fed = 0;

  async function next() {
    if (!G.alive(id)) return;
    let m;
    do { m = rand(MEALS); } while (m === last && MEALS.length > 1);
    last = cur = m;
    locked = false;
    const others = shuffle(MEALS.filter(x => x.food !== m.food)).slice(0, 2).map(x => x.food);
    const foods = shuffle([m.food, ...others]);
    $('#animal').innerHTML = `<img src="${imgSrc(m.a.emoji)}" alt="" draggable="false">`;
    G.anim($('#animal'), 'boom');
    $('#tray').innerHTML = foods.map(f => `<button class="meal-food" data-f="${f}">${pic(f)}</button>`).join('');
    $$('.meal-food', root).forEach(b => b.onclick = () => choose(b));
    // önce hayvanın gerçek sesi, sonra adı
    const my = ++asking;
    await wait(250);
    if (!G.alive(id) || my !== asking) return;
    await AnimalSounds.play(m.snd);
    if (!G.alive(id) || my !== asking) return;
    await Speech.seq(G.both(m.a.tr + '!', m.a.en + '!'));
    if (my === asking) asking = -my; // soru bitti
  }

  async function choose(btn) {
    if (locked || btn.classList.contains('wrong')) return;
    const f = btn.dataset.f;
    if (f !== cur.food) {
      G.anim(btn, 'shake');
      btn.classList.add('wrong');
      G.anim($('#animal'), 'shake');
      // soru hâlâ çalıyorsa kesme
      if (asking > 0) return;
      Speech.cancel();
      Speech.seq(G.both('Hayır, o değil!', 'Nope, not that one!'));
      return;
    }
    locked = true;
    asking = 0;
    Speech.cancel();
    // yiyecek hayvanın ağzına uçar
    const a = $('#animal').getBoundingClientRect(), b = btn.getBoundingClientRect();
    btn.style.setProperty('--dx', (a.left + a.width / 2 - (b.left + b.width / 2)) + 'px');
    btn.style.setProperty('--dy', (a.top + a.height * 0.45 - (b.top + b.height / 2)) + 'px');
    btn.classList.add('eaten');
    $$('.meal-food', root).forEach(o => { if (o !== btn) o.classList.add('fade'); });
    await wait(650);
    if (!G.alive(id)) return;
    Sounds.crunch();
    G.anim($('#animal'), 'chomp');
    G.burstAt($('#animal'), ['💖', '✨', '😋'], 10);
    fed++;
    const cnt = $('#cnt b');
    if (cnt) { cnt.textContent = fed; G.anim($('#cnt'), 'boom'); }
    await Speech.seq(G.both('Mmmm! Çok lezzetli!', 'Mmm! Yummy!'));
    if (!G.alive(id)) return;
    await AnimalSounds.play(cur.snd);
    if (!G.alive(id)) return;
    if (fed % 5 === 0) { await Promise.race([G.celebrate({ big: true }), wait(3500)]); if (!G.alive(id)) return; }
    next();
  }

  next();
};
