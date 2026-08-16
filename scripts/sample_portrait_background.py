from PIL import Image
from pathlib import Path

path = Path('/home/ubuntu/webdev-static-assets/emad-portrait-user-replacement.png')
im = Image.open(path).convert('RGB')
points = [(0, 0), (im.width // 2, 0), (im.width - 1, 0), (0, im.height // 5), (im.width - 1, im.height // 5)]
print([(point, im.getpixel(point)) for point in points])
