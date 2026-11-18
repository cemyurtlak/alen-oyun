/* =========================================================
   BALON PATLAT — renkli balonlar aşağıdan sürekli uçar,
   dokununca patlar. Bazı balonlarda sürpriz hayvan vardır.
   Patlayan balonun rengi söylenir (konuşma bitmeden yenisi binmez).
   ========================================================= */
G.activities.pop = () => {
  const { $, rand, TR, EN } = G;
  const id = G.newFlow();
  const FRIENDS = [
    { e: '🐱', snd: 'kitten' }, { e: '🐶', snd: 'dog' }, { e: '🐥', snd: 'chick' },
    { e: '🐮', snd: 'cow' }, { e: '🐸', snd: 'frog' }, { e: '🐑', snd: 'sheep' }
  ];
  AnimalSounds.preload(FRIENDS.map(x => x.snd).filter(Boolean)); // ilk dokunuşta gecikme olmasın
  const root = G.screen('popgame', G.topbar(`${pic('🎈', 'title-ic')} Balon Patlat <small>Pop Balloons</small>`,
    `<div class="counter" id="cnt"><b>0</b>${pic('🎈')}</div>`) + `
    <div class="pop-field" id="field"></div>`);
  G.bindHome(root);
  const field = $('#field');
  const balloons = [];
  let count = 0, nextSpawn = 0, last = performance.now();

  Speech.seq(G.both('Balonları patlat!', 'Pop the balloons!'));

  function spawn() {
    const c = rand(COLORS);
    const size = 130 + Math.random() * 90;                         // px
    const el = document.createElement('button');
    el.className = 'pballoon';
    const friend = Math.random() < 0.18 ? rand(FRIENDS) : null;
    el.innerHTML = `<img class="pic" src="${tintSrc('balloon', c.key)}" alt="" draggable="false">` +
      (friend ? `<div class="rider">${pic(friend.e)}</div>` : '');
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    field.appendChild(el);
    const b = {
      el, c, friend, size,
      x: 0.06 + Math.random() * 0.88, y: field.clientHeight + size,
      vy: 70 + Math.random() * 70 + Math.min(count, 40) * 1.2,      // px/sn seyir hızı — patlattıkça biraz hızlanır
      age: 0,
      ph: Math.random() * 6, sway: 18 + Math.random() * 22, dead: false
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (b.y > field.clientHeight - b.size * 0.6) return; // balon henüz görünmüyor
      popIt(b);
    });
    balloons.push(b);
  }

  function popIt(b) {
    if (b.dead) return;
    b.dead = true;
    Sounds.pop();
    const r = b.el.getBoundingClientRect();
    // renkli parçacıklar
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('div');
      d.className = 'shard';
      d.style.background = b.c.hex === '#ffffff' ? '#e9ecef' : b.c.hex;
      d.style.left = (r.left + r.width / 2) + 'px';
      d.style.top = (r.top + r.height * 0.4) + 'px';
      const a = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 120;
      d.style.setProperty('--tx', Math.cos(a) * dist + 'px');
      d.style.setProperty('--ty', Math.sin(a) * dist + 'px');
      G.fx.appendChild(d);
      setTimeout(() => d.remove(), 700);
    }
    b.el.classList.add('popped');
    setTimeout(() => b.el.remove(), 250);
    count++;
    const cnt = $('#cnt b');
    if (cnt) { cnt.textContent = count; G.anim($('#cnt'), 'boom'); }
    if (b.friend) {
      // sürpriz hayvan aşağı süzülür ve sesini çıkarır
      const f = document.createElement('div');
      f.className = 'falling-friend';
      f.innerHTML = pic(b.friend.e);
      f.style.left = (r.left + r.width / 2) + 'px';
      f.style.top = (r.top + r.height * 0.5) + 'px';
      G.fx.appendChild(f);
      setTimeout(() => f.remove(), 2600);
      AnimalSounds.play(b.friend.snd);
    } else if (!Speech.busy()) {
      Speech.seq(G.both(b.c.tr + '!', b.c.en + '!'));
    }
    if (count % 15 === 0) {
      setTimeout(() => { if (G.alive(id)) { G.confetti(90); Sounds.applause(1.6); } }, 300);
    }
  }

  function loop(now) {
    if (!G.alive(id)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    nextSpawn -= dt;
    if (nextSpawn <= 0 && balloons.length < 9) { spawn(); nextSpawn = 0.55 + Math.random() * 0.6; }
    const W = field.clientWidth;
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      if (b.dead) { balloons.splice(i, 1); continue; }
      // Giriş: balon alttan hızlı fırlar (ekranın ~%40'ı kadar), sonra yavaşlayıp seyir hızına iner.
      // Böylece çocuk balonu ekrana çıkmadan önce kenarda patlatamaz.
      b.age += dt;
      const H = field.clientHeight;
      b.y -= (b.vy + H * 1.2 * Math.exp(-b.age * 3)) * dt;
      b.ph += dt * 1.6;
      const x = b.x * W + Math.sin(b.ph) * b.sway - b.size / 2;
      b.el.style.transform = `translate(${x}px, ${b.y}px) rotate(${Math.sin(b.ph) * 6}deg)`;
      if (b.y < -b.size * 1.6) { b.el.remove(); balloons.splice(i, 1); }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
};
