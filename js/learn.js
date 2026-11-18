/* =========================================================
   Öğren + Soru-cevap bölümleri (Renkler, Sayılar, Kediler ...)
   Akış: (Grup seçimi) → Tanıtım → Soru-cevap → Tebrik
   ========================================================= */
const Learn = (() => {
  const { $, $$, esc, rand, shuffle, wait, TR, EN } = G;
  const S = { cat: null, group: 0, items: [], idx: 0, q: 0, score: 0, total: 5, target: null, last: null, options: [], attempts: 0, locked: false };

  const trSay = (it) => it.trSay || it.tr;
  const enSay = (it) => it.enSay || it.en;

  /* Soru: uzun "Which one is..." yerine doğrudan isim ("Köpek!" / "Dog!").
     Çocuk konuşmayı beklemiyor, sevdiğine hemen dokunuyor. */
  function names(it, forSpeech) {
    return { tr: forSpeech ? trSay(it) : it.tr, en: enSay(it) };
  }
  function promptParts(cat, it) {
    if (cat.soundQuiz) return G.both('Kim bu?', 'Who is it?');
    const n = names(it, true);
    const parts = G.both(n.tr + '!', n.en + '!');
    if (Speech.mode() === 'both' && Settings.get('enFirst')) parts.reverse();
    return parts;
  }

  // Bölümler kendi içinde gruplara ayrılmaz: her bölümde tüm öğeler birlikte öğretilir ve sorulur (Cem'in isteği)
  function groupsOf(cat) {
    return [cat.items];
  }

  const themeCls = (cat) => cat.theme ? ' theme-' + cat.theme : '';
  const titleOf = (c) => `${pic(c.icon, 'title-ic')} ${esc(c.tr)} <small>${esc(c.en)}</small>`;

  // Okyanus / yol sahnesi süsleri
  function sceneDeco(cat) {
    if (cat.theme === 'ocean') {
      let b = '';
      for (let i = 0; i < 14; i++) b += `<span class="ocean-bubble" style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 6}s;--s:${0.5 + Math.random()}"></span>`;
      return `<div class="ocean-deco"><div class="rays"></div>${b}
        <div class="seabed">${pic('🪸', 'sb s1')}${pic('🌿', 'sb s2')}${pic('🐚', 'sb s3')}${pic('🪸', 'sb s4')}${pic('🐙', 'sb s5')}${pic('🦀', 'sb s6')}</div></div>`;
    }
    if (cat.theme === 'road') {
      return `<div class="road-deco"><div class="road"><div class="lane"></div></div>${pic('🌳', 'rd t1')}${pic('🌲', 'rd t2')}${pic('🏡', 'rd t3')}</div>`;
    }
    return '';
  }

  function open(cat) {
    const groups = groupsOf(cat);
    // Tanıtım yok: bölüm doğrudan oyunla başlar, çocuk oynayarak öğrenir (Cem'in isteği)
    if (groups.length === 1) startPlay(cat, 0);
    else renderGroups(cat);
  }

  /* ---------- Grup seçimi ---------- */
  function renderGroups(cat) {
    G.newFlow();
    const groups = groupsOf(cat);
    const cur = Math.min(Settings.getProgress(cat.id), groups.length - 1);
    const btns = groups.map((g, gi) => `
      <button class="group-btn ${gi === cur ? 'current' : ''}" data-g="${gi}" style="animation-delay:${gi * 0.08}s">
        <div class="group-vis">${g.slice(0, 6).map(it => `<div class="mini">${G.visual(it, cat)}</div>`).join('')}</div>
        <div class="group-label">${esc(g[0].tr)} – ${esc(g[g.length - 1].tr)}</div>
      </button>`).join('');
    const root = G.screen('groups' + themeCls(cat), sceneDeco(cat) + G.topbar(titleOf(cat)) + `<div class="group-list">${btns}</div>`, cat.bg);
    G.bindHome(root);
    $$('.group-btn', root).forEach(b => b.onclick = () => { Sounds.tap(); startLearn(cat, +b.dataset.g); });
    Speech.seq(G.both(cat.tr, cat.en));
  }

  /* ---------- Tanıtım ---------- */
  function startPlay(cat, gi) {
    const groups = groupsOf(cat);
    S.cat = cat;
    S.group = Math.min(gi, groups.length - 1);
    S.items = groups[S.group];
    S.idx = 0;
    preloadCat(cat, S.items);
    startQuiz();
  }

  // Bölümün tüm seslerini arka planda önceden yükle: önce hayvan sesleri, sonra adlar → sorular gecikmesiz
  function preloadCat(cat, items) {
    AnimalSounds.preload(items.map(i => i.snd).filter(Boolean));
    const pairs = [['Kim bu?', TR], ['Who is it?', EN]];
    items.forEach(it => { const n = names(it, true); pairs.push([n.tr + '!', TR], [n.en + '!', EN]); });
    Speech.preload(pairs);
  }

  function startLearn(cat, gi) {
    const groups = groupsOf(cat);
    S.cat = cat;
    S.group = Math.min(gi, groups.length - 1);
    S.items = groups[S.group];
    S.idx = 0;
    Settings.setProgress(cat.id, S.group);
    renderLearn();
    learnFlow(true);
  }

  function renderLearn() {
    const c = S.cat;
    const root = G.screen('learn' + themeCls(c), sceneDeco(c) +
      G.topbar(titleOf(c), `<button class="icon-btn" id="toQuiz" aria-label="Oyna">${pic('🎮')}</button>`) + `
      <div class="stage">
        <button class="learn-item" id="item" aria-label="Tekrar dinle"></button>
        <div class="names">
          <div class="name-tr" id="ntr"><span class="badge tr">TR</span><span class="txt"></span></div>
          <div class="name-en" id="nen"><span class="badge en">EN</span><span class="txt"></span></div>
        </div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="prev" aria-label="Önceki">◀</button>
        <div class="dots" id="dots"></div>
        <button class="nav-btn" id="next" aria-label="Sonraki">▶</button>
      </div>
      <button class="play-btn" id="play">${pic('🎮')} Oyna · Play</button>`, c.bg);
    G.bindHome(root);
    $('#toQuiz').onclick = $('#play').onclick = () => { Sounds.tap(); startQuiz(); };
    $('#prev').onclick = () => { Sounds.tap(); S.idx = (S.idx - 1 + S.items.length) % S.items.length; learnFlow(false); };
    $('#next').onclick = () => { Sounds.tap(); S.idx = (S.idx + 1) % S.items.length; learnFlow(false); };
    $('#item').onclick = () => { Sounds.tap(); learnFlow(false); };
  }

  function showLearnItem() {
    const it = S.items[S.idx];
    const box = $('#item');
    if (!box) return;
    box.innerHTML = G.visual(it, S.cat);
    G.anim(box, 'pop-in');
    const ntr = $('#ntr .txt'), nen = $('#nen .txt');
    ntr.textContent = it.tr;
    nen.textContent = it.en;
    const col = S.cat.colorNames ? it.color : '';
    [ntr, nen].forEach(el => {
      el.style.color = col || '';
      el.classList.toggle('outlined', !!col && /^#(ffffff|ffd600)$/i.test(col));
    });
    $('#ntr').style.display = G.showTr() ? '' : 'none';
    $('#nen').style.display = G.showEn() ? '' : 'none';
    $('#dots').innerHTML = S.items.map((_, i) => `<span class="${i === S.idx ? 'on' : (i < S.idx ? 'done' : '')}"></span>`).join('');
  }

  async function speakItem(it, id) {
    const box = $('#item');
    // Sayılarda parmakla tek tek sayarak göster
    if (S.cat.type === 'number') {
      G.setFingers(box, 0);
      await wait(350);
      for (let i = 1; i <= it.value; i++) {
        if (!G.alive(id)) return false;
        G.setFingers(box, i);
        Sounds.tap();
        if (!await Speech.seq([{ t: COUNT_TR[i - 1], l: TR, alt: COUNT_EN[i - 1], rate: 1.05 }])) return false;
      }
      await wait(350);
    }
    const ntr = $('#ntr'), nen = $('#nen');
    // Hayvanlarda önce gerçek ses, sonra adı (Cem'in isteği)
    if (it.snd) {
      box && box.classList.add('wiggle');
      await AnimalSounds.play(it.snd);
      box && box.classList.remove('wiggle');
      if (!G.alive(id)) return false;
      await wait(250);
      if (!G.alive(id)) return false;
    }
    ntr && ntr.classList.add('speaking');
    let ok = await Speech.seq([{ t: trSay(it), l: TR }]);
    ntr && ntr.classList.remove('speaking');
    if (!ok || !G.alive(id)) return false;
    await wait(350);
    if (!G.alive(id)) return false;
    nen && nen.classList.add('speaking');
    ok = await Speech.seq([{ t: enSay(it), l: EN }]);
    nen && nen.classList.remove('speaking');
    if (!ok || !G.alive(id)) return false;
    // sonra taklit sesi ("Hav hav!") — çocuk tekrar etsin diye
    if (it.sound) {
      await wait(300);
      if (!G.alive(id)) return false;
      box && box.classList.add('wiggle');
      ok = await Speech.seq([{ t: it.sound, l: TR, pitch: 1.5 }]);
      box && box.classList.remove('wiggle');
    }
    return ok && G.alive(id);
  }

  async function learnFlow(withIntro) {
    const id = G.newFlow();
    showLearnItem();
    if (withIntro) {
      if (!await Speech.seq([...G.both(S.cat.tr + '!', S.cat.en + '!'), 250])) return;
    }
    while (G.alive(id)) {
      showLearnItem();
      if (!await speakItem(S.items[S.idx], id)) return;
      await wait(650);
      if (!G.alive(id)) return;
      if (S.idx < S.items.length - 1) {
        S.idx++;
        Sounds.whoosh();
        continue;
      }
      $('#play') && $('#play').classList.add('glow');
      if (!await Speech.seq([200, ...G.both('Şimdi oyun zamanı!', "Let's play!")])) return;
      if (G.alive(id)) startQuiz();
      return;
    }
  }

  /* ---------- Soru-cevap ---------- */
  function startQuiz() {
    S.q = 0;
    S.score = 0;
    S.last = null;
    S.total = 10; // her turda 10 soru (Cem'in isteği)
    nextQuestion();
  }

  function nextQuestion() {
    // 10 soru bitince "Tekrar oyna" ekranı yok: büyük kutlama yapılır ve yeni 10 soruyla kendiliğinden devam edilir
    if (S.q >= S.total) return roundDone();
    G.newFlow();
    S.q++;
    S.attempts = 0;
    S.locked = false;
    const pool = S.items;
    let target = rand(pool);
    if (pool.length > 1) while (target === S.last) target = rand(pool);
    S.target = target;
    S.last = target;
    const n = Math.min(Settings.get('optionCount'), S.cat.items.length);
    const similar = (a, b) => a.key && b.key && SIMILAR[a.key] && SIMILAR[a.key].includes(b.key);
    let others = shuffle(pool.filter(x => x !== target && !similar(target, x)));
    if (others.length < n - 1) others = others.concat(shuffle(S.cat.items.filter(x => x !== target && !others.includes(x) && !similar(target, x))));
    if (others.length < n - 1) {
      others = others.concat(shuffle(S.cat.items.filter(x => x !== target && !others.includes(x))));
    }
    S.options = shuffle([target, ...others.slice(0, n - 1)]);
    renderQuiz();
    ask();
  }

  async function roundDone() {
    const id = G.newFlow();
    S.locked = true;
    await G.celebrate({ big: true });
    if (!G.alive(id)) return;
    S.q = 0;
    S.score = 0;
    nextQuestion();
  }

  function starsBar() {
    let h = '';
    for (let i = 0; i < S.total; i++) {
      const cls = i < S.score ? 'got' : (i === S.q - 1 ? 'now' : '');
      h += `<span class="${cls}">${i < S.score ? pic('⭐') : '<i></i>'}</span>`;
    }
    return h;
  }

  function renderQuiz() {
    const c = S.cat;
    const nm = names(S.target, false);
    const lines = c.soundQuiz
      ? `${G.showTr() ? '<div class="q-line tr">Kim bu?</div>' : ''}${G.showEn() ? '<div class="q-line en">Who is it?</div>' : ''}`
      : `${G.showTr() ? `<div class="q-line tr big">${esc(nm.tr)}</div>` : ''}${G.showEn() ? `<div class="q-line en big">${esc(nm.en)}</div>` : ''}`;
    const root = G.screen('quiz' + themeCls(c), sceneDeco(c) + `
      <div class="topbar">
        <button class="icon-btn" data-home aria-label="Ana sayfa">${pic('🏠')}</button>
        <div class="stars" id="stars">${starsBar()}</div>
        <button class="icon-btn" id="again" aria-label="Soruyu tekrar dinle">${pic('🔊')}</button>
      </div>
      <div class="question">${c.soundQuiz ? `<span class="q-speaker">${pic('🔊')}</span>` : ''}${lines}</div>
      <div class="mascot" id="mascot">${pic('🐼')}</div>
      <div class="options n${S.options.length}">
        ${S.options.map((it, i) => `
          <button class="opt" data-i="${i}" style="--d:${(i * 0.37) % 1.2}s;--lane:${i};animation-delay:${i * 0.1}s">
            ${G.visual(it, c)}
          </button>`).join('')}
      </div>`, c.bg);
    G.bindHome(root);
    $('#again').onclick = () => { Sounds.tap(); if (!S.locked) ask(); };
    $$('.opt', root).forEach(b => b.onclick = () => onAnswer(b, S.options[+b.dataset.i]));
  }

  function setMascot(e, anim) {
    const m = $('#mascot');
    if (!m) return;
    m.innerHTML = pic(e);
    m.className = 'mascot';
    if (anim) G.anim(m, anim);
  }

  async function ask() {
    const id = G.newFlow();
    const c = S.cat, it = S.target;
    $$('.q-line').forEach(l => l.classList.add('pulse'));
    if (c.soundQuiz) {
      G.anim($('.q-speaker'), 'boom');
      await AnimalSounds.play(it.snd);
      if (!G.alive(id)) return;
    }
    // önce hayvanın gerçek sesi, sonra adı (ör. miyav → "Kedi!")
    if (it.snd && !c.soundQuiz) {
      await AnimalSounds.play(it.snd);
      if (!G.alive(id)) return;
    }
    await Speech.seq(promptParts(c, it));
    if (G.alive(id)) $$('.q-line').forEach(l => l.classList.remove('pulse'));
  }

  function onAnswer(btn, it) {
    if (S.locked || btn.classList.contains('wrong')) return;
    if (it === S.target) correct(btn);
    else wrongAnswer(btn);
  }

  // Doğru: kısa kutlama, beklemeden sonraki soru
  async function correct(btn) {
    S.locked = true;
    const id = G.newFlow();
    S.score++;
    $('#stars').innerHTML = starsBar();
    btn.classList.add('correct');
    $$('.opt').forEach(o => { if (o !== btn) o.classList.add('fade'); });
    G.burstAt(btn);
    if (S.cat.id === 'colors') setTimeout(() => Sounds.pop(), 500);
    setMascot('🥳', 'jump');
    // kutlama en fazla ~1,6 sn sürer; sonra yeni soru (konuşma kesilir)
    await Promise.race([G.celebrate(), wait(1600)]);
    if (G.alive(id)) nextQuestion();
  }

  // Yanlış: kısa "Hayır!", kilit yok — çocuk hemen başka birine dokunabilir
  async function wrongAnswer(btn) {
    S.attempts++;
    const id = G.newFlow();
    G.anim(btn, 'shake');
    btn.classList.add('wrong');
    setMascot('🙈', 'shake');
    await G.oops();
    if (!G.alive(id)) return;
    setMascot('🐼');
    const left = $$('.opt').filter(o => !o.classList.contains('wrong'));
    if (S.attempts >= 2 || left.length <= 1) {
      const tb = $(`.opt[data-i="${S.options.indexOf(S.target)}"]`);
      tb && tb.classList.add('hint');
    }
    ask();
  }

  /* ---------- Tebrik ---------- */
  function renderFinish() {
    const id = G.newFlow();
    const n = G.childName();
    const groups = groupsOf(S.cat);
    const hasNext = S.group < groups.length - 1;
    const root = G.screen('finish' + themeCls(S.cat), sceneDeco(S.cat) + `
      <div class="trophy">${pic('🏆')}</div>
      <h1 class="rainbow-title">${G.rainbowText('Aferin ' + n + '!')}</h1>
      <h2 class="sub">Great job, ${esc(n)}!</h2>
      <div class="stars-big">${('<span>' + pic('⭐') + '</span>').repeat(S.score)}</div>
      <div class="finish-btns">
        <button class="fbtn" id="replay" style="--c1:#2fb344;--c2:#69db7c">${pic('🔁')}<small>Tekrar oyna</small></button>
        ${hasNext ? `<button class="fbtn" id="nextg" style="--c1:#40c057;--c2:#8ce99a">${pic('🌟')}<small>Yenileri öğren</small></button>` : ''}
        <button class="fbtn" data-home style="--c1:#845ef7;--c2:#b197fc">${pic('🏠')}<small>Ana sayfa</small></button>
      </div>`, S.cat.bg);
    G.bindHome(root);
    $('#replay').onclick = () => { Sounds.tap(); startQuiz(); };
    if (hasNext) $('#nextg').onclick = () => { Sounds.tap(); startLearn(S.cat, S.group + 1); };
    Sounds.fanfare();
    Sounds.applause(3);
    G.confetti(130);
    setTimeout(() => { if (G.alive(id)) G.confetti(80); }, 1200);
    Speech.seq(G.both(`Aferin ${n}!`, `Great job, ${n}!`));
  }

  return { open };
})();
