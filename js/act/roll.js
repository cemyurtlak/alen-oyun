/* =========================================================
   TOP YUVARLA — yukarıdaki sepette renkli toplar. Topa dokununca
   zikzak rampalardan dönerek, "gürül gürül" ses çıkararak aşağı yuvarlanır;
   her rampadan düşüşte "tok" sesi, en altta kutuya düşünce rengi söylenir.
   6 top inince kutlama; toplar yeniden sepete gelir.
   ========================================================= */
G.activities.roll = () => {
  const { $, $$, shuffle, wait } = G;
  const id = G.newFlow();
  const BALL_COLORS = COLORS.filter(c => ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'].includes(c.key));
  const N = 6, RAMPS = 4;
  Speech.preload(BALL_COLORS.map(c => [c.tr + '!', 'tr-TR']).concat(BALL_COLORS.map(c => [c.en + '!', 'en-US'])));

  const root = G.screen('rollgame', G.topbar(`${pic('⚽', 'title-ic')} Top Yuvarla <small>Roll the Ball</small>`) + `
    <div class="roll-stage" id="stage">
      <div class="roll-basket" id="basket"></div>
      <div class="roll-box" id="box"></div>
    </div>`);
  G.bindHome(root);
  const stage = $('#stage');

  // Rampa geometrisi (sahne boyutuna göre): i. rampa soldan sağa ya da sağdan sola iner
  let geo = null;
  function layout() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const r = Math.max(18, Math.min(W, H) * 0.055);
    const top = H * 0.24, gapY = (H * 0.78 - top) / RAMPS, drop = gapY * 0.32;
    const xl = W * 0.08, xr = W * 0.92;
    const ramps = [];
    for (let i = 0; i < RAMPS; i++) {
      const y0 = top + i * gapY, ltr = i % 2 === 0;
      ramps.push({ x0: ltr ? xl : xr, y0, x1: ltr ? xr - W * 0.1 : xl + W * 0.1, y1: y0 + drop, ltr });
    }
    geo = { W, H, r, ramps, boxY: H * 0.93 };
    $$('.ramp', stage).forEach(e => e.remove());
    ramps.forEach(rp => {
      const el = document.createElement('div');
      el.className = 'ramp';
      const len = Math.hypot(rp.x1 - rp.x0, rp.y1 - rp.y0), ang = Math.atan2(rp.y1 - rp.y0, rp.x1 - rp.x0);
      el.style.width = len + 'px';
      el.style.left = rp.x0 + 'px';
      el.style.top = rp.y0 + 'px';
      el.style.transform = `rotate(${ang}rad)`;
      stage.appendChild(el);
    });
  }

  let inBox = 0, round = 0, queue = Promise.resolve(), pending = 0;
  function enqueue(job, force) {
    if (pending >= 4 && !force) return;
    pending++;
    queue = queue.then(async () => { try { if (G.alive(id)) await job(); } catch (e) { /* yoksay */ } pending--; });
  }

  function fillBasket() {
    inBox = 0;
    round++;
    $('#box').innerHTML = '';
    const cols = shuffle(BALL_COLORS).slice(0, N);
    $('#basket').innerHTML = cols.map((c, i) => `<button class="rball" data-i="${i}" style="--c:${c.hex}"><span></span></button>`).join('');
    $$('.rball', root).forEach((b, i) => { b.onclick = () => launch(b, cols[i]); });
  }

  // Yolu adım adım oynat: rampa boyunca yuvarlan (dönerek), sonraki rampaya düş
  async function launch(btn, c) {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.style.visibility = 'hidden';
    const { r, ramps, boxY, W } = geo;
    const ball = document.createElement('div');
    ball.className = 'rolling';
    ball.style.setProperty('--c', c.hex);
    ball.style.width = ball.style.height = r * 2 + 'px';
    ball.innerHTML = '<span></span>';
    stage.appendChild(ball);
    let x = ramps[0].x0 + (ramps[0].ltr ? r : -r), y = ramps[0].y0 - r * 1.6, rot = 0;
    const place = () => { ball.style.transform = `translate(${x - r}px, ${y - r}px) rotate(${rot}deg)`; };
    place();
    const r0 = round;
    const tween = (x2, y2, ms, spin) => new Promise(res => {
      const xs = x, ys = y, t0 = performance.now(), d = Math.hypot(x2 - xs, y2 - ys);
      const step = (now) => {
        if (!G.alive(id)) return res();
        const k = Math.min(1, (now - t0) / ms);
        const e = spin ? k : k * k; // rampada sabit, düşerken hızlanarak
        x = xs + (x2 - xs) * e; y = ys + (y2 - ys) * e;
        if (spin) rot = (spin > 0 ? 1 : -1) * (d * e) / r * (180 / Math.PI) + rot0;
        place();
        if (k < 1) requestAnimationFrame(step); else res();
      };
      const rot0 = rot;
      requestAnimationFrame(step);
    });
    for (let i = 0; i < ramps.length; i++) {
      const rp = ramps[i];
      const sx = rp.x0 + (rp.ltr ? r * 0.6 : -r * 0.6), sy = rp.y0 - r + (rp.y1 - rp.y0) * 0.03;
      await tween(sx, sy, i === 0 ? 260 : 300, 0);           // rampaya düş
      if (!G.alive(id)) return;
      Sounds.thud();
      const ms = 1100;
      const snd = Sounds.roll(ms / 1000);
      await tween(rp.x1, rp.y1 - r, ms, rp.ltr ? 1 : -1);     // dönerek yuvarlan
      snd.stop();
      if (!G.alive(id)) return;
    }
    // kutuya düş
    const slot = inBox++;
    await tween(W / 2 + (slot - (N - 1) / 2) * r * 1.6, boxY - r, 380, 0);
    if (!G.alive(id)) return;
    Sounds.thud();
    ball.remove();
    $('#box').insertAdjacentHTML('beforeend', `<div class="rball in" style="--c:${c.hex}"><span></span></div>`);
    G.anim($('#box'), 'boom');
    enqueue(async () => { if (r0 === round) await Speech.seq(G.both(c.tr + '!', c.en + '!')); });
    if (inBox >= N) {
      enqueue(async () => {
        if (r0 !== round) return;
        await Promise.race([G.celebrate(), wait(4000)]);
        if (G.alive(id)) fillBasket();
      }, true);
    }
  }

  layout();
  fillBasket();
  const onResize = () => { if (G.alive(id)) layout(); };
  window.addEventListener('resize', onResize);
  G.onLeave(() => window.removeEventListener('resize', onResize));
};
