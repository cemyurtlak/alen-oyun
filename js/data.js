/* =========================================================
   Oyun içeriği: bölümler, öğeler ve etkinlikler
   Her öğe: tr (Türkçe ad), en (İngilizce ad) + görsel bilgisi
     emoji : 3D görsel (assets/img, bkz. images.js)
     src   : doğrudan görsel yolu (renklendirilmiş görseller için)
     snd   : AnimalSounds içindeki ses efekti anahtarı
     sound : tanıtımda söylenen yansıma kelime (Hav hav!)
   Yeni bölüm eklemek için CATEGORIES listesine yeni bir nesne eklemek yeterli.
   ========================================================= */

const COLORS = [
  // ilk gruptakiler birbirinden çok farklı ana renkler (2 yaş için kolay ayırt edilir)
  { key: 'red', tr: 'Kırmızı', en: 'Red', hex: '#ff1a1a' },
  { key: 'blue', tr: 'Mavi', en: 'Blue', hex: '#0a84ff' },
  { key: 'yellow', tr: 'Sarı', en: 'Yellow', hex: '#ffe100' },
  { key: 'green', tr: 'Yeşil', en: 'Green', hex: '#22d63a' },
  { key: 'white', tr: 'Beyaz', en: 'White', hex: '#ffffff' },
  { key: 'orange', tr: 'Turuncu', en: 'Orange', hex: '#ff8800' },
  { key: 'purple', tr: 'Mor', en: 'Purple', hex: '#a020f0' },
  { key: 'pink', tr: 'Pembe', en: 'Pink', hex: '#ff4fb8' },
  { key: 'black', tr: 'Siyah', en: 'Black', hex: '#2a2a2a' },
  { key: 'brown', tr: 'Kahverengi', en: 'Brown', hex: '#9a5a24' }
];
/* Birbirine benzeyen renkler aynı soruda seçenek olarak çıkmaz */
const SIMILAR = { red: ['orange', 'pink'], orange: ['red', 'yellow', 'brown'], pink: ['red', 'purple'], purple: ['pink', 'blue'],
  yellow: ['orange'], brown: ['orange', 'black'], black: ['brown'], blue: ['purple'], green: [], white: [] };

const ANIMALS = [
  { tr: 'Köpek', en: 'Dog', emoji: '🐶', sound: 'Hav hav!', snd: 'dog' },
  { tr: 'Kedi', en: 'Cat', emoji: '🐱', sound: 'Miyav!', snd: 'cat' },
  { tr: 'İnek', en: 'Cow', emoji: '🐮', sound: 'Möööö!', snd: 'cow' },
  { tr: 'Koyun', en: 'Sheep', emoji: '🐑', sound: 'Meee!', snd: 'sheep' },
  { tr: 'Tavuk', en: 'Chicken', emoji: '🐔', sound: 'Gıt gıt gıdak!', snd: 'chicken' },
  { tr: 'Ördek', en: 'Duck', emoji: '🦆', sound: 'Vak vak!', snd: 'duck' },
  { tr: 'Civciv', en: 'Chick', emoji: '🐥', sound: 'Cik cik!', snd: 'chick' },
  { tr: 'At', en: 'Horse', emoji: '🐴', sound: 'İhihi!', snd: 'horse' },
  { tr: 'Aslan', en: 'Lion', emoji: '🦁', sound: 'Rooar!', snd: 'lion' },
  { tr: 'Fil', en: 'Elephant', emoji: '🐘', sound: 'Böööö!', snd: 'elephant' },
  { tr: 'Maymun', en: 'Monkey', emoji: '🐵', sound: 'Uu aa!', snd: 'monkey' },
  { tr: 'Kurbağa', en: 'Frog', emoji: '🐸', sound: 'Vırak vırak!', snd: 'frog' },
  { tr: 'Kuş', en: 'Bird', emoji: '🐦', sound: 'Cik cik!', snd: 'bird' },
  { tr: 'Baykuş', en: 'Owl', emoji: '🦉', sound: 'Hu hu!', snd: 'owl' },
  { tr: 'Ayı', en: 'Bear', emoji: '🐻', sound: 'Grrr!', snd: 'bear' },
  { tr: 'Arı', en: 'Bee', emoji: '🐝', sound: 'Vızzz!', snd: 'bee' },
  { tr: 'Balık', en: 'Fish', emoji: '🐟', sound: 'Blup blup!', snd: 'fish' },
  { tr: 'Tavşan', en: 'Rabbit', emoji: '🐰' },
  { tr: 'Tilki', en: 'Fox', emoji: '🦊' },
  { tr: 'Panda', en: 'Panda', emoji: '🐼' }
];

