from PIL import Image
from pathlib import Path

for path in [Path('/home/ubuntu/webdev-static-assets/emad-portrait-source.png'), Path('/home/ubuntu/webdev-static-assets/emad-portrait-no-checkerboard.png')]:
    image = Image.open(path)
    print(path.name, image.mode, image.getbands())
    if 'A' in image.getbands():
        alpha = image.getchannel('A')
        print('alpha extrema', alpha.getextrema(), 'transparent pixels', sum(1 for value in alpha.getdata() if value == 0))
    else:
        print('no alpha channel')
