from pathlib import Path
from PIL import Image
import math

source = Path('/home/ubuntu/webdev-static-assets/emad-portrait-no-white-crescent-v2.png')
target = Path('/home/ubuntu/webdev-static-assets/emad-portrait-final-transparent.png')
image = Image.open(source).convert('RGBA')
pixels = image.load()
width, height = image.size
cx, cy = width / 2, height * 0.49

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a == 0 or y < int(height * 0.56):
            continue
        distance = math.hypot(x - cx, y - cy)
        normalized = distance / width
        luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b)
        saturation = max(r, g, b) - min(r, g, b)
        # The unwanted bottom rim is a pale, low-saturation annulus around the portrait.
        if 0.39 < normalized < 0.58 and luminance > 184 and saturation < 52:
            pixels[x, y] = (r, g, b, 0)

image.save(target, 'PNG', optimize=True)
print(f'Wrote {target} ({width}x{height})')
