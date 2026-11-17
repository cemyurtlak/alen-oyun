/* =========================================================
   PARMAKLA SAY
   • Say: ellere her dokunuşta bir parmak açılır ve sayılır (1-10).
   • Kaç tane?: eller birkaç parmak gösterir, çocuk doğru sayıyı seçer.
   ========================================================= */
G.activities.fingers = () => {
  const { $, $$, rand, shuffle, wait, TR, EN } = G;
  let mode = 'count', n = 0, target = 0, lock = false, rounds = 0;

  const root = G.screen('fingers', G.topbar(`${pic('🖐️', 'title-ic')} Parmakla Say <small>Finger Count</small>`) + `
    <div class="tabs"><button class="tab on" data-m="count">${pic('☝️')} Say · Count</button><button class="tab" data-m="quiz">${pic('✌️')} Kaç tane? · How many?</button></div>
    <div class="finger-stage">
      <div class="big-num" id="num"></div>
      <button class="hand-box" id="hb">${G.hands(10)}</button>
      <div class="num-words" id="words"></div>
      <div class="num-opts" id="opts"></div>
    </div>
    <div class="controls"><button class="play-btn" id="reset">${pic('🔁')} Baştan · Again</button></div>`);
  G.bindHome(root);
  const hb = $('#hb');

  function showNum(k) {
    const el = $('#num');
    el.textContent = k || '';
    el.style.setProperty('--c', G.RAINBOW[(Math.max(1, k) - 1) % 7]);
    G.anim(el, 'boom');
    $('#words').innerHTML = k ? `<b>${COUNT_TR[k - 1]}</b><small>${COUNT_EN[k - 1]}</small>` : '';
  }

  function setupCount() {
    G.newFlow();
    mode = 'count'; n = 0;
    hb.innerHTML = G.hands(10);
    G.setFingers(hb, 0);
    $('#opts').innerHTML = '';
    showNum(0);
    $('#reset').style.display = '';
    Speech.seq([{ t: 'Parmaklarına dokun ve sayalım!', l: TR, pitch: 1.3 }, 150, { t: "Tap and let's count!", l: EN, pitch: 1.3 }]);
  }

  async function countTap() {
    if (n >= 10) { setupCount(); return; }
    n++;
    G.newFlow();
    G.setFingers(hb, n);
    Sounds.tap();
    showNum(n);
    await Speech.seq([{ t: COUNT_TR[n - 1] + '!', l: TR, rate: 1.05 }, 80, { t: COUNT_EN[n - 1] + '!', l: EN, rate: 1.05 }]);
    if (n === 5) G.burstAt(hb, ['⭐'], 10);
    if (n === 10) G.celebrate({ big: true, extra: [{ t: 'On parmak!', l: TR }, { t: 'Ten fingers!', l: EN }] });
  }

  function setupQuiz() {
    const id = G.newFlow();
    mode = 'quiz'; lock = false;
    $('#reset').style.display = 'none';
    const max = rounds < 4 ? 5 : 10;
    let t;
    do { t = 1 + Math.floor(Math.random() * max); } while (t === target);
    target = t;
    rounds++;
    hb.innerHTML = G.hands(target);
    showNum(0);
    const opts = new Set([target]);
    while (opts.size < 3) opts.add(1 + Math.floor(Math.random() * max));
    $('#opts').innerHTML = shuffle([...opts]).map(v => `<button class="nopt" data-v="${v}" style="--c:${G.RAINBOW[(v - 1) % 7]}">${v}</button>`).join('');
    $$('.nopt', root).forEach(b => b.onclick = () => answer(b, +b.dataset.v));
    (async () => {
      if (!await Speech.seq([{ t: 'How many fingers?', l: EN }, 300, { t: 'Kaç parmak var?', l: TR }])) return;
      // birlikte sayma ipucu: parmakları tek tek parlat
      if (!G.alive(id)) return;
    })();
  }

  async function answer(b, v) {
    if (lock || b.classList.contains('wrong')) return;
    if (v === target) {
      lock = true;
      const id = G.newFlow();
      b.classList.add('correct');
      // doğru cevaptan sonra birlikte say
      G.setFingers(hb, 0);
      for (let i = 1; i <= target; i++) {
        G.setFingers(hb, i);
        showNum(i);
        Sounds.tap();
        if (!await Speech.seq([{ t: COUNT_TR[i - 1], l: TR, rate: 1.1 }])) return;
      }
      await G.celebrate({ extra: [{ t: COUNT_TR[target - 1] + '!', l: TR }, { t: COUNT_EN[target - 1] + '!', l: EN }] });
      if (G.alive(id)) setupQuiz();
    } else {
      G.anim(b, 'shake');
      b.classList.add('wrong');
      await G.oops();
    }
  }

  hb.onclick = () => { if (mode === 'count') countTap(); else { G.anim(hb, 'wiggle'); } };
  $('#reset').onclick = () => { Sounds.tap(); setupCount(); };
  $$('.tab', root).forEach(t => t.onclick = () => {
    Sounds.tap();
    $$('.tab', root).forEach(x => x.classList.toggle('on', x === t));
    if (t.dataset.m === 'count') setupCount(); else { rounds = 0; setupQuiz(); }
  });
  setupCount();
};
