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
  `PHRASE_EN` sözlüğüne karşılığını ekle. Sonra sesini ElevenLabs'te üret (aşağıdaki SES KURALI).
- **Başlatma düğmeleri yeşil** (Oyna, Tekrar oyna, Başla). Oyun kartlarının renkleri değişmeyecek (Cem istemedi).
- **Bitince otomatik GitHub'a gönder** (Cem'in isteği): `github_yukle.bat` Dosya Gezgini'nden çift tıklanarak çalıştırılır.
- **SES KURALI (Cem'in isteği): Hiçbir şey bilgisayar seslendirmesi olmayacak.** Bütün konuşmalar (sayılar, harfler, renkler,
  hayvan isimleri, cümleler — TR ve EN) ElevenLabs'te **Piku - Expressive Kid Character**, **Eleven v4**, varsayılan ayarlar
  (Stability 50, Similarity 75) ile üretilir. **Gelecekte oyuna yeni cümle/içerik eklenirse sesi de mutlaka buradan indirilir.**
  Adımlar: `node tools/ses_listesi_olustur.js` → `python tools/ses_uret.py` (eksikleri `tools/eksik_sesler_*.txt`'ye yazar) →
  metni elevenlabs.io/app/speech-synthesis/text-to-speech'e yapıştır (cümleler ` [pause] ` ile ayrılmış, paket ≤ ~1300 karakter;
  daha uzun paketlerde aralar kısalıyor) → indir → `python tools/elevenlabs_bol.py dosya.mp3 tr|en` → `python tools/ses_uret.py`.
  Ücretsiz plan 10.000 kredi/ay; bitince Cem başka hesapla giriş yapar (Piku: Voices → ara → "Use").
- **Hayvan sesleri sadece gerçek kayıt.** Gerçek kaydı bulunamayan hayvan oyuna eklenmez (balık, tavşan, panda bu yüzden çıkarıldı).
  Kaynak: ESC-50 ve BBC Sound Effects (sound-effects.bbcrewind.co.uk, API: sound-effects-api.bbcrewind.co.uk/api/sfx/search,
  ses: sound-effects-media.bbcrewind.co.uk/mp3/<id>.mp3).

