#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre o Chromium do Playwright (mesmo dos bots) no Meta for Developers.
Sessao persistente em sessao_meta/ - igual ao LinkedIn_Bot."""
import os
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SESSION_DIR = os.path.join(BASE_DIR, "sessao_meta")

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
    page.goto("https://developers.facebook.com/apps", wait_until="domcontentloaded", timeout=60000)
    print("[*] Chromium aberto no Meta for Developers.")
    print("[*] Faca login e crie o app ExpoStacker.")
    print("[*] Feche o navegador quando terminar.")
    
    # Mantem aberto
    try:
        page.wait_for_event("close", timeout=0)
    except Exception:
        pass
    
    browser.close()
    pw.stop()

if __name__ == "__main__":
    main()
