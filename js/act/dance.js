/* =========================================================
   DANS EDEN BEBEKLER — disko ışıkları, müzik ve konuşan bebekler
   Bebeğe dokununca kıkırdar, döner ve bir şey söyler.
   ========================================================= */
G.activities.dance = () => {
  const { $, $$, rand, wait, TR, EN } = G;
  const id = G.newFlow();
  const MOVES = ['d-bounce', 'd-sway', 'd-spin', 'd-jump', 'd-wiggle'];
  const LINES = [
    { t: 'Dans edelim!', l: TR }, { t: "Let's dance!", l: EN }, { t: 'Yaşasın!', l: TR },
    { t: 'Ellerini çırp!', l: TR }, { t: 'Clap your hands!', l: EN }, { t: 'Zıpla zıpla!', l: TR },
    { t: 'Jump jump!', l: EN }, { t: 'Hi hi hi!', l: TR }, { t: () => `${G.childName()}, gel dans et!`, l: TR },
    { t: 'Merhaba!', l: TR }, { t: 'Hello!', l: EN }, { t: 'Agu agu!', l: TR }
  ];
  const babies = BABIES.map((b, i) => ({ src: 'assets/img/' + b + '.webp', move: MOVES[i % MOVES.length] }));

  const root = G.screen('dance', G.topbar(`${pic('🪩', 'title-ic')} Dans Eden Bebekler <small>Dancing Babies</small>`) + `
    <div class="disco">
      <div class="spot s1"></div><div class="spot s2"></div><div class="spot s3"></div>
      <div class="ball">${pic('🪩')}</div>
      <div class="notes" id="notes"></div>
      <div class="dancefloor"><div class="tiles-floor"></div></div>
      <div class="babies" id="babies">
        ${babies.map((b, i) => `<button class="baby ${b.move}" data-i="${i}" style="--i:${i}">
            <div class="say"></div><img class="pic" src="${b.src}" alt="" draggable="false"><div class="shadow"></div></button>`).join('')}
      </div>
    </div>
    <div class="dance-ctrl">
      <button class="dbtn" id="pp">${pic('🎵')}<small>Müzik</small></button>
      <button class="dbtn" id="song">${pic('🎶')}<small>Şarkı</small></button>
      <button class="dbtn" id="clap">${pic('👏')}<small>Alkış</small></button>
      <button class="dbtn" id="move">${pic('🔁')}<small>Hareket</small></button>
    </div>`);
  G.bindHome(root);
  G.onLeave(() => { Music.onBeat(null); Music.stop(); });

  const els = $$('.baby', root);
  function setTempo() { root.style.setProperty('--beat', (60 / Music.bpm()) + 's'); }

  function babySay(el, line) {
    const text = typeof line.t === 'function' ? line.t() : line.t;
    const b = el.querySelector('.say');
    b.textContent = text;
    G.anim(b, 'show');
    Music.duck(true);
    Speech.say(text, line.l, { pitch: 1.95, rate: 1.05 }).then(() => Music.duck(false));
  }

  els.forEach(el => el.onclick = () => {
    Sounds.tap();
    G.anim(el.querySelector('.pic'), 'twirl');
    G.burstAt(el, ['💖', '⭐', '🎵'], 10);
    babySay(el, rand(LINES));
  });

  Music.onBeat((beat) => {
    if (!G.alive(id)) return;
    // ışık ve nota efektleri vuruşla senkron
    root.classList.toggle('flash', beat % 2 === 0);
    if (beat % 2 === 0) {
      const n = document.createElement('div');
      n.className = 'fnote';
      n.innerHTML = pic(rand(['🎵', '🎶', '⭐', '💖']));
      n.style.left = (10 + Math.random() * 80) + '%';
      $('#notes').appendChild(n);
      setTimeout(() => n.remove(), 2600);
    }
    // ara sıra bir bebek konuşur
    if (beat % 16 === 8) babySay(rand(els), rand(LINES));
  });

  $('#pp').onclick = () => {
    Sounds.tap();
    if (Music.isPlaying()) { Music.stop(); root.classList.add('paused'); }
    else { Music.start(); setTempo(); root.classList.remove('paused'); }
  };
  $('#song').onclick = () => { Music.next(); setTempo(); root.classList.remove('paused'); G.toast('🎶 ' + Music.songName(), 1500); };
  $('#clap').onclick = () => {
    Sounds.applause(1.4);
    els.forEach((el, i) => setTimeout(() => G.anim(el, 'hop'), i * 60));
  };
  $('#move').onclick = () => {
    Sounds.whoosh();
    els.forEach(el => {
      const cur = MOVES.find(m => el.classList.contains(m));
      el.classList.remove(cur);
      el.classList.add(MOVES[(MOVES.indexOf(cur) + 1) % MOVES.length]);
    });
  };

  (async () => {
    Music.start(0);
    setTempo();
    await wait(600);
    if (G.alive(id)) babySay(els[2], { t: 'Hadi dans edelim!', l: TR });
  })();
};
