# -*- coding: utf-8 -*-
"""
SES DİZİNİ ve EKSİK SES LİSTESİ (bilgisayar seslendirmesi YOKTUR)

Oyundaki bütün konuşmalar ElevenLabs'te "Piku - Expressive Kid Character" sesiyle,
"Eleven v4" modeliyle üretilir (ayarlar: Stability 50, Similarity 75 — varsayılan).

Bu betik:
  1) tools/ses_listesi.json'daki her cümle için audio/voice/ içinde kayıt var mı bakar,
  2) olanlarla audio/voice/index.js dosyasını (oyunun okuduğu liste) yeniden yazar,
  3) kaydı olmayanları tools/eksik_sesler_tr.txt ve tools/eksik_sesler_en.txt
     dosyalarına ElevenLabs'e yapıştırılacak biçimde ([pause] ile ayrılmış) yazar.

Yeni cümle eklenince:
  node tools/ses_listesi_olustur.js   ->  python tools/ses_uret.py
  -> eksik_sesler_*.txt içeriğini ElevenLabs'te Piku ile seslendirip indir
  -> tools/elevenlabs_bol.py ile cümlelere böl  ->  python tools/ses_uret.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTE = os.path.join(ROOT, 'tools', 'ses_listesi.json')
SES = os.path.join(ROOT, 'audio', 'voice')


def bitir(t):
    t = t.strip()
    return t if t[-1:] in '.!?' else t + '.'


def main():
    items = json.load(open(LISTE, encoding='utf-8'))
    m, eksik = {}, {'tr': [], 'en': []}
    for it in items:
        if os.path.exists(os.path.join(ROOT, it['file'])):
            m[it['key']] = it['file']
        else:
            eksik[it['lang']].append(it)
    with open(os.path.join(SES, 'index.js'), 'w', encoding='utf-8') as f:
        f.write('/* ElevenLabs (Piku - Expressive Kid Character, Eleven v4) kayitlari. '
                'tools/ses_uret.py yazar - elle duzenlemeyin */\n')
        f.write('var VOICE_FILES = ' + json.dumps(m, ensure_ascii=False) + ';\n')
    for lang, lst in eksik.items():
        p = os.path.join(ROOT, 'tools', 'eksik_sesler_%s.txt' % lang)
        if lst:
            with open(p, 'w', encoding='utf-8') as f:
                f.write(' [pause] '.join(bitir(i['text']) for i in lst))
        elif os.path.exists(p):
            os.remove(p)
    print('Kayitli: %d  Eksik TR: %d  Eksik EN: %d' % (len(m), len(eksik['tr']), len(eksik['en'])))


if __name__ == '__main__':
    main()
