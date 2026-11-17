# -*- coding: utf-8 -*-
"""
Doğal ses kayıtlarını üretir (Microsoft Edge'in sinir ağı sesleri, edge-tts paketi ile).
  Türkçe : tr-TR-EmelNeural  (sıcak, net kadın sesi)
  English: en-US-AnaNeural   (neşeli çocuk sesi)
Girdi : tools/ses_listesi.json   (tools/ses_listesi_olustur.js üretir)
Çıktı : audio/voice/*.mp3  ve  audio/voice/index.js (oyunun okuduğu liste)
Daha önce üretilmiş dosyalar atlanır; sadece yeni cümleler üretilir.
Sesi değiştirmek için aşağıdaki VOICES satırını düzenleyip audio/voice klasörünü silin.
"""
import asyncio
import json
import os
import sys

try:
    import edge_tts
except ImportError:
    print("edge-tts yuklu degil. Once: pip install edge-tts")
    sys.exit(1)

VOICES = {"tr": "tr-TR-EmelNeural", "en": "en-US-AnaNeural"}
RATE = "-8%"   # çocuk için biraz yavaş ve anlaşılır
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


async def one(sem, e):
    out = os.path.join(ROOT, *e["file"].split("/"))
    if os.path.exists(out) and os.path.getsize(out) > 500:
        return True
    err = None
    async with sem:
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(e["text"], VOICES[e["lang"]], rate=RATE)
                await c.save(out + ".tmp")
                os.replace(out + ".tmp", out)
                return True
            except Exception as ex:  # ağ hatası vb.
                err = ex
                await asyncio.sleep(1.5 * (attempt + 1))
    print("HATA:", e["text"], "-", err)
    return False


async def main():
    items = json.load(open(os.path.join(ROOT, "tools", "ses_listesi.json"), encoding="utf-8"))
    os.makedirs(os.path.join(ROOT, "audio", "voice"), exist_ok=True)
    sem = asyncio.Semaphore(6)
    done = 0
    results = []
    for i in range(0, len(items), 60):
        part = items[i:i + 60]
        results += await asyncio.gather(*[one(sem, e) for e in part])
        done += len(part)
        print(f"{done}/{len(items)} cumle hazir")
    ok = {e["key"]: e["file"] for e, r in zip(items, results) if r}
    with open(os.path.join(ROOT, "audio", "voice", "index.js"), "w", encoding="utf-8") as f:
        f.write("/* Otomatik uretildi (tools/ses_uret.py) - elle duzenlemeyin */\n")
        f.write("var VOICE_FILES = " + json.dumps(ok, ensure_ascii=False) + ";\n")
    print(f"URETILDI {len(ok)}/{len(items)}")
    if len(ok) < len(items):
        print("Bazi cumleler uretilemedi; oyun onlar icin tarayicinin sesini kullanir.")


if __name__ == "__main__":
    asyncio.run(main())
