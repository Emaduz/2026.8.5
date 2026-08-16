from pathlib import Path
from PIL import Image
import math

for name in ['emad-portrait-source.png', 'emad-portrait-no-white-crescent-v2.png', 'emad-portrait-final-transparent.png']:
    path=Path('/home/ubuntu/webdev-static-assets')/name
    im=Image.open(path).convert('RGBA'); px=im.load(); w,h=im.size; cx=970.; cy=970.
    points=[]
    for y in range(int(h*.58), h):
        for x in range(int(w*.25), int(w*.75)):
            r,g,b,a=px[x,y]
            lum=.2126*r+.7152*g+.0722*b
            sat=max(r,g,b)-min(r,g,b)
            if a>200 and lum>190 and sat<55:
                points.append(math.hypot(x-cx,y-cy))
    print(name, 'white low-sat radius min/max=', (round(min(points),1), round(max(points),1)) if points else None, 'count=',len(points))
