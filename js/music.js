/* =========================================================
   Dans müziği — Web Audio ile çalınan özgün, neşeli ezgiler
   (telif sorunu olmaması için tamamen bu proje için yazıldı)
   ========================================================= */
const Music = (() => {
  // 8'lik notalar, 4 ölçü = 32 adım. -1 = sus. Akorlar: her ölçü için kök + üçlü + beşli (MIDI)
  const SONGS = [
    { name: 'Zıp Zıp', bpm: 118,
      chords: [[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]],
      mel: [72, 76, 79, 76, 72, 76, 79, -1, 71, 74, 79, 74, 71, 74, 77, -1,
            72, 76, 81, 76, 72, 76, 79, -1, 77, 76, 74, 72, 74, 72, 71, -1] },
    { name: 'Dans Dans', bpm: 126,
      chords: [[41, 45, 48], [43, 47, 50], [45, 48, 52], [48, 52, 55]],
      mel: [69, -1, 72, 74, 76, 74, 72, -1, 67, -1, 71, 72, 74, 72, 71, -1,
            69, 72, 76, 79, 77, 76, 74, -1, 72, 74, 72, 71, 72, -1, -1, -1] },
    { name: 'Neşeli Bebek', bpm: 104,
      chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]],
      mel: [76, -1, 79, -1, 81, 79, 76, -1, 74, -1, 77, -1, 79, 77, 74, -1,
            72, 74, 76, 77, 79, -1, 76, -1, 74, 72, 71, 74, 72, -1, -1, -1] }
  ];
  let timer = null, step = 0, nextTime = 0, song = 0, bus = null, playing = false;
  let beatCb = null;

  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function note(t, f, dur, type, vol) {
    const ctx = Sounds.getCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function kick(t) {
    const ctx = Sounds.getCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + 0.2);
  }
  function noiseHit(t, freq, dur, vol, type = 'bandpass') {
    const ctx = Sounds.getCtx();
    const s = ctx.createBufferSource();
    s.buffer = Sounds.getNoise();
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  function playStep(t) {
    const S = SONGS[song];
    const st = step % 32, bar = Math.floor(st / 8), inBar = st % 8;
    const ch = S.chords[bar];
    const eighth = 60 / S.bpm / 2;
    // davul
    if (inBar % 4 === 0) kick(t);
    if (inBar % 4 === 2) noiseHit(t, 1800, 0.12, 0.35);
    noiseHit(t, 8000, 0.035, 0.12, 'highpass');
    // bas
    if (inBar === 0 || inBar === 3 || inBar === 4 || inBar === 7) note(t, hz(ch[0] - 12), eighth * 0.9, 'triangle', 0.32);
    // akor vuruşları
    if (inBar === 2 || inBar === 6) ch.forEach(m => note(t, hz(m + 12), eighth * 0.8, 'square', 0.035));
    // melodi
    const m = S.mel[st];
    if (m > 0) {
      note(t, hz(m), eighth * 1.6, 'triangle', 0.16);
      note(t, hz(m + 12), eighth * 0.6, 'sine', 0.05);
    }
    if (beatCb && inBar % 2 === 0) {
      const beat = Math.floor(step / 2);
      const delay = Math.max(0, (t - Sounds.getCtx().currentTime) * 1000);
      setTimeout(() => beatCb && beatCb(beat), delay);
    }
  }

  function tick() {
    const ctx = Sounds.getCtx();
    const eighth = 60 / SONGS[song].bpm / 2;
    while (nextTime < ctx.currentTime + 0.15) {
      playStep(nextTime);
      nextTime += eighth;
      step++;
    }
  }

  function start(i = song) {
    const ctx = Sounds.getCtx();
    if (!ctx) return;
    stop();
    song = i % SONGS.length;
    bus = ctx.createGain();
    bus.gain.value = 0.55;
    bus.connect(ctx.destination);
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    playing = true;
    timer = setInterval(tick, 40);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    playing = false;
    if (bus) {
      const b = bus;
      try { b.gain.setTargetAtTime(0, Sounds.getCtx().currentTime, 0.05); } catch (e) { /* yoksay */ }
      setTimeout(() => { try { b.disconnect(); } catch (e) { /* yoksay */ } }, 400);
      bus = null;
    }
  }
  function duck(on) { if (bus) bus.gain.setTargetAtTime(on ? 0.2 : 0.55, Sounds.getCtx().currentTime, 0.1); }

  return {
    start, stop, duck,
    next: () => start(song + 1),
    isPlaying: () => playing,
    bpm: () => SONGS[song].bpm,
    songName: () => SONGS[song].name,
    onBeat: (fn) => { beatCb = fn; }
  };
})();
