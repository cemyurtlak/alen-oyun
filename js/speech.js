/* =========================================================
   Sesli okuma (Web Speech API — tarayıcının kendi sesleri)
   Türkçe ve İngilizce için ayrı ses seçer.
   ========================================================= */
const Speech = (() => {
  const supported = 'speechSynthesis' in window;
  let voices = [];
  let token = 0; // her iptalde artar; eski akışlar kendini durdurur

  function loadVoices() {
    if (!supported) return;
    voices = speechSynthesis.getVoices() || [];
  }
  loadVoices();
  if (supported) speechSynthesis.onvoiceschanged = loadVoices;

  const norm = (s) => (s || '').toLowerCase().replace('_', '-');

  function voicesFor(lang) {
    const base = lang.slice(0, 2).toLowerCase();
    return voices.filter(v => norm(v.lang).startsWith(base));
  }

  // En doğal sesi seçmeye çalış: kullanıcı seçimi > Natural/Online > Google > ilk bulunan
  function pickVoice(lang) {
    const list = voicesFor(lang);
    if (!list.length) return null;
    const wanted = Settings.get(lang.startsWith('tr') ? 'voiceTr' : 'voiceEn');
    if (wanted) {
      const w = list.find(v => v.name === wanted);
      if (w) return w;
    }
    const exact = list.filter(v => norm(v.lang) === norm(lang));
    const pool = exact.length ? exact : list;
    return pool.find(v => /natural|online/i.test(v.name)) ||
           pool.find(v => /google/i.test(v.name)) ||
           pool[0];
  }

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Tek cümle söyle; bitince (veya güvenlik zaman aşımında) çözülür
  function say(text, lang = 'tr-TR', opts = {}) {
    return new Promise(resolve => {
      if (!supported || !text) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = (opts.rate || 1) * Settings.get('rate');
      u.pitch = opts.pitch || 1.15;
      u.volume = 1;
      let done = false;
      const finish = () => { if (!done) { done = true; clearTimeout(timer); resolve(); } };
      u.onend = finish;
      u.onerror = finish;
      const timer = setTimeout(finish, 2500 + text.length * 200);
      speechSynthesis.speak(u);
    });
  }

  /* Sıralı konuşma. parts: [{t:'Kırmızı', l:'tr-TR'}, 400, {t:'Red', l:'en-US'}]
     Sayı = bekleme (ms). Akış iptal edilirse false döner. */
  async function seq(parts) {
    const my = token;
    for (const p of parts) {
      if (my !== token) return false;
      if (typeof p === 'number') { await wait(p); continue; }
      await say(p.t, p.l, p);
    }
    return my === token;
  }

  function cancel() {
    token++;
    if (supported) speechSynthesis.cancel();
  }

  return {
    supported,
    say, seq, cancel, wait,
    hasLang: (lang) => voicesFor(lang).length > 0,
    listVoices: (lang) => voicesFor(lang),
    current: () => token
  };
})();
