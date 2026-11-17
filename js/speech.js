/* =========================================================
   Konuşma motoru
   1) Önce önceden üretilmiş DOĞAL ses kayıtlarını çalar (audio/voice/, VOICE_FILES)
   2) Kayıt yoksa tarayıcının sesli okumasını kullanır (yedek)
   Dil ayarı: 'tr' (sadece Türkçe), 'en' (sadece İngilizce), 'both' (ikisi)
   Seçilmeyen dildeki cümleler atlanır; karşılığı varsa (alt / sözlük) çevrilir.
   Aynı anda tek ses: yeni akış başlayınca eski konuşma ve sesler susar.
   ========================================================= */

/* Tek dilde yazılmış cümlelerin diğer dildeki karşılıkları (yalnızca eşi olmayanlar) */
const PHRASE_EN = {
  'Agu agu!': 'Goo goo!', 'Balonları patlat!': 'Pop the balloons!', 'Bana yemek verir misin?': 'Can I have some food?',
  'Bütün hayvanlar evine gitti!': 'All the animals are home!', 'Hadi birlikte söyleyelim!': "Let's say it together!",
  'Hadi dans edelim!': "Let's dance!", 'İçinden ne çıkacak?': "What's inside?", 'Sen de yapabilirsin!': 'You can do it too!',
  'Sen de ye! Ham!': 'You eat too! Yum!', 'Çok güzel oynadın!': 'You played so well!', 'Çok güzel söyledin!': 'You said it so well!',
  'Miyav! Merhaba!': 'Meow! Hello!', 'Benimle konuş!': 'Talk to me!', 'Miyav miyav!': 'Meow meow!', 'Bir şey söyle!': 'Say something!',
  'Merhaba!': 'Hello!', 'Wiii!': 'Wheee!', 'Ham ham ham!': 'Yum yum yum!',
  // hayvan / taşıt sesleri
  'Hav hav!': 'Woof woof!', 'Miyav!': 'Meow!', 'Möööö!': 'Moo!', 'Meee!': 'Baa!', 'Gıt gıt gıdak!': 'Cluck cluck!',
  'Vak vak!': 'Quack quack!', 'Cik cik!': 'Tweet tweet!', 'İhihi!': 'Neigh!', 'Rooar!': 'Roar!', 'Böööö!': 'Toot toot!',
  'Uu aa!': 'Ooh ooh aah aah!', 'Vırak vırak!': 'Ribbit ribbit!', 'Hu hu!': 'Hoot hoot!', 'Grrr!': 'Grrr!', 'Vızzz!': 'Buzz!',
  'Blup blup!': 'Blub blub!', 'Hi hi hi!': 'Hee hee hee!', 'Mırr mırr!': 'Purr purr!', 'Muck!': 'Mwah!', 'Miyy?': 'Mew?',
  'Miyaaav...': 'Meow...', 'Hıhhh!': 'Hiss!', 'Miy miy!': 'Mew mew!', 'Dii duu dii duu!': 'Nee naw nee naw!', 'Dii duu!': 'Nee naw!',
  'Düt düt!': 'Beep beep!', 'Vınnn!': 'Vroom!', 'Döt döt!': 'Honk honk!', 'Vırrrın!': 'Vroom vroom!', 'Vıııın!': 'Zoom!',
  'Çuf çuf!': 'Choo choo!', 'Düüüt!': 'Toot toot!', 'Tak tak tak!': 'Chop chop chop!', 'Dırın dırın!': 'Ring ring!',
  'Tıkı tıkı!': 'Putt putt!', 'Fşşşuu!': 'Whoosh!'
};

