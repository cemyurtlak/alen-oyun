# Geliştirme Günlüğü

(En yeni aşama en üstte)

---

## Aşama 20 — Karga ve at sesleri yenilendi
**Tarih:** 18.11.2026

**İstek (Cem):** Karganın sesi çıkmıyor; at seslerinden biri saçma.

**Yapılanlar:**
- Karga: ESC-50 kayıtları (crow_1..3) BBC Sound Effects'ten iki net "gak gak" kaydıyla değiştirildi:
  - NHU05100162 "Carrion crow – Call CU" → `crow_1`
  - NHU05097107 "American crow – MCU calls" → `crow_2`
  Her dosyanın en yoğun 2,5 sn'si alındı ve -16 LUFS'a ayarlandı; spektrogramda 4'er net ötüş görüldü. `crow_3` kullanılmıyor.
- At: `horse_2` gürültülü bir kayıttı (spektrogramda kişneme yok). BBC 07050147 "One horse neighs" ile değiştirildi;
  temiz harmonik kişneme, 2 sn.
- Telefonlardaki eski seslerin yenilenmesi için medya önbelleği `alen-medya-v4` yapıldı.

**Değişen dosyalar:** `assets/sfx/crow_1.mp3`, `crow_2.mp3`, `horse_2.mp3`, `js/animalsounds.js`, `sw.js`, `sw_liste.js`, bu günlük.

**Test durumu:** Headless Chrome: karga ve at sesleri sonuna kadar çaldı.

---

## Aşama 19 — "Dans Eden Bebekler" yerine "Dans Edelim": gerçek dans eden çocuk videoları
**Tarih:** 18.11.2026

**İstek (Cem):** Dans Eden Bebekler kullanışlı değil; gerçekten dans eden bir bebek olsun, Alen izleyip dans etmeyi öğrensin.
Seçenekler arasından "2" (ücretsiz lisanslı gerçek dans videosu) seçildi.

**Yapılanlar:**
- Pexels'te "toddler dancing" ve "baby dancing" aramaları yapıldı. 10 aday video indirildi, kareleri incelendi; tek
  çocuğun net dans ettiği 4 video ve birlikte dans eden bir sınıf videosu seçildi.
  Pexels Lisansı: ücretsiz kullanım, atıf gerekmez; kaynaklar `assets/video/KAYNAK.txt` içinde.
- Videolar sessiz, 360p'ye küçültüldü (H.264, crf 27, faststart) → `assets/video/dans_1..5.mp4` + kapak resimleri (toplam 2,8 MB).
- `js/act/dance.js` baştan yazıldı:
  - Büyük video ekranı sessiz ve döngülü oynar; oyunun kendi müziği çalar, ışıklar ve notalar ritimle yanıp söner.
  - Alttaki küçük resimlerden dansçı seçilir: emzikli küçük çocuk, gökkuşağı etekli kız (iki video), şapkalı oğlan, dans eden sınıf.
  - Müzik, Şarkı ve Alkış düğmeleri var. Açılışta "Hadi dans edelim!" (kayıt mevcut).
- Ana sayfa kartının adı "Dans Edelim" oldu.

**Değişen dosyalar:** `js/act/dance.js`, `js/data.js`, `css/style.css`, `assets/video/*` (yeni), `sw.js`/`sw_liste.js`,
README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome, 400×800 ve 1024×700: video yüklendi ve oynadı (readyState 4); 5. dansçıya geçiş çalıştı;
hata yok. Ekran görüntüleri kontrol edildi.

---

## Aşama 18 — Yeni oyunlar: Dinozor Yumurtaları, Çekiç Oyunu, Top Yuvarla; Yemek Zamanı yenilendi; eller ve parmak sayma düzeltildi
**Tarih:** 18.11.2026

**İstek (Cem):**
- Çizgi filmlerdeki gibi: yumurtaların önünde onların renginde şekiller olsun, şekle basınca yumurta kırılsın, içinden
  dinozor çıksın (şekil + renk öğrenir).
- Konuşalım ve Konuşan Kedi kaldırılsın; başka ses çıkarınca da kabul ediyor, işe yaramıyor.
- Yemek Zamanı: bir hayvan çıksın, Alen onun yediği yiyeceği seçsin (inek → ot, tavşan → havuç ...).
- Delikler, üstünde renkli toplar; çekiçle vurunca toplar deliğe düşsün.
- Renkli topu yukarıdan yuvarlamayı, dönerek ve ses çıkararak inmesini seviyor.
- Parmakla Say: art arda basınca sayıyı duymadan sonraki parmak çıkıyor. Ellerin bir kısmı görünmüyor (temizlerken silinmiş).
- Dans Eden Bebekler kullanışlı değil (gerçekten dans eden bir bebek düşünmüştü).

