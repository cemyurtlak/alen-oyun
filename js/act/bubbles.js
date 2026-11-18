/* =========================================================
   BALONCUK PATLAT (su altı) — denizin dibinden sabun köpüğü gibi
   parlak baloncuklar yükselir; dokununca "blop" diye patlar.
   - Boş baloncuk: sırayla sayılır (Bir! İki! ... On! → kutlama)
   - İçinde deniz hayvanı olan baloncuk: hayvan kurtulup yüzerek gider,
     gerçek sesi (balina, fok, penguen) ve adı söylenir; renkli köpek balığının rengi söylenir.
   Sesler sıraya girer: üst üste binmez, sayılar atlanmaz (Kedi Koşusu ile aynı düzen).
   Tanıtım yok — oyun hemen başlar (Cem'in isteği).
   ========================================================= */
G.activities.bubbles = () => {
  const { $, rand } = G;
  const id = G.newFlow();

  // Baloncuklardan çıkan deniz hayvanları (yalnızca gerçek sesi/adı kayıtlı olanlar)
  const SHARK_COLORS = COLORS.filter(c => ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple'].includes(c.key));
  const SEA = [
    { e: '🐋', snd: 'whale', tr: 'Balina', en: 'Whale', face: 1 },
    { e: '🦭', snd: 'seal', tr: 'Fok', en: 'Seal', face: -1 },
    { e: '🐧', snd: 'penguin', tr: 'Penguen', en: 'Penguin', face: 0 }
  ];
  function randomFriend() {
    if (Math.random() < 0.55) {
      const c = rand(SHARK_COLORS);
      return { src: tintSrc('shark', c.key), tr: c.tr + ' köpek balığı', en: c.en + ' shark', face: 1 };
    }
    const s = rand(SEA);
    return { src: imgSrc(s.e), snd: s.snd, tr: s.tr, en: s.en, face: s.face };
  }

  // Ses ve konuşmaları önceden yükle (ilk dokunuşta gecikme olmasın)
  AnimalSounds.preload(SEA.map(s => s.snd));
  Speech.preload(COUNT_TR.map(n => [n + '!', 'tr-TR']).concat(COUNT_EN.map(n => [n + '!', 'en-US']))
    .concat(SEA.map(s => [s.tr + '!', 'tr-TR']), SEA.map(s => [s.en + '!', 'en-US']))
    .concat(SHARK_COLORS.map(c => [c.tr + ' köpek balığı!', 'tr-TR']), SHARK_COLORS.map(c => [c.en + ' shark!', 'en-US'])));

  let deco = '';
  for (let i = 0; i < 16; i++) deco += `<span class="ocean-bubble" style="left:${Math.random() * 100}%;animation-delay:${-Math.random() * 7}s;--s:${0.4 + Math.random() * 0.8}"></span>`;
  const root = G.screen('bubblegame theme-ocean', G.topbar(`${pic('🫧', 'title-ic')} Baloncuk Patlat <small>Pop the Bubbles</small>`,
    `<div class="counter" id="cnt"><b>0</b><span class="mini-bubble"></span></div>`) + `
    <div class="ocean-deco"><div class="rays"></div>${deco}
      <div class="bg-fish f1">${pic('🐠')}</div><div class="bg-fish f2">${pic('🐟')}</div><div class="bg-fish f3">${pic('🐠')}</div>
      <div class="seabed">${pic('🪸', 'sb s1')}${pic('🌿', 'sb s2')}${pic('🐚', 'sb s3')}${pic('🪸', 'sb s4')}${pic('🐙', 'sb s5')}${pic('🦀', 'sb s6')}</div>
    </div>
    <div class="pop-field" id="field"></div>`);
  G.bindHome(root);
  const field = $('#field');
  const bubbles = [];
  let count = 0, nextSpawn = 0.2, last = performance.now();

  /* Ses kuyruğu (en fazla 6 iş) */
  let queue = Promise.resolve(), pending = 0;
  function enqueue(job) {
    if (pending >= 6) return false;
    pending++;
    queue = queue.then(async () => {
      try { if (G.alive(id)) await job(); } catch (e) { /* yoksay */ }
      pending--;
    });
    return true;
  }

  function spawn() {
    const size = 110 + Math.random() * 100;
    const el = document.createElement('button');
    el.className = 'sbubble';
    const friend = Math.random() < 0.25 ? randomFriend() : null;
    el.innerHTML = '<span class="shine"></span>' + (friend ? `<img class="inside" src="${friend.src}" alt="" draggable="false">` : '');
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--hue', Math.floor(Math.random() * 360) + 'deg');
    field.appendChild(el);
    const b = {
      el, friend, size,
      x: 0.08 + Math.random() * 0.84, y: field.clientHeight + size,
      vy: 55 + Math.random() * 55 + Math.min(count, 30), age: 0,
      ph: Math.random() * 6, sway: 14 + Math.random() * 20, dead: false
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (b.y > field.clientHeight - b.size * 0.6) return; // baloncuk henüz görünmüyor
      popIt(b);
    });
    bubbles.push(b);
  }

  function popIt(b) {
    if (b.dead) return;
    b.dead = true;
    Sounds.bubble();
    const r = b.el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    // minik köpükler etrafa saçılır
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('div');
      d.className = 'froth';
      const s = 8 + Math.random() * 16;
      d.style.width = d.style.height = s + 'px';
      d.style.left = cx + 'px';
      d.style.top = cy + 'px';
      const a = Math.random() * Math.PI * 2, dist = r.width * (0.35 + Math.random() * 0.45);
      d.style.setProperty('--tx', Math.cos(a) * dist + 'px');
      d.style.setProperty('--ty', Math.sin(a) * dist - 30 + 'px');
      G.fx.appendChild(d);
      setTimeout(() => d.remove(), 800);
    }
    b.el.classList.add('popped');
    setTimeout(() => b.el.remove(), 260);

    if (b.friend) {
      const f = b.friend;
      // hayvan kurtulur, ekranın kenarına doğru yüzer
      const dir = cx < innerWidth / 2 ? -1 : 1;
      const sw = document.createElement('div');
      sw.className = 'swim-away';
      sw.innerHTML = `<img src="${f.src}" alt="" draggable="false">`;
      sw.style.left = cx + 'px';
      sw.style.top = cy + 'px';
      sw.style.setProperty('--dx', dir * (innerWidth * 0.7) + 'px');
      sw.style.setProperty('--flip', f.face && f.face !== dir ? -1 : 1);
      G.fx.appendChild(sw);
      setTimeout(() => sw.remove(), 3000);
      enqueue(async () => {
        if (f.snd) { await AnimalSounds.play(f.snd); if (!G.alive(id)) return; }
        await Speech.seq(G.both(f.tr + '!', f.en + '!'));
      });
      return;
    }

    // boş baloncuk: sayı (kuyruk doluysa sayı atlanmaz, hiç eklenmez)
    const n = count + 1 > 10 ? 1 : count + 1;
    if (!enqueue(async () => {
      await Speech.seq(G.both(COUNT_TR[n - 1] + '!', COUNT_EN[n - 1] + '!'));
      if (n === 10 && G.alive(id)) { G.confetti(90); await G.celebrate({ big: true }); }
    })) return;
    count = n;
    const cnt = $('#cnt b');
    if (cnt) { cnt.textContent = count; G.anim($('#cnt'), 'boom'); }
  }

  function loop(now) {
    if (!G.alive(id)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    nextSpawn -= dt;
    if (nextSpawn <= 0 && bubbles.length < 8) { spawn(); nextSpawn = 0.6 + Math.random() * 0.7; }
    const W = field.clientWidth, H = field.clientHeight;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (b.dead) { bubbles.splice(i, 1); continue; }
      // alttan hızlı çıkar, sonra yavaşça yükselir (ekrana girmeden patlatılamaz)
      b.age += dt;
      b.y -= (b.vy + H * 1.1 * Math.exp(-b.age * 3)) * dt;
      b.ph += dt * 1.8;
      const x = b.x * W + Math.sin(b.ph) * b.sway - b.size / 2;
      const sq = 1 + Math.sin(b.ph * 2.3) * 0.04; // baloncuk hafifçe esner
      b.el.style.transform = `translate(${x}px, ${b.y}px) scale(${sq}, ${2 - sq})`;
      if (b.y < -b.size * 1.4) { b.el.remove(); bubbles.splice(i, 1); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
