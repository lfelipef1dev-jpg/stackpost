#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Debug: ver o que acontece quando clica Agendar."""
import asyncio
from playwright.async_api import async_playwright

with open(r"C:\Users\lfeli\Desktop\StackPost\scripts\.token", "r") as f:
    TOKEN = f.read().strip().lstrip("\ufeff")

SITE = "https://stackpost.expostacker.com.br"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=["--start-maximized"])
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()

        # Capturar console
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))

        # Capturar requests
        async def on_request(req):
            if '/api/posts' in req.url or '/api/upload' in req.url:
                print(f"[REQUEST] {req.method} {req.url}")
                if req.post_data:
                    print(f"  Body: {req.post_data[:200]}")

        async def on_response(resp):
            if '/api/posts' in resp.url or '/api/upload' in resp.url:
                print(f"[RESPONSE] {resp.status} {resp.url}")
                try:
                    body = await resp.text()
                    print(f"  Body: {body[:200]}")
                except:
                    pass

        page.on("request", on_request)
        page.on("response", on_response)

        await page.goto(SITE, wait_until="networkidle")
        await page.evaluate(f"""() => {{ localStorage.setItem('token', '{TOKEN}'); }}""")
        await page.goto(f"{SITE}/composer", wait_until="networkidle")
        await asyncio.sleep(3)

        # Digitar
        textarea = page.locator("textarea").first
        await textarea.fill("Teste debug. #ExpoStacker")
        await asyncio.sleep(1)

        # Subir imagem
        file_input = page.locator("input[type=file]")
        await file_input.set_input_files(r"C:\Users\lfeli\Desktop\LinkedIn_Bot\posts_expostacker\banner\solmais-banner.jpg")
        await asyncio.sleep(5)

        # Selecionar Instagram via checkbox
        checkbox = page.locator("label:has-text('Instagram') input[type=checkbox]")
        is_checked = await checkbox.is_checked()
        print(f"Checkbox checked antes: {is_checked}")
        await checkbox.check()
        await asyncio.sleep(1)
        is_checked = await checkbox.is_checked()
        print(f"Checkbox checked depois: {is_checked}")

        # Preencher data
        from datetime import datetime, timezone, timedelta
        agendar = datetime.now(timezone.utc) + timedelta(minutes=5)
        brt = agendar - timedelta(hours=3)
        dt = brt.strftime("%Y-%m-%dT%H:%M")
        dt_input = page.locator("input[type=datetime-local]")
        await dt_input.fill(dt)
        await asyncio.sleep(1)

        # Verificar se botao Agendar esta enabled
        agendar_btn = page.locator("button:has-text('Agendar')")
        is_disabled = await agendar_btn.is_disabled()
        print(f"Botao Agendar disabled: {is_disabled}")

        # Screenshot antes de clicar
        await page.screenshot(path="C:\\Users\\lfeli\\Desktop\\StackPost\\debug_before_click.png")

        # Clicar Agendar
        print("Clicando Agendar...")
        await agendar_btn.click()
        await asyncio.sleep(2)

        # Screenshot depois de clicar
        await page.screenshot(path="C:\\Users\\lfeli\\Desktop\\StackPost\\debug_after_click.png")

        # Verificar se modal apareceu
        confirmar = page.locator("button:has-text('Confirmar')")
        count = await confirmar.count()
        print(f"Botao Confirmar count: {count}")

        if count > 0:
            print("Clicando Confirmar...")
            await confirmar.click()
            await asyncio.sleep(5)

            # Screenshot depois de confirmar
            await page.screenshot(path="C:\\Users\\lfeli\\Desktop\\StackPost\\debug_after_confirm.png")

            # Verificar URL atual
            print(f"URL atual: {page.url}")
        else:
            print("Modal nao apareceu!")
            # Verificar se ha mensagem de erro
            msg_div = page.locator("div.bg-brand-accent\\/10")
            if await msg_div.count() > 0:
                msg = await msg_div.text_content()
                print(f"Mensagem: {msg}")

        await asyncio.sleep(3)
        await browser.close()

asyncio.run(main())
