/* =========================================================
   KEDİ KOŞUSU — kediler uzaktan koşarak ekrana yaklaşır,
   sonunda ekrana doğru zıplar (farklı tonlarda miyav).
   Kediye dokununca hemen zıplar. Zıplayan kediler sayılır (1-10).
   ========================================================= */
G.activities.catrun = () => {
  const { $, rand, TR, EN } = G;
  const id = G.newFlow();
  const CATS = ['🐱', '🐈', '🐈‍⬛', '😺', '😸', '😻', '😹', '🙀', '😽'];
  const root = G.screen('catrun', G.topbar(`${pic('😸', 'title-ic')} Kedi Koşusu <small>Kitty Run</small>`,
    `<div class="counter" id="cnt"><b>0</b>${pic('🐱')}</div>`) + `
    <div class="field" id="field">
      <div class="far-hills"></div>
      <div class="meadow"></div>
      <div class="path"></div>
      <div class="flowers">${pic('🌷', 'fl f1')}${pic('🌻', 'fl f2')}${pic('🌸', 'fl f3')}${pic('🌷', 'fl f4')}${pic('🌻', 'fl f5')}</div>
    </div>
    <div class="glass" id="glass"></div>`);
  G.bindHome(root);

  const field = $('#field'), glass = $('#glass');
  const cats = [];
  let count = 0, nextSpawn = 0.6, last = performance.now();

  Speech.seq(G.both('Kediler geliyor!', 'Here come the kitties!'));

  function spawn() {
    const el = document.createElement('div');
    el.className = 'runcat';
    el.innerHTML = pic(rand(CATS));
    field.appendChild(el);
    const c = {
      el, t: 0, x0: 0.25 + Math.random() * 0.5, xEnd: 0.15 + Math.random() * 0.7,
      speed: 1 / (2.4 + Math.random() * 1.8), flip: Math.random() < 0.5, phase: Math.random() * 6,
      jumping: false, jt: 0
    };
    el.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (!c.jumping) startJump(c); });
    cats.push(c);
  }

  function startJump(c) {
    c.jumping = true;
    c.jt = 0;
    c.s0 = c.scale || 0.5;
    c.xj = c.x || field.clientWidth / 2;
    c.yj = c.y || field.clientHeight * 0.8;
    AnimalSounds.randomMeow();
    count++;
    if (count > 10) count = 1;
    const cnt = $('#cnt b');
    if (cnt) { cnt.textContent = count; G.anim($('#cnt'), 'boom'); }
    setTimeout(() => {
      if (!G.alive(id)) return;
      // miyav bittikten sonra sayıyı söyle (sesler üst üste binmesin)
      if (!Speech.busy()) Speech.seq(G.both(COUNT_TR[count - 1] + '!', COUNT_EN[count - 1] + '!'));
      if (count === 10) setTimeout(() => G.alive(id) && G.celebrate({ big: true, extra: G.both('On kedi!', 'Ten kitties!') }), 1200);
    }, 900);
  }

  // Kedi camın üstüne "yapışır" ve pati izi bırakır
  function smoosh(c) {
    const r = glass.getBoundingClientRect();
    const g = document.createElement('div');
    g.className = 'smoosh';
    g.innerHTML = c.el.innerHTML;
    const x = Math.min(Math.max(c.xj, r.width * 0.2), r.width * 0.8);
    g.style.left = x + 'px';
    g.style.top = r.height * 0.45 + 'px';
    glass.appendChild(g);
    setTimeout(() => g.remove(), 1400);
    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.className = 'pawprint';
      p.innerHTML = pic('🐾');
      p.style.left = (x + (Math.random() * 260 - 130)) + 'px';
      p.style.top = (r.height * 0.45 + (Math.random() * 220 - 110)) + 'px';
      p.style.setProperty('--r', (Math.random() * 60 - 30) + 'deg');
      p.style.animationDelay = (0.1 + i * 0.12) + 's';
      glass.appendChild(p);
      setTimeout(() => p.remove(), 2600);
    }
    Sounds.pop();
  }

  field.addEventListener('pointerdown', () => { if (cats.length < 6) spawn(); });

  function loop(now) {
    if (!G.alive(id)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    nextSpawn -= dt;
    if (nextSpawn <= 0 && cats.length < 4) { spawn(); nextSpawn = 1.2 + Math.random() * 1.6; }
    const W = field.clientWidth, H = field.clientHeight, horizon = H * 0.3;
    for (let i = cats.length - 1; i >= 0; i--) {
      const c = cats[i];
      if (!c.jumping) {
        c.t += dt * c.speed;
        const t = Math.min(c.t, 1);
        const p = Math.pow(t, 1.9);
        const scale = 0.1 + 1.6 * p;
        const x = (c.x0 + (c.xEnd - c.x0) * p) * W;
        const y = horizon + (H * 0.97 - horizon) * Math.pow(t, 1.35);
        const hop = Math.abs(Math.sin(c.t * 15 + c.phase)) * 34 * scale;
        c.scale = scale; c.x = x; c.y = y - hop;
        c.el.style.transform = `translate(${x}px,${y - hop}px) translate(-50%,-100%) scale(${scale}) scaleX(${c.flip ? -1 : 1})`;
        c.el.style.zIndex = Math.round(t * 100);
        c.el.querySelector('.pic').style.transform = `rotate(${Math.sin(c.t * 15 + c.phase) * 6}deg)`;
        if (c.t >= 1) startJump(c);
      } else {
        c.jt += dt;
        const j = Math.min(c.jt / 0.5, 1);
        const scale = c.s0 * (1 + j * j * 3.2);
        const y = c.yj - Math.sin(j * Math.PI * 0.85) * H * 0.35 + j * H * 0.1;
        const x = c.xj + (W / 2 - c.xj) * j * 0.4;
        c.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%) scale(${scale}) rotate(${j * 12 * (c.flip ? -1 : 1)}deg)`;
        c.el.style.zIndex = 500;
        c.el.style.opacity = j > 0.8 ? String(1 - (j - 0.8) * 5) : '1';
        if (j >= 1) {
          c.xj = x;
          smoosh(c);
          c.el.remove();
          cats.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
