"""Build a stable layered exercise animation from a sprite sheet.

The moving athlete is extracted from a light checkerboard sprite sheet. A
single transparent equipment image is then composited at identical pixel
coordinates in every frame. The result therefore cannot move the equipment.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


def extract_foreground(cell: Image.Image) -> Image.Image:
    """Remove the edge-connected near-white checkerboard from one cell."""
    rgb = np.asarray(cell.convert("RGB"))
    hi = rgb.max(axis=2)
    lo = rgb.min(axis=2)
    # The generated checkerboard is anti-aliased around the subject. Accept a
    # wider neutral range so those pale edge pixels do not become a white halo
    # on the dark theme. The flood fill still stops at the athlete's outline,
    # so enclosed light muscle highlights remain opaque.
    background_like = (lo >= 170) & ((hi - lo) <= 40)
    height, width = background_like.shape
    outside = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        if background_like[0, x]:
            outside[0, x] = True
            queue.append((0, x))
        if background_like[height - 1, x]:
            outside[height - 1, x] = True
            queue.append((height - 1, x))
    for y in range(height):
        if background_like[y, 0] and not outside[y, 0]:
            outside[y, 0] = True
            queue.append((y, 0))
        if background_like[y, width - 1] and not outside[y, width - 1]:
            outside[y, width - 1] = True
            queue.append((y, width - 1))

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if (
                0 <= ny < height
                and 0 <= nx < width
                and background_like[ny, nx]
                and not outside[ny, nx]
            ):
                outside[ny, nx] = True
                queue.append((ny, nx))

    foreground = ~outside
    padded = np.pad(foreground, 1, constant_values=False)
    eroded = np.ones_like(foreground)
    for dy in range(3):
        for dx in range(3):
            eroded &= padded[dy : dy + height, dx : dx + width]
    rgba = np.dstack((rgb, np.where(eroded, 255, 0).astype(np.uint8)))
    return Image.fromarray(rgba, "RGBA")


def checker(size: tuple[int, int], light: bool) -> Image.Image:
    base = "#f2f5f4" if light else "#07100d"
    alt = "#e8eeeb" if light else "#0b1813"
    image = Image.new("RGB", size, base)
    draw = ImageDraw.Draw(image)
    step = 32
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            if (x // step + y // step) % 2:
                draw.rectangle((x, y, x + step - 1, y + step - 1), fill=alt)
    return image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--athletes", required=True, type=Path)
    parser.add_argument("--bench", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    sheet = Image.open(args.athletes).convert("RGB")
    if sheet.size != (1536, 1024):
        raise ValueError(f"Expected 1536x1024 athlete sheet, got {sheet.size}")

    bench_source = Image.open(args.bench).convert("RGBA")
    bench = bench_source.resize((390, 390), Image.Resampling.LANCZOS)
    equipment = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    equipment.alpha_composite(bench, (83, 45))

    args.out.mkdir(parents=True, exist_ok=True)
    frames: list[Image.Image] = []
    for index in range(6):
        col, row = index % 3, index // 3
        cell = sheet.crop((col * 512, row * 512, (col + 1) * 512, (row + 1) * 512))
        athlete = extract_foreground(cell)
        frame = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        frame.alpha_composite(equipment)
        frame.alpha_composite(athlete)
        frame = frame.resize((420, 420), Image.Resampling.LANCZOS)
        frame.save(args.out / f"{index + 1:02}.png", optimize=True)
        frames.append(frame)

    durations = [700, 430, 430, 720, 430, 700]
    frames[0].save(
        args.out.parent / "bench-db-anatomy-v3.webp",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        lossless=True,
        method=6,
    )

    # Review sheets make it easy to compare both theme backgrounds.
    for light, name in ((False, "review-dark.png"), (True, "review-light.png")):
        review = checker((1260, 840), light)
        for index, frame in enumerate(frames):
            review.paste(frame, ((index % 3) * 420, (index // 3) * 420), frame)
        review.save(args.out.parent / name, optimize=True)


if __name__ == "__main__":
    main()
