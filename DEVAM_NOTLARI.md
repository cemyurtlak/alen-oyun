# Devam Notları

## Çalışma kuralları
- Kullanıcıyla (Cem) **Türkçe** konuşulur. Dosya/hesap/site üzerinde bir şey yapmadan önce haber verilir.
- Her değişiklikten sonra: `GELISTIRME_GUNLUGU.md`'ye yeni aşama (en üste), gerekirse `README.md` ve bu dosya güncellenir.
- Hedef kitle 2 yaş: büyük dokunma alanları, kısa cümleler, her deneme ödüllendirilir, **asla cezalandırıcı/korkutucu ses yok**
  ("Hayıııır" komik ve yumuşak kalmalı; konuşma/yemek etkinliklerinde hiç "yanlış" denmez).
- Her metin iki dilli: önce Türkçe ad, sonra İngilizce (soru sırası ayarlanabilir, varsayılan önce İngilizce).
- Görsel kalite: düz 2D emoji/çizim yerine 3D Fluent görselleri, parlak gradyanlı düğmeler, yaylı (spring) animasyonlar.

## Teknik kararlar ve nedenleri
| Karar | Neden |
|---|---|
| Saf HTML/CSS/JS, derleme yok | GitHub Pages'e doğrudan yüklenir, her cihazda açılır |
| Script'ler sırayla `<script>` ile (modül değil) | `file://` ile açıldığında da çalışsın (ES module CORS sorunu yok) |
| 3D görseller: Microsoft Fluent Emoji (MIT) → WebP 200px | Profesyonel görünüm, cihazdan bağımsız, küçük boyut |
| Renkli varyantlar önceden üretildi (PIL, HSV) | CSS mask/canvas tint `file://`'da CORS'a takılıyor; önceden üretmek her yerde çalışır |
| Sesler Web Audio ile sentez | İnternetten telifli/lisanssız ses indirmemek; dosya eklenirse otomatik onu kullanır |
| TTS: Web Speech API | Ücretsiz, çevrimdışı; Türkçe ses cihaza bağlı (ayarlarda uyarı var) |
| Mikrofon yalnızca seviye ölçer | Çocuğun ne dediğini anlamaya gerek yok; her ses denemesi ödül alır (babıldama dahil) |
| Akış belirteci (`G.newFlow()` / `G.alive(id)`) | Ekran değişince eski konuşmalar/döngüler kendini durdurur |
| Yüzdelik `padding` kullanılmaz | Yüzde, düğme yerine kapsayıcı genişliğine göre hesaplanıyor → görseller küçülüyordu |

## Kod haritası
- `js/core.js` → `G`: `screen()`, `topbar()`, `celebrate()`, `oops()`, `confetti()`, `burstAt()`, `visual()`,
  `hands()/setFingers()` (parmaklı eller SVG), `longPress()`, `toggleFullscreen()`, `activities{}` kaydı.
- `js/learn.js` → `Learn.open(cat)`: grup seçimi → tanıtım (`learnFlow`) → soru (`nextQuestion/ask/correct/wrongAnswer`) → tebrik.
  Kategori özellikleri: `type` (pic/number/letter/shape), `theme` (ocean/road), `soundQuiz`, `colorNames`, `qEn/qTr`.
- `js/home.js` → başla ekranı, ana sayfa (Oyunlar + Öğrenelim), ayarlar; `G.goHome`.
- `js/act/*.js` → her oyun `G.activities.<id> = () => {...}` olarak kayıtlı; `ACTIVITIES` listesi (`data.js`) ana sayfayı besler.
- Yeni bölüm: `data.js` → `CATEGORIES`'e nesne ekle. Yeni oyun: `js/act/x.js` + `index.html`'e script + `ACTIVITIES`'e kart.
- Yeni görsel: Fluent deposundan `assets/<Ad>/3D/<ad>_3d.png` indir → 200px WebP → `images.js`'te `IMG`'ye ekle.

## Bilinen sorunlar / sınırlamalar
- iOS Safari tam ekran API'sini desteklemez → "Ana ekrana ekle" ile açılınca tam ekran olur.
- Türkçe TTS sesi olmayan cihazda Türkçe metinler İngilizce sesle okunabilir (ayarlarda uyarı ve rehber var).
- Mikrofon algılama eşiği gürültülü ortamda hassas olabilir; gerçek cihazda Alen'le denenip ayarlanmalı (`mic.js` → `thr`).
- Konuşan Kedi: `MediaRecorder` + `decodeAudioData` gerektirir (Chrome/Edge/Safari 14.1+).
- `sounds/` içinde dosya yoksa tarayıcı konsolunda 404 uyarıları görünür (zararsız).
- Sentez hayvan sesleri çizgi film tarzıdır; gerçekçi ses için `sounds/animals/` klasörüne kayıt eklenebilir.

## Sonraki adımlar / fikirler
- GitHub deposu oluşturup GitHub Pages ile yayınlamak (kullanıcının sıradaki isteği).
- Gerçek hayvan seslerini (CC0 lisanslı) bulup `sounds/animals/` klasörüne eklemek.
- Anne-baba sesiyle "aferin", "hayır" ve kelime kayıtları (ayarlardan kayıt alma özelliği eklenebilir).
- Çevrimdışı çalışma için service worker.
- İlerleme takibi: hangi kelimeleri söylemeye çalıştı, kaç lokma yedi (ebeveyn paneli).
- Daha fazla oyun: araba yarışı, köpek balığı besleme, kedi saklambacı.
