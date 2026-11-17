# Geliştirme Günlüğü

(En yeni aşama en üstte)

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
