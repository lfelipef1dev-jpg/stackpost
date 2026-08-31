#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extrai textos de posts dos scripts Python do LinkedIn_Bot."""
import os, re, json

BASE = r"C:\Users\lfeli\Desktop\LinkedIn_Bot"
files = [
    "post_video01_dependencia.py", "post_video01_nexus.py",
    "post_video02_nexus.py", "post_video02_preco.py",
    "post_video03_nexus.py", "post_video03_pdf.py",
    "post_video04_analise_site.py", "post_video04_nexus.py",
    "post_video05_codigo.py", "post_video06_modelos.py",
    "post_video07_memoria.py", "post_video08_imagem.py",
    "post_video09_workspace.py", "post_video10_migracao.py",
    "post_video11_pix.py", "post_video13_word.py",
    "post_case_marken_fassi.py", "post_case_gordaomod.py",
    "post_faturamais.py", "post_frotamais_linkedin.py",
    "post_marken_fassi.py", "post_medellin.py",
    "post_sanatto.py", "post_seeds.py",
    "post_solmais.py", "post_tigrebet.py",
    "post_vendamais.py", "post_vivamais.py",
    "post_gordaomod.py",
]

posts = []
for f in files:
    path = os.path.join(BASE, f)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        content = fh.read()
    # Tentar varios padroes de texto
    m = re.search(r'"texto":\s*"""([\s\S]*?)"""', content)
    if not m:
        m = re.search(r"'texto':\s*\"\"\"([\s\S]*?)\"\"\"", content)
    if not m:
        m = re.search(r"texto:\s*\"\"\"([\s\S]*?)\"\"\"", content)
    if not m:
        # Tentar aspas simples triplas
        m = re.search(r"['\"]texto['\"]:\s*'''([\s\S]*?)'''", content)
    if m:
        texto = m.group(1).strip()
        # Pegar imagem tambem
        img_m = re.search(r"['\"]imagem['\"]:\s*['\"]([^'\"]+)['\"]", content)
        imagem = img_m.group(1) if img_m else ""
        posts.append({"arquivo": f, "imagem": imagem, "texto": texto})

# Tambem ler os arquivos .txt com posts
txt_files = ["posts_nexus.txt", "posts_frotamais.txt", "posts_seeds.txt"]
for tf in txt_files:
    path = os.path.join(BASE, tf)
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        content = fh.read()
    # Splitar por "POST N -"
    parts = re.split(r'\nPOST \d+ - ', content)
    for i, part in enumerate(parts):
        if i == 0:
            continue
        # Pegar nome da imagem
        img_m = re.search(r'IMAGEM:\s*(\S+)', part)
        imagem = img_m.group(1) if img_m else ""
        # Pegar texto depois do ---
        txt_m = re.search(r'---\n([\s\S]*?)(?:\n\nPOST|\Z)', part)
        if txt_m:
            texto = txt_m.group(1).strip()
            posts.append({"arquivo": f"{tf}#POST{i}", "imagem": imagem, "texto": texto})

out_path = r"C:\Users\lfeli\Desktop\StackPost\apps\web\scripts\posts_extraidos.json"
with open(out_path, "w", encoding="utf-8") as fh:
    json.dump(posts, fh, ensure_ascii=False, indent=2)

print(f"Total posts extraidos: {len(posts)}")
for p in posts:
    print(f"  {p['arquivo']}: {p['texto'][:80]}...")
