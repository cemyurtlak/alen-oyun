/* =========================================================
   Öğren + Soru-cevap bölümleri (Renkler, Sayılar, Kediler ...)
   Akış: (Grup seçimi) → Tanıtım → Soru-cevap → Tebrik
   ========================================================= */
const Learn = (() => {
  const { $, $$, esc, rand, shuffle, wait, TR, EN } = G;
  const S = { cat: null, group: 0, items: [], idx: 0, q: 0, score: 0, total: 5, target: null, last: null, options: [], attempts: 0, locked: false };

  const trSay = (it) => it.trSay || it.tr;
  const enSay = (it) => it.enSay || it.en;

  // Soru cümleleri (gösterim ve konuşma için ayrı)
  function question(cat, it, forSpeech) {
    let trName, enName;
    if (cat.type === 'letter') {
      trName = forSpeech ? trSay(it) : it.tr;
      enName = it.en;
    } else {
      trName = it.tr.toLocaleLowerCase('tr-TR');
      enName = it.en.toLowerCase();
    }
    return { en: cat.qEn.replace('{en}', enName), tr: cat.qTr.replace('{tr}', trName) };
  }

  function groupsOf(cat) {
    const n = Math.max(2, Settings.get('groupSize'));
    const g = [];
    for (let i = 0; i < cat.items.length; i += n) g.push(cat.items.slice(i, i + n));
    if (g.length > 1 && g[g.length - 1].length < 3) {
      const last = g.pop();
      g[g.length - 1] = g[g.length - 1].concat(last);
    }
    return g;
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
    if (groups.length === 1) startLearn(cat, 0);
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
    Speech.seq([{ t: cat.tr, l: TR }, 150, { t: cat.en, l: EN }]);
  }

  /* ---------- Tanıtım ---------- */
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
        if (!await Speech.seq([{ t: COUNT_TR[i - 1], l: TR, rate: 1.05 }])) return false;
      }
      await wait(350);
    }
    const ntr = $('#ntr'), nen = $('#nen');
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
    if (it.sound || it.snd) {
      await wait(300);
      if (!G.alive(id)) return false;
      box && box.classList.add('wiggle');
      if (it.sound) ok = await Speech.seq([{ t: it.sound, l: TR, pitch: 1.5 }]);
      if (ok && it.snd && G.alive(id)) await AnimalSounds.play(it.snd);
      box && box.classList.remove('wiggle');
    }
    return ok && G.alive(id);
  }

  async function learnFlow(withIntro) {
    const id = G.newFlow();
    showLearnItem();
    if (withIntro) {
      if (!await Speech.seq([{ t: S.cat.tr + '!', l: TR }, 150, { t: S.cat.en + '!', l: EN }, 300])) return;
    }
    while (G.alive(id)) {
      showLearnItem();
      if (!await speakItem(S.items[S.idx], id)) return;
      await wait(1100);
      if (!G.alive(id)) return;
      if (S.idx < S.items.length - 1) {
        S.idx++;
        Sounds.whoosh();
        continue;
      }
      $('#play') && $('#play').classList.add('glow');
      if (!await Speech.seq([300, { t: 'Şimdi oyun zamanı!', l: TR }, 150, { t: "Let's play!", l: EN }, 300])) return;
      if (G.alive(id)) startQuiz();
      return;
    }
  }

  /* ---------- Soru-cevap ---------- */
  function startQuiz() {
    S.q = 0;
    S.score = 0;
    S.last = null;
    S.total = Settings.get('questionCount');
    nextQuestion();
  }

  function nextQuestion() {
    if (S.q >= S.total) return renderFinish();
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
    let others = shuffle(pool.filter(x => x !== target));
    if (others.length < n - 1) {
      others = others.concat(shuffle(S.cat.items.filter(x => x !== target && !others.includes(x))));
    }
    S.options = shuffle([target, ...others.slice(0, n - 1)]);
    renderQuiz();
    ask();
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
    const q = question(c, S.target, false);
    const enFirst = Settings.get('enFirst');
    const lines = enFirst
      ? `<div class="q-line en">${esc(q.en)}</div><div class="q-line tr">${esc(q.tr)}</div>`
      : `<div class="q-line tr">${esc(q.tr)}</div><div class="q-line en">${esc(q.en)}</div>`;
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
    const q = question(c, it, true);
    const en = { t: q.en, l: EN }, tr = { t: q.tr, l: TR };
    const parts = Settings.get('enFirst') ? [en, 350, tr] : [tr, 350, en];
    $$('.q-line').forEach(l => l.classList.add('pulse'));
    if (c.soundQuiz) {
      G.anim($('.q-speaker'), 'boom');
      await AnimalSounds.play(it.snd);
      if (!G.alive(id)) return;
      await wait(300);
    }
    const ok = await Speech.seq(parts);
    // Örn. "Which one is the cat? Hangisi kedi?" → ardından miyav sesi
    if (ok && G.alive(id) && it.snd) {
      await wait(250);
      if (G.alive(id)) {
        G.anim($('.q-speaker'), 'boom');
        await AnimalSounds.play(it.snd);
      }
    }
    if (G.alive(id)) $$('.q-line').forEach(l => l.classList.remove('pulse'));
  }

  function onAnswer(btn, it) {
    if (S.locked || btn.classList.contains('wrong')) return;
    if (it === S.target) correct(btn);
    else wrongAnswer(btn);
  }

  async function correct(btn) {
    S.locked = true;
    const id = G.newFlow();
    S.score++;
    $('#stars').innerHTML = starsBar();
    btn.classList.add('correct');
    $$('.opt').forEach(o => { if (o !== btn) o.classList.add('fade'); });
    G.burstAt(btn);
    if (S.cat.id === 'colors') setTimeout(() => Sounds.pop(), 700);
    setMascot('🥳', 'jump');
    const it = S.target;
    if (it.snd) setTimeout(() => AnimalSounds.play(it.snd), 1700);
    await G.celebrate({ extra: [{ t: trSay(it) + '!', l: TR }, 200, { t: enSay(it) + '!', l: EN }, 400] });
    if (it.snd && G.alive(id)) await wait(600);
    if (G.alive(id)) nextQuestion();
  }

  async function wrongAnswer(btn) {
    S.attempts++;
    S.locked = true;
    const id = G.newFlow();
    G.anim(btn, 'shake');
    setTimeout(() => btn.classList.add('wrong'), 450);
    setMascot('🙈', 'shake');
    await G.oops();
    if (!G.alive(id)) return;
    S.locked = false;
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
        <button class="fbtn" id="replay" style="--c1:#ff6b6b;--c2:#ff9a8b">${pic('🔁')}<small>Tekrar oyna</small></button>
        <button class="fbtn" id="relearn" style="--c1:#4dabf7;--c2:#74c0fc">${pic('📖')}<small>Tekrar öğren</small></button>
        ${hasNext ? `<button class="fbtn" id="nextg" style="--c1:#40c057;--c2:#8ce99a">${pic('🌟')}<small>Yenileri öğren</small></button>` : ''}
        <button class="fbtn" data-home style="--c1:#845ef7;--c2:#b197fc">${pic('🏠')}<small>Ana sayfa</small></button>
      </div>`, S.cat.bg);
    G.bindHome(root);
    $('#replay').onclick = () => { Sounds.tap(); startQuiz(); };
    $('#relearn').onclick = () => { Sounds.tap(); startLearn(S.cat, S.group); };
    if (hasNext) $('#nextg').onclick = () => { Sounds.tap(); startLearn(S.cat, S.group + 1); };
    Sounds.fanfare();
    Sounds.applause(3);
    G.confetti(130);
    setTimeout(() => { if (G.alive(id)) G.confetti(80); }, 1200);
    Speech.seq([{ t: `Aferin ${n}!`, l: TR, pitch: 1.35 }, 200, { t: `Great job, ${n}!`, l: EN, pitch: 1.35 },
      300, { t: 'Çok güzel oynadın!', l: TR }]);
  }

  return { open };
})();
