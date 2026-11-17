/* =========================================================
   Hayvan ve taşıt sesleri — SADECE GERÇEK KAYITLAR (assets/sfx)
   Bilgisayarla üretilmiş (sentez) ses yoktur. Gerçek kaydı olmayan
   anahtar sessiz geçer; böyle bir hayvan oyuna eklenmemelidir.
   Kaynaklar:
   - ESC-50 veri seti (K. J. Piczak): dog, cat, cow, sheep, hen, rooster, frog,
     chirping_birds, insects, car_horn, siren, train, airplane, helicopter, clapping
   - BBC Sound Effects (RemArc lisansı, kişisel/ev kullanımı): duck, horse, lion,
     elephant, monkey, owl, chick, howl, bear, fox
   Kendi kaydınızı kullanmak isterseniz sounds/animals/<anahtar>.mp3 koyun;
   dosya varsa önce o çalar.
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
    elephant: { f: ['elephant_1', 'elephant_2'] },
    monkey: { f: ['monkey_1', 'monkey_2'] },
    owl: { f: ['owl_1', 'owl_2'] },
    bear: { f: ['bear_1'] },
    fox: { f: ['fox_1', 'fox_2'] },
    frog: { f: ['frog_1', 'frog_3'] },
    bird: { f: ['chirping_birds_3', 'chirping_birds_1'] },
    bee: { f: ['insects_1'] },
    car: { f: ['car_horn_2', 'car_horn_3'] },
    truck: { f: ['car_horn_1'] },
    siren: { f: ['siren_1', 'siren_2'] },
    train: { f: ['train_1'] },
    plane: { f: ['airplane_1'] },
    heli: { f: ['helicopter_1', 'helicopter_2'] }
  };

  // Kullanıcının kendi kayıtları (varsa)
  const files = {};
  Object.keys(REAL).forEach(k => {
    try {
      const a = new Audio('sounds/animals/' + k + '.mp3');
      a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { files[k] = a; }, { once: true });
      a.addEventListener('error', () => {}, { once: true });
    } catch (e) { /* yoksay */ }
  });

  const playing = new Set();

  function playSrc(src, rate, resolve, maxMs = 4000) {
    const a = new Audio(src);
    a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
    a.playbackRate = rate || 1;
    playing.add(a);
    let done = false;
    const fin = () => { if (!done) { done = true; clearTimeout(t); playing.delete(a); resolve(); } };
    const t = setTimeout(() => { try { a.pause(); } catch (e) { /* yoksay */ } fin(); }, maxMs);
    a.onended = fin;
    a.onpause = fin;
    a.onerror = fin;
    a.play().catch(fin);
  }

  // Sesi çal, bitince çözülen bir söz (Promise) döndür. Gerçek kaydı yoksa sessiz geçer.
  function play(key) {
    return new Promise(resolve => {
      if (!key) return resolve();
      if (files[key]) return playSrc(files[key].src, 1, resolve);
      const r = REAL[key];
      if (!r) return resolve();
      const name = r.f[Math.floor(Math.random() * r.f.length)];
      playSrc('assets/sfx/' + name + '.mp3', (r.rate || 1) * (0.95 + Math.random() * 0.1), resolve);
    });
  }

  function stopAll() {
    playing.forEach(a => { try { a.pause(); } catch (e) { /* yoksay */ } });
    playing.clear();
  }

  // Kedi Koşusu için rastgele tonda gerçek miyav (yavru → iri kedi)
  function randomMeow() {
    return new Promise(res => playSrc('assets/sfx/' + ['cat_1', 'cat_2', 'cat_3'][Math.floor(Math.random() * 3)] + '.mp3', 0.75 + Math.random() * 0.75, res));
  }

  return { play, randomMeow, stopAll, has: (k) => !!(files[k] || REAL[k]) };
})();
