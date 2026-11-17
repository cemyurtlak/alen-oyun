# Geliştirme Günlüğü

(En yeni aşama en üstte)

---

## Aşama 5 — Takılan akışlar düzeltildi, gerçekçi hayvan fotoğrafları
**Tarih:** 17.11.2026

**İstek (Cem):** Oyunun yapısını mantıksal olarak tekrar kontrol et, bazı yerlerde ilerlenmiyor. Hayvanların görüntülerini daha gerçekçi yap.

**Yapılanlar:**
- Akış denetimi (tüm etkinlikler kod + headless Chrome ile tarandı). Bulunan ve düzeltilen takılmalar:
  - **Yumurtalar:** her dokunuşta `G.newFlow()` çağrıldığı için etkinliğin akış kimliği geçersiz oluyordu → 3 yumurta
    çatlayınca yeni yumurtalar **hiç gelmiyordu**. Dokunuşlarda artık sadece konuşma susturuluyor (`Speech.cancel()`).
  - **Hayvan Evleri:** kutlama sırasında 🔊 basılırsa akış iptal olup sıradaki hayvan gelmiyordu → kilitliyken 🔊 yok sayılır.
  - **Konuşalım / Ses Taklidi:** mikrofon yoksa ebeveynin 👍 basması bekleniyordu (çocuk yalnızken takılıyordu) →
    3,5 sn sonra kendiliğinden kutlayıp devam eder. İzin penceresi cevaplanmazsa 5 sn sonra mikrofonsuz devam eder.
  - **Sayılar / Parmak Sayma:** sadece İngilizce modda parmakla sayarken sayılar söylenmiyordu → İngilizce sayılır.
    Parmak sorusunda sayma yarıda kesilirse kilit açılır.
- Gerçekçi görseller: 20 hayvan için Wikipedia/Wikimedia Commons'tan gerçek fotoğraf seçildi, arka planı rembg
  (isnet-general-use) ile temizlendi, 360×360 WebP → `assets/img/real/` (kaynaklar `KAYNAK.txt`). `images.js`'te
  köpek, kedi, sarı/siyah kedi, inek, koyun, tavuk, ördek, civciv, at, aslan, fil, maymun, kurbağa, kuş, baykuş,
  ayı, arı, tilki, uluyan köpek emojileri bu fotoğraflara yönlendirildi. Kedi duygu yüzleri ve renkli köpek balıkları çizim kaldı.

**Değişen / oluşan dosyalar:** `js/act/eggs.js`, `js/act/homes.js`, `js/act/imitate.js`, `js/act/fingers.js`, `js/learn.js`,
`js/images.js`, `assets/img/real/*` (yeni), README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** `node --check` temiz. Headless Chrome: Yumurtalar 2 tur (yeni yumurtalar geliyor), Hayvan Evleri
🔊 basılarak 4 tur ilerledi, Ses Taklidi mikrofonsuz kendiliğinden sonraki hayvana geçti; hayvanlar öğrenme/soru,
Hayvan Evleri ve Sapan ekran görüntüleriyle görseller kontrol edildi; sayfa hatası yok.

---

## Aşama 4 — Tüm seslendirme ElevenLabs çocuk sesi (Piku), sadece gerçek hayvan sesleri
**Tarih:** 17.11.2026

**İstek (Cem):**
- Edge sesleri "yapmacık ve kötü"; seslendirme ElevenLabs sitesinden, çocuk sesiyle (ücretsiz plan) yapılsın.
- Sayılar, harfler, renkler, hayvan isimleri, konuşmalar — hepsi ElevenLabs'ten; **hiçbir şey bilgisayar seslendirmesi olmasın**.
- İki dilli: İngilizce kısım da eksiksiz seslendirilsin.
- Oyunda sadece gerçek hayvan sesi olsun (ev kullanımı); gerçek sesi bulunamayan hayvan kaldırılsın. Eksikler BBC'den indirilsin.
- Gelecekte yeni ses gerekirse yine ElevenLabs'ten üretilsin.

**Yapılanlar:**
- Ses seçimi: ElevenLabs **Piku - Expressive Kid Character**, model **Eleven v4** (Stability 50, Similarity 75). Cem seçti.
- 717 cümle (369 TR + 348 EN) ~60'lık paketler halinde, cümleler arasına `[pause]` etiketi konarak üretildi
  (1. hesap: Türkçe, 2. hesap: İngilizce). Her paket tek MP3 indirildi, burada sessizlik + cümle uzunluğu tabanlı
  dinamik programlama ile cümlelere bölündü ve her bölünme süre tutarlılığıyla kontrol edildi → `audio/voice/*.mp3`
  (dosya adları öncekiyle aynı; eski Edge kayıtlarının hepsinin üzerine yazıldı) + `audio/voice/index.js`.