**Yapılanlar:**
- `js/act/dino.js` (yeni) — Dinozor Yumurtaları:
  - Her yumurtanın önünde aynı renkte bir şekil durur (7 şekil × 7 renk).
  - Şekle ya da yumurtaya dokununca "Kırmızı! Üçgen!" söylenir, yumurta çatlar ve dinozor (sauropod / T-rex) çıkar.
  - 3 yumurta açılınca kutlama ve yeni tur. Yumurta Sürprizi'ndeki takılmaz kuyruk düzeni kullanıldı.
- `js/act/feed.js` (baştan yazıldı) — Yemek Zamanı:
  - Hayvan gelir: önce gerçek sesi, sonra adı. Tepside 3 yiyecek vardır.
  - Eşleşmeler: inek–ot, at–havuç, maymun–muz, tavuk–mısır, köpek–kemik, kedi–balık, ayı–bal, kurbağa–sinek,
    kuş–solucan, fil–fıstık. Tavşan oyunda yok (gerçek sesi bulunamadığı için çıkarılmıştı); at–havuç onun yerini tutuyor.
  - Doğru yiyecek ağza uçar, "Mmmm! Çok lezzetli!" ve hayvanın sesi çalar; her 5 doğruda kutlama.
  - Yanlış seçim sallanır. Soru konuşması yanlış dokunuşla kesilmez.
- `js/act/pegs.js` (yeni) — Çekiç Oyunu: tahtada 5 delik, üstlerinde renkli toplar. Topa dokununca çekiç iner,
  top "tok" diye deliğe düşer ve rengi söylenir; hepsi düşünce kutlama ve yeni toplar.
- `js/act/roll.js` (yeni) — Top Yuvarla: sepetteki topa dokununca top 4 zikzak rampadan dönerek iner.
  Rampada "gürül gürül" ses (`Sounds.roll`), her düşüşte "tok" sesi çıkar; kutuya düşünce rengi söylenir. 6 top inince kutlama.
- Konuşalım (`talk`) ve Konuşan Kedi (`parrot`, `js/act/parrot.js` artık yüklenmiyor) ana sayfadan kaldırıldı.
  Ses Taklidi kaldı.
- Parmakla Say: sayı söylenirken gelen dokunuşlar yok sayılır, her sayı duyulmadan yeni parmak açılmaz.
  `hand_1..5` orijinal fotoğraftan, gerçek panel sınırlarına göre ve ten rengi maskesiyle yeniden kesildi; eller artık tam.
- Yeni Fluent görselleri: dinozorlar, kemik, bal, ot, çekiç, solucan, sinek, fıstık, marul, fide, yanardağ, palmiye, top.
- `Sounds.thud()` (tahta "tok") ve `Sounds.roll()` (yuvarlanma) efektleri eklendi.

**Yeni ses kaydı gerekmedi:** şekil, renk, hayvan adları ve "Mmmm! Çok lezzetli!" zaten Piku ile kayıtlıydı.
İleride istenirse ElevenLabs'te: yiyecek adları (Ot, Kemik, Balık, Bal, Sinek, Solucan, Fıstık), "Dinozor!",
"… ne yer?" soruları.

**Değişen dosyalar:** `js/act/dino.js`, `js/act/pegs.js`, `js/act/roll.js` (yeni), `js/act/feed.js`, `js/act/fingers.js`,
`js/sounds.js`, `js/data.js`, `js/images.js`, `index.html`, `css/style.css`, `assets/img/*.webp` (13 yeni),
`assets/img/real/hand_1..5.webp`, `sw_liste.js`, `sw.js`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome, 400×800 ve 1024×700:
- Yemek: 4/4 doğru seçim, sayaç ilerledi.
- Dinozor: 2 tur tamamlandı.
- Çekiç: 5 top düştü, yeni tur geldi.
- Top Yuvarla: 6 top kutuya indi, sepet yenilendi.
- Parmakla Say: 150 ms arayla 10 hızlı dokunuşta yalnızca 2 sayı ilerledi; sayılar atlanmadan 10'a ulaşıldı.
- Hata yok, kaydı olmayan cümle yok. Ekran görüntüleri kontrol edildi.

---

## Aşama 17 — Aslan–kaplan aynı soruda çıkmaz, sesler arasında nefes payı
**Tarih:** 18.11.2026

**İstek (Cem):** Civciv sesi düzeldi mi? Hayvanları sorarken aslanla kaplan aynı anda gelmesin, sesleri aynı.
Konuşmanın hemen arkasından yeni soru gelince anlaşılmayabiliyor; seslerden önce boşluk bırak.

