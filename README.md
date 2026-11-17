# Alen'in Oyunu 🐱🦈🎈

2 yaşındaki Alen için hazırlanmış, **Türkçe + İngilizce sesli**, renkli ve 3D görselli eğitici web oyunu.
Kurulum gerektirmez; tarayıcıda açılır, telefonda/tablette tam ekran çalışır.

## Neler var?

### 📖 Öğrenelim (tanıtım + soru-cevap)
Her bölümde önce öğeler tek tek **sesli tanıtılır** (önce Türkçe, sonra İngilizce adı),
sonra oyun başlar: *"Which one is red? Hangisi kırmızı?"*. Doğru cevapta **"Yeeey!" + alkış + konfeti**,
yanlışta **"Hayıııır! Tekrar dene!"** sesi gelir. 2 yanlıştan sonra doğru cevap parlayarak ipucu verir.

| Bölüm | İçerik |
|---|---|
| Renkler | 10 renk, havada süzülen 3D balonlarla |
| Sayılar | 1–10, **parmaklarla tek tek sayarak** |
| Kediler | Mutlu, gülen, seven, şaşkın, üzgün, kızgın kediler — her biri farklı tonda miyavlar |
| Hayvanlar | 20 hayvan; soruda "Which one is the cat?" dedikten sonra **miyav sesi** gelir |
| Kim Bu Ses? | Hayvan sesi çalar, çocuk sesin sahibini bulur |
| Köpek Balıkları | Okyanus sahnesinde yüzen **renkli köpek balıkları** |
| Arabalar | Polis, ambulans, itfaiye (siren), taksi, yarış arabası, renkli arabalar |
| Taşıtlar | Uçak, tren, gemi, helikopter, bisiklet, traktör, roket |
| Meyveler / Yiyecekler | 12 meyve, 16 katı yiyecek |
| Harfler / Şekiller | A–Z (Türkçe okunuşla), 7 şekil |

### 🎮 Oyunlar
| Oyun | Ne yapar? |
|---|---|
| **Kedi Koşusu** | Kediler uzaktan koşarak ekrana yaklaşır ve **ekrana zıplar**, camda pati izi bırakır; her seferinde farklı tonda miyav. Zıplayan kediler sayılır (1–10). |
| **Ses Taklidi** | İnek "Mööö", **uluyan köpek** "Auuuu", kedi, ördek, tavuk... Sesi dinler, hece hece duyar, "Sen yap!" der. Mikrofon çocuğun ses çıkarmasını algılar ve **her denemeyi** ödüllendirir. |
| **Konuşalım** | İlk sesler (a, o, u, m, ba, ma, pa, da) ve ilk kelimeler (anne, baba, su, mama, daha, bay bay...). Hece hece yavaşça söylenir, çocuğun her sesi kutlanır. |
| **Konuşan Kedi / Bebek** | Çocuk ne söylerse (babıldama dahil) kedi veya bebek onu **komik ince bir sesle tekrar eder**. Dokununca gıdıklanır. |
| **Dans Eden Bebekler** | Disko topu, renkli ışıklar, özgün neşeli müzik; 5 bebek dans eder ve konuşur. Dokununca döner ve bir şey söyler. |
| **Yemek Zamanı** | Kedi (köpek, panda, ayı) acıkmıştır; çocuk yiyeceğe dokununca kedi ağzını açar, **çiğner ("ham ham")**, "Mmm, çok lezzetli!" der. "Birlikte çiğneyelim" düğmesi aç–ısır–çiğne–yut adımlarını gösterir. **"Alen de yedi!"** düğmesi gerçek bir lokma yendiğinde büyük kutlama yapar. |
| **Parmakla Say** | Dokundukça parmaklar açılır ve sayılır (1–10); "Kaç tane?" modunda parmak sayısını bulur. |
| **Yumurta Sürprizi** | Renkli yumurtalara dokun, çatlasın; içinden civciv, ördek, kedi, baykuş... çıksın. Her dokunuşta yumurtanın rengi söylenir. |
| **Hayvan Evleri** | Önce tüm hayvanların nerede yaşadığı öğretilir (ördek → göl, kuş → yuva, inek → çiftlik...), sonra hayvan **parmakla doğru eve sürüklenir**. |
| **Sapan** | Hayvanı sapana oturt, **parmakla geri çek, bırak**; renkli balonları patlat. Küçük eller için balona dokunmak da otomatik atış yapar. |
| **Balonu Üfle** | Mikrofona üfledikçe balon şişer ve patlar (ağız-dudak kaslarını çalıştırır). |

## Kullanım