const FOODS = [
  { tr: 'Ekmek', en: 'Bread', emoji: '🍞' },
  { tr: 'Peynir', en: 'Cheese', emoji: '🧀' },
  { tr: 'Havuç', en: 'Carrot', emoji: '🥕' },
  { tr: 'Yumurta', en: 'Egg', emoji: '🥚' },
  { tr: 'Bisküvi', en: 'Biscuit', emoji: '🍪' },
  { tr: 'Makarna', en: 'Pasta', emoji: '🍝' },
  { tr: 'Pilav', en: 'Rice', emoji: '🍚' },
  { tr: 'Tavuk', en: 'Chicken', emoji: '🍗' },
  { tr: 'Patates', en: 'Potato', emoji: '🥔' },
  { tr: 'Salatalık', en: 'Cucumber', emoji: '🥒' },
  { tr: 'Brokoli', en: 'Broccoli', emoji: '🥦' },
  { tr: 'Mısır', en: 'Corn', emoji: '🌽' },
  { tr: 'Domates', en: 'Tomato', emoji: '🍅' },
  { tr: 'Elma', en: 'Apple', emoji: '🍎' },
  { tr: 'Muz', en: 'Banana', emoji: '🍌' },
  { tr: 'Köfte', en: 'Meatball', emoji: '🧆' }
];

