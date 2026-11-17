/* =========================================================
   Hayvan ve taşıt sesleri — Web Audio ile sentezlenir (çizgi film tadında)
   Gerçek kayıt kullanmak isterseniz sounds/animals/ klasörüne
   anahtar adıyla mp3 koyun: dog.mp3, cat.mp3, cow.mp3 ...
   Dosya varsa otomatik onu çalar.
   ========================================================= */
const AnimalSounds = (() => {
  const KEYS = ['dog', 'howl', 'cat', 'kitten', 'catBig', 'catHappy', 'catSad', 'catAngry', 'catPurr', 'catLove', 'catSurprised',
    'cow', 'sheep', 'chicken', 'chick', 'duck', 'horse', 'lion', 'elephant', 'monkey', 'frog', 'bird', 'owl', 'bear', 'bee', 'fish',
    'car', 'race', 'truck', 'moto', 'plane', 'train', 'bell', 'ship', 'heli', 'siren', 'tractor', 'rocket', 'chomp'];
  const files = {};
  KEYS.forEach(k => {
    try {
      const a = new Audio('sounds/animals/' + k + '.mp3');
      a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { files[k] = a; }, { once: true });
      a.addEventListener('error', () => {}, { once: true });
    } catch (e) { /* yoksay */ }
  });

  let master = null;
  function out() {
    const ctx = Sounds.getCtx();
    if (!ctx) return null;
    if (!master) {
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    return ctx;
  }

  function ramp(param, t, points, mode = 'lin') {
    param.setValueAtTime(points[0][1], t + points[0][0]);
    for (const [tt, v] of points.slice(1)) {
      if (mode === 'exp') param.exponentialRampToValueAtTime(Math.max(v, 0.0001), t + tt);
      else param.linearRampToValueAtTime(v, t + tt);
    }
  }

  function env(g, t, dur, vol, attack, release) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.setValueAtTime(vol, t + Math.max(attack, dur - release));
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
  }

  function lfo(ctx, t, dur, rate, depth, target) {
    const l = ctx.createOscillator();
    const lg = ctx.createGain();
    l.frequency.value = rate;
    lg.gain.value = depth;
    l.connect(lg).connect(target);
    l.start(t);
    l.stop(t + dur + 0.05);
  }

  // Osilatörlü ses: freqs = [[zaman, frekans], ...]
  function voice(o) {
    const ctx = out();
    if (!ctx) return;
    const t = ctx.currentTime + (o.t0 || 0);
    const dur = o.dur;
    const osc = ctx.createOscillator();
    osc.type = o.type || 'sawtooth';
    ramp(osc.frequency, t, o.freqs);
    if (o.vib) lfo(ctx, t, dur, o.vibRate || 6, o.vib, osc.frequency);
    const f = ctx.createBiquadFilter();
    f.type = o.filt || 'bandpass';
    f.Q.value = o.q || 1;
    ramp(f.frequency, t, o.fFreqs || [[0, 1200]]);
    const g = ctx.createGain();
    env(g, t, dur, o.vol || 0.3, o.attack || 0.02, o.release || 0.1);
    if (o.am) {
      const am = ctx.createGain();
      am.gain.value = 1 - o.am.depth;
      lfo(ctx, t, dur, o.am.rate, o.am.depth, am.gain);
      osc.connect(f).connect(am).connect(g).connect(master);
    } else {
      osc.connect(f).connect(g).connect(master);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Gürültülü ses (kükreme, buhar, rüzgâr)
  function hiss(o) {
    const ctx = out();
    if (!ctx) return;
    const t = ctx.currentTime + (o.t0 || 0);
    const src = ctx.createBufferSource();
    src.buffer = Sounds.getNoise();
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filt || 'lowpass';
    f.Q.value = o.q || 1;
    ramp(f.frequency, t, o.fFreqs || [[0, 800]]);
    const g = ctx.createGain();
    env(g, t, o.dur, o.vol || 0.3, o.attack || 0.01, o.release || 0.05);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + o.dur + 0.05);
  }

  /* Miyav: p = ses inceliği (1 normal, >1 yavru, <1 iri kedi), len = süre çarpanı,
     contour = 'normal' | 'up' (soru/mutlu) | 'down' (üzgün) */
  function meow(p = 1, len = 1, t0 = 0, contour = 'normal') {
    const L = len;
    const fr = {
      normal: [[0, 480], [0.25 * L, 780], [0.6 * L, 700], [0.95 * L, 430]],
      up: [[0, 450], [0.5 * L, 650], [0.95 * L, 880]],
      down: [[0, 700], [0.25 * L, 760], [0.95 * L, 340]]
    }[contour].map(([t, f]) => [t, f * p]);
    voice({ t0, dur: L, freqs: fr, vib: 8 * p, vibRate: 5,
      fFreqs: [[0, 700 * p], [0.3 * L, 1800 * p], [0.95 * L, 850 * p]], q: 3, vol: 0.5, attack: 0.06, release: 0.3 * L });
    voice({ t0, type: 'triangle', dur: L, freqs: fr.map(([t, f]) => [t, f * 2]), filt: 'bandpass', fFreqs: [[0, 2400 * p]], q: 2, vol: 0.08, attack: 0.06, release: 0.3 * L });
    return t0 + L + 0.05;
  }

  // Her ses: çalar ve süresini (sn) döndürür
  const SYNTH = {
    dog() {
      [0, 0.32].forEach(t0 => {
        voice({ t0, dur: 0.17, freqs: [[0, 560], [0.05, 400], [0.15, 260]], fFreqs: [[0, 1100]], q: 1.2, vol: 0.55, attack: 0.005, release: 0.08 });
        hiss({ t0, dur: 0.1, filt: 'bandpass', fFreqs: [[0, 1600]], vol: 0.25 });
      });
      return 0.6;
    },
    cat() { return meow(1, 1); },
    kitten() { meow(1.6, 0.55); meow(1.75, 0.5, 0.6); return 1.2; },
    catBig() { return meow(0.72, 1.3); },
    catHappy() { return meow(1.25, 0.8, 0, 'up'); },
    catSurprised() { return meow(1.5, 0.35, 0, 'up'); },
    catSad() { return meow(0.95, 1.7, 0, 'down'); },
    catLove() {
      // önce mırlama, sonra yumuşak miyav
      hiss({ dur: 0.9, fFreqs: [[0, 260]], q: 4, vol: 0.5, attack: 0.1, release: 0.3 });
      voice({ dur: 0.9, freqs: [[0, 60]], filt: 'lowpass', fFreqs: [[0, 300]], vol: 0.35, attack: 0.1, release: 0.3, am: { rate: 24, depth: 0.8 } });
      meow(1.15, 0.7, 0.85);
      return 1.6;
    },
    catPurr() {
      voice({ dur: 1.8, freqs: [[0, 55], [1.8, 58]], filt: 'lowpass', fFreqs: [[0, 320]], vol: 0.55, attack: 0.15, release: 0.4, am: { rate: 23, depth: 0.85 } });
      hiss({ dur: 1.8, fFreqs: [[0, 300]], q: 3, vol: 0.3, attack: 0.15, release: 0.4 });
      return 1.8;
    },
    catAngry() {
      hiss({ dur: 0.9, filt: 'highpass', fFreqs: [[0, 2500]], vol: 0.55, attack: 0.03, release: 0.3 });
      voice({ t0: 0.85, dur: 0.8, freqs: [[0, 160], [0.8, 130]], vib: 12, vibRate: 22, filt: 'bandpass', fFreqs: [[0, 700]], q: 2, vol: 0.45, attack: 0.08, release: 0.25 });
      return 1.7;
    },
    howl() {
      // Auuuuu — uzun, yükselip alçalan uluma
      voice({ dur: 2.6, freqs: [[0, 330], [0.5, 560], [1.6, 600], [2.6, 380]], vib: 10, vibRate: 5.5, filt: 'bandpass',
        fFreqs: [[0, 500], [0.6, 1100], [2.0, 900], [2.6, 500]], q: 2.5, vol: 0.55, attack: 0.25, release: 0.8 });
      voice({ type: 'sine', dur: 2.6, freqs: [[0, 330], [0.5, 560], [1.6, 600], [2.6, 380]], vib: 10, vibRate: 5.5, filt: 'lowpass', fFreqs: [[0, 2000]], vol: 0.25, attack: 0.25, release: 0.8 });
      return 2.7;
    },
    chick() {
      for (let i = 0; i < 5; i++) voice({ t0: i * 0.16, type: 'sine', dur: 0.11, freqs: [[0, 3200], [0.04, 3900], [0.1, 3300]], filt: 'highpass', fFreqs: [[0, 1500]], vol: 0.3, attack: 0.005, release: 0.05 });
      return 0.85;
    },
    owl() {
      [0, 0.55, 0.8].forEach(t0 => voice({ t0, type: 'sine', dur: t0 ? 0.22 : 0.45, freqs: [[0, 380], [0.1, 420], [0.2, 360]], filt: 'lowpass', fFreqs: [[0, 1200]], vol: 0.55, attack: 0.04, release: 0.12 }));
      return 1.1;
    },
    race() {
      voice({ dur: 1.4, freqs: [[0, 80], [0.6, 320], [0.7, 220], [1.4, 420]], vib: 6, vibRate: 40, filt: 'lowpass', fFreqs: [[0, 1400]], vol: 0.4, attack: 0.05, release: 0.3 });
      return 1.4;
    },
    moto() {
      voice({ type: 'square', dur: 1.2, freqs: [[0, 60], [0.5, 200], [1.2, 150]], vib: 10, vibRate: 35, filt: 'lowpass', fFreqs: [[0, 900]], vol: 0.35, attack: 0.05, release: 0.3 });
      return 1.2;
    },
    truck() {
      [0, 0.4].forEach(t0 => [220, 277].forEach(fr =>
        voice({ t0, type: 'square', dur: 0.32, freqs: [[0, fr]], filt: 'lowpass', fFreqs: [[0, 1200]], vol: 0.22, attack: 0.01, release: 0.05 })));
      return 0.75;
    },
    chomp() {
      [0, 0.22].forEach(t0 => {
        hiss({ t0, dur: 0.08, filt: 'bandpass', fFreqs: [[0, 1200]], vol: 0.6 });
        voice({ t0, type: 'sine', dur: 0.12, freqs: [[0, 220], [0.1, 90]], filt: 'lowpass', fFreqs: [[0, 800]], vol: 0.5, attack: 0.005, release: 0.06 });
      });
      return 0.45;
    },
    cow() {
      voice({ dur: 1.6, freqs: [[0, 125], [0.3, 118], [1.5, 92]], vib: 2, vibRate: 4, filt: 'lowpass',
        fFreqs: [[0, 300], [0.4, 950], [1.5, 350]], q: 4, vol: 0.65, attack: 0.15, release: 0.4 });
      return 1.65;
    },
    sheep() {
      voice({ dur: 1.0, freqs: [[0, 360], [0.9, 330]], vib: 22, vibRate: 7.5, fFreqs: [[0, 1400], [1, 1000]],
        q: 2, vol: 0.5, attack: 0.03, release: 0.25, am: { rate: 7.5, depth: 0.4 } });
      return 1.05;
    },
    chicken() {
      [0, 0.18, 0.34, 0.5].forEach(t0 =>
        voice({ t0, type: 'square', dur: 0.08, freqs: [[0, 700], [0.07, 500]], fFreqs: [[0, 1500]], q: 2, vol: 0.3, attack: 0.005, release: 0.04 }));
      voice({ t0: 0.7, dur: 0.55, freqs: [[0, 800], [0.15, 1100], [0.5, 700]], vib: 15, vibRate: 12, fFreqs: [[0, 1500]], q: 2, vol: 0.38, release: 0.15 });
      return 1.3;
    },
    duck() {
      [0, 0.28, 0.56].forEach(t0 => {
        voice({ t0, dur: 0.2, freqs: [[0, 300], [0.15, 240]], fFreqs: [[0, 1300]], q: 6, vol: 0.6, attack: 0.01, release: 0.08 });
        voice({ t0, type: 'square', dur: 0.2, freqs: [[0, 300], [0.15, 240]], fFreqs: [[0, 900]], q: 3, vol: 0.2, attack: 0.01, release: 0.08 });
      });
      return 0.8;
    },
    horse() {
      voice({ dur: 1.2, freqs: [[0, 1100], [0.4, 900], [1.1, 450]], vib: 90, vibRate: 13, fFreqs: [[0, 2000], [1.1, 900]], q: 2, vol: 0.35, attack: 0.05, release: 0.4 });
      hiss({ t0: 1.1, dur: 0.45, fFreqs: [[0, 900], [0.45, 300]], vol: 0.25, attack: 0.05, release: 0.3 });
      return 1.6;
    },
    lion() {
      hiss({ dur: 1.5, fFreqs: [[0, 300], [0.4, 950], [1.5, 250]], q: 3, vol: 0.75, attack: 0.2, release: 0.6 });
      voice({ dur: 1.5, freqs: [[0, 95], [0.5, 125], [1.5, 70]], vib: 6, vibRate: 25, filt: 'lowpass', fFreqs: [[0, 550]], vol: 0.55, attack: 0.2, release: 0.6 });
      return 1.6;
    },
    elephant() {
      voice({ dur: 1.1, freqs: [[0, 500], [0.2, 820], [0.8, 760], [1.1, 560]], vib: 20, vibRate: 9, fFreqs: [[0, 1400]], q: 2, vol: 0.55, attack: 0.06, release: 0.25 });
      voice({ type: 'square', dur: 1.1, freqs: [[0, 250], [0.2, 410], [0.8, 380], [1.1, 280]], fFreqs: [[0, 900]], vol: 0.2, attack: 0.06, release: 0.25 });
      return 1.2;
    },
    monkey() {
      [0, 0.25].forEach(t0 => voice({ t0, type: 'triangle', dur: 0.18, freqs: [[0, 450], [0.15, 650]], filt: 'lowpass', fFreqs: [[0, 2000]], vol: 0.5, attack: 0.02, release: 0.06 }));
      [0.55, 0.9].forEach(t0 => voice({ t0, dur: 0.3, freqs: [[0, 900], [0.2, 1300], [0.3, 1000]], fFreqs: [[0, 1500]], q: 2, vol: 0.45, attack: 0.02, release: 0.08 }));
      return 1.25;
    },
    frog() {
      [0, 0.45].forEach(t0 => voice({ t0, type: 'square', dur: 0.32, freqs: [[0, 95], [0.3, 85]], filt: 'lowpass', fFreqs: [[0, 700]], vol: 0.55, attack: 0.01, release: 0.06, am: { rate: 28, depth: 0.5 } }));
      return 0.85;
    },
    bird() {
      for (let i = 0; i < 6; i++) {
        const t0 = i * 0.13 + (i > 2 ? 0.15 : 0);
        voice({ t0, type: 'sine', dur: 0.1, freqs: [[0, 2600], [0.05, 4200], [0.09, 3000]], filt: 'highpass', fFreqs: [[0, 1000]], vol: 0.28, attack: 0.005, release: 0.04 });
      }
      return 1.0;
    },
    bear() {
      hiss({ dur: 1.0, fFreqs: [[0, 200], [0.3, 550], [1.0, 200]], q: 3, vol: 0.65, attack: 0.15, release: 0.4 });
      voice({ dur: 1.0, freqs: [[0, 72], [1.0, 60]], vib: 10, vibRate: 30, filt: 'lowpass', fFreqs: [[0, 420]], vol: 0.6, attack: 0.15, release: 0.4 });
      return 1.05;
    },
    bee() {
      voice({ dur: 1.4, freqs: [[0, 210], [0.7, 250], [1.4, 200]], vib: 12, vibRate: 30, fFreqs: [[0, 600], [0.7, 950], [1.4, 600]], q: 3, vol: 0.35, attack: 0.15, release: 0.35 });
      return 1.4;
    },
    fish() {
      [0, 0.17, 0.3, 0.5].forEach(t0 => voice({ t0, type: 'sine', dur: 0.08, freqs: [[0, 300], [0.07, 1100]], filt: 'lowpass', fFreqs: [[0, 3000]], vol: 0.4, attack: 0.005, release: 0.03 }));
      return 0.65;
    },
    car() {
      [0, 0.35].forEach(t0 => [392, 494].forEach(fr =>
        voice({ t0, type: 'square', dur: 0.25, freqs: [[0, fr]], filt: 'lowpass', fFreqs: [[0, 2000]], vol: 0.2, attack: 0.01, release: 0.04 })));
      return 0.65;
    },
    plane() {
      hiss({ dur: 2.4, filt: 'bandpass', fFreqs: [[0, 400], [1.4, 1500], [2.4, 600]], q: 1.5, vol: 0.5, attack: 0.6, release: 0.8 });
      voice({ dur: 2.4, freqs: [[0, 120], [1.4, 180], [2.4, 110]], filt: 'lowpass', fFreqs: [[0, 600]], vol: 0.15, attack: 0.6, release: 0.8 });
      return 2.4;
    },
    train() {
      [900, 1130].forEach(fr => voice({ type: 'sine', dur: 0.8, freqs: [[0, fr]], filt: 'lowpass', fFreqs: [[0, 4000]], vol: 0.2, attack: 0.05, release: 0.15 }));
      for (let i = 0; i < 4; i++) hiss({ t0: 0.95 + i * 0.22, dur: 0.15, filt: 'bandpass', fFreqs: [[0, 700]], vol: 0.6, release: 0.1 });
      return 1.9;
    },
    bell() {
      [0, 0.22].forEach(t0 => [2100, 2900].forEach(fr =>
        voice({ t0, type: 'sine', dur: 0.4, freqs: [[0, fr]], filt: 'highpass', fFreqs: [[0, 500]], vol: 0.2, attack: 0.002, release: 0.35, am: { rate: 18, depth: 0.3 } })));
      return 0.65;
    },
    ship() {
      [110, 165].forEach(fr => voice({ dur: 1.4, freqs: [[0, fr]], filt: 'lowpass', fFreqs: [[0, 500]], vol: 0.45, attack: 0.1, release: 0.3 }));
      return 1.45;
    },
    heli() {
      for (let i = 0; i < 13; i++) hiss({ t0: i * 0.075, dur: 0.06, fFreqs: [[0, 450]], vol: 0.7, release: 0.04 });
      return 1.0;
    },
    siren() {
      voice({ type: 'square', dur: 1.6, freqs: [[0, 700], [0.4, 700], [0.41, 950], [0.8, 950], [0.81, 700], [1.2, 700], [1.21, 950], [1.6, 950]],
        filt: 'lowpass', fFreqs: [[0, 1600]], vol: 0.22, attack: 0.02, release: 0.1 });
      return 1.6;
    },
    tractor() {
      voice({ type: 'square', dur: 1.4, freqs: [[0, 55], [1.4, 62]], filt: 'lowpass', fFreqs: [[0, 420]], vol: 0.55, attack: 0.1, release: 0.3, am: { rate: 12, depth: 0.5 } });
      hiss({ dur: 1.4, fFreqs: [[0, 300]], vol: 0.2, attack: 0.1, release: 0.3 });
      return 1.4;
    },
    rocket() {
      hiss({ dur: 1.8, fFreqs: [[0, 200], [1.8, 3000]], vol: 0.55, attack: 0.3, release: 0.5 });
      voice({ type: 'sine', dur: 1.8, freqs: [[0, 300], [1.8, 1500]], filt: 'lowpass', fFreqs: [[0, 4000]], vol: 0.1, attack: 0.3, release: 0.5 });
      return 1.8;
    }
  };

  // Sesi çal, bitince çözülen bir söz (Promise) döndür
  function play(key) {
    return new Promise(resolve => {
      if (!key) return resolve();
      const f = files[key];
      if (f) {
        try {
          f.currentTime = 0;
          const done = () => { clearTimeout(t); resolve(); };
          const t = setTimeout(done, 5000);
          f.onended = done;
          f.play().catch(done);
          return;
        } catch (e) { /* sentezle devam */ }
      }
      const fn = SYNTH[key];
      if (!fn || !out()) return resolve();
      const d = fn();
      setTimeout(resolve, d * 1000 + 120);
    });
  }

  // Kedi Koşusu için rastgele tonda miyav
  function randomMeow() {
    const opts = ['cat', 'kitten', 'catBig', 'catHappy', 'catSurprised', 'catSad'];
    if (Math.random() < 0.6) {
      // tamamen rastgele perde ve uzunluk
      const p = 0.7 + Math.random() * 1.0;
      const contour = ['normal', 'up', 'down'][Math.floor(Math.random() * 3)];
      out() && meow(p, 0.45 + Math.random() * 0.8, 0, contour);
      return Promise.resolve();
    }
    return play(opts[Math.floor(Math.random() * opts.length)]);
  }

  return { play, randomMeow, has: (k) => !!(files[k] || SYNTH[k]) };
})();
