# アプリアイコン（PNG）を生成する: python3 tools/make_icons.py
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = "/Library/Fonts/Arial Unicode.ttf"
BG = (37, 99, 235)


def draw(size: int, maskable: bool) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    # maskable アイコンは端が切り取られるので文字を小さめにする
    scale = 0.30 if maskable else 0.36
    big = ImageFont.truetype(FONT, int(size * scale))
    small = ImageFont.truetype(FONT, int(size * scale * 0.42))
    d.text((size / 2, size * 0.44), "中3", font=big, fill="white", anchor="mm",
           stroke_width=max(1, size // 64), stroke_fill="white")
    d.text((size / 2, size * 0.72), "一問一答", font=small, fill=(219, 234, 254), anchor="mm")
    return img


out = ROOT / "icons"
out.mkdir(exist_ok=True)
draw(192, False).save(out / "icon-192.png")
draw(512, False).save(out / "icon-512.png")
draw(512, True).save(out / "icon-maskable-512.png")
draw(180, False).save(out / "apple-touch-icon.png")
print("icons written to", out)