**Yapılanlar:**
- Civciv: Aşama 15'te yeni temiz kayıtla değiştirildi (yayınlanınca telefona gelir).
- `data.js` `SOUND_ALIKE`: sesi benzeyen hayvan grupları (aslan–kaplan–ayı, tavuk–horoz–hindi, ördek–kaz,
  kuş–civciv–güvercin, maymun–goril, köpek–kurt–tilki). `learn.js` seçenek seçerken bunları aynı soruda bir araya getirmez.
- `audiocache.js`: bir ses bittikten sonra aynı türden (konuşma/efekt) yeni ses en az 350 ms sonra başlar.
  Bekleme sırasında da "meşgul" sayılır ve durdurulabilir.

**Test durumu:** Kim Bu Ses 12 soru: ardışık sesler arası ~350 ms; 24 bölüm hatasız; yumurta stres testi 6/6 tur.

---

## Aşama 16 — Yumurta Sürprizi takılmıyor, alakasız sesler kalktı
**Tarih:** 18.11.2026

**İstek (Cem):** Yumurta kırma kısmında takılıp kalıyor; hızlıca sırayla basınca hepsini kırıyor ama alakasız sesler çıkıyor. Eksik bir şey varsa tamamla.

**Sebep:**
- Ses sırası en fazla 8 iş tutuyordu. Hızlı basınca (özellikle çıkmış yavrulara tekrar tekrar) sıra doluyordu ve
  "kutlama + yeni yumurtalar" adımı sıraya giremeyip kayboluyordu → yeni yumurtalar hiç gelmiyordu (takılma).
- Çıkmış yavrulara her dokunuş yeni bir "ses + ad" ekliyordu. Bunlar yeni yumurtalar geldikten sonra da çalmaya
  devam ediyordu (alakasız sesler).

**Yapılanlar (`js/act/eggs.js`):**
- Tur numarası eklendi: tur değişince eski turun bekleyen sesleri atlanır.
- Yumurta kırılma sesi ve "kutlama + yeni yumurtalar" adımı sıraya her zaman girer (zorunlu); oyun asla takılmaz.
  Kutlama en fazla 6 sn bekler.
- Çıkmış yavruya dokununca ses yalnızca o an başka ses çalmıyorsa tekrar çalar (sıra birikmez).
- Kutlama sırasında yumurtalara dokunma kapatılır.

**Eksik kontrolü:** 24 bölüm ve oyunun hepsi açıldı. Kaydı olmayan cümle yok, eksik dosya (404) yok, sayfa hatası yok.

**Değişen dosyalar:** `js/act/eggs.js`, `sw.js`/`sw_liste.js` (sürüm), bu günlük, DEVAM_NOTLARI.

**Test durumu:** Headless Chrome: 6 tur boyunca her turda 3 yumurtaya 4'er kez hızlıca (60 ms arayla) basıldı.
6 turun hepsi tamamlandı; 18 hayvan sesi çaldı, hepsi o anki yumurtalara aitti (alakasız ses 0).

---

## Aşama 15 — Sesler yarıda kesilmiyor, civciv sesi yenilendi, baloncuklarda hayvanlar
**Tarih:** 18.11.2026

**İstek (Cem):** Karganın sesi çıkmadı (ekrana sürekli basılmış olabilir). Baloncuk oyununda baloncukların içine balık koy;
sonra düzeltti: farklı farklı hayvanlar olsun, patlayınca sesleri çıksın. "Kırmızı köpek balığı" yerine "kırmızı kop" diyor.
Sapanda ve her yerde sesler yarıda kesiliyor. Hayvanlarda civciv sesi duyulmuyor.

**Bulunanlar:**
- Ses dosyaları sağlam: 753 konuşma ve 117 efekt dosyası tarayıcıda tek tek açıldı, hece/enerji incelemesiyle
  kırmızı köpek balığı kaydının tam olduğu görüldü.
- Kesilmenin asıl sebebi oyunun kendisiydi: doğru cevaptan sonra kutlamaya en fazla 1,6 sn tanınıyor, sonra yeni soru
  konuşmayı ortasından kesiyordu ("Yaşasın! Bra…").
- Yanlış şıkka dokunmak, çalmakta olan soruyu (hayvan sesi/adı) durduruyordu. Çocuk sürekli dokununca karga sesi hiç duyulmuyordu.
- Aşama 12'deki Web Audio motoru telefonda güvenilir değildi.
- Civciv kayıtları (ESC-50) neredeyse tamamen hışırtıydı; içinde yalnızca birkaç zayıf cik vardı.

**Yapılanlar:**
- `audiocache.js` baştan yazıldı. Dosyalar bir kez indirilip bellekte (Blob) tutuluyor. Çalma telefonun medya oynatıcısıyla
  (`<audio>`) yapılıyor; en fazla 8 oynatıcılık havuz var. Dosya 1,5 sn'de bellekte değilse doğrudan internetten çalar, ses atlanmaz.
