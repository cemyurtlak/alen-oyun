/* =========================================================
   Hayvan ve taşıt sesleri — SADECE GERÇEK KAYITLAR (assets/sfx)
   Bilgisayarla üretilmiş (sentez) ses yoktur. Gerçek kaydı olmayan
   anahtar sessiz geçer; böyle bir hayvan oyuna eklenmemelidir.
   Kaynaklar:
   - ESC-50 veri seti (K. J. Piczak): dog, cat, cow, sheep, hen, rooster, frog, crow,
     chirping_birds, insects, car_horn, siren, train, airplane, helicopter, clapping
   - BBC Sound Effects (RemArc lisansı, kişisel/ev kullanımı): duck, horse, lion,
     elephant, monkey, owl, chick, howl, bear, fox, goat, donkey, turkey, goose, wolf, tiger, cuckoo,
     seagull, parrot, whale, seal, gorilla, peacock, pigeon, penguin, snake (çıngırak), cricket
   Tüm sesler ortak ses motoru (AudioCache) ile önceden yüklenip gecikmesiz çalınır.
   ========================================================= */
const AnimalSounds = (() => {
  /* rate: çalma hızı (1.35 = yavru kedi gibi ince, 0.8 = iri kedi) */
  const REAL = {
    dog: { f: ['dog_1', 'dog_2', 'dog_3'] },
    howl: { f: ['howl_1', 'howl_2'] },
    cat: { f: ['cat_1', 'cat_2'] },
    kitten: { f: ['cat_1', 'cat_2'], rate: 1.35 },
    catBig: { f: ['cat_1', 'cat_3'], rate: 0.8 },
    catHappy: { f: ['cat_2'], rate: 1.15 },
    catSurprised: { f: ['cat_2'], rate: 1.45 },
    catSad: { f: ['cat_1'], rate: 0.85 },
    catAngry: { f: ['cat_3'], rate: 0.9 },
    catPurr: { f: ['cat_2'], rate: 1.05 },
    catLove: { f: ['cat_1'], rate: 1.1 },
    cow: { f: ['cow_1', 'cow_2', 'cow_3'] },
    sheep: { f: ['sheep_1', 'sheep_2'] },
    chicken: { f: ['hen_1', 'hen_2', 'rooster_1'] },
    rooster: { f: ['rooster_1', 'rooster_2'] },
    chick: { f: ['chick_1', 'chick_2'] },
    duck: { f: ['duck_1', 'duck_2', 'duck_3'] },
    horse: { f: ['horse_1', 'horse_2'] },
    lion: { f: ['lion_1', 'lion_2'] },
    elephant: { f: ['elephant_1', 'elephant_2', 'elephant_3'] },
    monkey: { f: ['monkey_1', 'monkey_2'] },
    owl: { f: ['owl_1', 'owl_2'] },
    bear: { f: ['bear_1'] },
    fox: { f: ['fox_1', 'fox_2'] },
    frog: { f: ['frog_1', 'frog_3'] },
    goat: { f: ['goat_1', 'goat_2'] },
    donkey: { f: ['donkey_1', 'donkey_2'] },
    turkey: { f: ['turkey_1'] },
    goose: { f: ['goose_1'] },
    wolf: { f: ['wolf_1'] },
    tiger: { f: ['tiger_1', 'tiger_2'] },
    cuckoo: { f: ['cuckoo_1', 'cuckoo_2'] },
    crow: { f: ['crow_1', 'crow_2', 'crow_3'] },
    seagull: { f: ['seagull_1', 'seagull_2'] },
    parrot: { f: ['parrot_1'] },
    whale: { f: ['whale_1', 'whale_2'] },
    seal: { f: ['seal_1'] },
    gorilla: { f: ['gorilla_1'] },
    peacock: { f: ['peacock_1', 'peacock_2'] },
    pigeon: { f: ['pigeon_1'] },
    penguin: { f: ['penguin_1'] },
    snake: { f: ['snake_1', 'snake_2'] },
    cricket: { f: ['cricket_1'] },
    bird: { f: ['chirping_birds_3', 'chirping_birds_1'] },
    bee: { f: ['insects_1'] },
    car: { f: ['car_horn_2', 'car_horn_3'] },
    truck: { f: ['car_horn_1'] },
    siren: { f: ['siren_1', 'siren_2'] },
    train: { f: ['train_1'] },
    plane: { f: ['airplane_1'] },
    heli: { f: ['helicopter_1', 'helicopter_2'] }
  };

  // Not: eskiden sounds/animals/ altındaki isteğe bağlı kayıtlar açılışta tek tek yoklanıyordu (55+ boş istek,
  // yavaş açılış ve telefonda oynatıcı sınırının dolması) — kaldırıldı.
  const url = (name) => 'assets/sfx/' + name + '.mp3';
  function playSrc(src, rate, resolve, maxMs = 4500) {
    AudioCache.play(src, { group: 'fx', rate: rate || 1, maxMs }).then(() => resolve());
  }

  // Sesi çal, bitince çözülen bir söz (Promise) döndür. Gerçek kaydı yoksa sessiz geçer.
  function play(key) {
    return new Promise(resolve => {
      if (!key) return resolve();
      const r = REAL[key];
      if (!r) return resolve();
      const name = r.f[Math.floor(Math.random() * r.f.length)];
      playSrc(url(name), (r.rate || 1) * (0.95 + Math.random() * 0.1), resolve);
    });
  }

  function stopAll() { AudioCache.stop('fx'); }

  // Önceden yükle: anahtarların tüm kayıtları (bölüm açılırken çağrılır → ilk çalışta gecikme olmaz)
  function preload(keys) {
    AudioCache.preload([].concat(...keys.filter(k => REAL[k]).map(k => REAL[k].f.map(url))));
  }

  // Kedi Koşusu için farklı gerçek miyavlar: 17 BBC kaydı (Burma, Siyam, İran, erkek kedi, yavrular) + ESC-50,
  // hafif ton farkıyla; aynı ses art arda gelmez
  const MEOWS = Array.from({ length: 17 }, (_, i) => 'meow_' + (i + 1)).concat(['cat_1', 'cat_2', 'cat_3']);
  let lastMeow = '';
  function randomMeow() {
    let m;
    do { m = MEOWS[Math.floor(Math.random() * MEOWS.length)]; } while (m === lastMeow);
    lastMeow = m;
    return new Promise(res => playSrc(url(m), 0.9 + Math.random() * 0.3, res));
  }

  const preloadMeows = () => AudioCache.preload(MEOWS.map(url));
  return { play, randomMeow, stopAll, preload, preloadMeows, has: (k) => !!REAL[k] };
})();