1. `index.html` dosyasını **Chrome** veya **Edge** ile açın (en iyi sonuç: GitHub Pages linki).
2. Büyük yeşil ▶ düğmesine basın — oyun tam ekrana geçer ve sesler açılır.
3. Ana sayfadaki ⛶ düğmesi tam ekranı açıp kapatır.
4. **Ebeveyn ayarları:** sol üstteki ⚙️ düğmesine **basılı tutun** (çocuk yanlışlıkla açmasın diye).
   Çocuğun adı, seçenek sayısı (2–4), soru sayısı, konuşma hızı, soru sırası (önce İngilizce/Türkçe), ses seçimi.

> **Mikrofon:** Konuşalım, Ses Taklidi, Konuşan Kedi ve Balonu Üfle mikrofon izni ister.
> Mikrofon yalnızca ses *seviyesini* ölçer; hiçbir şey kaydedilip bir yere gönderilmez
> (Konuşan Kedi kaydı yalnızca tarayıcı içinde anında geri çalar). Mikrofon izni yoksa ebeveyn 👍 düğmesine basar.

> **Türkçe ses:** Sesli okuma tarayıcının/işletim sisteminin seslerini kullanır. Türkçe ses yoksa:
> Windows → Ayarlar → Saat ve dil → Konuşma → Türkçe ses ekleyin; Android → Google metin okuma → Türkçe indirin.

## Kendi sesinizi ekleyin (isteğe bağlı)
- `sounds/yeah.mp3`, `sounds/alkis.mp3`, `sounds/hayir.mp3` → doğru/yanlış cevap sesleri yerine çalınır (anne-baba sesi çok etkili olur!).
- `sounds/animals/` → gerçek hayvan kayıtları: `cat.mp3`, `dog.mp3`, `cow.mp3`, `howl.mp3` (uluma), `kitten.mp3` ...
  Dosya varsa otomatik kullanılır, yoksa oyunun kendi ürettiği sesler çalar. Anahtar listesi `js/animalsounds.js` başında.

## GitHub Pages ile yayınlama
1. GitHub'da yeni bir depo açın (ör. `alen-oyun`), bu klasörün içeriğini yükleyin.
2. Depo → **Settings → Pages** → Source: `main` dalı, `/ (root)` → Save.
3. Birkaç dakika sonra link: `https://KULLANICI_ADI.github.io/alen-oyun/`
4. Telefonda linki açıp **"Ana ekrana ekle"** derseniz uygulama gibi tam ekran açılır.

## Dosya yapısı
```
index.html            Giriş sayfası (script sırası önemli)
manifest.json         Ana ekrana ekleme / tam ekran ayarı
css/style.css         Tüm tasarım ve animasyonlar
js/images.js          3D görsel haritası (emoji → dosya)
js/data.js            Bölümler, kelimeler, hayvanlar, evler, oyun listesi
js/settings.js        Ebeveyn ayarları (tarayıcıda saklanır)
js/speech.js          Türkçe/İngilizce sesli okuma
js/sounds.js          Alkış, ta-da, "vuuu", patlama, çıtır sesleri
js/animalsounds.js    Hayvan/taşıt sesleri (sentez) + kayıt desteği
js/mic.js             Mikrofon: ses ve üfleme algılama
js/music.js           Dans müziği (özgün ezgiler)
js/core.js            Ortak altyapı: ekran, konfeti, kutlama, eller (parmak)
js/learn.js           Öğren + soru-cevap motoru
js/home.js            Başla ekranı, ana sayfa, ayarlar
js/act/*.js           Oyunlar: catrun, imitate (Konuşalım + Ses Taklidi), parrot,
                      dance, feed, fingers, eggs, homes, sling, blow
assets/img/           3D görseller (Microsoft Fluent Emoji, MIT lisansı)
assets/img/tint/      Renklendirilmiş balon, araba, yumurta, köpek balığı
sounds/               (isteğe bağlı) kendi ses kayıtlarınız
```

## Ebeveyn için not
Oyun konuşma ve yeme konusunda oyunla destek olmak için tasarlandı: her ses denemesi ödüllendirilir,
yemek modellenir ve gerçek lokmalar kutlanır. 2 yaşında kelime kullanımı çok az ise ya da katı yiyecekler
hiç kabul edilmiyorsa, bir çocuk doktoru ve dil-konuşma / beslenme terapisti değerlendirmesi önerilir —
bu oyun o desteğin yerine geçmez, yanında eğlenceli bir yardımcıdır.

## Lisans / Kaynaklar
- 3D görseller: [Microsoft Fluent UI Emoji](https://github.com/microsoft/fluentui-emoji) — MIT lisansı.
- Sesler ve müzik: Web Audio API ile bu proje için üretilmiştir.
- Yazı tipi: Baloo 2 (Google Fonts, OFL).
