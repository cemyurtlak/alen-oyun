/* =========================================================
   Ses efektleri (Web Audio API ile üretilir — dosya gerekmez)
   İsterseniz sounds/ klasörüne kendi kayıtlarınızı koyabilirsiniz:
     sounds/yeah.mp3   -> doğru cevapta sevinç ("yeeey")
     sounds/alkis.mp3  -> doğru cevapta alkış
     sounds/hayir.mp3  -> yanlış cevapta "hayııır"
   Dosya varsa onu çalar, yoksa üretilmiş sesi kullanır.
   ========================================================= */
const Sounds = (() => {
  let ctx = null;
  let noiseBuf = null;
  const files = {};

  function init() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      // 1 saniyelik beyaz gürültü (alkış ve patlama için)
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // İsteğe bağlı kayıt dosyalarını önceden yükle
  ['yeah', 'alkis', 'hayir'].forEach(name => {
    try {
      const a = new Audio('sounds/' + name + '.mp3');
      a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { files[name] = a; }, { once: true });
      a.addEventListener('error', () => {}, { once: true });
    } catch (e) { /* yoksay */ }
  });

  function playFile(name) {
    const a = files[name];
    if (!a) return false;
    try { a.currentTime = 0; a.play().catch(() => {}); return true; } catch (e) { return false; }
  }

  function tone(freq, start, dur, type = 'sine', vol = 0.25, freqEnd) {
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(start, dur, vol, freq = 1500, q = 1) {
    if (!ctx) return;
    const t = ctx.currentTime + start;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  // Kalabalık alkışı: çok sayıda kısa gürültü patlaması
  function applause(duration = 2.4) {
    if (playFile('alkis')) return;
    // gerçek alkış kaydı (ESC-50), kısa tutulur
    try {
      const a = new Audio('assets/sfx/clapping_' + (1 + Math.floor(Math.random() * 2)) + '.mp3');
      a.volume = 0.8;
      a.play().then(() => setTimeout(() => { try { a.pause(); } catch (e) { /* yoksay */ } }, Math.min(duration, 2.4) * 1000)).catch(() => {});
      return;
    } catch (e) { /* sentezle */ }
    init();
    if (!ctx) return;
    const claps = Math.floor(duration * 70);
    for (let i = 0; i < claps; i++) {
      const s = Math.random() * duration;
      const fade = 1 - s / duration;           // sona doğru azalır
      noise(s, 0.03 + Math.random() * 0.04, 0.35 * fade + 0.03,
            900 + Math.random() * 1800, 0.8 + Math.random());
    }
  }

  // Sevinç müziği (ta-da!)
  function fanfare() {
    init();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle', 0.22));
    tone(1046.5, 0.45, 0.6, 'triangle', 0.2);
    tone(1318.5, 0.45, 0.6, 'sine', 0.12);
    // pırıltı
    for (let i = 0; i < 6; i++) tone(1500 + Math.random() * 1500, 0.5 + i * 0.07, 0.12, 'sine', 0.06);
  }

  // Yanlış: komik "vuuu-vuuuu" sesi
  function wrong() {
    init();
    if (!ctx) return;
    tone(330, 0, 0.35, 'sawtooth', 0.12, 260);
    tone(260, 0.38, 0.6, 'sawtooth', 0.12, 160);
  }

  // Balon patlaması
  function pop() {
    init();
    if (!ctx) return;
    noise(0, 0.12, 0.6, 2500, 0.6);
    tone(600, 0, 0.12, 'sine', 0.2, 120);
  }

  // Dokunma sesi
  function tap() {
    init();
    if (!ctx) return;
    tone(880, 0, 0.09, 'sine', 0.15, 1320);
  }

  // Sayfa geçiş "vıın"
  function whoosh() {
    init();
    if (!ctx) return;
    tone(300, 0, 0.25, 'sine', 0.1, 900);
  }

  // Ham ham (çiğneme) sesi
  function crunch() {
    init();
    if (!ctx) return;
    noise(0, 0.07, 0.45, 2200, 0.7);
    noise(0.05, 0.05, 0.25, 3200, 0.9);
  }

  // Yutma "gulp"
  function gulp() {
    init();
    if (!ctx) return;
    tone(500, 0, 0.18, 'sine', 0.25, 140);
  }

  return {
    init, applause, fanfare, wrong, pop, tap, whoosh, crunch, gulp,
    getCtx: () => { init(); return ctx; },
    getNoise: () => { init(); return noiseBuf; },
    hasFile: (n) => !!files[n],
    playFile
  };
})();
