# -*- coding: utf-8 -*-
"""
ElevenLabs'ten indirilen TEK mp3'ü cümlelere böler (gerekenler: ffmpeg, numpy).
Metin ElevenLabs'e cümleler arasına " [pause] " konarak yapıştırılmış olmalı.
Kullanım:
  python tools/elevenlabs_bol.py indirilen.mp3 tr     (eksik_sesler_tr.txt sırasıyla)
Bölme yöntemi: sessiz aralıklar + cümle uzunluğuna göre beklenen süre (dinamik programlama).
Her cümle audio/voice/<dil>_<md5>.mp3 olarak kaydedilir; sonra: python tools/ses_uret.py
Ekranda "<<" ile işaretlenen satırlar şüphelidir; dinleyip kontrol edin.
"""
import json, math, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768


def energy_db(x):
    n = len(x) // 160
    e = np.sqrt(np.mean(x[:n * 160].reshape(n, 160) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(e + 1e-9)


def units(s):
    letters = len(re.findall(r'\w', s)); punct = len(re.findall(r'[!?.,]', s))
    return letters + 2.5 * max(0, punct - 1) + 3


def align(x, says, thr=-40):
    db = energy_db(x); sp = db > thr; n = len(sp)
    gaps, i = [], 0
    while i < n:
        if not sp[i]:
            j = i
            while j < n and not sp[j]: j += 1
            if i > 0 and j < n and j - i >= 8: gaps.append((i, j))
            i = j
        else: i += 1
    idx = np.where(sp)[0]; t0, t1 = idx[0], idx[-1] + 1
    pts = [(t0, t0, 0)] + [(a, b, b - a) for a, b in gaps] + [(t1, t1, 0)]
    M, N = len(pts), len(says); U = [units(s) for s in says]
    rate = (t1 - t0) / sum(U)
    for _ in range(4):
        INF = 1e18
        dp = np.full((N + 1, M), INF); bp = np.zeros((N + 1, M), int); dp[0, 0] = 0
        for k in range(1, N + 1):
            for j in range(1, M):
                if (k < N and j == M - 1) or (k == N and j != M - 1): continue
                for i in range(max(0, j - 40), j):
                    if dp[k - 1, i] >= INF: continue
                    dur = pts[j][0] - pts[i][1]
                    if dur <= 0: continue
                    c = dp[k - 1, i] + 4 * math.log(dur / (rate * U[k - 1])) ** 2 - (0 if j == M - 1 else 3 * min(pts[j][2], 120) / 30)
                    if c < dp[k, j]: dp[k, j] = c; bp[k, j] = i
        path = [M - 1]; j = M - 1
        for k in range(N, 0, -1): j = bp[k, j]; path.append(j)
        path = path[::-1]
        segs = [(pts[path[k]][1], pts[path[k + 1]][0]) for k in range(N)]
        rate = sum(b - a for a, b in segs) / sum(U)
    return segs, rate


def main():
    src, lang = sys.argv[1], sys.argv[2]
    liste = json.load(open(os.path.join(ROOT, 'tools', 'ses_listesi.json'), encoding='utf-8'))
    items = [i for i in liste if i['lang'] == lang and not os.path.exists(os.path.join(ROOT, i['file']))]
    x = load(src); segs, rate = align(x, [i['text'] for i in items])
    for k, ((s, e), it) in enumerate(zip(segs, items)):
        pe = segs[k - 1][1] if k else 0
        ns = segs[k + 1][0] if k + 1 < len(segs) else len(x) / 160
        a = max(pe + (s - pe) * 0.5, s - 8) / 100; b = min(e + (ns - e) * 0.5, e + 15) / 100; d = b - a
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.3f' % a, '-t', '%.3f' % d, '-i', src, '-af',
                        'afade=t=in:d=0.02,afade=t=out:st=%.3f:d=0.06' % max(d - 0.06, 0), '-ac', '1', '-ar', '44100',
                        '-b:a', '96k', os.path.join(ROOT, it['file'])], check=True)
        r = (e - s) / (rate * units(it['text']))
        print('%5.2fs %4.2f %s%s' % ((e - s) / 100, r, it['text'], '  <<' if r > 1.8 or r < 0.5 else ''))


if __name__ == '__main__':
    main()