- `speech.js`: tarayıcı sesli okuması (Web Speech / TTS) **tamamen kaldırıldı**. Kaydı olmayan cümle sessiz geçer ve
  konsola "Ses kaydı yok" uyarısı yazılır (`Speech.missing()`). Ayarlardan ses seçimi ve konuşma hızı kaldırıldı.
- `animalsounds.js`: tüm sentez (Web Audio) hayvan/taşıt sesleri kaldırıldı; **sadece gerçek kayıt** çalar.
  BBC Sound Effects arşivinden ördek, at, aslan, fil, maymun, baykuş, civciv, uluyan köpek, ayı ve tilki kayıtları
  indirildi; en net bölüm seçilip kırpıldı, ses düzeyi eşitlendi → `assets/sfx/{duck,horse,lion,elephant,monkey,owl,chick,howl,bear,fox}_N.mp3`.
- Gerçek sesi olmayan **balık, tavşan, panda** oyundan çıkarıldı (Hayvanlar, Göl evi, Yumurtalar, Sapan, Yemek Zamanı).
  Sapan'da panda yerine ördek geldi. Köpek balıklarının sentez "ham" sesi kaldırıldı. Tilkiye gerçek havlama eklendi.
- Kaydı olmayan taşıtlar (yarış arabası, motosiklet, gemi, bisiklet, traktör, roket) artık sentez ses çalmaz; adları söylenir.
- Araçlar: `tools/ses_uret.py` artık ses üretmiyor — dizini (`index.js`) yazar ve eksik cümleleri ElevenLabs'e yapıştırılacak
  biçimde `tools/eksik_sesler_tr/en.txt`'ye çıkarır. Yeni `tools/elevenlabs_bol.py` indirilen MP3'ü cümlelere böler.
- `.gitignore`: kök klasördeki ElevenLabs/BBC ham indirmeleri depoya gitmez.

**Değişen / oluşan dosyalar:** `js/speech.js`, `js/animalsounds.js`, `js/home.js`, `js/data.js`, `js/act/{eggs,sling,feed}.js`,
`audio/voice/*` (717 kayıt + index.js), `assets/sfx/*` (20 yeni BBC kaydı), `tools/ses_uret.py`, `tools/elevenlabs_bol.py` (yeni),
`tools/ses_listesi.json`, `tools/ses_listesi_olustur.js`, `.gitignore`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** `node --check` temiz. Headless Chrome'da 12 etkinlik × 3 dil modu açıldı; sayfa hatası yok;
ilk testte 4 cümle ("Hadi konuşalım!", "Hayvanları taklit edelim!" ve İngilizceleri) listede yoktu → `ses_listesi_olustur.js`'e `introTr/introEn` taraması eklendi, bu 4 cümle de Piku ile üretildi; şimdi kodun söyleyebileceği 713 cümlenin hepsinin kaydı var. Yeni hayvan sesleri ve Piku kayıtları
çalınarak süreleri doğrulandı. Kesimler kulakla dinlenemedi; yanlış kesilen/yanlış ses duyulursa bildirilmeli.

---

## Aşama 3 — Hızlı geçiş, dil seçimi, gerçek sesler, doğal konuşma, Balon Patlat, ileri sapan
**Tarih:** 17.11.2026

**İstek (Cem):**
- Seçimden sonra beklemeden hızlı geçiş olsun (Alen konuşmayı beklemeden basmaya devam ediyor).
- Başlangıçta dil seçimi: İngilizce seçilirse her şey İngilizce, Türkçe seçilirse Türkçe; sesler birbirine girmesin.
- "Which one is..." yerine doğrudan "Dog!" / "Köpek!" desin.
- Hayvan sesleri ve konuşma sesleri daha gerçekçi olsun.
- Renkler zor seçiliyor; daha belirgin renkler.
- Oyun başlatma düğmeleri her zaman yeşil olsun (oyun kartları aynı kalsın).
- Sürekli uçan, dokununca patlayan balon oyunu.
- Sapan: soldan sağa değil, geriye çekip ileri atılsın.
- Bitince otomatik olarak GitHub'a gönderilsin.

**Yapılanlar:**
- `speech.js` yeniden yazıldı: dil modu (tr / en / both), seçilmeyen dildeki cümleler atlanır (karşılığı varsa
  `alt`/`PHRASE_EN` sözlüğüyle çevrilir); önce `audio/voice/` doğal ses kayıtlarını çalar, yoksa tarayıcı sesine düşer;
  `cancel()` konuşmayı, kayıtları ve hayvan seslerini birlikte susturur (üst üste binme biter); TTS perdesi doğal aralığa çekildi.
