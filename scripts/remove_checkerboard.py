from math import hypot
from pathlib import Path
from PIL import Image

source = Path('/home/ubuntu/webdev-static-assets/emad-portrait-source.png')
target = Path('/home/ubuntu/webdev-static-assets/emad-portrait-clean.png')
image = Image.open(source).convert('RGBA')
width, height = image.size
cx, cy = width / 2, height / 2
portrait_radius = min(width, height) * 0.24
pixels = image.load()
removed = 0
for y in range(height):
    for x in range(width):
        r, g, b, _ = pixels[x, y]
        neutral = max(r, g, b) - min(r, g, b) <= 6
        light = min(r, g, b) >= 205
        outside_portrait = hypot(x - cx, y - cy) > portrait_radius
        if neutral and light and outside_portrait:
            pixels[x, y] = (r, g, b, 0)
            removed += 1
image.save(target, format='PNG', optimize=True)
print(f'saved {target} {width}x{height}, removed {removed} pixels')
