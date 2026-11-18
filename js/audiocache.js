/* =========================================================
   Ortak ses motoru
   - Her ses dosyası BİR KEZ indirilir ve bellekte (Blob) saklanır → çalarken internet beklenmez, gecikme olmaz.
   - Çalma, telefonun kendi medya oynatıcısıyla (<audio>) yapılır. (Aşama 12'de Web Audio denendi;
     telefonda sesler yarıda kesildi → Aşama 15'te medya oynatıcısına geri dönüldü.)
   - Oynatıcılar havuzda tekrar kullanılır (en fazla 8): telefonun oynatıcı sınırı dolmaz.
   - Gruplar: 'speech' (konuşma) ve 'fx' (hayvan/efekt); grup bazında durdurulabilir.
   - Dosya henüz inmediyse beklemek yerine doğrudan internetten çalar (ses atlanmaz).
   ========================================================= */
const AudioCache = (() => {
  const blobs = new Map();     // url -> blob: adresi
  const loading = new Map();   // url -> Promise<blobUrl|null>
  const active = { speech: new Set(), fx: new Set() };
  const pool = [];             // { a: HTMLAudioElement, free: bool }
  const POOL_MAX = 8;
  // Bir ses bittikten sonra yenisi hemen başlamasın: arada kısa nefes payı (çocuk ayırt edebilsin)
  const GAP = 350;
  let lastEnd = 0;

  function newEl() {
    const a = new Audio();
    a.preload = 'auto';
    try { a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false; } catch (e) { /* yoksay */ }
    const p = { a, free: true };
    pool.push(p);
    return p;
  }

  function load(url) {
    if (blobs.has(url)) return Promise.resolve(blobs.get(url));
    if (loading.has(url)) return loading.get(url);
    const p = fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => { const u = URL.createObjectURL(b); blobs.set(url, u); return u; })
      .catch(() => null)
      .finally(() => loading.delete(url));
    loading.set(url, p);
    return p;
  }

  // Arka planda sırayla önceden indir (aynı anda en fazla 3)
  let queue = [], running = 0;
  function preload(urls) {
    urls.forEach(u => { if (u && !blobs.has(u) && !loading.has(u) && !queue.includes(u)) queue.push(u); });
    pump();
  }
  function pump() {
    while (running < 3 && queue.length) {
      const u = queue.shift();
      running++;
      load(u).finally(() => { running--; pump(); });
    }
  }

  // Boş oynatıcı al; hepsi doluysa en eski efekti durdurup onu kullan
  function takeEl() {
    let p = pool.find(x => x.free) || (pool.length < POOL_MAX ? newEl() : null);
    if (!p) {
      const oldest = active.fx.values().next().value || active.speech.values().next().value;
      if (oldest) oldest.stop();
      p = pool.find(x => x.free) || newEl();
    }
    p.free = false;
    return p;
  }

  /* Çal. opts: { group: 'speech'|'fx', rate, vol, maxMs, fadeAfterMs, alive: () => bool }
     Ses bitince (ya da durdurulunca) çözülen bir söz (Promise) döndürür. */
  function play(url, opts = {}) {
    const group = opts.group || 'fx';
    return new Promise(async (resolve) => {
      let src = blobs.get(url);
      if (!src) {
        // en fazla 1,5 sn bellekteki kopyayı bekle; olmazsa doğrudan internetten çal
        src = await Promise.race([load(url), new Promise(r => setTimeout(() => r(null), 1500))]) || url;
      }
      const since = performance.now() - lastEnd;
      if (!busy(group) && since < GAP) {
        // bekleme sırasında da "meşgul" sayılır ve durdurulabilir
        let cancelled = false, tw = 0;
        const w = { stop: () => { cancelled = true; clearTimeout(tw); } };
        active[group].add(w);
        await new Promise(r => { tw = setTimeout(r, GAP - since); const st = w.stop; w.stop = () => { st(); r(); }; });
        active[group].delete(w);
        if (cancelled) return resolve();
      }
      if (opts.alive && !opts.alive()) return resolve();
      const p = takeEl(), a = p.a;
      let done = false, tmax = 0, tfade = 0, ifade = 0;
      const item = { stop: () => fin(true) };
      const fin = (stopNow) => {
        if (done) return;
        done = true;
        clearTimeout(tmax); clearTimeout(tfade); clearInterval(ifade);
        a.onended = a.onerror = null;
        if (stopNow) { try { a.pause(); } catch (e) { /* yoksay */ } }
        active[group].delete(item);
        p.free = true;
        lastEnd = performance.now();
        resolve();
      };
      active[group].add(item);
      a.onended = () => fin(false);
      a.onerror = () => fin(false);
      try {
        a.src = src;
        a.defaultPlaybackRate = opts.rate || 1;
        a.playbackRate = opts.rate || 1;
        a.volume = opts.vol == null ? 1 : opts.vol;
      } catch (e) { /* yoksay */ }
      tmax = setTimeout(() => fin(true), opts.maxMs || 15000);
      if (opts.fadeAfterMs) {
        tfade = setTimeout(() => {
          ifade = setInterval(() => {
            const v = a.volume - 0.07;
            if (v <= 0.02) fin(true); else a.volume = v;
          }, 40);
        }, opts.fadeAfterMs);
      }
      const r = a.play();
      if (r && r.catch) r.catch(() => fin(false));
    });
  }

  // grup verilmezse tüm sesler durur
  function stop(group) { (group ? [group] : Object.keys(active)).forEach(g => [...(active[g] || [])].forEach(i => i.stop())); }
  const busy = (group) => !!(active[group] && active[group].size > 0);

  return { load, preload, play, stop, busy };
})();
