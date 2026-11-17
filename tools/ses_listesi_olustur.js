/* =========================================================
   Oyunda söylenen TÜM cümlelerin listesini çıkarır → tools/ses_listesi.json
   (ses_uret.py bu listeden doğal ses kayıtlarını üretir)
   Çalıştırma:  node tools/ses_listesi_olustur.js
   Yeni içerik eklenince bu komut ve ardından ses_uret.bat tekrar çalıştırılır.
   ========================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const NAME = process.argv[2] || 'Alen';

// Veri dosyalarını tarayıcı yokmuş gibi yükle
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(read('js/images.js') + '\nthis.IMG=IMG;this.tintSrc=tintSrc;', ctx);
vm.runInContext(read('js/data.js') + `
this.D = { COLORS, ANIMALS, FOODS, CATEGORIES, TALK_GROUPS, COPY_ITEMS, HOMES, PRAISE, TRY_AGAIN, COUNT_TR, COUNT_EN };`, ctx);
const sp = read('js/speech.js');
const PHRASE_EN = vm.runInNewContext('(' + sp.slice(sp.indexOf('{', sp.indexOf('const PHRASE_EN')), sp.indexOf('};', sp.indexOf('const PHRASE_EN')) + 1) + ')');
const D = ctx.D;

const list = [];
const add = (lang, t) => { if (t && String(t).trim()) list.push({ lang, text: String(t).trim() }); };
const both = (tr, en) => { add('tr', tr); add('en', en); };

/* 1) Koddaki sabit cümleler */
const STR = `'(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"`;
const unq = (s) => vm.runInNewContext(s);
const files = ['js/core.js', 'js/learn.js', 'js/home.js', ...fs.readdirSync(path.join(ROOT, 'js/act')).map(f => 'js/act/' + f)];
for (const f of files) {
  const src = read(f);
  for (const m of src.matchAll(new RegExp(`G\\.both\\(\\s*(${STR})\\s*,\\s*(${STR})`, 'g'))) both(unq(m[1]), unq(m[2]));
  for (const m of src.matchAll(new RegExp(`\\{\\s*t:\\s*(${STR}),\\s*l:\\s*(TR|EN)`, 'g'))) add(m[2] === 'TR' ? 'tr' : 'en', unq(m[1]));
  for (const m of src.matchAll(new RegExp(`introTr:\\s*(${STR}),\\s*introEn:\\s*(${STR})`, 'g'))) both(unq(m[1]), unq(m[2]));
}
/* 2) Sözlük (tek dilli cümlelerin karşılıkları) */
for (const [tr, en] of Object.entries(PHRASE_EN)) both(tr, en);

/* 3) Veriden üretilen cümleler */
const lowTr = (s) => s.toLocaleLowerCase('tr-TR');
for (const c of D.CATEGORIES) {
  both(c.tr, c.en); both(c.tr + '!', c.en + '!');
  for (const it of c.items) {
    both((it.trSay || it.tr) + '!', it.en + '!');
    if (it.sound) both(it.sound, PHRASE_EN[it.sound]);
  }
}
D.COUNT_TR.forEach((t, i) => both(t, D.COUNT_EN[i]));
for (const c of D.COLORS) { both(`${c.tr} yumurta!`, `${c.en} egg!`); both(`${c.tr} balon!`, `${c.en} balloon!`); }
for (const h of D.HOMES) {
  both(`Burası ${lowTr(h.tr)}.`, `This is the ${h.en.toLowerCase()}.`);
  for (const a of h.animals) {
    both(`${a.tr} ${h.trLoc} yaşar.`, `The ${a.en} lives ${h.enLoc}.`);
    both(`${a.tr} nerede yaşar?`, `Where does the ${a.en} live?`);
  }
}
const EGG = [['Civciv', 'Chick'], ['Ördek', 'Duck'], ['Kedi', 'Kitty'], ['Kuş', 'Bird'], ['Baykuş', 'Owl'], ['Tavşan', 'Bunny'], ['Köpek', 'Puppy'], ['Kurbağa', 'Frog']];
EGG.forEach(([t, e]) => both(`Sürpriz! ${t}!`, `A ${e.toLowerCase()}!`));
for (const f of D.FOODS) both(f.tr + '!', f.en + '!');
for (const g of D.TALK_GROUPS) for (const it of g.items) {
  both(it.tr, it.en); it.syl.forEach(s => add('tr', s)); add('tr', it.syl.join(' '));
  it.en.split(' ').forEach(s => add('en', s)); add('en', it.en);
}
for (const it of D.COPY_ITEMS) {
  both(it.tr, it.en); it.syl.forEach(s => add('tr', s)); add('tr', it.syl.join(' '));
  (it.synEn || []).forEach(s => add('en', s)); if (it.synEn) add('en', it.synEn.join(' '));
}
for (const p of D.PRAISE) both(p.tr, p.en);
for (const p of D.TRY_AGAIN) both(p.tr, p.en);
[['Kedi', 'Kitty'], ['Köpek', 'Puppy'], ['Civciv', 'Chick'], ['Panda', 'Panda'], ['Kurbağa', 'Frog']].forEach(([t, e]) => both(t + '!', e + '!'));
/* Çocuğun adıyla söylenenler */
both(`Merhaba ${NAME}!`, `Hello ${NAME}!`);
both(`Aferin ${NAME}!`, `Great job, ${NAME}!`);
both(`Merhaba ${NAME}! Bana bir şey söyle!`, `Hi ${NAME}! Say something!`);
both(`Şimdi sıra sende ${NAME}! Sen de bir lokma ye!`, `Now it's your turn, ${NAME}! Take a bite!`);
both(`Aferin ${NAME}! Kocaman bir lokma yedin!`, `Great job, ${NAME}! What a big bite!`);
add('tr', `${NAME}, gel dans et!`);

/* Anahtar: speech.js keyOf ile birebir aynı */
function keyOf(text, L) {
  const t = String(text).toLocaleLowerCase(L === 'tr' ? 'tr-TR' : 'en-US').normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
  return L + '|' + t;
}
const seen = new Map();
for (const e of list) {
  const key = keyOf(e.text, e.lang);
  if (key.endsWith('|') || seen.has(key)) continue;
  const h = crypto.createHash('md5').update(key).digest('hex').slice(0, 10);
  seen.set(key, { key, lang: e.lang, text: e.text, file: `audio/voice/${e.lang}_${h}.mp3` });
}
const out = [...seen.values()];
fs.writeFileSync(path.join(__dirname, 'ses_listesi.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('Cümle sayısı:', out.length, '(tr:', out.filter(x => x.lang === 'tr').length, ', en:', out.filter(x => x.lang === 'en').length, ')');
