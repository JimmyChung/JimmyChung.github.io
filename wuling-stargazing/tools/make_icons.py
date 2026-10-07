"""Draw the app icon (night sky over mountains) at 192 and 512 px."""
import random
from PIL import Image, ImageDraw, ImageFilter

def icon(n):
    S = 4 * n
    im = Image.new('RGB', (S, S))
    d = ImageDraw.Draw(im)
    for y in range(S):  # vertical gradient
        t = y / S
        d.line([(0, y), (S, y)], fill=(int(8 + 20 * t), int(12 + 30 * t), int(36 + 50 * t)))
    rnd = random.Random(7)
    glow = Image.new('RGB', (S, S)); g = ImageDraw.Draw(glow)
    for _ in range(140):  # milky way band
        x = rnd.uniform(0.1, 0.9) * S; y = S * 0.9 - x * 0.8 + rnd.gauss(0, S * 0.05)
        r = rnd.uniform(0.02, 0.05) * S
        g.ellipse([x - r, y - r, x + r, y + r], fill=(40, 50, 90))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(S * 0.03)), 0.5)
    d = ImageDraw.Draw(im)
    for _ in range(90):
        x, y = rnd.uniform(0.12, 0.88) * S, rnd.uniform(0.12, 0.7) * S
        r = rnd.choice([1, 1, 1, 2]) * S / 512
        d.ellipse([x - r, y - r, x + r, y + r], fill=(220, 225, 255))
    # a constellation (Cassiopeia-like W)
    pts = [(0.25, 0.30), (0.37, 0.40), (0.48, 0.28), (0.60, 0.38), (0.72, 0.24)]
    pts = [(x * S, y * S) for x, y in pts]
    d.line(pts, fill=(255, 210, 122), width=int(S * 0.012), joint='curve')
    for x, y in pts:
        r = S * 0.022
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 245, 220))
    # mountains
    d.polygon([(0, S * 0.78), (S * 0.22, S * 0.60), (S * 0.40, S * 0.72), (S * 0.62, S * 0.52), (S * 0.85, S * 0.70), (S, S * 0.64), (S, S), (0, S)], fill=(10, 22, 18))
    d.polygon([(0, S * 0.88), (S * 0.3, S * 0.76), (S * 0.55, S * 0.86), (S * 0.8, S * 0.78), (S, S * 0.86), (S, S), (0, S)], fill=(5, 12, 10))
    return im.resize((n, n), Image.LANCZOS)

for n in (192, 512):
    icon(n).save(f'icon-{n}.png', optimize=True)
