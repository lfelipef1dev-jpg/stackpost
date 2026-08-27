#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Grava video demonstracao: 3 posts completos na interface do StackPost."""
import asyncio
import os
import time
from datetime import datetime, timezone, timedelta
from playwright.async_api import async_playwright

with open(r"C:\Users\lfeli\Desktop\StackPost\scripts\.token", "r") as f:
    TOKEN = f.read().strip().lstrip("\ufeff")

SITE = "https://stackpost.expostacker.com.br"
VIDEO_DIR = r"C:\Users\lfeli\Desktop\StackPost\videos_demo"
os.makedirs(VIDEO_DIR, exist_ok=True)

POSTS = [
    {
        "arquivo": r"C:\Users\lfeli\Desktop\LinkedIn_Bot\posts_expostacker\videos\nexus_ia_acelerados\video01_nexus_gera_pdf_30s_acelerado2x_h264_aac.mp4",
        "texto": """IA que gera PDF executivo em 30 segundos. Voce pede, a Nexus IA escreve, formata e entrega o documento pronto pra download.

Relatorio, proposta, contrato, laudo tecnico — tudo no chat, tudo editavel, tudo profissional.

A Nexus IA reune 7 modelos de IA de ponta com roteamento automatico, streaming em tempo real e memoria entre conversas. Claude, GPT, Gemini, Llama, Mistral, DeepSeek e Perplexity num so painel.

Teste gratis por 15 dias: nexusia.expostacker.com.br
Vitrine ExpoStacker: expostacker.com.br

#NexusIA #Produtividade #Documentos #IA #ExpoStacker"""
    },
    {
        "arquivo": r"C:\Users\lfeli\Desktop\LinkedIn_Bot\posts_expostacker\banner\marken-fassi-banner.jpg",
        "texto": """LXP que aumentou vendas em 28% e engajamento em 67%. Reduziu churn em 42%.

A Casa Fassi e uma plataforma de microlearning pra vendedores de enxovais. O lojista entra, faz trilhas de aprendizagem e usa o FASSI.AI pra vender com confianca.

IA com contexto do negocio, nao chatbot generico. Resultado real de produto em producao.

Conheca: expostacker.com.br/pt/#produtos
Fale sobre seu projeto: expostacker.com.br/pt/#contato

#ExpoStacker #MarkenFassi #LXP #IA #Vendas"""
    },
    {
        "arquivo": r"C:\Users\lfeli\Desktop\LinkedIn_Bot\posts_expostacker\logo\logo_expostacker_horizontal.png",
        "texto": """ExpoStacker — a vitrine de tecnologia brasileira que transforma dor de infraestrutura em produto digital rodando em producao.

Nao e slide. Nao e promessa. Nao e localhost. E codigo rodando com usuario pagando real.

12 produtos entregues e no ar. 64 tecnologias dominadas. CI/CD com deploy automatico.

Fale sobre seu projeto: expostacker.com.br/pt/#contato
Ver produtos: expostacker.com.br

#ExpoStacker #TecnologiaBrasil #SaaS #Desenvolvimento"""
    },
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=VIDEO_DIR,
            record_video_size={"width": 1920, "height": 1080},
        )
        page = await context.new_page()

        # 1. Login
        await page.goto(SITE, wait_until="networkidle")
        await asyncio.sleep(2)
        await page.evaluate(f"""() => {{ localStorage.setItem('token', '{TOKEN}'); }}""")
        await page.goto(f"{SITE}/composer", wait_until="networkidle")
        await asyncio.sleep(3)

        inicio = datetime.now(timezone.utc) + timedelta(minutes=2)

        for i, post in enumerate(POSTS):
            print(f"\n--- POST {i+1}/{len(POSTS)} ---")

            # Sempre navegar pro composer (apos agendar redireciona pra /calendar)
            if i > 0:
                print("  Voltando pro composer...")
                await page.goto(f"{SITE}/composer", wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(5)

            # Digitar texto
            print("  Digitando...")
            textarea = page.locator("textarea").first
            await textarea.wait_for(state="visible", timeout=20000)
            await textarea.click()
            await textarea.fill(post["texto"])
            await asyncio.sleep(1)

            # Subir midia
            print("  Subindo midia...")
            file_input = page.locator("input[type=file]")
            await file_input.set_input_files(post["arquivo"])
            await asyncio.sleep(5)

            # Selecionar Instagram - clicar no CHECKBOX dentro do label
            print("  Selecionando Instagram...")
            instagram_checkbox = page.locator("label:has-text('Instagram') input[type=checkbox]")
            await instagram_checkbox.check()
            await asyncio.sleep(1)

            # Preencher data/hora
            agendar = inicio + timedelta(minutes=5 * i)
            brt = agendar - timedelta(hours=3)
            dt = brt.strftime("%Y-%m-%dT%H:%M")
            dt_input = page.locator("input[type=datetime-local]")
            await dt_input.fill(dt)
            await asyncio.sleep(1)

            # Clicar agendar + confirmar
            agendar_btn = page.locator("button:has-text('Agendar')")
            await agendar_btn.click()
            await asyncio.sleep(1)
            confirmar = page.locator("button:has-text('Confirmar')")
            await confirmar.click()
            await asyncio.sleep(3)

            print(f"  Post {i+1} agendado {brt.strftime('%H:%M')} BRT")

        # Mostrar calendario
        print("\nMostrando calendario...")
        await page.goto(f"{SITE}/calendar", wait_until="networkidle")
        await asyncio.sleep(5)

        # Dashboard
        print("Mostrando dashboard...")
        await page.goto(f"{SITE}/dashboard", wait_until="networkidle")
        await asyncio.sleep(5)

        await context.close()
        await browser.close()

        # Renomear
        videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith(".webm")]
        if videos:
            latest = max(videos, key=lambda f: os.path.getmtime(os.path.join(VIDEO_DIR, f)))
            new_path = os.path.join(VIDEO_DIR, f"demo_3_posts_{int(time.time())}.webm")
            os.rename(os.path.join(VIDEO_DIR, latest), new_path)
            print(f"\nVideo: {new_path}")

asyncio.run(main())