const CATEGORIES = [
  {
    id: 'colors', tr: 'Renkler', en: 'Colors', icon: '🎨', type: 'pic', bg: '#ffe3e3',
    qEn: 'Which one is {en}?', qTr: 'Hangisi {tr}?', colorNames: true,
    items: COLORS.map(c => ({ ...c, src: tintSrc('balloon', c.key), color: c.hex }))
  },
  {
    id: 'numbers', tr: 'Sayılar', en: 'Numbers', icon: '🔢', type: 'number', bg: '#e3f2ff',
    qEn: 'Which one is {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Bir', en: 'One', value: 1 }, { tr: 'İki', en: 'Two', value: 2 },
      { tr: 'Üç', en: 'Three', value: 3 }, { tr: 'Dört', en: 'Four', value: 4 },
      { tr: 'Beş', en: 'Five', value: 5 }, { tr: 'Altı', en: 'Six', value: 6 },
      { tr: 'Yedi', en: 'Seven', value: 7 }, { tr: 'Sekiz', en: 'Eight', value: 8 },
      { tr: 'Dokuz', en: 'Nine', value: 9 }, { tr: 'On', en: 'Ten', value: 10 }
    ]
  },
  {
    id: 'cats', tr: 'Kediler', en: 'Kitties', icon: '😺', type: 'pic', bg: '#ffe9f3',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Mutlu kedi', en: 'Happy cat', emoji: '😺', sound: 'Miyav!', snd: 'catHappy' },
      { tr: 'Gülen kedi', en: 'Laughing cat', emoji: '😹', sound: 'Hi hi hi!', snd: 'kitten' },
      { tr: 'Seven kedi', en: 'Loving cat', emoji: '😻', sound: 'Mırr mırr!', snd: 'catPurr' },
      { tr: 'Öpücük veren kedi', en: 'Kissing cat', emoji: '😽', sound: 'Muck!', snd: 'catLove' },
      { tr: 'Şaşkın kedi', en: 'Surprised cat', emoji: '🙀', sound: 'Miyy?', snd: 'catSurprised' },
      { tr: 'Üzgün kedi', en: 'Sad cat', emoji: '😿', sound: 'Miyaaav...', snd: 'catSad' },
      { tr: 'Kızgın kedi', en: 'Angry cat', emoji: '😾', sound: 'Hıhhh!', snd: 'catAngry' },
      { tr: 'Sarı kedi', en: 'Yellow cat', emoji: '🐈', sound: 'Miyav!', snd: 'cat' },
      { tr: 'Siyah kedi', en: 'Black cat', emoji: '🐈‍⬛', sound: 'Miyav!', snd: 'catBig' },
      { tr: 'Yavru kedi', en: 'Kitten', emoji: '🐱', sound: 'Miy miy!', snd: 'kitten' }
    ]
  },
  {
    id: 'animals', tr: 'Hayvanlar', en: 'Animals', icon: '🐶', type: 'pic', bg: '#fdebd3',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: ANIMALS
  },
  {
    id: 'animalSounds', tr: 'Kim Bu Ses?', en: 'Who Says This?', icon: '🔊', type: 'pic', bg: '#fff0c9',
    soundQuiz: true, // soruda hayvan sesi çalınır, çocuk sesin sahibini bulur
    qEn: 'Who says this?', qTr: 'Bu sesi kim çıkarıyor?',
    items: ANIMALS.filter(a => a.snd)
  },
  {
    id: 'sharks', tr: 'Köpek Balıkları', en: 'Sharks', icon: '🦈', type: 'pic', bg: '#0b4f8a', theme: 'ocean',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?', colorNames: true,
    items: COLORS.map(c => ({ key: c.key, tr: c.tr + ' köpek balığı', en: c.en + ' shark', src: tintSrc('shark', c.key), color: c.hex, snd: 'chomp' }))
  },
  {
    id: 'cars', tr: 'Arabalar', en: 'Cars', icon: '🚓', type: 'pic', bg: '#e4ecf5', theme: 'road',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Polis arabası', en: 'Police car', emoji: '🚓', sound: 'Dii duu dii duu!', snd: 'siren' },
      { tr: 'Ambulans', en: 'Ambulance', emoji: '🚑', sound: 'Dii duu!', snd: 'siren' },
      { tr: 'İtfaiye', en: 'Fire truck', emoji: '🚒', sound: 'Dii duu!', snd: 'siren' },
      { tr: 'Taksi', en: 'Taxi', emoji: '🚕', sound: 'Düt düt!', snd: 'car' },
      { tr: 'Yarış arabası', en: 'Race car', emoji: '🏎️', sound: 'Vınnn!', snd: 'race' },
      { tr: 'Kamyon', en: 'Truck', emoji: '🚚', sound: 'Döt döt!', snd: 'truck' },
      { tr: 'Otobüs', en: 'Bus', emoji: '🚌', sound: 'Düt düt!', snd: 'truck' },
      { tr: 'Kamyonet', en: 'Pickup truck', emoji: '🛻', snd: 'car' },
      { tr: 'Jip', en: 'Jeep', emoji: '🚙', snd: 'car' },
      { tr: 'Motosiklet', en: 'Motorcycle', emoji: '🏍️', sound: 'Vırrrın!', snd: 'moto' },
      { tr: 'Kırmızı araba', en: 'Red car', src: tintSrc('car', 'red'), snd: 'car' },
      { tr: 'Mavi araba', en: 'Blue car', src: tintSrc('car', 'blue'), snd: 'car' },
      { tr: 'Sarı araba', en: 'Yellow car', src: tintSrc('car', 'yellow'), snd: 'car' },
      { tr: 'Yeşil araba', en: 'Green car', src: tintSrc('car', 'green'), snd: 'car' },
      { tr: 'Pembe araba', en: 'Pink car', src: tintSrc('car', 'pink'), snd: 'car' }
    ]
  },
  {
    id: 'vehicles', tr: 'Taşıtlar', en: 'Vehicles', icon: '✈️', type: 'pic', bg: '#e8e6ff',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Uçak', en: 'Airplane', emoji: '✈️', sound: 'Vıııın!', snd: 'plane' },
      { tr: 'Tren', en: 'Train', emoji: '🚂', sound: 'Çuf çuf!', snd: 'train' },
      { tr: 'Gemi', en: 'Ship', emoji: '🚢', sound: 'Düüüt!', snd: 'ship' },
      { tr: 'Helikopter', en: 'Helicopter', emoji: '🚁', sound: 'Tak tak tak!', snd: 'heli' },
      { tr: 'Bisiklet', en: 'Bicycle', emoji: '🚲', sound: 'Dırın dırın!', snd: 'bell' },
      { tr: 'Traktör', en: 'Tractor', emoji: '🚜', sound: 'Tıkı tıkı!', snd: 'tractor' },
      { tr: 'Roket', en: 'Rocket', emoji: '🚀', sound: 'Fşşşuu!', snd: 'rocket' },
      { tr: 'Araba', en: 'Car', emoji: '🚗', sound: 'Düt düt!', snd: 'car' }
    ]
  },
  {
    id: 'fruits', tr: 'Meyveler', en: 'Fruits', icon: '🍎', type: 'pic', bg: '#e6f8e0',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Elma', en: 'Apple', emoji: '🍎' }, { tr: 'Muz', en: 'Banana', emoji: '🍌' },
      { tr: 'Üzüm', en: 'Grape', emoji: '🍇' }, { tr: 'Çilek', en: 'Strawberry', emoji: '🍓' },
      { tr: 'Portakal', en: 'Orange', emoji: '🍊' }, { tr: 'Karpuz', en: 'Watermelon', emoji: '🍉' },
      { tr: 'Armut', en: 'Pear', emoji: '🍐' }, { tr: 'Kiraz', en: 'Cherry', emoji: '🍒' },
      { tr: 'Şeftali', en: 'Peach', emoji: '🍑' }, { tr: 'Ananas', en: 'Pineapple', emoji: '🍍' },
      { tr: 'Limon', en: 'Lemon', emoji: '🍋' }, { tr: 'Kivi', en: 'Kiwi', emoji: '🥝' }
    ]
  },
  {
    id: 'foods', tr: 'Yiyecekler', en: 'Foods', icon: '🍞', type: 'pic', bg: '#fff1e0',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: FOODS
  },
  {
    id: 'letters', tr: 'Harfler', en: 'Letters', icon: '🔤', type: 'letter', bg: '#fff6d6',
    qEn: 'Which one is the letter {en}?', qTr: 'Hangisi {tr} harfi?',
    // trSay: Türkçe sesli okumada harfin doğru telaffuzu için
    items: 'A,a|B,be|C,ce|D,de|E,e|F,fe|G,ge|H,he|I,ı|J,je|K,ke|L,le|M,me|N,ne|O,o|P,pe|R,re|S,se|T,te|U,u|V,ve|Y,ye|Z,ze'
      .split('|').map(p => { const [l, s] = p.split(','); return { tr: l, en: l, trSay: s }; })
  },
  {
    id: 'shapes', tr: 'Şekiller', en: 'Shapes', icon: '⭐', type: 'shape', bg: '#ffe6f4',
    qEn: 'Which one is the {en}?', qTr: 'Hangisi {tr}?',
    items: [
      { tr: 'Daire', en: 'Circle', shape: 'circle', color: '#ff2d2d' },
      { tr: 'Kare', en: 'Square', shape: 'square', color: '#1e90ff' },
      { tr: 'Üçgen', en: 'Triangle', shape: 'triangle', color: '#2ecc40' },
      { tr: 'Yıldız', en: 'Star', shape: 'star', color: '#ffc400' },
      { tr: 'Kalp', en: 'Heart', shape: 'heart', color: '#ff69b4' },
      { tr: 'Dikdörtgen', en: 'Rectangle', shape: 'rect', color: '#ff8c00' },
      { tr: 'Oval', en: 'Oval', shape: 'oval', color: '#9b30ff' }
    ]
  }
];