- Başlangıç ekranına bayraklı dil seçimi (Türkçe / English / İkisi); ayarlara "Konuşma dili" eklendi.
- Soru-cevap: soru = sadece isim ("Kedi!") + hayvan sesi; doğru cevapta en fazla ~1,6 sn kutlama, sonra hemen yeni soru;
  yanlışta kilit yok, kısa "Hayıııır!". Benzer renkler (kırmızı-turuncu, pembe-mor...) aynı soruda çıkmaz.
- Gerçek kayıtlar: ESC-50 veri setinden (CC BY-NC 3.0) köpek, kedi, inek, koyun, tavuk, horoz, kurbağa, kuş, arı,
  korna, siren, tren, uçak, helikopter ve alkış seçildi, kırpıldı, ses düzeyi eşitlendi → `assets/sfx/` (54 dosya).
  Kedi tonları gerçek kaydın hızıyla (yavru/iri) üretiliyor; Kedi Koşusu her seferinde farklı tonda gerçek miyav.
- Doğal konuşma: `tools/ses_listesi_olustur.js` oyundaki 717 cümleyi çıkarır; `tools/ses_uret.py` + `ses_uret.bat`
  bunları Microsoft sinir ağı sesleriyle (tr-TR-EmelNeural, en-US-AnaNeural) MP3'e çevirir ve `audio/voice/index.js` yazar;
  bitince `github_yukle.bat` ile otomatik GitHub'a gönderir.
- Renkler daha canlı ve doygun yeniden üretildi; renk sorusunda balonlar büyütüldü; ilk renk grubu ana renkler.
- "Oyna", "Tekrar oyna" gibi başlatma düğmeleri yeşil yapıldı.
- Yeni oyun: **Balon Patlat** (`js/act/pop.js`) — balonlar aşağıdan sürekli uçar, dokununca patlar, bazılarında sürpriz hayvan.
- **Sapan** baştan yazıldı: 3B perspektif; sapan altta, hayvan geriye çekilip bırakılınca ileri, derinliğe uçar.

**Değişen / oluşan dosyalar:** `js/speech.js`, `js/core.js`, `js/learn.js`, `js/home.js`, `js/data.js`, `js/sounds.js`,
`js/animalsounds.js`, `js/act/{imitate,catrun,dance,parrot,feed,sling,pop}.js`, `css/style.css`, `index.html`,
`assets/sfx/*` (yeni), `assets/img/tint/*` (yeniden), `tools/ses_listesi_olustur.js`, `tools/ses_listesi.json`,
`tools/ses_uret.py`, `ses_uret.bat` (yeni), `.gitignore`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Tüm JS `node --check` temiz; headless Chrome'da başlangıç/dil seçimi, renk ve hayvan soruları,
Balon Patlat, sapan çekme-atma, İngilizce Ses Taklidi denendi — sayfa hatası yok. Doğal ses üretimi kullanıcının
bilgisayarında çalıştırılır (bu ortamdan Microsoft ses servisine erişim yok).

---

## Aşama 2 — GitHub'a yükleme ve GitHub Pages yayını
**Tarih:** 17.11.2026

**İstek:** Projeyi Chrome üzerinden GitHub'a yükleyip link oluşturmak.

**Yapılanlar:**
- Chrome'da `cemyurtlak/alen-oyun` adlı herkese açık depo oluşturuldu.
- Web yükleme sayfası klasör yapısını koruyamadığı için (yalnızca kök dosyalar gitti), klasöre
  `github_yukle.bat` eklendi: `git init` → `git add` → `commit` → `git push -f origin main`.
  Dosya Gezgini'nden çalıştırıldı; GitHub girişi kullanıcı tarafından onaylandı. 251 dosya gönderildi (PUSH_OK).
- GitHub Pages açıldı (Deploy from a branch → main → / root).
- Yayın adresi: https://cemyurtlak.github.io/alen-oyun/ — Chrome'da açıldığı doğrulandı.

**Değişen / oluşan dosyalar:** `github_yukle.bat` (yeni), `.gitignore` (yeni, bat ve log dosyasını hariç tutar),
`README.md` (canlı link + güncelleme yöntemi), `DEVAM_NOTLARI.md`, `GELISTIRME_GUNLUGU.md`.

**Test durumu:** Canlı site başlangıç ekranı Chrome'da sorunsuz yüklendi.

---

## Aşama 1 — İlk sürüm: iki dilli sesli eğitim oyunu
**Tarih:** 17.11.2026

