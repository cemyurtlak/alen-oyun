/* =========================================================
   ÇEKİÇ OYUNU — tahta sıranın üstünde delikler, deliklerin üstünde renkli toplar.
   Topa dokununca çekiç iner, top "tok" diye deliğe düşer ve rengi söylenir.
   Hepsi düşünce kutlama; sıra ters çevrilir, toplar yeni renklerle yeniden çıkar.
   ========================================================= */
G.activities.pegs = () => {
  const { $, $$, shuffle, wait } = G;
  const id = G.newFlow();
  const BALL_COLORS = COLORS.filter(c => ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink'].includes(c.key));
  const N = 5;
  Speech.preload(BALL_COLORS.map(c => [c.tr + '!', 'tr-TR']).concat(BALL_COLORS.map(c => [c.en + '!', 'en-US'])));

  const root = G.screen('pegs', G.topbar(`${pic('🔨', 'title-ic')} Çekiç Oyunu <small>Hammer Time</small>`) + `
    <div class="peg-stage">
      <div class="bench" id="bench"></div>
      <img class="hammer" id="hammer" src="${imgSrc('🔨')}" alt="" draggable="false">
    </div>`);
  G.bindHome(root);

  let down = 0, round = 0;
  let queue = Promise.resolve(), pending = 0;
  function enqueue(job, force) {
    if (pending >= 4 && !force) return;
    pending++;
    queue = queue.then(async () => {
      try { if (G.alive(id)) await job(); } catch (e) { /* yoksay */ }
      pending--;
    });
  }

  function setup() {
    down = 0;
    round++;
    const cols = shuffle(BALL_COLORS).slice(0, N);
    $('#bench').innerHTML = cols.map((c, i) => `
      <div class="peg-hole" style="animation-delay:${i * 0.08}s">
        <div class="hole"></div>
        <button class="peg-ball" data-i="${i}" style="--c:${c.hex}"></button>
      </div>`).join('');
    $$('.peg-ball', root).forEach((b, i) => { b.onclick = () => hit(b, cols[i]); });
  }

  function hit(ball, c) {
    if (ball.classList.contains('in')) return;
    // çekiç topun üstüne gelir ve vurur
    const hm = $('#hammer'), r = ball.getBoundingClientRect(), st = $('.peg-stage').getBoundingClientRect();
    hm.style.left = (r.left - st.left + r.width * 0.15) + 'px';
    hm.style.top = (r.top - st.top - r.height * 1.25) + 'px';
    hm.classList.remove('smash'); void hm.offsetWidth; hm.classList.add('smash');
    setTimeout(() => {
      if (!G.alive(id)) return;
      ball.classList.add('in');
      Sounds.thud();
      G.burstAt(ball, ['✨'], 6);
    }, 170);
    const r0 = round;
    enqueue(async () => { if (r0 === round) await Speech.seq(G.both(c.tr + '!', c.en + '!')); });
    down++;
    if (down >= N) {
      enqueue(async () => {
        if (r0 !== round) return;
        await Promise.race([G.celebrate(), wait(4000)]);
        if (!G.alive(id)) return;
        $('#bench').classList.add('flip');
        await wait(600);
        $('#bench').classList.remove('flip');
        if (G.alive(id)) setup();
      }, true);
    }
  }

  setup();
};
