/* =========================================================
   Ortak ses motoru (Web Audio API)
   - Her ses dosyası bir kez indirilir ve çözülür (decode), sonra GECİKMESİZ çalar.
   - Telefon/tabletlerde her ses için yeni <audio> açmak oynatıcı sınırını dolduruyor,
     sesler gecikiyor ya da hiç çalmıyordu → tek AudioContext kullanılır.
   - Gruplar: 'speech' (konuşma) ve 'fx' (hayvan/efekt); grup bazında durdurulabilir.
   - Çözülmüş sesler için sınırlı önbellek (LRU) — bellek şişmesin.
   ========================================================= */
const AudioCache = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  const bufs = new Map();      // url -> AudioBuffer (LRU sırası: Map ekleme sırası)
  const loading = new Map();   // url -> Promise<AudioBuffer|null>
  const MAX_BUFS = 220;
  const active = { speech: new Set(), fx: new Set() };

  function getCtx() {
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  // iOS/Android: ilk dokunuşta ses motorunu aç
  const unlock = () => {
    const c = getCtx();
    if (!c) return;
    try {
      const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
      s.buffer = b; s.connect(c.destination); s.start(0);
    } catch (e) { /* yoksay */ }
  };
  ['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));

  function touch(url, b) { bufs.delete(url); bufs.set(url, b); if (bufs.size > MAX_BUFS) bufs.delete(bufs.keys().next().value); }

  function decode(ab) {
    const c = getCtx();
    return new Promise((res, rej) => {
      try {
        const p = c.decodeAudioData(ab, res, rej);
        if (p && p.then) p.then(res, rej);
      } catch (e) { rej(e); }
    });
  }

  function load(url) {
    if (!AC) return Promise.resolve(null);
    if (bufs.has(url)) { const b = bufs.get(url); touch(url, b); return Promise.resolve(b); }
    if (loading.has(url)) return loading.get(url);
    const p = fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(decode)
      .then(b => { touch(url, b); return b; })
      .catch(() => null)
      .finally(() => loading.delete(url));
    loading.set(url, p);
    return p;
  }

  // Arka planda sırayla önceden yükle (aynı anda en fazla 4 indirme)
  let queue = [], running = 0;
  function preload(urls) {
    urls.forEach(u => { if (u && !bufs.has(u) && !loading.has(u) && !queue.includes(u)) queue.push(u); });
    pump();
  }
  function pump() {
    while (running < 4 && queue.length) {
      const u = queue.shift();
      running++;
      load(u).finally(() => { running--; pump(); });
    }
  }

  /* Çal. opts: { group: 'speech'|'fx', rate, vol, maxMs, fadeAfterMs, alive: () => bool }
     Ses bitince (ya da durdurulunca) çözülen bir söz (Promise) döndürür; 'err' = çalınamadı. */
  function play(url, opts = {}) {
    const group = opts.group || 'fx';
    if (!AC) return htmlFallback(url, opts);
    return new Promise(async (resolve) => {
      // yükleme çok uzarsa beklemeyi bırak (oyun takılmasın)
      const b = bufs.has(url) ? bufs.get(url)
        : await Promise.race([load(url), new Promise(r => setTimeout(() => r('slow'), 6000))]);
      if (b === 'slow' || !b) return resolve('err');
      if (opts.alive && !opts.alive()) return resolve();
      const c = getCtx();
      const src = c.createBufferSource();
      src.buffer = b;
      src.playbackRate.value = opts.rate || 1;
      const g = c.createGain();
      g.gain.value = opts.vol == null ? 1 : opts.vol;
      src.connect(g).connect(c.destination);
      let done = false;
      const item = { stop: () => fin(true) };
      const fin = (stopNow) => {
        if (done) return;
        done = true;
        clearTimeout(tmax);
        active[group].delete(item);
        if (stopNow) { try { src.stop(); } catch (e) { /* yoksay */ } }
        resolve();
      };
      src.onended = () => fin(false);
      active[group].add(item);
      const tmax = setTimeout(() => fin(true), opts.maxMs || 15000);
      if (opts.fadeAfterMs) {
        const t0 = c.currentTime + opts.fadeAfterMs / 1000;
        g.gain.setValueAtTime(g.gain.value, t0);
        g.gain.linearRampToValueAtTime(0.0001, t0 + 0.45);
        setTimeout(() => fin(true), opts.fadeAfterMs + 500);
      }
      src.start(0);
    });
  }

  // Web Audio olmayan eski tarayıcılar için
  function htmlFallback(url, opts) {
    return new Promise(resolve => {
      const a = new Audio(url);
      a.playbackRate = opts.rate || 1;
      a.volume = opts.vol == null ? 1 : opts.vol;
      const item = { stop: () => { try { a.pause(); } catch (e) { /* yoksay */ } resolve(); } };
      active[opts.group || 'fx'].add(item);
      const end = () => { active[opts.group || 'fx'].delete(item); resolve(); };
      a.onended = end; a.onerror = () => { end(); };
      setTimeout(item.stop, opts.maxMs || 15000);
      a.play().catch(end);
    });
  }

  // grup verilmezse tüm sesler durur
  function stop(group) { (group ? [group] : Object.keys(active)).forEach(g => [...(active[g] || [])].forEach(i => i.stop())); }
  const busy = (group) => !!(active[group] && active[group].size > 0);

  return { load, preload, play, stop, busy, ctx: getCtx };
})();