/* =========================================================
   KONUŞALIM — konuşmayı destekleyen taklit etkinliği
   Önce kolay sesler (a, o, u, m, b, p), sonra yansıma kelimeler
   (hav hav), en son ilk kelimeler. syl: heceler (tek tek söylenir)
   ========================================================= */
const TALK_GROUPS = [
  {
    tr: 'İlk Sesler', en: 'First Sounds', icon: '😮',
    items: [
      { tr: 'Aaa', en: 'Aaa', emoji: '😮', syl: ['Aaaa'] },
      { tr: 'Ooo', en: 'Ooo', emoji: '😯', syl: ['Oooo'] },
      { tr: 'Uuu', en: 'Hoo', emoji: '🦉', syl: ['Uuuu'] },
      { tr: 'Mmm', en: 'Yummy', emoji: '😋', syl: ['Mmmm'] },
      { tr: 'Ba ba ba', en: 'Ba ba', emoji: '🥁', syl: ['Ba', 'ba', 'ba'] },
      { tr: 'Ma ma ma', en: 'Ma ma', emoji: '🥣', syl: ['Ma', 'ma', 'ma'] },
      { tr: 'Pa pa pa', en: 'Pa pa', emoji: '🫧', syl: ['Pa', 'pa', 'pa'] },
      { tr: 'Da da da', en: 'Da da', emoji: '🎵', syl: ['Da', 'da', 'da'] }
    ]
  },
  {
    tr: 'İlk Kelimeler', en: 'First Words', icon: '👩',
    items: [
      { tr: 'Anne', en: 'Mommy', emoji: '👩', syl: ['An', 'ne'] },
      { tr: 'Baba', en: 'Daddy', emoji: '👨', syl: ['Ba', 'ba'] },
      { tr: 'Mama', en: 'Food', emoji: '🥣', syl: ['Ma', 'ma'] },
      { tr: 'Su', en: 'Water', emoji: '💧', syl: ['Su'] },
      { tr: 'Top', en: 'Ball', emoji: '⚽', syl: ['Top'] },
      { tr: 'Bay bay', en: 'Bye bye', emoji: '👋', syl: ['Bay', 'bay'] },
      { tr: 'Daha', en: 'More', emoji: '🙌', syl: ['Da', 'ha'] },
      { tr: 'Ver', en: 'Give', emoji: '🤲', syl: ['Ver'] },
      { tr: 'Dede', en: 'Grandpa', emoji: '👴', syl: ['De', 'de'] },
      { tr: 'Nene', en: 'Grandma', emoji: '👵', syl: ['Ne', 'ne'] },
      { tr: 'Bebek', en: 'Baby', emoji: '👶', syl: ['Be', 'bek'] },
      { tr: 'Kedi', en: 'Kitty', emoji: '🐱', syl: ['Ke', 'di'], snd: 'catHappy' },
      { tr: 'Am', en: 'Yum', emoji: '😋', syl: ['Aaam'] }
    ]
  }
];

