/* =========================================================
   SAPAN (ileri atış) — sapan ekranın altında, çocuğun elinde gibi.
   Hayvanı parmakla GERİYE (kendine/aşağı doğru) çek, bırak:
   hayvan İLERİ, ekranın derinliğine uçar ve uzaktaki balonları patlatır.
   Sağa-sola çekince ters yöne nişan alır (gerçek sapan gibi).
   Küçük eller için: bir balona dokunmak da otomatik atış yapar.
   ========================================================= */
G.activities.sling = () => {
  const { $, $$, shuffle, TR, EN } = G;
  const id = G.newFlow();
  const AMMO = [
    { e: '🐱', snd: 'kitten', tr: 'Kedi', en: 'Kitty' },
    { e: '🐶', snd: 'dog', tr: 'Köpek', en: 'Puppy' },
    { e: '🐥', snd: 'chick', tr: 'Civciv', en: 'Chick' },
    { e: '🦆', snd: 'duck', tr: 'Ördek', en: 'Duck' },
    { e: '🐸', snd: 'frog', tr: 'Kurbağa', en: 'Frog' }
  ];
  const root = G.screen('sling', G.topbar(`${pic('🎯', 'title-ic')} Sapan <small>Slingshot</small>`,
    `<div class="counter" id="score"><b>0</b>${pic('🎈')}</div>`) + `
    <canvas id="cv"></canvas>
    <div class="ammo-pick">${AMMO.map((a, i) => `<button class="cp ${i === 0 ? 'on' : ''}" data-i="${i}">${pic(a.e)}</button>`).join('')}</div>
    <div class="sling-hint" id="hint">${pic('👆')}<span>${G.tx('Geri çek, bırak!', 'Pull back, let go!')}</span></div>`);
  G.bindHome(root);

  const cv = $('#cv'), ctx = cv.getContext('2d');
  const load = (src) => { const im = new Image(); im.src = src; return im; };
  const images = {};
  AMMO.forEach(a => { images[a.e] = load(imgSrc(a.e)); });
  const balloonImgs = {};
  COLORS.forEach(c => { balloonImgs[c.key] = load(tintSrc('balloon', c.key)); });
  const decoImgs = ['🌳', '🌲', '🌻', '🌷', '🌳'].map(e => load(imgSrc(e)));
  const cloudImg = load(imgSrc('☁️')), sunImg = load(imgSrc('☀️'));

  let W = 0, H = 0, DPR = 1, F = 600;          // F: odak uzaklığı (px)
  const CAM_H = 1.5, G_ACC = 9.8;              // kamera yüksekliği (m), yer çekimi
  let ammo = AMMO[0], level = 1, score = 0;
  let balloons = [], parts = [], deco = [];
  // mermi (dünya koordinatı, metre): x sağ, y yukarı, z ileri
  const P = { x: 0, y: 1.1, z: 1.2, vx: 0, vy: 0, vz: 0, rot: 0, state: 'rest' };
  let drag = { dx: 0, dy: 0 };

  const horizon = () => H * 0.42;
  // 3B → ekran
  function proj(x, y, z) {
    const zz = Math.max(0.35, z);
    return { sx: W / 2 + (x / zz) * F, sy: horizon() - ((y - CAM_H) / zz) * F, s: F / zz };
  }
  // sapan cebinin ekrandaki yeri (dinlenme)
  const pouch = () => ({ x: W / 2, y: H * 0.78 });

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    F = Math.min(W, H * 1.4) * 0.9;
  }

  function makeLevel() {
    const n = Math.min(3 + level, 7);
    const cols = shuffle(COLORS.filter(c => c.key !== 'white')).slice(0, n);
    balloons = cols.map((c, i) => ({
      c, x: (i - (n - 1) / 2) * 2.2 + (Math.random() - 0.5), y: 2.2 + Math.random() * 3.2,
      z: 10 + Math.random() * 12, r: 0.95, ph: Math.random() * 6, alive: true,
      drift: level > 2 ? (Math.random() - 0.5) * 1.2 : 0
    }));
    deco = Array.from({ length: 14 }, () => ({
      img: decoImgs[Math.floor(Math.random() * decoImgs.length)],
      x: (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 14), z: 18 + Math.random() * 45, h: 1.5 + Math.random() * 2.5
    })).sort((a, b) => b.z - a.z);
  }

  function resetShot() {
    P.x = 0; P.y = 1.1; P.z = 1.2; P.vx = P.vy = P.vz = 0; P.rot = 0; P.state = 'rest';
    drag = { dx: 0, dy: 0 };
  }

  /* ---------- Çizim ---------- */
  function drawWorld(t) {
    const hz = horizon();
    let g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, '#45b8ff'); g.addColorStop(1, '#c9f1ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 1);
    if (sunImg.complete) { const s = Math.min(W, H) * 0.16; ctx.drawImage(sunImg, W * 0.84 - s / 2, hz * 0.25 - s / 2, s, s); }
    if (cloudImg.complete) for (let i = 0; i < 4; i++) {
      const s = Math.min(W, H) * (0.14 + i * 0.02), x = ((t * 12 + i * 330) % (W + 300)) - 150;
      ctx.drawImage(cloudImg, x, hz * (0.12 + i * 0.14), s, s * 0.8);
    }
    // uzak tepeler
    ctx.fillStyle = '#8fdc7a';
    ctx.beginPath(); ctx.moveTo(0, hz);
    for (let x = 0; x <= W; x += 16) ctx.lineTo(x, hz - 18 - Math.sin(x / W * 7) * 14);
    ctx.lineTo(W, hz); ctx.fill();
    // zemin (perspektifli çim şeritleri)
    g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, '#6fd35b'); g.addColorStop(1, '#2f9e2a');
    ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2;
    for (let z = 2; z < 60; z *= 1.35) { const p = proj(0, 0, z); ctx.beginPath(); ctx.moveTo(0, p.sy); ctx.lineTo(W, p.sy); ctx.stroke(); }
    for (let x = -30; x <= 30; x += 3) { const a = proj(x, 0, 1.2), b = proj(x, 0, 80); ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke(); }
    // ağaçlar / çiçekler
    deco.forEach(d => {
      const p = proj(d.x, 0, d.z), s = d.h * p.s;
      if (d.img.complete) ctx.drawImage(d.img, p.sx - s / 2, p.sy - s, s, s);
    });
  }

  function drawBalloons(t) {
    balloons.filter(b => b.alive).sort((a, b) => b.z - a.z).forEach(b => {
      b.x += b.drift / 60;
      if (Math.abs(b.x) > 7) b.drift *= -1;
      b.cy = b.y + Math.sin(t * 1.5 + b.ph) * 0.25;
      const p = proj(b.x, b.cy, b.z), s = b.r * 2.6 * p.s;
      const im = balloonImgs[b.c.key];
      if (im.complete) ctx.drawImage(im, p.sx - s / 2, p.sy - s * 0.42, s, s);
    });
  }

  function drawSling(behind) {
    const p0 = pouch(), s = Math.min(W, H) / 700;
    const lx = p0.x - 95 * s, rx = p0.x + 95 * s, topY = p0.y - 70 * s;
    if (behind) {
      // sapan gövdesi (Y), ekranın altından yükselir
      const wood = ctx.createLinearGradient(p0.x - 40 * s, 0, p0.x + 40 * s, 0);
      wood.addColorStop(0, '#7a4a20'); wood.addColorStop(0.5, '#d08b45'); wood.addColorStop(1, '#6e3f18');
      ctx.lineCap = 'round';
      [['#4a2a10', 46], [wood, 34]].forEach(([col, w]) => {
        ctx.strokeStyle = col; ctx.lineWidth = w * s;
        ctx.beginPath(); ctx.moveTo(p0.x, H + 20); ctx.lineTo(p0.x, p0.y + 80 * s);
        ctx.moveTo(p0.x, p0.y + 80 * s); ctx.lineTo(lx, topY);
        ctx.moveTo(p0.x, p0.y + 80 * s); ctx.lineTo(rx, topY); ctx.stroke();
      });
    }
    if (P.state === 'rest' || P.state === 'drag') {
      const ax = p0.x + drag.dx, ay = p0.y + drag.dy;
      ctx.strokeStyle = behind ? '#8f1d1d' : '#c92a2a'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
      ctx.beginPath();
      if (behind) { ctx.moveTo(rx, topY); ctx.lineTo(ax + 30 * s, ay); }
      else { ctx.moveTo(lx, topY); ctx.lineTo(ax - 30 * s, ay); }
      ctx.stroke();
      if (!behind) {
        ctx.fillStyle = '#4a2a10';
        ctx.beginPath(); ctx.ellipse(ax, ay + 30 * s, 48 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawAmmo() {
    const im = images[ammo.e];
    if (!im.complete) return;
    let x, y, size;
    if (P.state === 'rest' || P.state === 'drag') {
      const p0 = pouch(), s = Math.min(W, H) / 700;
      x = p0.x + drag.dx; y = p0.y + drag.dy; size = 150 * s * (1 + Math.min(1, drag.dy / 200) * 0.15);
    } else {
      const p = proj(P.x, P.y, P.z);
      x = p.sx; y = p.sy; size = 1.1 * p.s;
      // gölge
      const sh = proj(P.x, 0, P.z);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.beginPath(); ctx.ellipse(sh.sx, sh.sy, size * 0.35, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(P.rot);
    ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    ctx.drawImage(im, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  // Nişan çizgisi (atış yolunun önizlemesi)
  function drawPreview() {
    if (P.state !== 'drag') return;
    const v = launchVel();
    let x = P.x, y = P.y, z = P.z, vx = v.vx, vy = v.vy, vz = v.vz;
    for (let i = 0; i < 40; i++) {
      for (let k = 0; k < 2; k++) { vy -= G_ACC * 0.02; x += vx * 0.02; y += vy * 0.02; z += vz * 0.02; }
      if (y < 0) break;
      const p = proj(x, y, z);
      ctx.fillStyle = `rgba(255,255,255,${0.95 - i * 0.02})`;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, Math.max(2, 0.09 * p.s), 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawParts(dt) {
    parts = parts.filter(p => (p.life -= dt) > 0);
    parts.forEach(p => {
      p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- Fizik ---------- */
  const MAXPULL = () => Math.min(W, H) * 0.32;
  // Geri çekme miktarından fırlatma hızı: aşağı çek = ileri + yukarı, sola çek = sağa
  function launchVel() {
    const m = MAXPULL();
    const back = Math.max(0, drag.dy) / m;            // 0..1
    const side = -drag.dx / m;                        // ters yöne
    return { vz: 8 + back * 22, vy: 2.5 + back * 6, vx: side * 9 };
  }

  function popBalloon(b) {
    b.alive = false;
    Sounds.pop();
    const p = proj(b.x, b.cy, b.z);
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 280;
      parts.push({ x: p.sx, y: p.sy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, r: 3 + Math.random() * 6,
        c: Math.random() < 0.75 ? b.c.hex : '#fff', life: 0.9, max: 0.9 });
    }
    score++;
    const sc = $('#score b'); if (sc) { sc.textContent = score; G.anim($('#score'), 'boom'); }
    if (!Speech.busy()) Speech.seq(G.both(b.c.tr + '!', b.c.en + '!'));
    if (balloons.every(x => !x.alive)) {
      setTimeout(() => {
        if (!G.alive(id)) return;
        G.celebrate({ big: true });
        level++;
        setTimeout(() => G.alive(id) && makeLevel(), 2000);
      }, 500);
    }
  }

  function physics(dt) {
    if (P.state !== 'fly') return;
    P.vy -= G_ACC * dt;
    P.x += P.vx * dt; P.y += P.vy * dt; P.z += P.vz * dt;
    P.rot += dt * 7;
    balloons.forEach(b => {
      if (b.alive && b.cy != null && Math.abs(P.z - b.z) < 1.1 && Math.hypot(P.x - b.x, P.y - b.cy) < b.r + 0.55) popBalloon(b);
    });
    if (P.y < 0.3 || P.z > 70) {
      P.state = 'done';
      setTimeout(() => { if (G.alive(id)) { resetShot(); Sounds.whoosh(); } }, 450);
    }
  }

  function fire(v) {
    P.x = 0; P.y = 1.1; P.z = 1.2;
    P.vx = v.vx; P.vy = v.vy; P.vz = v.vz; P.state = 'fly';
    drag = { dx: 0, dy: 0 };
    Sounds.whoosh();
    if (ammo.snd) AnimalSounds.play(ammo.snd);
    else Speech.say('Wiii!', TR);
    $('#hint').classList.add('hide');
  }

  /* ---------- Dokunma ---------- */
  let dragId = null, sx = 0, sy = 0;
  cv.addEventListener('pointerdown', (e) => {
    if (P.state !== 'rest') return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top, p0 = pouch();
    if (Math.hypot(x - p0.x, y - p0.y) < Math.min(W, H) * 0.2) {
      P.state = 'drag'; dragId = e.pointerId; cv.setPointerCapture(dragId);
      sx = e.clientX; sy = e.clientY;
      Sounds.tap();
      return;
    }
    // Kolay mod: balona dokununca otomatik nişan
    const hit = balloons.filter(b => b.alive && b.cy != null).find(b => {
      const p = proj(b.x, b.cy, b.z);
      return Math.hypot(x - p.sx, y - p.sy) < b.r * 1.6 * p.s;
    });
    if (hit) {
      const T = 0.9;
      fire({ vx: (hit.x - 0) / T, vz: (hit.z - 1.2) / T, vy: (hit.cy - 1.1 + 0.5 * G_ACC * T * T) / T });
    }
  });
  cv.addEventListener('pointermove', (e) => {
    if (P.state !== 'drag' || e.pointerId !== dragId) return;
    let dx = e.clientX - sx, dy = e.clientY - sy;
    const m = MAXPULL(), d = Math.hypot(dx, dy);
    if (d > m) { dx = dx / d * m; dy = dy / d * m; }
    drag = { dx, dy: Math.max(-m * 0.2, dy) };
  });
  const release = (e) => {
    if (P.state !== 'drag' || e.pointerId !== dragId) return;
    if (drag.dy < MAXPULL() * 0.12) { P.state = 'rest'; drag = { dx: 0, dy: 0 }; return; }
    fire(launchVel());
  };
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', release);

  $$('.cp', root).forEach(b => b.onclick = () => {
    Sounds.tap();
    ammo = AMMO[+b.dataset.i];
    $$('.cp', root).forEach(x => x.classList.toggle('on', x === b));
    if (ammo.snd) AnimalSounds.play(ammo.snd);
    else Speech.seq(G.both(ammo.tr + '!', ammo.en + '!'));
  });

  /* ---------- Döngü ---------- */
  let last = performance.now();
  function frame(now) {
    if (!G.alive(id)) return;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    physics(dt);
    drawWorld(t);
    drawBalloons(t);
    if (P.state === 'fly' || P.state === 'done') { drawSling(true); drawSling(false); drawAmmo(); }
    else { drawPreview(); drawSling(true); drawAmmo(); drawSling(false); }
    drawParts(dt);
    requestAnimationFrame(frame);
  }

  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  G.onLeave(() => window.removeEventListener('resize', onResize));
  resize();
  makeLevel();
  requestAnimationFrame(frame);
  Speech.seq([...G.both('Hayvanı geri çek ve bırak!', 'Pull back and let go!'), 150, ...G.both('Balonları patlat!', 'Pop the balloons!')]);
};
