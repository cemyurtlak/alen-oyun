/* Ebeveyn ayarları — tarayıcıda saklanır (localStorage) */
const Settings = (() => {
  const KEY = 'alen-oyun-ayarlar-v1';
  const defaults = {
    childName: 'Alen',
    optionCount: 3,      // soru başına seçenek sayısı (2-4)
    questionCount: 10,   // (kullanılmıyor: tur hep 10 soru, sonra kendiliğinden devam)
    groupSize: 5,        // bir grupta kaç öğe tanıtılır
    rate: 0.85,          // konuşma hızı
    enFirst: true,       // soruda önce İngilizce mi?
    autoFull: true,      // başlarken tam ekran
    homeOrder: null,     // ana sayfa kart sırası (basılı tutup sürükleyerek)
    progress: {}         // bölüm -> son seçilen grup
  };
  let data = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    data = { ...defaults, ...saved, progress: { ...(saved.progress || {}) } };
  } catch (e) { /* depolama yoksa varsayılanlar */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* yoksay */ }
  }
  return {
    get: (k) => data[k],
    set: (k, v) => { data[k] = v; save(); },
    setProgress: (catId, group) => { data.progress[catId] = group; save(); },
    getProgress: (catId) => data.progress[catId] || 0
  };
})();
