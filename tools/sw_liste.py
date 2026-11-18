"""Servis çalışanı (sw.js) listesini yeniler.
Görsel/ses eklendikten veya kod değiştirildikten sonra çalıştırın:  python tools/sw_liste.py
- sw_liste.js: arka planda önbelleğe alınacak görsel ve efekt dosyaları
- sw.js içindeki SURUM değeri dosyaların içeriğine göre değişir → telefonlar yeni sürümü alır."""
import hashlib, json, os, re
KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(KOK)
dosyalar = []
for kok in ['assets/img', 'assets/sfx']:
    for d, _, fs in os.walk(kok):
        for f in fs:
            if f.lower().endswith(('.webp', '.png', '.jpg', '.svg', '.mp3')):
                dosyalar.append(os.path.join(d, f).replace('\\', '/'))
dosyalar.sort()
open('sw_liste.js', 'w', encoding='utf-8').write(
    '// Otomatik üretilir: python tools/sw_liste.py — arka planda önbelleğe alınan görseller/efektler\n'
    'self.WARM_FILES = ' + json.dumps(dosyalar) + ';\n')
h = hashlib.sha1()
for d, _, fs in sorted(os.walk('.')):
    if d.startswith(('./.git', './tools', './sounds')): continue
    for f in sorted(fs):
        if f.endswith(('.js', '.css', '.html', '.json', '.webp', '.png', '.mp3')) and f != 'sw.js':
            p = os.path.join(d, f); h.update(p.encode()); h.update(str(os.path.getsize(p)).encode()); h.update(str(int(os.path.getmtime(p))).encode())
surum = h.hexdigest()[:10]
s = open('sw.js', encoding='utf-8').read()
s = re.sub(r"const SURUM = '[^']*';", f"const SURUM = '{surum}';", s)
open('sw.js', 'w', encoding='utf-8').write(s)
print(len(dosyalar), 'dosya, sürüm', surum)
