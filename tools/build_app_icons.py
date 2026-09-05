"""Build GoFit web-app icons from one square master image."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def square_crop(image: Image.Image) -> Image.Image:
    width, height = image.size
    edge = min(width, height)
    left = (width - edge) // 2
    top = (height - edge) // 2
    return image.crop((left, top, left + edge, top + edge)).convert("RGB")


def save_resized(master: Image.Image, path: Path, size: int) -> None:
    image = master.resize((size, size), Image.Resampling.LANCZOS)
    image.save(path, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    args.output.mkdir(parents=True, exist_ok=True)
    master = square_crop(Image.open(args.source))

    save_resized(master, args.output / "gofit-icon-master-v2.png", 1024)
    save_resized(master, args.output / "icon-v2-180.png", 180)
    save_resized(master, args.output / "icon-v2-192.png", 192)
    save_resized(master, args.output / "icon-v2-512.png", 512)

    # Android adaptive icons may crop the outer 20 percent. Keep the complete
    # dumbbell and PF emblem inside the central safe zone.
    foreground = master.resize((400, 400), Image.Resampling.LANCZOS)
    # Reuse an icon-free carbon patch so the safe margin retains the same
    # texture instead of looking like a second square around the artwork.
    maskable = master.crop((0, 0, 280, 280)).resize((512, 512), Image.Resampling.LANCZOS)
    blend = Image.new("L", foreground.size, 0)
    ImageDraw.Draw(blend).rounded_rectangle((10, 10, 390, 390), radius=36, fill=255)
    blend = blend.filter(ImageFilter.GaussianBlur(18))
    maskable.paste(foreground, ((512 - 400) // 2, (512 - 400) // 2), blend)
    maskable.save(args.output / "icon-v2-maskable-512.png", "PNG", optimize=True)


if __name__ == "__main__":
    main()
