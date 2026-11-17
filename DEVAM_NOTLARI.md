# Devam Notları

## Çalışma kuralları
- Kullanıcıyla (Cem) **Türkçe** konuşulur. Dosya/hesap/site üzerinde bir şey yapmadan önce haber verilir.
- Her değişiklikten sonra: `GELISTIRME_GUNLUGU.md`'ye yeni aşama (en üste), gerekirse `README.md` ve bu dosya güncellenir.
- Hedef kitle 2 yaş: büyük dokunma alanları, kısa cümleler, her deneme ödüllendirilir, **asla cezalandırıcı/korkutucu ses yok**
  ("Hayıııır" komik ve yumuşak kalmalı; konuşma/yemek etkinliklerinde hiç "yanlış" denmez).
- Her metin iki dilli: önce Türkçe ad, sonra İngilizce (soru sırası ayarlanabilir, varsayılan önce İngilizce).
- Görsel kalite: düz 2D emoji/çizim yerine 3D Fluent görselleri, parlak gradyanlı düğmeler, yaylı (spring) animasyonlar.

- **Hız:** Alen konuşmayı beklemiyor. Uzun cümle yok; soru = sadece isim. Doğru cevaptan sonra en fazla ~1,6 sn, yanlışta kilit yok.
- **Dil:** Başlangıçta seçilir (tr / en / both). Yeni cümle eklerken `G.both(tr, en)` kullan; tek dilli cümle gerekiyorsa
  `PHRASE_EN` sözlüğüne karşılığını ekle. Sonra `node tools/ses_listesi_olustur.js` + `ses_uret.bat`.
- **Başlatma düğmeleri yeşil** (Oyna, Tekrar oyna, Başla). Oyun kartlarının renkleri değişmeyecek (Cem istemedi).
- **Bitince otomatik GitHub'a gönder** (Cem'in isteği): `github_yukle.bat` (ya da ses değiştiyse `ses_uret.bat`) Dosya Gezgini'nden çift tıklanarak çalıştırılır.

## Teknik kararlar ve nedenleri
| Karar | Neden |
|---|---|
| Saf HTML/CSS/JS, derleme yok | GitHub Pages'e doğrudan yüklenir, her cihazda açılır |
| Script'ler sırayla `<script>` ile (modül değil) | `file://` ile açıldığında da çalışsın (ES module CORS sorunu yok) |
| 3D görseller: Microsoft Fluent Emoji (MIT) → WebP 200px | Profesyonel görünüm, cihazdan bağımsız, küçük boyut |
| Renkli varyantlar önceden üretildi (PIL, HSV) | CSS mask/canvas tint `file://`'da CORS'a takılıyor; önceden üretmek her yerde çalışır |
| Hayvan sesleri: ESC-50 gerçek kayıtları (GitHub'dan), yoksa sentez | Sentez sesler "kötü" bulundu; ESC-50 GitHub'dan erişilebilir ve ticari olmayan kullanıma açık |
| Konuşma: önceden üretilmiş MP3 (edge-tts, EmelNeural/AnaNeural), yedek Web Speech | PC Chrome'da Türkçe ses "Microsoft Tolga" (robotik); doğal ses için kayıt şart. Üretim Cem'in PC'sinde yapılır (bu ortamdan Microsoft servisine erişim yok) |
| Ses dosyası anahtarı = dil + küçük harf, noktalamasız metin | "Kedi!" ve "Kedi" aynı kaydı kullanır; speech.js `keyOf` ile ses_listesi_olustur.js birebir aynı olmalı |
| `Speech.cancel()` hayvan seslerini de durdurur | Sesler üst üste binmesin |
| Mikrofon yalnızca seviye ölçer | Çocuğun ne dediğini anlamaya gerek yok; her ses denemesi ödül alır (babıldama dahil) |
| Akış belirteci (`G.newFlow()` / `G.alive(id)`) | Ekran değişince eski konuşmalar/döngüler kendini durdurur |
| Yüzdelik `padding` kullanılmaz | Yüzde, düğme yerine kapsayıcı genişliğine göre hesaplanıyor → görseller küçülüyordu |

## Yayın
- Depo: `cemyurtlak/alen-oyun` (herkese açık), site: https://cemyurtlak.github.io/alen-oyun/
- Güncelleme yolu: klasördeki `github_yukle.bat` (git add/commit/push -f). Git kimlik bilgisi Windows'ta kayıtlı.
- Claude oturumunda depoya doğrudan push izni yok; Chrome dosya seçimine izin vermiyor → bat dosyası Dosya Gezgini'nden çift tıklanarak çalıştırılır.
- `.gitignore`: `github_yukle.bat`, `yukleme_log.txt` depoya gitmez.

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
- ESC-50'de olmayan sesler (ördek, at, aslan, fil, maymun, baykuş, uluma, civciv) hâlâ sentez; gerçek kayıt bulunursa `sounds/animals/` veya `assets/sfx` + `REAL` haritası.
- Çocuğun adı değişirse adlı cümleler (Merhaba Alen!) için `node tools/ses_listesi_olustur.js YeniAd` + `ses_uret.bat` gerekir.
- `sounds/` içinde dosya yoksa tarayıcı konsolunda 404 uyarıları görünür (zararsız).
- Sentez hayvan sesleri çizgi film tarzıdır; gerçekçi ses için `sounds/animals/` klasörüne kayıt eklenebilir.

## Sonraki adımlar / fikirler
- Eksik hayvanlar için gerçek kayıt (ördek, at, aslan, uluyan köpek...).
- Anne-baba sesiyle "aferin", "hayır" ve kelime kayıtları (ayarlardan kayıt alma özelliği eklenebilir).
- Çevrimdışı çalışma için service worker.
- İlerleme takibi: hangi kelimeleri söylemeye çalıştı, kaç lokma yedi (ebeveyn paneli).
- Daha fazla oyun: araba yarışı, köpek balığı besleme, kedi saklambacı.
