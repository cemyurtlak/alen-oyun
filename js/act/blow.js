/* =========================================================
   BALONU ÜFLE — mikrofona üfledikçe balon şişer, sonunda patlar!
   Üfleme ağız-dudak kaslarını çalıştırır (konuşma ve yemek için faydalı).
   Mikrofon yoksa balona dokunarak şişirilir.
   ========================================================= */
G.activities.blow = () => {
  const { $, rand, wait, TR, EN } = G;
  const id = G.newFlow();
  const root = G.screen('blow', G.topbar(`${pic('🎈', 'title-ic')} Balonu Üfle <small>Blow It Up</small>`,
    `<div class="counter" id="cnt"><b>0</b>${pic('🎈')}</div>`) + `
    <div class="blow-stage">
      <div class="blow-meter"><div id="meter"></div></div>
      <button class="blow-balloon" id="bal"><img class="pic" id="bimg" alt="" draggable="false"></button>
      <div class="pump">${pic('🌬️')}</div>
      <div class="blow-tip" id="tip">${pic('😮')}<span>Fuuu! Üfle! · Blow!</span></div>
    </div>`);
  G.bindHome(root);

  let size = 0, color = rand(COLORS), count = 0, popping = false;
  const bal = $('#bal'), bimg = $('#bimg');

  function newBalloon() {
    let c;
    do { c = rand(COLORS); } while (c === color);
    color = c;
    size = 0;
    bimg.src = tintSrc('balloon', color.key);
    render();
    G.anim(bal, 'pop-in');
    Speech.seq([{ t: `${color.tr} balon!`, l: TR, pitch: 1.3 }, 100, { t: `${color.en} balloon!`, l: EN, pitch: 1.3 }]);
  }

  function render() {
    bal.style.setProperty('--s', 0.35 + size * 1.0);
    $('#meter').style.width = (size * 100) + '%';
  }

  async function pop() {
    if (popping) return;
    popping = true;
    Sounds.pop();
    G.burstAt(bal, ['✨', '⭐', '🎉'], 20);
    G.confetti(60);
    bal.classList.add('popped');
    count++;
    $('#cnt b').textContent = count;
    await G.celebrate({ extra: [{ t: 'Pat! Patladı!', l: TR }, { t: 'Pop!', l: EN }] });
    bal.classList.remove('popped');
    popping = false;
    if (G.alive(id)) newBalloon();
  }

  function grow(amount) {
    if (popping) return;
    size = Math.min(1, size + amount);
    render();
    if (size >= 1) pop();
  }

  bal.onclick = () => { Sounds.whoosh(); grow(0.12); G.anim(bal, 'puff'); };

  (async () => {
    newBalloon();
    await Speech.seq([300, { t: 'Balonu üfle! Fuuuu!', l: TR, pitch: 1.3 }, 150, { t: 'Blow the balloon!', l: EN, pitch: 1.3 }]);
    const ok = await Mic.ensure();
    if (!G.alive(id)) return;
    if (!ok) { $('#tip span').textContent = 'Balona dokun! · Tap the balloon!'; return; }
    // Üfleme döngüsü: ses seviyesi eşiği aşınca balon büyür, sessizlikte azıcık söner
    let base = 0.01;
    const t0 = performance.now();
    function tick() {
      if (!G.alive(id)) return;
      const l = Mic.level();
      if (performance.now() - t0 < 600) base = Math.max(base, l * 1.5);
      else if (!popping) {
        if (l > Math.max(0.035, base * 2.5)) { grow(Math.min(0.02, l * 0.06)); bal.classList.add('blowing'); }
        else { size = Math.max(0, size - 0.0015); render(); bal.classList.remove('blowing'); }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();
};