## Teknik kararlar ve nedenleri
| Karar | Neden |
|---|---|
| Saf HTML/CSS/JS, derleme yok | GitHub Pages'e doğrudan yüklenir, her cihazda açılır |
| Script'ler sırayla `<script>` ile (modül değil) | `file://` ile açıldığında da çalışsın (ES module CORS sorunu yok) |
| 3D görseller: Microsoft Fluent Emoji (MIT) → WebP 200px | Profesyonel görünüm, cihazdan bağımsız, küçük boyut |
| Renkli varyantlar önceden üretildi (PIL, HSV) | CSS mask/canvas tint `file://`'da CORS'a takılıyor; önceden üretmek her yerde çalışır |
| Hayvan sesleri: sadece gerçek kayıt (ESC-50 + BBC Sound Effects), sentez yok | Sentez sesler "kötü" bulundu; Cem: "sadece gerçek hayvan sesi olsun, bulunamazsa hayvanı kaldır" |
| Konuşma: ElevenLabs Piku kayıtları, TTS yedeği YOK | Edge sesleri "yapmacık" bulundu; Cem bilgisayar seslendirmesi istemiyor |
| ElevenLabs'te paket üretim + `[pause]` + bölme | 717 ayrı üretim yerine ~12 paket; `[pause]` cümle arasına ~0,3–0,9 sn boşluk koyar, bölme süre tahminiyle doğrulanır |
| İndirme adı JS ile değiştirilir (`alen_xx.mp3`) | ElevenLabs dosya adında `:` var, Windows kabul etmiyor → indirme yarım kalıyordu |
| Ses dosyası anahtarı = dil + küçük harf, noktalamasız metin | "Kedi!" ve "Kedi" aynı kaydı kullanır; speech.js `keyOf` ile ses_listesi_olustur.js birebir aynı olmalı |
| `Speech.cancel()` hayvan seslerini de durdurur | Sesler üst üste binmesin |
| Mikrofon yalnızca seviye ölçer | Çocuğun ne dediğini anlamaya gerek yok; her ses denemesi ödül alır (babıldama dahil) |
| Akış belirteci (`G.newFlow()` / `G.alive(id)`) | Ekran değişince eski konuşmalar/döngüler kendini durdurur |
| Hayvan görselleri gerçek fotoğraf (`assets/img/real`, arka planı temizlenmiş) | Cem "daha gerçekçi" istedi; Wikipedia ana fotoğrafları en net sonuç verdi. Yeni hayvan eklenirse aynı yöntem: foto → rembg isnet → 360px WebP → `images.js` gerçek fotoğraf bloğu |
| Tur 10 soru, bitiş ekranı yok (`roundDone` → kutlama → yeni tur) | Cem: "5 soru sorup tekrar oyna çıkmasın, 10 soru sorsun" |
| Ana sayfa tek kart alanı, basılı tut + sürükle ile sıralama (`Settings.homeOrder`) | Cem kartların sırasını kendisi belirlemek istedi; yeni kart eklenince listede yoksa sona eklenir |
| Hayvan ekleme: BBC ses (spektrogram kontrolü) + Wikipedia foto (rembg) + Piku ad (TR/EN) — üçü yoksa hayvan eklenmez | Deve, yunus, su aygırı, ağaçkakan, fare temiz ses bulunamadığı için eklenmedi |
| El görseli gerçek fotoğraf (`hand_0..5`) | Çizim el "ele benzemiyor" bulundu |
| Tanıtım yok, bölümler doğrudan oyunla başlar (`Learn.open` → `startPlay`; Hayvan Evleri → `play()`) | Cem: "direkt oyun oynayarak öğrenmiş olur". `startLearn`/`teach` kodu duruyor, istenirse geri açılabilir |
| Bölümlerde grup yok (`groupsOf` tek grup döner) | Cem: "kendi içinde bölümler olmasın, tüm hayvanlar çıksın" |
| Art arda dokunulan etkinliklerde ses kuyruğu (Yumurtalar, Kedi Koşusu) | Cem: sesler üst üste binmesin ve atlanmasın; kuyruk sınırlı tutulur |
| Sentez fanfar kapalı; ses eklemeden önce spektrogramla kontrol | Alkıştaki ıslık ve yanlış fil kaydı kulakla değil spektrogramla bulundu |
| Etkinlik içinde `G.newFlow()` dikkatli kullanılır | `newFlow` etkinliğin başlangıç kimliğini geçersiz kılar; yalnızca konuşmayı susturmak için `Speech.cancel()` kullan, yoksa "ilerlemiyor" hatası çıkar (Yumurtalar'da yaşandı) |
| Mikrofon gerektiren adımlar asla sonsuza kadar beklemez | Çocuk tek başına oynar; mikrofon/izin yoksa birkaç saniye sonra kendiliğinden devam |
| Tüm sesler `AudioCache` (Web Audio, tek bağlam, çözülmüş tampon önbelleği) ile çalar; yeni `new Audio()` açılmaz | Telefonda her `<audio>` bir oynatıcı tutuyor, sınır dolunca sesler gecikiyor/çalmıyordu. Yeni ses eklenen yerde bölüm açılırken `AnimalSounds.preload([...])` / `Speech.preload([[metin, dil]])` çağır |
| Açılışta dosya varlığı yoklanmaz | 55 boş istek açılışı yavaşlatıyordu; isteğe bağlı `sounds/` kayıt desteği kaldırıldı |
| Servis çalışanı (`sw.js`): kod ağ-önce, medya önbellek-önce | Kod güncellemeleri hemen gelsin, görsel/sesler anında açılsın. **Görsel/ses eklenince `python tools/sw_liste.py` çalıştır** (liste + sürüm). Medya önbelleği `alen-medya-v1`: aynı adla dosya DEĞİŞTİRİLİRSE bu adı v2 yap |
| Yüzdelik `padding` kullanılmaz | Yüzde, düğme yerine kapsayıcı genişliğine göre hesaplanıyor → görseller küçülüyordu |

## Yayın
- Depo: `cemyurtlak/alen-oyun` (herkese açık), site: https://cemyurtlak.github.io/alen-oyun/
- Güncelleme yolu: klasördeki `github_yukle.bat` (git add/commit/push -f). Git kimlik bilgisi Windows'ta kayıtlı.
- Claude oturumunda depoya doğrudan push izni yok; Chrome dosya seçimine izin vermiyor → bat dosyası Dosya Gezgini'nden çift tıklanarak çalıştırılır.
- `.gitignore`: `github_yukle.bat`, `yukleme_log.txt` depoya gitmez.

## Kod haritası
- `js/core.js` → `G`: `screen()`, `topbar()`, `celebrate()`, `oops()`, `confetti()`, `burstAt()`, `visual()`,
  `hands()/setFingers()` (parmaklı eller SVG), `longPress()`, `toggleFullscreen()`, `activities{}` kaydı.
- `js/audiocache.js` → `AudioCache.load/preload/play/stop/busy` (tüm seslerin ortak motoru).
- `sw.js` + `sw_liste.js` → önbellek; `tools/sw_liste.py` ile yenilenir.
- `js/learn.js` → `Learn.open(cat)`: grup seçimi → tanıtım (`learnFlow`) → soru (`nextQuestion/ask/correct/wrongAnswer`) → tebrik.
  Kategori özellikleri: `type` (pic/number/letter/shape), `theme` (ocean/road), `soundQuiz`, `colorNames`, `qEn/qTr`.
- `js/home.js` → başla ekranı, ana sayfa (Oyunlar + Öğrenelim), ayarlar; `G.goHome`.
- `js/act/*.js` → her oyun `G.activities.<id> = () => {...}` olarak kayıtlı; `ACTIVITIES` listesi (`data.js`) ana sayfayı besler.
- Yeni bölüm: `data.js` → `CATEGORIES`'e nesne ekle. Yeni oyun: `js/act/x.js` + `index.html`'e script + `ACTIVITIES`'e kart.
- Yeni görsel: Fluent deposundan `assets/<Ad>/3D/<ad>_3d.png` indir → 200px WebP → `images.js`'te `IMG`'ye ekle.

## Bilinen sorunlar / sınırlamalar
- iOS Safari tam ekran API'sini desteklemez → "Ana ekrana ekle" ile açılınca tam ekran olur.
- Mikrofon algılama eşiği gürültülü ortamda hassas olabilir; gerçek cihazda Alen'le denenip ayarlanmalı (`mic.js` → `thr`).
- Konuşan Kedi: `MediaRecorder` + `decodeAudioData` gerektirir (Chrome/Edge/Safari 14.1+).
- Kaydı olmayan taşıtlar (yarış arabası, motosiklet, gemi, bisiklet, traktör, roket) sessiz; istenirse BBC'den gerçek kayıt eklenebilir.
- ElevenLabs kesimleri otomatik doğrulandı ama kulakla dinlenmedi; hatalı kesim bildirilirse o paket yeniden üretilir.
- Chrome aynı siteden art arda çok dosya indirmeyi engelliyor → BBC sesleri tek paket (`bbc_paket.bin`) olarak indirilip burada açıldı.
- Çocuğun adı değişirse adlı cümleler (Merhaba Alen!) için yeni ad ElevenLabs'te seslendirilmeli (aksi halde o cümleler sessiz geçer).
- Konuşma kayıtları (16 MB) arka planda topluca indirilmez, yalnızca bölüm açılınca o bölümünkiler; ilk açılışta internet yoksa çalmaz.

## Sonraki adımlar / fikirler
- Taşıtlar için gerçek kayıt (motor, gemi düdüğü, bisiklet zili, traktör, roket).
- İstenirse daha fazla hayvan: deve, yunus, su aygırı, ağaçkakan, fare için temiz kayıt aranabilir.
- ElevenLabs 2. hesapta ~2.570 kredi kaldı (18.11.2026).
- Anne-baba sesiyle "aferin", "hayır" ve kelime kayıtları (ayarlardan kayıt alma özelliği eklenebilir).
- İlerleme takibi: hangi kelimeleri söylemeye çalıştı, kaç lokma yedi (ebeveyn paneli).
- Daha fazla oyun: araba yarışı, köpek balığı besleme, kedi saklambacı.
