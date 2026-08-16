from pathlib import Path
from PIL import Image
import math

source = Path('/home/ubuntu/webdev-static-assets/emad-portrait-no-white-crescent-v2.png')
target = Path('/home/ubuntu/webdev-static-assets/emad-portrait-final-transparent.png')
image = Image.open(source).convert('RGBA')
pixels = image.load()
width, height = image.size
cx, cy = 970.0, 970.0
radius = 400.0
softness = 3.0

for y in range(height):
    for x in range(width):
        distance = math.hypot(x - cx, y - cy)
        if distance > radius + softness:
            pixels[x, y] = (*pixels[x, y][:3], 0)
        elif distance > radius:
            alpha = int(255 * max(0.0, 1.0 - ((distance - radius) / softness)))
            r, g, b, old_alpha = pixels[x, y]
            pixels[x, y] = (r, g, b, min(old_alpha, alpha))

image.save(target, 'PNG', optimize=True)
print(f'Wrote {target} ({width}x{height}) with circle radius {radius}')
