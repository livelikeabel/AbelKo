#!/usr/bin/env python3
"""FIGHT CAMP 식단 아이콘 생성: #101315 배경 + 옐로 'FC' 모노그램 (Anton 폰트).

사용법: python3 scripts/make-icons.py  (저장소 루트에서 실행, icons/ 에 출력)
"""
import io
import os
import re
import urllib.request

from PIL import Image, ImageDraw, ImageFont

BG = (0x10, 0x13, 0x15)
YELLOW = (0xF2, 0xC9, 0x4C)
RED = (0xE8, 0x4B, 0x3C)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "icons")


def fetch_anton():
    """구글 폰트에서 Anton TTF 다운로드, 실패하면 None."""
    try:
        css_req = urllib.request.Request(
            "https://fonts.googleapis.com/css2?family=Anton",
            headers={"User-Agent": "Mozilla/5.0"},  # TTF url을 받기 위한 UA
        )
        css = urllib.request.urlopen(css_req, timeout=10).read().decode()
        url = re.search(r"url\((https://[^)]+\.(?:ttf|woff2?)[^)]*)\)", css).group(1)
        data = urllib.request.urlopen(url, timeout=10).read()
        return io.BytesIO(data)
    except Exception as e:
        print("Anton 다운로드 실패, 시스템 볼드 폰트로 대체:", e)
        return None


def load_font(size, anton_bytes):
    if anton_bytes is not None:
        anton_bytes.seek(0)
        return ImageFont.truetype(anton_bytes, size)
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_icon(size, anton_bytes):
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)

    # 핸드랩 테이프 스트라이프 (우하단 코너 대각선 2줄)
    stripe_w = size * 0.06
    for i, color in enumerate((RED, YELLOW)):
        off = size * (1.52 + i * 0.16)
        d.line(
            [(off - size * 1.3, size * 1.3), (size * 1.3, off - size * 1.3)],
            fill=color,
            width=max(2, int(stripe_w * (0.6 if i == 0 else 1.0))),
        )

    # 'FC' 모노그램
    font = load_font(int(size * 0.46), anton_bytes)
    text = "FC"
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1] - size * 0.02
    d.text((x, y), text, font=font, fill=YELLOW)

    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    anton = fetch_anton()
    base = draw_icon(1024, anton)
    for name, px in (("icon-512.png", 512), ("icon-192.png", 192), ("apple-touch-icon.png", 180)):
        base.resize((px, px), Image.LANCZOS).save(os.path.join(OUT_DIR, name))
        print("생성:", name)


if __name__ == "__main__":
    main()
