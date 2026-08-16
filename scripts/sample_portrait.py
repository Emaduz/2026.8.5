from PIL import Image
from pathlib import Path

image = Image.open(Path('/home/ubuntu/webdev-static-assets/emad-portrait-source.png')).convert('RGB')
y = image.height // 2
for x in range(400, 601, 10):
    print(x, image.getpixel((x, y)))
