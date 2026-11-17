/* =========================================================
   KONUŞALIM ve SES TAKLİDİ
   Kelime / hayvan sesi gösterilir → yavaşça, hece hece söylenir →
   "Sen söyle!" → mikrofon çocuğun HERHANGİ bir ses çıkarmasını bekler.
   Her deneme (babıldama dahil) coşkuyla ödüllendirilir; asla "yanlış" denmez.
   Mikrofon yoksa ebeveyn 👍 düğmesine basar.
   ========================================================= */
(() => {
  const { $, $$, esc, wait, TR, EN } = G;

  function imitate(cfg) {
    const id0 = G.newFlow();
    let groupIdx = 0, idx = 0;
    const groups = cfg.groups;

    const tabs = groups.length > 1
      ? `<div class="tabs">${groups.map((g, i) => `<button class="tab" data-g="${i}">${pic(g.icon)} ${esc(g.tr)}</button>`).join('')}</div>` : '';
    const root = G.screen('imitate', G.topbar(cfg.title) + tabs + `
      <div class="imi-stage">
        <button class="imi-card" id="card"></button>
        <div class="imi-word" id="word"></div>
        <div class="syl" id="syl"></div>
        <div class="listen" id="listen"><div class="ring" id="ring"></div>${pic('🎤')}<span>Sen söyle! · Your turn!</span></div>
      </div>
      <div class="controls">
        <button class="nav-btn" id="prev" aria-label="Önceki">◀</button>
        <button class="nav-btn again" id="again" aria-label="Tekrar">${pic('🔁')}</button>
        <button class="nav-btn ok" id="ok" aria-label="Söyledi">${pic('👍')}</button>
        <button class="nav-btn" id="next" aria-label="Sonraki">▶</button>
      </div>
      <div class="strip" id="strip"></div>`);
    G.bindHome(root);

    const items = () => groups[groupIdx].items;
    // İngilizce modda heceler İngilizce kelimeden/sesten gelir
    const isEn = () => Speech.mode() === 'en';
    const sylOf = (it) => isEn() ? (it.synEn || it.en.split(' ')) : it.syl;
    const SL = () => isEn() ? EN : TR;

    function renderStrip() {
      $('#strip').innerHTML = items().map((it, i) => `<button class="thumb ${i === idx ? 'on' : ''}" data-i="${i}">${pic(it.emoji)}</button>`).join('');
      $$('#strip .thumb').forEach(b => b.onclick = () => { Sounds.tap(); idx = +b.dataset.i; run(); });
      $$('.tab', root).forEach(t => t.classList.toggle('on', +t.dataset.g === groupIdx));
      const on = $('#strip .on');
      on && on.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    function show(it) {
      $('#card').innerHTML = pic(it.emoji);
      G.anim($('#card'), 'pop-in');
      $('#word').innerHTML = `${G.showTr() ? `<b>${esc(it.tr)}</b>` : ''}${G.showEn() ? `<small>${esc(it.en)}</small>` : ''}`;
      $('#syl').innerHTML = sylOf(it).map(s => `<span>${esc(s)}</span>`).join('<i>·</i>');
      $('#listen').classList.remove('on');
      renderStrip();
    }

    let successLock = false;
    async function success(id) {
      if (successLock) return;
      successLock = true;
      const it = items()[idx];
      $('#listen').classList.remove('on');
      G.anim($('#card'), 'jump');
      G.burstAt($('#card'), ['⭐', '💖', '✨'], 16);
      const p = G.celebrate({ extra: G.both('Çok güzel söyledin!', 'You said it so well!') });
      if (it.snd) setTimeout(() => AnimalSounds.play(it.snd), 1600);
      await p;
      successLock = false;
      if (!G.alive(id)) return;
      await wait(it.snd ? 1400 : 700);
      if (!G.alive(id)) return;
      idx = (idx + 1) % items().length;
      run();
    }

    async function listenOnce(id) {
      if (!Mic.ready()) return 'nomic';
      $('#listen').classList.add('on');
      const ring = $('#ring');
      const r = await Mic.listen(5500, (l) => { ring.style.transform = `scale(${1 + l * 0.8})`; ring.style.opacity = 0.35 + l * 0.6; }, () => G.alive(id));
      $('#listen') && $('#listen').classList.remove('on');
      return r;
    }

    async function run() {
      const id = G.newFlow();
      successLock = false;
      const it = items()[idx];
      show(it);
      const sylEls = $$('#syl span');
      // 1) Sesi / kelimeyi doğal haliyle duyur
      if (it.snd && cfg.soundFirst) {
        G.anim($('#card'), 'wiggle');
        await AnimalSounds.play(it.snd);
        if (!G.alive(id)) return;
        await wait(250);
      }
      if (!await Speech.seq([...G.both(it.tr, it.en), 300])) return;
      // 2) Hece hece, yavaşça (karaoke gibi vurgulanır)
      const sy = sylOf(it);
      for (let i = 0; i < sy.length; i++) {
        sylEls.forEach((s, k) => s.classList.toggle('lit', k === i));
        G.anim($('#card'), 'nod');
        if (!await Speech.seq([{ t: sy[i], l: SL(), rate: 0.75 }, 120])) return;
      }
      sylEls.forEach(s => s.classList.remove('lit'));
      if (!await Speech.seq([250, ...G.both('Sen söyle!', 'Your turn!')])) return;
      // 3) Çocuğu dinle
      let r = await listenOnce(id);
      if (r === 'voice') return success(id);
      if (r === 'cancel' || !G.alive(id)) return;
      if (r === 'silence') {
        // Nazikçe bir kez daha, birlikte
        if (!await Speech.seq([...G.both('Hadi birlikte söyleyelim!', "Let's say it together!"), 200, { t: sylOf(it).join(' '), l: SL(), rate: 0.8 }])) return;
        r = await listenOnce(id);
        if (r === 'voice') return success(id);
        if (!G.alive(id)) return;
        await wait(800);
        if (!G.alive(id)) return;
        idx = (idx + 1) % items().length;
        run();
      }
      // 'nomic': ebeveyn 👍 düğmesini bekler
    }

    $('#prev').onclick = () => { Sounds.tap(); idx = (idx - 1 + items().length) % items().length; run(); };
    $('#next').onclick = () => { Sounds.tap(); idx = (idx + 1) % items().length; run(); };
    $('#again').onclick = () => { Sounds.tap(); run(); };
    $('#card').onclick = () => { Sounds.tap(); run(); };
    $('#ok').onclick = () => success(G.newFlow());
    $$('.tab', root).forEach(t => t.onclick = () => { Sounds.tap(); groupIdx = +t.dataset.g; idx = 0; run(); });

    (async () => {
      show(items()[0]);
      if (!await Speech.seq(G.both(cfg.introTr, cfg.introEn))) return;
      const ok = await Mic.ensure();
      if (!G.alive(id0)) return;
      if (!ok) G.toast('Mikrofon kapalı — çocuk söyleyince 👍 düğmesine basın', 4200);
      run();
    })();
  }

  G.activities.talk = () => imitate({
    title: `${pic('🗣️', 'title-ic')} Konuşalım <small>Let's Talk</small>`,
    groups: TALK_GROUPS,
    introTr: 'Hadi konuşalım!', introEn: "Let's talk!"
  });

  G.activities.copy = () => imitate({
    title: `${pic('🐮', 'title-ic')} Ses Taklidi <small>Copy the Sound</small>`,
    groups: [{ tr: 'Sesler', icon: '🐮', items: COPY_ITEMS }],
    soundFirst: true,
    introTr: 'Hayvanları taklit edelim!', introEn: "Let's copy the animals!"
  });
})();
