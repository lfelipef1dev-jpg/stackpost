#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Converte imagem para proporcoes especificas de cada rede social.
Gera versoes: instagram_1x1, instagram_4x5, linkedin_1x1, linkedin_1_9x1.
"""
import os
import sys
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "videos", "convertidas")
os.makedirs(OUTPUT_DIR, exist_ok=True)

RATIOS = {
    "instagram_1x1": (1, 1),
    "instagram_4x5": (4, 5),
    "linkedin_1x1": (1, 1),
    "linkedin_1_9x1": (191, 100),
}

SIZES = {
    "instagram_1x1": (1080, 1080),
    "instagram_4x5": (1080, 1350),
    "linkedin_1x1": (1200, 1200),
    "linkedin_1_9x1": (1200, 627),
}

def crop_center(img, aspect_w, aspect_h):
    """Corta a imagem no centro mantendo a proporcao."""
    src_w, src_h = img.size
    target_ratio = aspect_w / aspect_h
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        # Mais larga - corta os lados
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        return img.crop((left, 0, left + new_w, src_h))
    else:
        # Mais alta - corta em cima e embaixo
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        return img.crop((0, top, src_w, top + new_h))

def convert(input_path, platform, mode):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Imagem nao encontrada: {input_path}")

    key = f"{platform}_{mode}"
    ratio = RATIOS[key]
    size = SIZES[key]

    with Image.open(input_path) as img:
        img = img.convert("RGB")
        cropped = crop_center(img, ratio[0], ratio[1])
        resized = cropped.resize(size, Image.LANCZOS)

    base = os.path.splitext(os.path.basename(input_path))[0]
    output_path = os.path.join(OUTPUT_DIR, f"{base}_{key}.jpg")
    resized.save(output_path, "JPEG", quality=92, optimize=True)
    return output_path

def convert_all(input_path):
    """Converte a imagem para todas as versoes e retorna dict."""
    result = {}
    for key in SIZES:
        platform, mode = key.split("_", 1)
        # reconstruir mode com underscore
        mode = key.split("_", 1)[1]
        try:
            result[key] = convert(input_path, platform, mode)
            print(f"[+] {key}: {result[key]}")
        except Exception as e:
            print(f"[!] Erro em {key}: {e}")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: py converter_imagem.py <caminho_da_imagem>")
        sys.exit(1)
    convert_all(sys.argv[1])
