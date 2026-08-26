#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Operar Meta for Developers - criar app ExpoStacker e pegar credenciais.
Usa sessao persistente em sessao_meta/."""
import os, time, json
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SESSION_DIR = os.path.join(BASE_DIR, "sessao_meta")
LOG = os.path.join(BASE_DIR, "videos", "meta_operacao.log")

def log(msg):
    t = time.strftime("%H:%M:%S")
    line = f"[{t}] {msg}"
    print(line)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def main():
    pw = sync_playwright().start()
    browser = pw.chromium.launch_persistent_context(
        user_data_dir=SESSION_DIR,
        headless=False,
        locale="pt-BR",
        viewport={"width": 1366, "height": 900},
        args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
    )
    page = browser.new_page()

    try:
        log("Abrindo Meta for Developers...")
        page.goto("https://developers.facebook.com/apps", wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_01_apps.png"))
        log("Screenshot 01 salvo.")

        # Verifica se esta logado
        content = page.content()
        if "login" in content.lower() and "Criar app" not in content:
            log("[!] Nao esta logado. Faca login manualmente.")
            time.sleep(60)
            page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_02_pos_login.png"))

        log("Procurando botao Criar app...")
        try:
            btn = page.locator("button:has-text('Criar app'), a:has-text('Criar app'), button:has-text('Create app')").first
            btn.click(timeout=15000)
            log("[+] Botao Criar app clicado.")
            time.sleep(3)
            page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_03_criar_form.png"))
        except Exception as e:
            log(f"[!] Botao Criar app nao encontrado: {e}")
            # Tenta link
            try:
                page.goto("https://developers.facebook.com/apps/creation/", wait_until="domcontentloaded", timeout=30000)
                time.sleep(3)
                page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_03_criar_form.png"))
                log("[+] Pagina de criacao aberta diretamente.")
            except Exception as e2:
                log(f"[!] Falha ao abrir criacao: {e2}")

        # Preencher nome do app
        log("Preenchendo nome do app: ExpoStacker...")
        try:
            page.fill('input[name="app_name"], input[placeholder*="nome"], input[placeholder*="App name"]', "ExpoStacker", timeout=10000)
            log("[+] Nome preenchido.")
            time.sleep(1)
        except Exception as e:
            log(f"[!] Campo nome nao encontrado: {e}")
            page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_erro_nome.png"))

        # Email de contato
        try:
            page.fill('input[name="contact_email"], input[type="email"]', "lfelipef1.dev@gmail.com", timeout=5000)
            log("[+] Email preenchido.")
        except Exception:
            log("[*] Campo email nao encontrado (talvez preenchido automaticamente).")

        page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_04_form_preenchido.png"))

        # Selecionar tipo de app (Outro / Other)
        try:
            radio = page.locator('input[type="radio"][value="other"], label:has-text("Outro"), label:has-text("Other")').first
            radio.click(timeout=5000)
            log("[+] Tipo Outro selecionado.")
            time.sleep(1)
        except Exception as e:
            log(f"[*] Tipo nao selecionado: {e}")

        # Clicar em Criar app / Next
        try:
            page.locator("button:has-text('Criar app'), button:has-text('Create app'), button:has-text('Avançar'), button:has-text('Next')").first.click(timeout=10000)
            log("[+] Botao Criar app clicado.")
            time.sleep(5)
            page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_05_criando.png"))
        except Exception as e:
            log(f"[!] Erro ao clicar Criar app: {e}")

        # Pode pedir senha novamente
        time.sleep(10)
        page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_06_pos_criar.png"))
        log("[*] Verificando se app foi criado...")

        # Pegar App ID da URL ou pagina
        current_url = page.url
        log(f"[*] URL atual: {current_url}")

        # Tenta pegar App ID da URL
        import re
        match = re.search(r'/apps/(\d+)', current_url)
        if match:
            app_id = match.group(1)
            log(f"[+] App ID encontrado na URL: {app_id}")

        # Vai para configuracoes basicas
        log("[*] Acessando configuracoes basicas...")
        try:
            page.goto(f"https://developers.facebook.com/apps/{app_id}/settings/basic/", wait_until="domcontentloaded", timeout=30000)
            time.sleep(5)
            page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_07_settings.png"))
            log("[+] Pagina de configuracoes aberta.")
        except Exception as e:
            log(f"[!] Erro ao acessar configuracoes: {e}")

        log("[*] Operacao concluida. Verifique os screenshots.")
        log("[*] Pegue App ID e App Secret manualmente se necessario.")

    except Exception as e:
        log(f"[!] Erro geral: {e}")
        import traceback
        traceback.print_exc()
        page.screenshot(path=os.path.join(BASE_DIR, "videos", "meta_erro_geral.png"))
    finally:
        time.sleep(5)
        browser.close()
        pw.stop()
        log("[*] Navegador fechado.")

if __name__ == "__main__":
    main()