- `learn.js`: kutlama konuşması sonuna kadar çalar (güvenlik sınırı 3,5 sn), alkış kendi yumuşak kısılmasıyla biter (~1,9 sn).
  Soru çalarken yanlış şıkka dokunulursa soru kesilmez; şık sadece sallanır ve işaretlenir.
- Civciv: BBC kaydından (NHU05012038) en temiz 8 cik ayıklandı (spektrogramda net harmonik yaylar) → yeni `chick_1/2.mp3`.
- Baloncuk Patlat: baloncukların ~%75'inde oyundaki 36 hayvandan biri var (aynısı art arda gelmez). Patlayınca hayvan kenara
  doğru gider, önce gerçek sesi sonra adı çalar; çok hızlı patlatılırsa ad atlanır, ses atlanmaz. Boş baloncuklar sayılmaya devam eder.
- Servis çalışanı: medya önbelleği `alen-medya-v3` (yeni civciv sesleri telefona gelsin); arka plan indirmesi 2 paralele düşürüldü.

**Değişen dosyalar:** `js/audiocache.js`, `js/learn.js`, `js/core.js`, `js/animalsounds.js`, `js/act/bubbles.js`,
`assets/sfx/chick_1.mp3`, `assets/sfx/chick_2.mp3`, `sw.js`, `sw_liste.js`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome, sesler oynatıcı düzeyinde izlendi:
- Kim Bu Ses 10 soru: 41 ses çaldı, 41'i sonuna kadar bitti. Kutlama ve soru konuşmalarında kesilme yok; kesilenler yalnızca
  alkışın kasıtlı kısılması ve doğru şıkka dokununca duran soru.
- Baloncuk Patlat: hayvanlar sesleriyle çıktı, hata yok.
- 24 bölüm ve oyunun hepsi hatasız açıldı.

---

## Aşama 14 — Yeni oyun: Baloncuk Patlat (su altı)
**Tarih:** 18.11.2026

**İstek (Cem):** Oyuna bir de suyun altında baloncuk patlatma oyunu ekleyelim.

**Yapılanlar:**
- `js/act/bubbles.js`: okyanus sahnesi (ışık huzmeleri, kum, mercan, yengeç, ahtapot, arkada yüzen balıklar).
  Dipten gökkuşağı yansımalı sabun köpüğü baloncuklar yükselir, hafifçe esner. Balon Patlat'taki gibi önce hızlı çıkar,
  sonra yavaşlar; ekrana girmeden patlatılamaz.
- Dokununca "blop" sesiyle patlar, etrafa minik köpükler saçılır. Boş baloncuklar sırayla sayılır (Bir... On → kutlama).
- Baloncukların %25'inde deniz hayvanı vardır: renkli köpek balığı (rengiyle söylenir), balina, fok, penguen
  (gerçek sesi + adı). Patlayınca hayvan kurtulup ekranın kenarına doğru yüzer.
- Sesler kuyrukta (en fazla 6): üst üste binmez, sayılar atlanmaz. Tanıtım konuşması yok; oyun hemen başlar.
- Yeni konuşma kaydı gerekmedi: sayılar, hayvan adları ve renkli köpek balıkları zaten Piku ile kayıtlıydı.
- `Sounds.bubble()`: kısa yükselen "blop" efekti (konuşma değil, efekt).
- Ana sayfaya "Baloncuk Patlat 🫧" kartı eklendi. Kaydedilmiş sıralamada yoksa sona eklenir, basılı tutup taşınabilir.

**Değişen dosyalar:** `js/act/bubbles.js` (yeni), `js/sounds.js`, `js/data.js`, `index.html`, `css/style.css`, `sw.js`/`sw_liste.js`,
README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome, 400×800 ve 1024×700: ~33 baloncuk patlatıldı, sayılar sırayla, hayvan sesleri ve adları
çaldı, sayfa hatası yok. Ekran görüntüleri kontrol edildi.

---

## Aşama 13 — Domuz kaldırıldı, koyun fotoğrafı yenilendi
**Tarih:** 18.11.2026

**İstek (Cem):** "Kim bu"da domuzun sesi çıkmıyor, domuzu tamamen kaldır. Koyunun arka bacakları yok.

**Yapılanlar:**
- Domuz `ANIMALS` listesinden, `animalsounds.js` REAL haritasından ve `images.js` gerçek fotoğraf bloğundan çıkarıldı → 36 hayvan.
  (`pig_*.mp3` ve `real/pig.webp` dosyaları klasörde duruyor ama artık kullanılmıyor.)
- Koyun: eski fotoğrafta arka bacaklar otun içinde kayboluyordu. Wikimedia Commons'tan yandan çekilmiş, dört bacağı görünen
  Columbia kuzusu (Ewe lamb, Columbia breed.jpg) alındı, rembg ile arka planı temizlendi → `assets/img/real/sheep.webp`. KAYNAK.txt güncellendi.
