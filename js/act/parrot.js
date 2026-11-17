/* =========================================================
   KONUŞAN KEDİ / KONUŞAN BEBEK
   Çocuk ne söylerse (babıldama dahil) karakter onu komik, ince
   bir sesle tekrar eder. Konuşmaya teşvik için çok etkilidir.
   Karaktere dokununca gıdıklanır ve konuşur.
   ========================================================= */
G.activities.parrot = () => {
  const { $, $$, rand, wait, TR, EN } = G;
  const id = G.newFlow();
  const CHARS = [
    { key: 'cat', tr: 'Kedi', img: imgSrc('🐱'), talkImg: imgSrc('😸'), pitch: 1.55, snd: 'kitten',
      lines: ['Miyav! Merhaba!', 'Benimle konuş!', 'Miyav miyav!', 'Bir şey söyle!'], tickle: 'catHappy' },
    { key: 'baby', tr: 'Bebek', img: 'assets/img/' + BABIES[1] + '.webp', talkImg: 'assets/img/' + BABIES[1] + '.webp', pitch: 1.35,
      lines: ['Merhaba!', 'Hi hi hi!', 'Agu agu!', 'Benimle konuş!'], tickle: null }
  ];
  let ch = CHARS[0];

  const root = G.screen('parrot', G.topbar(`${pic('🎤', 'title-ic')} Konuşan Kedi <small>Talking Kitty</small>`) + `
    <div class="char-pick">${CHARS.map((c, i) => `<button class="cp ${i === 0 ? 'on' : ''}" data-i="${i}"><img class="pic" src="${c.img}" alt="">${c.tr}</button>`).join('')}</div>
    <div class="parrot-stage">
      <div class="bubble-say" id="say"></div>
      <button class="parrot-char" id="char"><img class="pic" id="charImg" src="${ch.img}" alt="" draggable="false"></button>
      <div class="parrot-floor"></div>
    </div>
    <div class="parrot-status" id="status"></div>`);
  G.bindHome(root);

  const charEl = $('#char'), img = $('#charImg'), status = $('#status');
  let busy = false;

  function setStatus(kind) {
    const map = {
      listen: `${pic('👂')} Dinliyorum... <small>I'm listening</small>`,
      talk: `${pic('💬')} Konuşuyor! <small>Talking!</small>`,
      nomic: `${pic('🎤')} Mikrofon izni gerekli <small>Allow the microphone</small>`
    };
    status.innerHTML = map[kind] || '';
    status.className = 'parrot-status ' + kind;
  }

  function say(text) {
    const b = $('#say');
    b.textContent = text;
    G.anim(b, 'show');
  }

  // Karakteri konuşur gibi oynat
  function talkAnim(ms) {
    charEl.classList.add('talking');
    img.src = ch.talkImg;
    setTimeout(() => { charEl.classList.remove('talking'); img.src = ch.img; }, ms);
  }

  async function tickle() {
    if (busy) return;
    busy = true;
    G.anim(charEl, 'wiggle');
    G.burstAt(charEl, ['💖', '✨'], 10);
    if (ch.tickle) AnimalSounds.play(ch.tickle);
    const line = rand(ch.lines);
    say(Speech.mode() === 'en' && PHRASE_EN[line] ? PHRASE_EN[line] : line);
    talkAnim(1500);
    await Speech.say(line, TR, { pitch: 1.2, rate: 1.05 });
    busy = false;
  }

  // Kaydedilen sesi ince sesle çal
  async function playBack(blob) {
    const ctx = Sounds.getCtx();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    const data = buf.getChannelData(0);
    // baştaki sessizliği kırp
    let start = 0;
    for (let i = 0; i < data.length; i++) { if (Math.abs(data[i]) > 0.04) { start = Math.max(0, i - buf.sampleRate * 0.08); break; } }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = ch.pitch;
    const g = ctx.createGain();
    g.gain.value = 1.6;
    src.connect(g).connect(ctx.destination);
    const dur = (buf.duration - start / buf.sampleRate) / ch.pitch;
    talkAnim(dur * 1000);
    setStatus('talk');
    src.start(0, start / buf.sampleRate);
    await wait(dur * 1000 + 250);
  }

  async function loop() {
    const ok = await Mic.ensure();
    if (!G.alive(id)) return;
    if (!ok || !window.MediaRecorder) { setStatus('nomic'); return; }
    while (G.alive(id)) {
      if (busy) { await wait(300); continue; }
      setStatus('listen');
      let rec, chunks = [];
      try {
        rec = new MediaRecorder(Mic.stream());
      } catch (e) { setStatus('nomic'); return; }
      rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
      rec.start();
      const r = await Mic.listen(20000, (l) => { charEl.style.setProperty('--lvl', l); }, () => G.alive(id) && !busy);
      if (r !== 'voice') { try { rec.stop(); } catch (e) { /* yoksay */ } if (!G.alive(id)) return; continue; }
      // konuşma bitene kadar kayda devam (0.7 sn sessizlik veya en fazla 5 sn)
      charEl.classList.add('ears');
      const t0 = performance.now();
      let quiet = 0, lastT = t0;
      const thr = 0.03;
      while (G.alive(id) && performance.now() - t0 < 5000) {
        await wait(50);
        const now = performance.now();
        if (Mic.level() < thr) quiet += now - lastT; else quiet = 0;
        lastT = now;
        if (quiet > 700) break;
      }
      charEl.classList.remove('ears');
      const stopped = new Promise(res => { rec.onstop = res; });
      rec.stop();
      await stopped;
      if (!G.alive(id)) return;
      busy = true;
      try { await playBack(new Blob(chunks, { type: rec.mimeType })); } catch (e) { /* çözülemedi */ }
      busy = false;
    }
  }

  charEl.onclick = tickle;
  $$('.cp', root).forEach(b => b.onclick = () => {
    Sounds.tap();
    ch = CHARS[+b.dataset.i];
    img.src = ch.img;
    $$('.cp', root).forEach(x => x.classList.toggle('on', x === b));
    G.anim(charEl, 'pop-in');
  });

  (async () => {
    say(G.tx('Merhaba! Bana bir şey söyle!', 'Hi! Say something!'));
    talkAnim(2000);
    await Speech.seq(G.both(`Merhaba ${G.childName()}! Bana bir şey söyle!`, `Hi ${G.childName()}! Say something!`));
    if (G.alive(id)) loop();
  })();
};
