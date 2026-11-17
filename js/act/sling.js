/* =========================================================
   SAPAN — hayvanı sapana oturt, parmakla geri çek, bırak!
   Uçan hayvan renkli balonları patlatır; balonun rengi söylenir.
   Küçük eller için kolaylık: bir balona dokunmak da otomatik atış yapar.
   ========================================================= */
G.activities.sling = () => {
  const { $, $$, rand, shuffle, TR, EN } = G;
  const id = G.newFlow();
  const AMMO = [
    { e: '🐱', snd: 'kitten', tr: 'Kedi', en: 'Kitty' },
    { e: '🐶', snd: 'dog', tr: 'Köpek', en: 'Puppy' },
    { e: '🐥', snd: 'chick', tr: 'Civciv', en: 'Chick' },
    { e: '🐼', snd: null, tr: 'Panda', en: 'Panda' },
    { e: '🐸', snd: 'frog', tr: 'Kurbağa', en: 'Frog' }
  ];
  const root = G.screen('sling', G.topbar(`${pic('🎯', 'title-ic')} Sapan <small>Slingshot</small>`,
    `<div class="counter" id="score"><b>0</b>${pic('🎈')}</div>`) + `
    <canvas id="cv"></canvas>
    <div class="ammo-pick">${AMMO.map((a, i) => `<button class="cp ${i === 0 ? 'on' : ''}" data-i="${i}">${pic(a.e)}</button>`).join('')}</div>
    <div class="sling-hint" id="hint">${pic('👆')}<span>Geri çek ve bırak! · Pull back and let go!</span></div>`);
  G.bindHome(root);

  const cv = $('#cv'), ctx = cv.getContext('2d');
  let W = 0, H = 0, S = 1, DPR = 1;
  const load = (src) => { const im = new Image(); im.src = src; return im; };
  const images = {};
  AMMO.forEach(a => { images[a.e] = load(imgSrc(a.e)); });
  const cloudImg = load(imgSrc('☁️')), sunImg = load(imgSrc('☀️'));
  const balloonImgs = {};
  COLORS.forEach(c => { balloonImgs[c.key] = load(tintSrc('balloon', c.key)); });

  let ammo = AMMO[0];
  let level = 1, score = 0;
  let balloons = [], parts = [], clouds = [];
  // mermi (hayvan) durumu: 'rest' | 'drag' | 'fly' | 'done'
  const P = { x: 0, y: 0, vx: 0, vy: 0, r: 40, state: 'rest', rot: 0, still: 0 };

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = Math.max(0.55, Math.min(W / 1100, H / 650));
    P.r = 42 * S;
    if (P.state === 'rest') resetShot();
  }
  const ground = () => H * 0.86;
  const fork = () => ({ x: W * 0.18, y: ground() - 175 * S });

  function resetShot() {
    const f = fork();
    P.x = f.x; P.y = f.y + 8 * S; P.vx = P.vy = 0; P.rot = 0; P.state = 'rest'; P.still = 0;
  }

  function makeBalloons() {
    const n = Math.min(3 + level, 7);
    const cols = shuffle(COLORS).slice(0, n);
    balloons = cols.map((c, i) => ({
      c, x: W * (0.5 + 0.42 * Math.random()), y: H * (0.18 + 0.5 * Math.random()),
      r: 46 * S, ph: Math.random() * 6, drift: level > 1 ? (Math.random() * 2 - 1) * 30 * S : 0, alive: true
    }));
    // üst üste binmesin
    for (let k = 0; k < 40; k++) for (const a of balloons) for (const b of balloons) {
      if (a === b) continue;
      const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
      if (d < a.r * 2.3) { a.x = Math.min(W * 0.93, Math.max(W * 0.48, a.x + dx / (d || 1) * 10)); a.y = Math.min(H * 0.7, Math.max(H * 0.15, a.y + dy / (d || 1) * 10)); }
    }
  }

  clouds = [0, 1, 2, 3].map(i => ({ x: Math.random(), y: 0.08 + Math.random() * 0.22, s: 0.7 + Math.random() * 0.6, v: 0.006 + Math.random() * 0.01 }));

  /* ---------- Çizim ---------- */
  function drawBg(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5ec8ff'); g.addColorStop(0.7, '#bff0ff'); g.addColorStop(1, '#e8fbff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (sunImg.complete) { const s = 130 * S; ctx.save(); ctx.translate(W * 0.88, H * 0.13); ctx.rotate(t * 0.1); ctx.drawImage(sunImg, -s / 2, -s / 2, s, s); ctx.restore(); }
    clouds.forEach(c => {
      c.x += c.v / 60; if (c.x > 1.2) c.x = -0.2;
      const s = 140 * S * c.s;
      if (cloudImg.complete) ctx.drawImage(cloudImg, c.x * W - s / 2, c.y * H - s / 2, s, s * 0.8);
    });
    // tepeler
    const hill = (yb, amp, col, ph) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, yb - Math.sin(x / W * Math.PI * 2 + ph) * amp - amp);
      ctx.lineTo(W, H); ctx.fill();
    };
    hill(ground() - 10 * S, 40 * S, '#9be28a', 0.5);
    hill(ground() + 5 * S, 22 * S, '#6ccf5b', 2.2);
    const gg = ctx.createLinearGradient(0, ground(), 0, H);
    gg.addColorStop(0, '#4fbf3f'); gg.addColorStop(1, '#2f8f2a');
    ctx.fillStyle = gg; ctx.fillRect(0, ground(), W, H - ground());
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let x = 0; x < W; x += 40 * S) ctx.fillRect(x, ground(), 20 * S, H - ground());
  }

  function drawSlingBack() {
    const f = fork(), gy = ground();
    const wood = ctx.createLinearGradient(f.x - 20 * S, 0, f.x + 20 * S, 0);
    wood.addColorStop(0, '#8b5a2b'); wood.addColorStop(0.5, '#c68642'); wood.addColorStop(1, '#7a4a20');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5a3412'; ctx.lineWidth = 30 * S;
    ctx.beginPath(); ctx.moveTo(f.x, gy + 5 * S); ctx.lineTo(f.x, f.y + 70 * S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.x, f.y + 70 * S); ctx.lineTo(f.x - 36 * S, f.y); ctx.moveTo(f.x, f.y + 70 * S); ctx.lineTo(f.x + 36 * S, f.y); ctx.stroke();
    ctx.strokeStyle = wood; ctx.lineWidth = 22 * S;
    ctx.beginPath(); ctx.moveTo(f.x, gy + 5 * S); ctx.lineTo(f.x, f.y + 70 * S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(f.x, f.y + 70 * S); ctx.lineTo(f.x - 36 * S, f.y); ctx.moveTo(f.x, f.y + 70 * S); ctx.lineTo(f.x + 36 * S, f.y); ctx.stroke();
    // arka lastik
    if (P.state === 'rest' || P.state === 'drag') {
      ctx.strokeStyle = '#7a1f1f'; ctx.lineWidth = 9 * S;
      ctx.beginPath(); ctx.moveTo(f.x + 36 * S, f.y); ctx.lineTo(P.x + P.r * 0.6, P.y); ctx.stroke();
    }
  }
  function drawSlingFront() {
    const f = fork();
    if (P.state === 'rest' || P.state === 'drag') {
      ctx.strokeStyle = '#a32929'; ctx.lineWidth = 9 * S; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(f.x - 36 * S, f.y); ctx.lineTo(P.x - P.r * 0.6, P.y); ctx.stroke();
      // deri cep
      ctx.fillStyle = '#4a2a10';
      ctx.beginPath(); ctx.ellipse(P.x - P.r * 0.55, P.y, 12 * S, 22 * S, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawAmmo() {
    const im = images[ammo.e];
    const s = P.r * 2.2;
    ctx.save();
    ctx.translate(P.x, P.y);
    ctx.rotate(P.rot);
    ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 10 * S; ctx.shadowOffsetY = 6 * S;
    if (im.complete) ctx.drawImage(im, -s / 2, -s / 2, s, s);
    ctx.restore();
  }

  function drawPreview() {
    if (P.state !== 'drag') return;
    const f = fork();
    let x = P.x, y = P.y, vx = (f.x - P.x) * POWER, vy = (f.y - P.y) * POWER;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < 26; i++) {
      for (let k = 0; k < 3; k++) { vy += GRAV() * 0.016; x += vx * 0.016; y += vy * 0.016; }
      if (y > ground()) break;
      ctx.beginPath(); ctx.arc(x, y, Math.max(2, (6 - i * 0.18)) * S, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawBalloons(t) {
    balloons.forEach(b => {
      if (!b.alive) return;
      b.x += b.drift / 60;
      if (b.x < W * 0.45 || b.x > W * 0.95) b.drift *= -1;
      const y = b.y + Math.sin(t * 1.6 + b.ph) * 10 * S;
      b.cy = y;
      const im = balloonImgs[b.c.key], s = b.r * 2.4;
      if (im.complete) ctx.drawImage(im, b.x - s / 2, y - s * 0.42, s, s);
    });
  }

  function drawParts(dt) {
    parts = parts.filter(p => (p.life -= dt) > 0);
    parts.forEach(p => {
      p.vy += 600 * S * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- Fizik ---------- */
  const POWER = 7.2;
  const GRAV = () => 950 * S;

  function popBalloon(b) {
    b.alive = false;
    Sounds.pop();
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, v = (150 + Math.random() * 350) * S;
      parts.push({ x: b.x, y: b.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150 * S, r: (4 + Math.random() * 6) * S, c: Math.random() < 0.7 ? b.c.hex : '#fff', life: 1, max: 1 });
    }
    score++;
    const sc = $('#score b'); if (sc) { sc.textContent = score; G.anim($('#score'), 'boom'); }
    Speech.cancel();
    Speech.seq([{ t: b.c.tr + '!', l: TR, pitch: 1.3 }, 80, { t: b.c.en + '!', l: EN, pitch: 1.3 }]);
    if (balloons.every(x => !x.alive)) {
      setTimeout(() => {
        if (!G.alive(id)) return;
        G.celebrate({ big: true });
        level++;
        setTimeout(() => G.alive(id) && makeBalloons(), 2500);
      }, 700);
    }
  }

  function physics(dt) {
    if (P.state !== 'fly') return;
    P.vy += GRAV() * dt;
    P.x += P.vx * dt; P.y += P.vy * dt;
    P.rot += P.vx * dt * 0.012;
    balloons.forEach(b => {
      if (b.alive && b.cy != null && Math.hypot(P.x - b.x, P.y - b.cy) < P.r + b.r * 0.9) popBalloon(b);
    });
    if (P.y > ground() - P.r * 0.8) {
      P.y = ground() - P.r * 0.8;
      if (Math.abs(P.vy) > 120 * S) Sounds.tap();
      P.vy *= -0.45; P.vx *= 0.75;
    }
    if (Math.abs(P.vx) < 20 * S && Math.abs(P.vy) < 40 * S) P.still += dt;
    if (P.x > W + 150 || P.x < -150 || P.still > 0.6) {
      P.state = 'done';
      setTimeout(() => { if (G.alive(id)) { resetShot(); Sounds.whoosh(); } }, 400);
    }
  }

  function launch(vx, vy) {
    P.vx = vx; P.vy = vy; P.state = 'fly';
    Sounds.whoosh();
    if (ammo.snd) AnimalSounds.play(ammo.snd);
    else Speech.say('Wiii!', TR, { pitch: 2 });
    $('#hint').classList.add('hide');
  }

  /* ---------- Dokunma ---------- */
  let dragId = null;
  cv.addEventListener('pointerdown', (e) => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (P.state === 'rest' && Math.hypot(x - P.x, y - P.y) < P.r * 2.2) {
      P.state = 'drag'; dragId = e.pointerId; cv.setPointerCapture(dragId);
      Sounds.tap();
      return;
    }
    // Kolay mod: balona dokununca otomatik nişan alıp at
    if (P.state === 'rest') {
      const b = balloons.find(b => b.alive && b.cy != null && Math.hypot(x - b.x, y - b.cy) < b.r * 1.3);
      if (b) {
        const T = 0.85, g = GRAV();
        const dx = b.x + b.drift * T - P.x, dy = b.cy - P.y;
        launch(dx / T, (dy - 0.5 * g * T * T) / T);
      }
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (P.state !== 'drag' || e.pointerId !== dragId) return;
    const r = cv.getBoundingClientRect(), f = fork();
    let dx = e.clientX - r.left - f.x, dy = e.clientY - r.top - f.y;
    const max = 150 * S, d = Math.hypot(dx, dy);
    if (d > max) { dx = dx / d * max; dy = dy / d * max; }
    P.x = f.x + dx; P.y = f.y + dy;
  });
  const release = (e) => {
    if (P.state !== 'drag' || e.pointerId !== dragId) return;
    const f = fork();
    const dx = f.x - P.x, dy = f.y - P.y;
    if (Math.hypot(dx, dy) < 20 * S) { resetShot(); return; }
    launch(dx * POWER, dy * POWER);
  };
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', release);

  $$('.cp', root).forEach(b => b.onclick = () => {
    Sounds.tap();
    ammo = AMMO[+b.dataset.i];
    $$('.cp', root).forEach(x => x.classList.toggle('on', x === b));
    if (ammo.snd) AnimalSounds.play(ammo.snd);
    Speech.seq([{ t: ammo.tr + '!', l: TR }, { t: ammo.en + '!', l: EN }]);
  });

  /* ---------- Döngü ---------- */
  let last = performance.now();
  function frame(now) {
    if (!G.alive(id)) return;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    physics(dt);
    drawBg(t);
    drawBalloons(t);
    drawSlingBack();
    drawPreview();
    if (P.state !== 'done' || true) drawAmmo();
    drawSlingFront();
    drawParts(dt);
    requestAnimationFrame(frame);
  }

  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  G.onLeave(() => window.removeEventListener('resize', onResize));
  resize();
  makeBalloons();
  requestAnimationFrame(frame);
  Speech.seq([{ t: 'Hayvanı geri çek ve bırak!', l: TR, pitch: 1.3 }, 150, { t: 'Pull back and let go!', l: EN, pitch: 1.3 }, 150,
    { t: 'Balonları patlat!', l: TR, pitch: 1.3 }]);
};