**İstek:**
2 yaşındaki Alen için bölümlü (renkler, sayılar, harfler, meyveler, hayvanlar...) web oyunu.
Önce sesli tanıtım (Türkçe + İngilizce ad), sonra iki dilli soru-cevap ("Which one is red? Hangisi kırmızı?"),
doğruda "yeeey" + alkış, yanlışta "hayııır". Sohbet sırasında eklenen istekler:
- Eğlenceli, renkli; "saçma 2D değil", kaliteli ve profesyonel görünüm
- Konuşmayı öğretme (çocuk sadece babıldıyor) ve katı yiyecek yemeyi teşvik eden etkinlikler
- Tam ekran seçeneği
- Hayvan sesleri; hayvan sorusunda önce "Which one is the cat?" sonra miyav sesi
- Hayvanları yaşadıkları yere taşıma (ördek → su, kuş → yuva), önce hepsini öğreterek
- Parmaklarla sayı sayma
- Ayrı kediler bölümü, renkli köpek balıkları bölümü, arabalar
- Sapana hayvanı koyup parmakla geri çekip fırlatma
- Koşarak ekrana yaklaşan, ekrana zıplayan kediler; farklı tonlarda kedi sesleri
- Tavuklar, ördekler, renkli yumurtalar, dans eden bebekler, konuşan bebekler
- Uluyan köpek, "mööö" gibi sesler ve taklit etme

**Yapılanlar:**
- Saf HTML/CSS/JS web uygulaması (kurulumsuz, GitHub Pages uyumlu, PWA manifest ile tam ekran).
- Microsoft Fluent Emoji 3D görselleri (MIT) indirildi, WebP'ye çevrildi (~200 görsel, ~2 MB).
- Balon/araba/yumurta/köpek balığı için 10 renkte renklendirilmiş 3D görseller üretildi (Python/PIL, HSV yöntemi).
- 11 öğren + soru-cevap bölümü: Renkler, Sayılar (parmakla sayma), Kediler, Hayvanlar, Kim Bu Ses?,
  Köpek Balıkları (okyanus teması), Arabalar (yol teması), Taşıtlar, Meyveler, Yiyecekler, Harfler, Şekiller.
- 11 oyun: Kedi Koşusu, Ses Taklidi, Konuşalım, Konuşan Kedi/Bebek, Dans Eden Bebekler, Yemek Zamanı,
  Parmakla Say, Yumurta Sürprizi, Hayvan Evleri, Sapan, Balonu Üfle.
- Sesli okuma: Web Speech API, Türkçe/İngilizce ses otomatik seçimi + ayarlardan seçim.
- Ses efektleri ve 39 hayvan/taşıt sesi Web Audio ile sentezlendi (uluma, 7 farklı kedi tonu dahil);
  isteğe bağlı mp3 kayıtlarıyla değiştirilebilir.
- Mikrofon ile ses/üfleme algılama; Konuşan Kedi için kayıt + ince sesle geri çalma.
- Özgün dans müziği (3 şarkı) Web Audio zamanlayıcısıyla.
- Ebeveyn ayarları (⚙️ basılı tutunca): ad, seçenek/soru sayısı, grup boyutu, hız, dil sırası, tam ekran, ses seçimi.

**Değişen / oluşan dosyalar:**
`index.html`, `manifest.json`, `css/style.css`, `js/images.js`, `js/data.js`, `js/settings.js`, `js/speech.js`,
`js/sounds.js`, `js/animalsounds.js`, `js/mic.js`, `js/music.js`, `js/core.js`, `js/learn.js`, `js/home.js`,
`js/act/catrun.js`, `js/act/imitate.js`, `js/act/parrot.js`, `js/act/dance.js`, `js/act/feed.js`,
`js/act/fingers.js`, `js/act/eggs.js`, `js/act/homes.js`, `js/act/sling.js`, `js/act/blow.js`,
`assets/img/*.webp`, `assets/img/tint/*.webp`, `assets/icon-192.png`, `assets/icon-512.png`,
`sounds/BENIOKU.txt`, `README.md`, `GELISTIRME_GUNLUGU.md`, `DEVAM_NOTLARI.md`.

**Test durumu:**
- Tüm JS dosyaları `node --check` ile sözdizimi kontrolünden geçti.
- Headless Chrome (Playwright) ile tüm ekranlar açıldı, tıklama/sürükleme/sapan çekme senaryoları denendi:
  sayfa hatası yok. Ekran görüntüleriyle görsel kontrol yapıldı (düğme içi görsel boyutu, dans balonu
  ters dönmesi, yemek ekranı yerleşimi düzeltildi).
- Test edilemeyenler: gerçek cihazda Türkçe TTS sesi, gerçek mikrofonla çocuk sesi algılama eşiği.
