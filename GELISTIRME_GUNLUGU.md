# Geliştirme Günlüğü

(En yeni aşama en üstte)

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