/* SES TAKLİDİ — hayvan seslerini dinle ve taklit et */
const COPY_ITEMS = [
  { tr: 'İnek', en: 'Cow', emoji: '🐮', syl: ['Mööö'], synEn: ['Moooo'], snd: 'cow' },
  { tr: 'Uluyan köpek', en: 'Howling dog', emoji: '🐕', syl: ['Auuuu'], synEn: ['Awoooo'], snd: 'howl' },
  { tr: 'Köpek', en: 'Dog', emoji: '🐶', syl: ['Hav', 'hav'], synEn: ['Woof', 'woof'], snd: 'dog' },
  { tr: 'Kedi', en: 'Cat', emoji: '🐱', syl: ['Mi', 'yav'], synEn: ['Me', 'ow'], snd: 'cat' },
  { tr: 'Yavru kedi', en: 'Kitten', emoji: '😺', syl: ['Miy', 'miy'], synEn: ['Mew', 'mew'], snd: 'kitten' },
  { tr: 'Koyun', en: 'Sheep', emoji: '🐑', syl: ['Meee'], synEn: ['Baaa'], snd: 'sheep' },
  { tr: 'Ördek', en: 'Duck', emoji: '🦆', syl: ['Vak', 'vak'], synEn: ['Quack', 'quack'], snd: 'duck' },
  { tr: 'Tavuk', en: 'Chicken', emoji: '🐔', syl: ['Gıt', 'gıt', 'gıdak'], synEn: ['Cluck', 'cluck'], snd: 'chicken' },
  { tr: 'Civciv', en: 'Chick', emoji: '🐥', syl: ['Cik', 'cik'], synEn: ['Tweet', 'tweet'], snd: 'chick' },
  { tr: 'Aslan', en: 'Lion', emoji: '🦁', syl: ['Rooaar'], synEn: ['Roooar'], snd: 'lion' },
  { tr: 'Baykuş', en: 'Owl', emoji: '🦉', syl: ['Hu', 'hu'], synEn: ['Hoo', 'hoo'], snd: 'owl' },
  { tr: 'Kurbağa', en: 'Frog', emoji: '🐸', syl: ['Vı', 'rak'], synEn: ['Rib', 'bit'], snd: 'frog' },
  { tr: 'Arı', en: 'Bee', emoji: '🐝', syl: ['Vızzz'], synEn: ['Buzzz'], snd: 'bee' },
  { tr: 'Araba', en: 'Car', emoji: '🚗', syl: ['Düt', 'düt'], synEn: ['Beep', 'beep'], snd: 'car' },
  { tr: 'Tren', en: 'Train', emoji: '🚂', syl: ['Çuf', 'çuf'], synEn: ['Choo', 'choo'], snd: 'train' }
];

