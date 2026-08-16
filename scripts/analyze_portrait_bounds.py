from pathlib import Path
from PIL import Image

for name in ['emad-portrait-source.png', 'emad-portrait-no-white-crescent-v2.png']:
    path = Path('/home/ubuntu/webdev-static-assets') / name
    im = Image.open(path).convert('RGBA')
    px = im.load(); w, h = im.size; cx = w // 2
    samples = []
    for y in [h//2, int(h*.62), int(h*.7)]:
        runs = []
        active = False
        start = 0
        for x in range(w):
            r,g,b,a = px[x,y]
            # portrait interior is dark/colored; checkerboard is near-neutral and bright.
            signal = a > 0 and ((max(r,g,b)-min(r,g,b) > 24) or ((r+g+b)/3 < 180))
            if signal and not active: start=x; active=True
            if active and (not signal or x == w-1):
                end=x if x == w-1 else x-1
                if end-start > 40: runs.append((start,end))
                active=False
        samples.append((y, runs[:10]))
    print(name, im.size, samples)
