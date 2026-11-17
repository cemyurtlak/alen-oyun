/* =========================================================
   Mikrofon: çocuğun ses çıkarıp çıkarmadığını ve üflemeyi algılar.
   Ne söylediğini anlamaz — HER denemeyi ödüllendirmek için sadece
   ses seviyesine bakar (babıldama da ödül alır).
   Mikrofon izni yoksa oyun yine çalışır: ebeveyn 👍 düğmesine basar.
   ========================================================= */
const Mic = (() => {
  let analyser = null, buf = null, state = 'idle', stream = null;
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));

  async function ensure() {
    if (analyser) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { state = 'unsupported'; return false; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false }
      });
      const ctx = Sounds.getCtx();
      const src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      buf = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      state = 'ok';
      return true;
    } catch (e) {
      state = 'denied';
      return false;
    }
  }

  function level() {
    if (!analyser) return 0;
    analyser.getFloatTimeDomainData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / buf.length);
  }

  /* Ses bekle: 'voice' | 'silence' | 'cancel' | 'nomic'
     onLevel(0..1) ile görsel gösterge güncellenir. isAlive() false olursa durur. */
  async function listen(ms, onLevel, isAlive) {
    if (!analyser) return 'nomic';
    let base = 0, n = 0;
    const c0 = performance.now();
    while (performance.now() - c0 < 350) { // ortam gürültüsünü ölç
      await frame();
      if (!isAlive()) return 'cancel';
      base += level(); n++;
    }
    base /= Math.max(1, n);
    const thr = Math.max(0.025, base * 3);
    let above = 0, last = performance.now();
    const start = last;
    while (performance.now() - start < ms) {
      await frame();
      if (!isAlive()) return 'cancel';
      const now = performance.now(), dt = now - last; last = now;
      const l = level();
      onLevel && onLevel(Math.min(1, l / (thr * 3)));
      if (l > thr) { above += dt; if (above > 160) return 'voice'; }
      else above = Math.max(0, above - dt * 0.5);
    }
    return 'silence';
  }

  return { ensure, level, listen, state: () => state, ready: () => !!analyser, stream: () => stream };
})();