- Aynı adlı görsel değiştiği için servis çalışanının medya önbelleği `alen-medya-v2` yapıldı; eski önbellek otomatik silinir.

**Değişen dosyalar:** `js/data.js`, `js/animalsounds.js`, `js/images.js`, `assets/img/real/sheep.webp`, `assets/img/real/KAYNAK.txt`,
`sw.js`, `sw_liste.js`, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome: 36 hayvan, domuz yok, sesi olmayan hayvan yok; Kim Bu Ses?, Hayvanlar, Hayvan Evleri,
Yumurtalar hatasız açıldı. Yeni koyun görseli kontrol edildi (dört bacak görünür).

---

## Aşama 12 — Hız: sesler gecikmesiz, açılış ve görseller hızlı (ortak ses motoru + önbellek)
**Tarih:** 18.11.2026

**İstek (Cem):** "Kim bu" kısmında sesler ya geç geliyor ya da hiç çıkmıyor; oyun geç açılıyor; görseller geç çıkıyor.

**Neden oluyordu:**
- Açılışta `sounds/animals/` ve `sounds/` altındaki isteğe bağlı kayıtlar tek tek yoklanıyordu → ~55 boş (404) istek,
  ve telefonda her biri bir ses oynatıcısı açtığı için oynatıcı sınırı doluyordu (sesler çalmıyordu).
- Her ses/cümle için yeni `<audio>` açılıp dosya o an indiriliyordu → her soruda gecikme; hayvan sesinde 4 sn sınırı
  yüklenmeyen sesi hiç çalmadan kesiyordu.
- Hiçbir şey cihazda saklanmıyordu → her açılışta görseller yeniden indiriliyordu; Google yazı tipi açılışı bekletiyordu.

**Yapılanlar:**
- Yeni `js/audiocache.js` (AudioCache): tek Web Audio bağlamı, her dosya bir kez indirilip çözülür, sonra anında çalar;
  ilk dokunuşta ses kilidi açılır; `speech`/`fx` grupları ayrı durdurulur; arka planda sıralı önceden yükleme (4 paralel); bellek sınırı 220 ses.
- `speech.js`, `animalsounds.js`, `sounds.js` (alkış) bu motora bağlandı; açılış yoklamaları kaldırıldı.
- Önceden yükleme: bölüm açılınca o bölümün tüm hayvan sesleri + adları + "Kim bu?"; ana sayfada kutlama/alkış/"hayır";
  Kedi Koşusu'nda miyavlar ve sayılar; Yumurta, Sapan, Balon Patlat'ta hayvan sesleri.
- `sw.js` servis çalışanı: kod önce ağdan (güncellemeler hemen gelir), görsel/ses önce önbellekten; kurulumdan sonra
  390 görsel+efekt arka planda indirilir → ikinci açılıştan itibaren anında ve internetsiz çalışır.
  `tools/sw_liste.py` listeyi (`sw_liste.js`) ve sürüm numarasını yeniler.
- Google yazı tipi açılışı bekletmeyecek şekilde yükleniyor.

**Değişen dosyalar:** `js/audiocache.js` (yeni), `sw.js` (yeni), `sw_liste.js` (yeni), `tools/sw_liste.py` (yeni), `index.html`,
`js/speech.js`, `js/animalsounds.js`, `js/sounds.js`, `js/learn.js`, `js/home.js`, `js/act/catrun.js`, `js/act/eggs.js`,
`js/act/sling.js`, `js/act/pop.js`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome: açılışta 404 kalmadı (yalnızca test ortamında internet olmadığı için Google yazı tipi);
"Kim Bu Ses?" 10 soru: hayvan sesi soru ekrana gelir gelmez 2–3 ms içinde başladı, ardından ad çaldı; yavaş ağ (1,5 Mbit, 150 ms)
benzetiminde ilk soru 0,36 sn. 24 bölüm/oyunun hepsi hatasız açıldı. Servis çalışanı ~600 dosyayı önbelleğe aldı.

---

## Aşama 11 — Kedi Koşusu: her zıplayışta farklı gerçek miyav, "pıt" sesi kaldırıldı
**Tarih:** 18.11.2026

**İstek (Cem):** Kediler geliyor bölümünde kediler zıplarken farklı miyav sesleri çıksın; şu an sadece "pıt pıt" ses çıkıyor, bu gereksiz.

**Yapılanlar:**
- BBC Sound Effects'ten 11 kedi kaydı (Burma, Siyam, İran, erkek kedi, 10 haftalık ve 3 aylık yavrular...) indirildi; enerji tabanlı
  olay tespitiyle tek tek miyavlar ayıklandı, spektrogramla (harmonik yaylar) doğrulandı → `assets/sfx/meow_1..17.mp3`.