/* HAYVAN EVLERİ — hangi hayvan nerede yaşar */
const HOMES = [
  { id: 'pond', tr: 'Göl', en: 'Pond', trLoc: 'gölde', enLoc: 'in the pond', icon: '🌊', deco: ['🪷', '🌿'], bg: 'linear-gradient(180deg,#7fd3ff,#1f8fe0)',
    animals: [{ tr: 'Ördek', en: 'duck', emoji: '🦆', snd: 'duck' }, { tr: 'Balık', en: 'fish', emoji: '🐟', snd: 'fish' }, { tr: 'Kurbağa', en: 'frog', emoji: '🐸', snd: 'frog' }] },
  { id: 'nest', tr: 'Kuş yuvası', en: 'Nest', trLoc: 'yuvada', enLoc: 'in the nest', icon: '🪺', deco: ['🌳'], bg: 'linear-gradient(180deg,#c9f2b5,#6cc35a)',
    animals: [{ tr: 'Kuş', en: 'bird', emoji: '🐦', snd: 'bird' }, { tr: 'Baykuş', en: 'owl', emoji: '🦉', snd: 'owl' }, { tr: 'Civciv', en: 'chick', emoji: '🐤', snd: 'chick' }] },
  { id: 'farm', tr: 'Çiftlik', en: 'Farm', trLoc: 'çiftlikte', enLoc: 'on the farm', icon: '🛖', deco: ['🌾', '🌻'], bg: 'linear-gradient(180deg,#ffe9a8,#f2b84b)',
    animals: [{ tr: 'İnek', en: 'cow', emoji: '🐮', snd: 'cow' }, { tr: 'Koyun', en: 'sheep', emoji: '🐑', snd: 'sheep' }, { tr: 'Tavuk', en: 'chicken', emoji: '🐔', snd: 'chicken' }, { tr: 'At', en: 'horse', emoji: '🐴', snd: 'horse' }] },
  { id: 'house', tr: 'Ev', en: 'House', trLoc: 'evde', enLoc: 'in the house', icon: '🏡', deco: ['🌷'], bg: 'linear-gradient(180deg,#ffd6e7,#ff9cc2)',
    animals: [{ tr: 'Köpek', en: 'dog', emoji: '🐶', snd: 'dog' }, { tr: 'Kedi', en: 'cat', emoji: '🐱', snd: 'cat' }] },
  { id: 'forest', tr: 'Orman', en: 'Forest', trLoc: 'ormanda', enLoc: 'in the forest', icon: '🌲', deco: ['🌳', '🍄'], bg: 'linear-gradient(180deg,#9be7a0,#2e8b57)',
    animals: [{ tr: 'Aslan', en: 'lion', emoji: '🦁', snd: 'lion' }, { tr: 'Fil', en: 'elephant', emoji: '🐘', snd: 'elephant' }, { tr: 'Maymun', en: 'monkey', emoji: '🐵', snd: 'monkey' }, { tr: 'Ayı', en: 'bear', emoji: '🐻', snd: 'bear' }, { tr: 'Tilki', en: 'fox', emoji: '🦊' }] }
];

