#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Converte imagem para proporcoes de redes sociais. Salva em pasta de destino."""
import sys, os
from PIL import Image

OUTPUT_DIR = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos", "convertidas")
os.makedirs(OUTPUT_DIR, exist_ok=True)

CONFIG = {
    "instagram_1x1": (1, 1, 1080, 1080),
    "instagram_4x5": (4, 5, 1080, 1350),
    "linkedin_1x1": (1, 1, 1200, 1200),
    "linkedin_1.9x1": (191, 100, 1200, 627),
}

def crop_center(img, aspect_w, aspect_h):
    src_w, src_h = img.size
    target_ratio = aspect_w / aspect_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        return img.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        return img.crop((0, top, src_w, top + new_h))

def convert(input_path, name, aspect_w, aspect_h, width, height):
    with Image.open(input_path) as img:
        img = img.convert("RGB")
        cropped = crop_center(img, aspect_w, aspect_h)
        resized = cropped.resize((width, height), Image.LANCZOS)
    output_path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
    resized.save(output_path, "JPEG", quality=92, optimize=True)
    return output_path

def main():
    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        print(f"[!] Arquivo nao encontrado: {input_path}", file=sys.stderr)
        sys.exit(1)

    results = {}
    for name, (aw, ah, w, h) in CONFIG.items():
        try:
            out = convert(input_path, name, aw, ah, w, h)
            results[name] = out
            print(f"[+] {name}: {out}")
        except Exception as e:
            print(f"[!] Erro em {name}: {e}", file=sys.stderr)

    print(results)

if __name__ == "__main__":
    main()