- `animalsounds.js` `randomMeow`: 17 BBC + 3 ESC-50 miyav arasından, aynısı art arda gelmeden, hafif ton farkıyla çalar.
- `catrun.js`: kendiliğinden ekrana zıplayan kediler de miyavlar (sıra kalabalıksa eklenmez, böylece üst üste binmez);
  dokunulan kedi miyav + sayı. Kedi cama yapışınca çalan `Sounds.pop()` ("pıt") kaldırıldı.

**Değişen dosyalar:** `js/act/catrun.js`, `js/animalsounds.js`, `assets/sfx/meow_1..17.mp3`, README, bu günlük.

**Test durumu:** Headless Chrome: dokunmadan 25 sn → 10 kedi zıpladı, 10 farklı miyav sırayla çaldı (meow_3, 11, 12, 17, 9, cat_3, 1, 10, 8, 4),
"pıt" sesi yok, sayfa hatası yok.

---

## Aşama 10 — Gerçekçi kediler/köpek balıkları/eller, 37 hayvan, 10 soruluk kesintisiz tur, kart sıralama
**Tarih:** 18.11.2026

**İstek (Cem):**
- Kedi Koşusu: kediler zıplarken yüzleri ekrana doğru gelsin; kediler gerçekçi olsun.
- Balon Patlat: balonlar alttan biraz hızlı gelip yavaşlasın (çıkmadan patlatıyor).
- Köpek balıkları yüzen gerçekçi köpek balığı olsun.
- "Kim bu ses?" bölümüne çok daha fazla hayvan (en sevdiği bölüm).
- 5 soru sorup "Tekrar oyna" çıkmasın, 10 soru sorsun.
- Ana sayfadaki giriş kartlarının sırası basılı tutarak kalıcı değiştirilebilsin.
- Parmak saymadaki el çizimi kötü; gerçekçi el.

**Yapılanlar:**
- Kedi Koşusu (`catrun.js`): 8 gerçek, kameraya bakan kedi fotoğrafı (Wikipedia: Bombay, Scottish Fold, sarman, Rus mavisi,
  Maine Coon, turuncu-beyaz, İran, tekir; arka planı temizlendi) → `assets/img/real/cat_*.webp`. Ayna çevirme ve zıplarken
  dönme kaldırıldı: kedi hep yüzü ekrana dönük koşar ve ekrana doğru büyüyerek zıplar.
- Balon Patlat (`pop.js`): giriş hızı = seyir hızı + H·1,2·e^(−3t) → balon ekranın ~%40'ına hızla çıkıp yavaşlar;
  henüz ekrana girmemiş balona dokunma sayılmaz.
- Köpek balıkları: Wikipedia mako fotoğrafı arka planı temizlenip 10 renge boyandı (karın beyaz kalır) →
  `assets/img/tint/shark_*.webp` (mevcut yüzme animasyonu sürüyor); 🦈 → `real/shark.webp`.
- Yeni 20 hayvan (`data.js`, `animalsounds.js`, `images.js`): Keçi, Domuz, Eşek, Hindi, Kaz, Horoz, Kurt, Kaplan, Guguk Kuşu,
  Karga, Martı, Papağan, Balina, Fok, Goril, Tavus Kuşu, Güvercin, Penguen, Yılan (çıngırak), Cırcır Böceği → toplam 37.
  Sesler BBC Sound Effects (spektrogramla seçildi; insan ıslığı "wolf whistle", guguklu saat, oyuncak fare gibi yanlış
  sonuçlar elendi; deve, yunus, su aygırı, ağaçkakan ve fare temiz kayıt bulunamadığı için eklenmedi), domuz/karga/horoz ESC-50.
  Fotoğraflar Wikipedia (arka planı temizlendi). Türkçe/İngilizce adlar ElevenLabs Piku ile üretildi (40 kayıt, 2. hesap).
- Sorular (`learn.js`): tur 10 soru; bitince bitiş ekranı yerine büyük kutlama ve kendiliğinden yeni 10 soru.
  Ayarlardaki "soru sayısı" seçeneği kaldırıldı.
- Ana sayfa (`home.js`, `settings.js`, `style.css`): tüm kartlar tek alanda; karta ~0,45 sn basılı tut → kart kalkar →
  sürükle → bırak. Sıra `Settings.homeOrder`'a kaydedilir (kalıcı). Basılı tutmadan kaydırma normal çalışır;
  sürüklemeden sonra kart yanlışlıkla açılmaz. Ana sayfadan çıkınca dinleyiciler temizlenir.