/* Ana sayfadaki oyun / etkinlik kartları */
const ACTIVITIES = [
  { id: 'catrun', tr: 'Kedi Koşusu', en: 'Kitty Run', icon: '😸' },
  { id: 'copy', tr: 'Ses Taklidi', en: 'Copy the Sound', icon: '🐮' },
  { id: 'talk', tr: 'Konuşalım', en: "Let's Talk", icon: '🗣️' },
  { id: 'parrot', tr: 'Konuşan Kedi', en: 'Talking Kitty', icon: '🎤' },
  { id: 'dance', tr: 'Dans Eden Bebekler', en: 'Dancing Babies', icon: '🪩' },
  { id: 'feed', tr: 'Yemek Zamanı', en: 'Meal Time', icon: '🍽️' },
  { id: 'fingers', tr: 'Parmakla Say', en: 'Finger Count', icon: '🖐️' },
  { id: 'eggs', tr: 'Yumurta Sürprizi', en: 'Egg Surprise', icon: '🐣' },
  { id: 'homes', tr: 'Hayvan Evleri', en: 'Animal Homes', icon: '🏡' },
  { id: 'sling', tr: 'Sapan', en: 'Slingshot', icon: '🎯' },
  { id: 'pop', tr: 'Balon Patlat', en: 'Pop Balloons', icon: '🎈' },
  { id: 'blow', tr: 'Balonu Üfle', en: 'Blow It Up', icon: '🌬️' }
];

/* Sevinç ve teselli cümleleri (rastgele seçilir) */
/* Sevinç: tek dilde kısa ve coşkulu (hızlı geçiş için) */
const PRAISE = [
  { tr: 'Yeeey! Aferin!', en: 'Yeeey! Good job!' },
  { tr: 'Yaşasın! Bravo!', en: 'Yaaay! Well done!' },
  { tr: 'Süpersin!', en: 'Super!' },
  { tr: 'Harikasın!', en: 'Awesome!' }
];
const TRY_AGAIN = [
  { tr: 'Hayıııır!', en: 'Nooo!' },
  { tr: 'Hayır, o değil!', en: 'Nope, not that one!' }
];
const COUNT_TR = ['Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz', 'On'];
const COUNT_EN = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
