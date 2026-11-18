/* =========================================================
   Konuşma motoru
   1) ElevenLabs (Piku, çocuk sesi) ile üretilmiş kayıtları çalar (audio/voice/, VOICE_FILES)
   2) Bilgisayar seslendirmesi YOK: kaydı olmayan cümle sessiz geçer
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
  /* Bilgisayar (tarayıcı) seslendirmesi KULLANILMAZ. Tüm konuşmalar ElevenLabs
     (Piku sesi) ile kaydedilmiş dosyalardır. Kaydı olmayan cümle sessiz geçer ve
     konsola uyarı yazılır: yeni cümle eklenirse sesini ElevenLabs'ten üretin. */
  const supported = false;
  let token = 0;
  const FILES = (typeof VOICE_FILES !== 'undefined') ? VOICE_FILES : {};
  const missing = new Set();

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

  // Kayıt ortak ses motoruyla çalınır (önceden yüklendiyse gecikmesiz)
  function playFile(src, id) {
    return AudioCache.play(src, { group: 'speech', alive: () => id === token, maxMs: 12000 });
  }

  // Tek cümle (dil filtresiyle)
  async function say(text, lang = 'tr-TR', opts = {}) {
    const p = resolve({ t: text, l: lang, ...opts });
    if (!p || !p.t) return;
    const id = token;
    const f = FILES[keyOf(p.t, p.l)];
    if (!f) {
      const k = keyOf(p.t, p.l);
      if (!missing.has(k)) { missing.add(k); console.warn('Ses kaydı yok (ElevenLabs ile üretin):', k); }
      return;
    }
    await playFile(f, id);
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
    AudioCache.stop('speech');
    if (typeof AnimalSounds !== 'undefined') AnimalSounds.stopAll();
  }

  return {
    supported, say, seq, cancel, wait, keyOf, mode,
    allows: (l) => mode() === 'both' || mode() === l.slice(0, 2),
    hasLang: () => false,
    hasRecordings: () => Object.keys(FILES).length > 0,
    listVoices: () => [],
    missing: () => [...missing],
    busy: () => AudioCache.busy('speech'),
    // Bir cümlenin ses dosyası (dil filtresi uygulanarak) — önceden yükleme için
    fileFor: (text, lang) => { const r = resolve({ t: text, l: lang }); return r ? FILES[keyOf(r.t, r.l)] : null; },
    preload: (pairs) => AudioCache.preload(pairs.map(([t, l]) => { const r = resolve({ t, l }); return r && FILES[keyOf(r.t, r.l)]; }).filter(Boolean))
  };
})();
