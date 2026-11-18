/* =========================================================
   DANS EDELİM — gerçek çocuklar dans eder (Pexels videoları, sessiz),
   oyunun kendi neşeli müziği çalar; Alen izleyip birlikte dans eder.
   • Alttaki küçük resimlerden dansçı seçilir (küçük çocuk, kız, oğlan, sınıf).
   • Müzik aç/kapa, başka şarkı, alkış düğmeleri. Işıklar müziğin ritmiyle yanıp söner.
   (Eski "Dans Eden Bebekler" Cem'in isteğiyle kaldırıldı: çizim bebekler dans öğretmiyordu.)
   ========================================================= */
G.activities.dance = () => {
  const { $, $$, rand, wait, TR, EN } = G;
  const id = G.newFlow();
  const DANCERS = [1, 2, 3, 4, 5].map(i => ({ src: `assets/video/dans_${i}.mp4`, poster: `assets/video/dans_${i}.jpg` }));
  let cur = 0;

  const root = G.screen('dance dance2', G.topbar(`${pic('🪩', 'title-ic')} Dans Edelim <small>Let's Dance</small>`) + `
    <div class="disco">
      <div class="spot s1"></div><div class="spot s2"></div><div class="spot s3"></div>
      <div class="notes" id="notes"></div>
    </div>
    <div class="dance-video-wrap">
      <video id="dv" class="dance-video" muted playsinline loop autoplay preload="auto" poster="${DANCERS[0].poster}" src="${DANCERS[0].src}"></video>
    </div>
    <div class="dancer-pick" id="pick">
      ${DANCERS.map((d, i) => `<button class="dp ${i === 0 ? 'on' : ''}" data-i="${i}"><img src="${d.poster}" alt="" draggable="false"></button>`).join('')}
    </div>
    <div class="dance-ctrl">
      <button class="dbtn" id="pp">${pic('🎵')}<small>Müzik</small></button>
      <button class="dbtn" id="song">${pic('🎶')}<small>Şarkı</small></button>
      <button class="dbtn" id="clap">${pic('👏')}<small>Alkış</small></button>
    </div>`);
  G.bindHome(root);
  const dv = $('#dv');
  G.onLeave(() => { Music.onBeat(null); Music.stop(); try { dv.pause(); dv.removeAttribute('src'); dv.load(); } catch (e) { /* yoksay */ } });

  const playVideo = () => { const p = dv.play(); if (p && p.catch) p.catch(() => {}); };

  function choose(i) {
    if (i === cur) { playVideo(); return; }
    cur = i;
    Sounds.tap();
    $$('.dp', root).forEach((b, k) => b.classList.toggle('on', k === i));
    dv.poster = DANCERS[i].poster;
    dv.src = DANCERS[i].src;
    playVideo();
    G.anim($('.dance-video-wrap'), 'boom');
    if (!Music.isPlaying()) { Music.start(); root.classList.remove('paused'); }
  }
  $$('.dp', root).forEach(b => b.onclick = () => choose(+b.dataset.i));
  dv.onclick = () => { if (dv.paused) playVideo(); };

  Music.onBeat((beat) => {
    if (!G.alive(id)) return;
    root.classList.toggle('flash', beat % 2 === 0);
    if (beat % 2 === 0) {
      const n = document.createElement('div');
      n.className = 'fnote';
      n.innerHTML = pic(rand(['🎵', '🎶', '⭐', '💖']));
      n.style.left = (5 + Math.random() * 90) + '%';
      $('#notes').appendChild(n);
      setTimeout(() => n.remove(), 2600);
    }
  });

  $('#pp').onclick = () => {
    Sounds.tap();
    if (Music.isPlaying()) { Music.stop(); dv.pause(); root.classList.add('paused'); }
    else { Music.start(); playVideo(); root.classList.remove('paused'); }
  };
  $('#song').onclick = () => { Music.next(); playVideo(); root.classList.remove('paused'); G.toast('🎶 ' + Music.songName(), 1500); };
  $('#clap').onclick = () => { Sounds.applause(1.4); G.burstAt($('.dance-video-wrap'), ['👏', '⭐', '💖'], 12); };

  (async () => {
    Music.start(0);
    playVideo();
    await wait(500);
    if (!G.alive(id)) return;
    Music.duck(true);
    await Speech.seq(G.both('Hadi dans edelim!', "Let's dance!"));
    Music.duck(false);
  })();
};
