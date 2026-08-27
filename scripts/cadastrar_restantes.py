#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cadastra os posts restantes no StackPost via API com presign."""
import sys
import os
import requests
import time
from datetime import datetime, timezone, timedelta

BASE = "https://stackpost.expostacker.com.br"

with open(r"C:\Users\lfeli\Desktop\StackPost\scripts\.token", "r") as f:
    token = f.read().strip().lstrip("\ufeff")

headers = {"Authorization": f"Bearer {token}"}
headers_json = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Adicionar o diretorio scripts ao path e importar POSTS
d = r"C:\Users\lfeli\Desktop\StackPost\scripts"
if d not in sys.path:
    sys.path.insert(0, d)

from cadastrar_30_posts import POSTS

# Posts ja agendados na interface
PULAR_NOMES = {
    "nexus_gera_pdf.mp4",
    "nexus_gera_word.mp4",
    "logo_expostacker_horizontal.png"
}

# O nexus_excel e logo_horizontal_pulado
POSTS_RESTANTES = [p for p in POSTS if p["nome"] not in PULAR_NOMES]

def upload_presign(caminho, nome, content_type):
    size = os.path.getsize(caminho)
    r = requests.post(
        f"{BASE}/api/upload/presign",
        headers=headers_json,
        json={"fileName": nome, "contentType": content_type, "size": size},
        timeout=30,
    )
    if r.status_code != 200:
        print(f"ERRO PRESIGN: {r.status_code} {r.text[:200]}")
        return None
    data = r.json()

    with open(caminho, "rb") as f:
        r2 = requests.put(
            data["signedUrl"],
            headers={"Content-Type": content_type},
            data=f,
            timeout=120,
        )
    if r2.status_code not in [200, 204]:
        print(f"ERRO UPLOAD SUPABASE: {r2.status_code}")
        return None

    r3 = requests.post(
        f"{BASE}/api/upload/register",
        headers=headers_json,
        json={
            "id": data["id"],
            "fileName": nome,
            "contentType": content_type,
            "size": size,
            "url": data["publicUrl"],
        },
        timeout=30,
    )
    if r3.status_code != 200:
        print(f"ERRO REGISTER: {r3.status_code} {r3.text[:200]}")
        return None
    return data["id"]

def main():
    # Verificar posts ja agendados
    r = requests.get(f"{BASE}/api/posts?limit=50", headers=headers, timeout=30)
    existing = r.json().get("items", [])
    existing_captions = {p["content"][:60] for p in existing}
    print(f"Posts ja existentes: {len(existing)}")

    # Inicio depois dos 3 ja agendados (07:15, 07:20, 07:25) -> proximo 07:30
    inicio = datetime(2026, 8, 27, 7, 30, 0, tzinfo=timezone.utc)
    
    total = len(POSTS_RESTANTES)
    print(f"\n=== CADASTRANDO {total} POSTS RESTANTES ===")
    print(f"Inicio: {inicio.isoformat()}")

    for i, post in enumerate(POSTS_RESTANTES):
        if post["texto"][:60] in existing_captions:
            print(f"PULANDO (ja existe): {post['nome']}")
            continue

        print(f"\n--- POST {i+1}/{total}: {post['nome']} ---")

        upload_id = upload_presign(post["arquivo"], post["nome"], post["tipo"])
        if not upload_id:
            print("  ERRO no upload")
            continue
        print(f"  Upload: {upload_id[:8]}")

        agendar = inicio + timedelta(minutes=5 * i)
        agendar_str = agendar.isoformat().replace("+00:00", "Z")
        brt = agendar - timedelta(hours=3)

        post_data = {
            "content": post["texto"],
            "platforms": ["instagram"],
            "uploadIds": [upload_id],
            "scheduledAt": agendar_str,
        }

        r = requests.post(
            f"{BASE}/api/posts",
            headers=headers_json,
            json=post_data,
            timeout=30,
        )
        if r.status_code != 201:
            print(f"  ERRO POST: {r.status_code} {r.text[:200]}")
            continue

        data = r.json()
        print(f"  Post OK: {data['id'][:8]} | Agendado: {brt.strftime('%d/%m %H:%M')} BRT")
        time.sleep(1)

    print("\nDone!")

if __name__ == "__main__":
    main()