- Parmak sayma (`core.js`): çizim el yerine gerçek el fotoğrafları (Wikimedia "Finger-counting to 5 from pointer" 4160×1200
  şerit 5 ele bölündü + "Closed fist" = 0) → `assets/img/real/hand_0..5.webp`; 6–10 için ikinci el aynalanır; değişimde küçük zıplama.

**Değişen / oluşan dosyalar:** `js/{catrun,pop}.js` (act), `js/learn.js`, `js/home.js`, `js/settings.js`, `js/images.js`, `js/data.js`,
`js/animalsounds.js`, `js/core.js`, `css/style.css`, `assets/img/real/*` (8 kedi, 20 hayvan, köpek balığı, 6 el), `assets/img/tint/shark_*`,
`assets/sfx/*` (25 yeni), `audio/voice/*` (40 yeni) + `index.js`, `tools/ses_listesi.json`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Headless Chrome: 37 hayvanın hepsinde gerçek ses + fotoğraf var; 753 cümlenin hepsi kayıtlı; renkler bölümünde
11 doğru cevap → 10. sorudan sonra kutlama ve yeni soru (bitiş ekranı yok); kart sürükleme 16. sıradan 11.'ye taşıdı,
yenilemede korundu; ekran görüntüleriyle eller, Kedi Koşusu, köpek balıkları, Kim bu ses kontrol edildi. Sayfa hatası ve 404 yok.

---

## Aşama 9 — Tanıtım kısımları kaldırıldı, doğrudan oyun
**Tarih:** 17.11.2026

**İstek (Cem):** Tanıtım kısımları olmasın, direkt oyun oynayarak öğrenmiş olur.

**Yapılanlar:**
- `js/learn.js`: bölüm açılınca tanıtım ekranı yerine doğrudan soru-cevap başlar (`startPlay`). Bitiş ekranındaki
  "Tekrar öğren" düğmesi kaldırıldı ("Tekrar oyna" ve "Ana sayfa" kaldı). Tanıtım kodu (`startLearn`) kullanılmıyor, silinmedi.
- `js/act/homes.js`: Hayvan Evleri tanıtım turu atlanır, doğrudan sürükleme oyunu açılır; "Tekrar öğren" kaldırıldı.
  Çocuk doğru cevapta "Ördek gölde yaşar" cümlesiyle, iki yanlışta parlayan doğru evle öğrenir.

**Değişen dosyalar:** `js/learn.js`, `js/act/homes.js`, README, bu günlük.

**Test durumu:** Headless Chrome: 12 bölümün hepsi doğrudan soru ekranıyla, Hayvan Evleri doğrudan oyunla açıldı;
3 soruluk tur doğru cevaplarla tebrik ekranına ulaştı (düğmeler: Tekrar oyna, Ana sayfa). Sayfa hatası yok.

---

## Aşama 8 — Temiz alkış, doğru fil sesi, Kedi Koşusu ses sırası, bölümlerde grup yok
**Tarih:** 17.11.2026

**İstek (Cem):**
- Alkış sesinde sorun var, arka planda farklı sesler çıkıyor. Filin sesi doğru değil.
- Kediler geliyor kısmında sesler üst üste biniyor ve seslerin çoğu çalışmıyor.
- Hayvanlar, sayılar, renkler vb. kendi içinde bölümlere ayrılmasın; örneğin hayvanlarda tüm hayvanlar çıksın.

**Yapılanlar:**
- Spektrogram incelemesi: ESC-50 `clapping_1`'de sürekli ~5 kHz ıslık, `clapping_3` alkış değildi; `elephant_2` kuş/ortam karışıktı.
- Alkış: BBC Sound Effects temiz salon alkışı (07047044, 07047045) → `assets/sfx/clapping_1..3.mp3` (-20 LUFS, yumuşak giriş/çıkış).
  `sounds.js`: alkış 3 kayıttan seçilir, sonunda sesi kısılarak biter (kesik tık yok); sentez alkış yedeği kaldırıldı.
- Kutlamadaki bilgisayar sentezi "ta-da" (fanfar) kapatıldı → kutlama = gerçek alkış + Piku "Yeeey! Aferin!".
- Fil: BBC African elephant trumpeting (NHU05098070, NHU05098069) ve Indian elephant (07062089) kayıtlarından
  spektrogramla doğrulanmış 3 temiz boru sesi → `elephant_1..3.mp3`.
- Kedi Koşusu (`catrun.js`): ses kuyruğu — her dokunuşta gerçek miyav → sayı ("Bir! One!") sırayla, üst üste binmez,
  atlanmaz (kuyruk ≤ 6). Kendiliğinden ekrana zıplayan kediler artık sessiz (üst üste binmenin ana sebebi buydu).
  "On kedi!" kutlaması da kuyrukta.