const Speech = (() => {
  const supported = 'speechSynthesis' in window;
  let voices = [];
  let token = 0;
  let current = null; // çalan ses kaydı
  const FILES = (typeof VOICE_FILES !== 'undefined') ? VOICE_FILES : {};

  function loadVoices() { if (supported) voices = speechSynthesis.getVoices() || []; }
  loadVoices();
  if (supported) speechSynthesis.onvoiceschanged = loadVoices;

  const norm = (s) => (s || '').toLowerCase().replace('_', '-');
  const voicesFor = (lang) => voices.filter(v => norm(v.lang).startsWith(lang.slice(0, 2).toLowerCase()));

  function pickVoice(lang) {
    const list = voicesFor(lang);
    if (!list.length) return null;
    const wanted = Settings.get(lang.startsWith('tr') ? 'voiceTr' : 'voiceEn');
    if (wanted) { const w = list.find(v => v.name === wanted); if (w) return w; }
    const exact = list.filter(v => norm(v.lang) === norm(lang));
    const pool = exact.length ? exact : list;
    return pool.find(v => /natural/i.test(v.name)) || pool.find(v => /online/i.test(v.name)) ||
           pool.find(v => /google/i.test(v.name)) || pool[0];
  }

  // Ses dosyası anahtarı (noktalama ve büyük/küçük harf fark etmez)
  function keyOf(text, lang) {
    const L = lang.slice(0, 2);
    const t = String(text).toLocaleLowerCase(L === 'tr' ? 'tr-TR' : 'en-US').normalize('NFC')
      .replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    return L + '|' + t;
  }

  const mode = () => Settings.get('lang') || 'both';
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Bir parçayı seçili dile göre çöz: {t, l} veya null (atla)
  function resolve(p) {
    const L = p.l.slice(0, 2), want = mode();
    if (want === 'both' || want === L) return p;
    const toL = want === 'tr' ? 'tr-TR' : 'en-US';
    if (p.alt) return { ...p, t: p.alt, l: toL };
    if (L === 'tr' && want === 'en' && PHRASE_EN[p.t]) return { ...p, t: PHRASE_EN[p.t], l: toL };
    return null;
  }

  function playFile(src, id) {
    return new Promise(resolveP => {
      const a = new Audio(src);
      current = a;
      let done = false;
      const fin = () => { if (!done) { done = true; clearTimeout(t); if (current === a) current = null; resolveP(); } };
      const t = setTimeout(fin, 9000);
      a.onended = fin;
      a.onerror = () => { done = true; clearTimeout(t); resolveP('err'); };
      a.play().catch(() => { done = true; clearTimeout(t); resolveP('err'); });
      // iptal edilirse
      const chk = setInterval(() => { if (id !== token) { clearInterval(chk); try { a.pause(); } catch (e) { /* yoksay */ } fin(); } if (done) clearInterval(chk); }, 60);
    });
  }

  function tts(text, lang, opts) {
    return new Promise(res => {
      if (!supported || !text) return res();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = (opts.rate || 1) * Settings.get('rate');
      // aşırı ince ses robotik duyulur: perdeyi doğal aralıkta tut
      u.pitch = Math.min(1.2, Math.max(0.9, opts.pitch || 1.05));
      let done = false;
      const finish = () => { if (!done) { done = true; clearTimeout(timer); res(); } };
      u.onend = finish; u.onerror = finish;
      const timer = setTimeout(finish, 2500 + text.length * 180);
      speechSynthesis.speak(u);
    });
  }

  // Tek cümle (dil filtresiyle)
  async function say(text, lang = 'tr-TR', opts = {}) {
    const p = resolve({ t: text, l: lang, ...opts });
    if (!p || !p.t) return;
    const id = token;
    const f = FILES[keyOf(p.t, p.l)];
    if (f) {
      const r = await playFile(f, id);
      if (r !== 'err') return;
    }
    if (id !== token) return;
    return tts(p.t, p.l, p);
  }

  /* Sıralı konuşma. parts: [{t, l, alt?}, 300 (bekleme ms), ...]
     Seçilmeyen dildeki parça atlanınca yanındaki bekleme de atlanır. */
  async function seq(parts) {
    const my = token;
    const out = [];
    let dropped = false;
    for (const p of parts) {
      if (typeof p === 'number') { if (!dropped) out.push(p); continue; }
      const r = resolve(p);
      if (r) { out.push(r); dropped = false; }
      else { if (typeof out[out.length - 1] === 'number') out.pop(); dropped = true; }
    }
    for (const p of out) {
      if (my !== token) return false;
      if (typeof p === 'number') { await wait(p); continue; }
      await say(p.t, p.l, { ...p, alt: undefined });
    }
    return my === token;
  }

  function cancel() {
    token++;
    if (supported) speechSynthesis.cancel();
    if (current) { try { current.pause(); } catch (e) { /* yoksay */ } current = null; }
    if (typeof AnimalSounds !== 'undefined') AnimalSounds.stopAll();
  }

  return {
    supported, say, seq, cancel, wait, keyOf, mode,
    allows: (l) => mode() === 'both' || mode() === l.slice(0, 2),
    hasLang: (lang) => voicesFor(lang).length > 0,
    hasRecordings: () => Object.keys(FILES).length > 0,
    listVoices: (lang) => voicesFor(lang),
    busy: () => !!current || (supported && speechSynthesis.speaking)
  };
})();
