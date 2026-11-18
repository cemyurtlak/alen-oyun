/* =========================================================
   Ses efektleri (Web Audio API ile üretilir — dosya gerekmez)
   İsterseniz sounds/ klasörüne kendi kayıtlarınızı koyabilirsiniz:
   (Alkış gerçek kayıttır ve ortak ses motoru AudioCache ile çalınır.)
   ========================================================= */
const Sounds = (() => {
  let ctx = null;
  let noiseBuf = null;

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

  // (Eskiden sounds/ altındaki isteğe bağlı kayıtlar açılışta yoklanıyordu — gereksiz istekler kaldırıldı)

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

  // Alkış: SADECE gerçek kayıt (BBC Sound Effects, temiz salon alkışı); ortak ses motoruyla gecikmesiz çalar,
  // sona doğru yumuşakça kısılarak biter (kesik "tık" olmasın)
  function applause(duration = 2.4) {
    const src = 'assets/sfx/clapping_' + (1 + Math.floor(Math.random() * 3)) + '.mp3';
    AudioCache.play(src, { group: 'fx', vol: 0.75, fadeAfterMs: Math.max(300, Math.min(duration, 3) * 1000 - 450) });
  }
  const preloadCommon = () => AudioCache.preload([1, 2, 3].map(i => 'assets/sfx/clapping_' + i + '.mp3'));

  // Sevinç müziği (ta-da!)
  /* Bilgisayarla üretilmiş "ta-da" müziği kutlamada alkışın arkasında ayrı bir ses gibi duyuluyordu
     (Cem: "alkışta arka planda farklı sesler çıkıyor") → kapatıldı. Kutlama = gerçek alkış + Piku. */
  function fanfare() { /* kapalı */ }
  function fanfareSynth() {
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

  // Su altı baloncuk "blop" sesi: yükselen yumuşak ton + çok kısa su şıpırtısı
  function bubble() {
    init();
    if (!ctx) return;
    const f = 260 + Math.random() * 160;
    tone(f, 0, 0.13, 'sine', 0.32, f * 3.2);
    tone(f * 1.5, 0.02, 0.08, 'sine', 0.12, f * 4);
    noise(0.01, 0.06, 0.12, 1800, 1.2);
  }

  // Çekiç Oyunu: tahtaya vuruş "tok" sesi (kısa, alçak, tahta gibi)
  function thud() {
    init();
    if (!ctx) return;
    tone(180, 0, 0.16, 'sine', 0.45, 70);
    tone(420, 0, 0.05, 'triangle', 0.18, 200);
    noise(0, 0.05, 0.25, 900, 1.5);
  }

  // Top Yuvarla: rampada yuvarlanan topun "gürül gürül" sesi (dur saniye). Döndürülen nesne ile erken durdurulabilir.
  function roll(dur, vol = 0.32) {
    init();
    if (!ctx) return { stop() {} };
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 260; f.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.08);
    g.gain.setValueAtTime(vol, t + Math.max(0.1, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // tıkırtı hissi: genliği hızlıca dalgalandır
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 11; lg.gain.value = vol * 0.55;
    lfo.connect(lg).connect(g.gain);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t); lfo.start(t);
    src.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    return { stop() { try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(0.0001, ctx.currentTime); } catch (e) { /* yoksay */ } } };
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
    init, applause, fanfare, wrong, pop, bubble, thud, roll, tap, whoosh, crunch, gulp,
    getCtx: () => { init(); return ctx; },
    getNoise: () => { init(); return noiseBuf; },
    hasFile: () => false,
    preloadCommon,
    playFile: () => false
  };
})();