- Öğren bölümleri (`learn.js`): grup seçimi kaldırıldı; her bölüm doğrudan tüm öğelerle açılır ve tümünden sorulur.
  Ebeveyn ayarlarındaki "Bir grupta kaç öğe" seçeneği kaldırıldı.

**Değişen dosyalar:** `js/sounds.js`, `js/animalsounds.js`, `js/act/catrun.js`, `js/learn.js`, `js/home.js`,
`assets/sfx/{clapping_1..3, elephant_1..3}.mp3`, README, DEVAM_NOTLARI, bu günlük.

**Test durumu:** Yeni kliplerin spektrogramları temiz (alkışta sabit ton/konuşma yok; filde harmonikli boru sesi).
Headless Chrome: fil 4 kez çalındı, kutlama hatasız; Kedi Koşusu'nda 5 hızlı dokunuş → 5 miyav + "bir…beş" sırayla, sayaç 5;
12 bölümün hepsi grup ekranı olmadan tüm öğelerle açıldı. Sayfa hatası yok.

---

## Aşama 7 — Sapan dikey ekranda düzgün ve nişanla vurulabilir; hayvanlarda önce ses, sonra ad
**Tarih:** 17.11.2026

**İstek (Cem):**
- Sapan: ekran dik konumdayken balonlar ekranın içinde kalmıyor; sapanla vurulabilecek açıda olmuyor,
  sadece balona tıklayınca vuruluyor.
- Hayvanlar kısmında önce hayvanın sesi çıksın, sonra adını söylesin.

**Yapılanlar:**
- `js/act/sling.js`:
  - Balonlar artık ekrana göre (u,v) yerleşiyor: her derinlikte görünür genişliğin %85'i ve üst çubuk ile sapan
    arasındaki yükseklik içinde. Ekran döndürülünce/boyut değişince yeniden yerleşiyor. Kayan balonlar da kenarda dönüyor.
  - Yeni nişan: sapan geri çekilince çekişin ters yönünde ekranda bir nişan noktası oluşur (çok çekince yukarı/uzağa).
    Noktaya yakın balon **parlak halkayla** işaretlenir (geniş tolerans), bırakınca hayvan balistik olarak tam ona uçar.
    Boşluğa nişan alınırsa o noktaya doğru uçar. Balona dokunarak atış (kolay mod) aynı hesapla çalışır.
  - Vuruşta ya da hedeflerin ötesine geçince atış hemen biter → yeni atış beklemesi 4–5 sn'den ~0,5 sn'ye indi.
- `js/learn.js`: öğrenmede sıra **gerçek hayvan sesi → Türkçe ad → İngilizce ad → taklit ("Hav hav!")**;
  soruda **gerçek ses → ad**.

**Değişen dosyalar:** `js/act/sling.js`, `js/learn.js`, README, bu günlük.

**Test durumu:** Headless Chrome, sadece geri çekip nişan alarak: dikey 390×844 → 10 atışta 10 balon,
yatay 1100×700 → 10/10; ekran görüntüsünde tüm balonlar görünür. Hayvanlar öğrenme/soru ses sırası kayıtla doğrulandı
(dog_2 → köpek → dog → hav hav; cow_3 → cow → inek). Sayfa hatası yok.

---

## Aşama 6 — Yumurta Sürprizi: tek dokunuşta açılma, sesler atlanmıyor
**Tarih:** 17.11.2026

**İstek (Cem):** Yumurtalara bir kere basınca kırılıp açılsın. Basmaya devam edince ses çalmıyor; sesler atlanmasın.

**Yapılanlar:**
- `js/act/eggs.js`: yumurta artık **tek dokunuşta** çatlıyor (önce 3 dokunuş gerekiyordu).
- Ses kuyruğu: her dokunuşun sesi (gerçek hayvan sesi → "Sürpriz! Köpek!" → "A puppy!") sıraya giriyor; yeni dokunuş
  önceki sesi kesmiyor (eskiden `Speech.cancel()` ile kesiliyordu). Çıkmış yavruya tekrar dokununca sesi ve adı yine
  sıraya eklenir. Kuyruk en fazla 8 iş tutar (sesler dakikalarca birikmesin). Açılış konuşması ilk dokunuşta susar.
- Hız için yumurta başına renk cümlesi kaldırıldı (yumurta başına ~4–6 sn). 3 yumurta açılınca kutlama, sonra yeni yumurtalar.

**Değişen dosyalar:** `js/act/eggs.js`, README, bu günlük.

**Test durumu:** Headless Chrome: 3 yumurtaya 150 ms arayla basıldı → üçü hemen açıldı; 3 hayvan sesi + adları sırayla,
kesilmeden çaldı; 4. dokunuş (açılmış yavru) da çaldı; ardından yeni yumurtalar geldi. Sayfa hatası yok.

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
