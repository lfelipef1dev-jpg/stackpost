#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre Supabase pra gerar Personal Access Token e salvar."""
import os, sys, time, uuid
from playwright.sync_api import sync_playwright

PROJECT_REF = "aaynzvvoeufunbpzblwa"

def log(msg):
    from datetime import datetime
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

log("[*] Abrindo navegador no Supabase...")

pw = sync_playwright().start()
session_dir = r"C:\Users\lfeli\Desktop\StackPost\migrations\supabase_session"
os.makedirs(session_dir, exist_ok=True)
browser = pw.chromium.launch_persistent_context(
    user_data_dir=session_dir,
    headless=False,
    locale="pt-BR",
    viewport={"width": 1366, "height": 900},
    args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
)
page = browser.new_page()

try:
    page.goto(f"https://supabase.com/dashboard/account/tokens", wait_until="domcontentloaded", timeout=60000)
    log("[*] Pagina de tokens aberta. Faz login e depois cria um novo token.")
    log("[*] Nome do token: 'devin-token' (copie e cole em uma conversa ou salve).")
    log("[*] Aguardando voce finalizar. Nao vou fechar o navegador.")
    
    while True:
        time.sleep(60)

except Exception as e:
    log(f"[!] Erro: {e}")
finally:
    try:
        browser.close()
    except:
        pass
    pw.stop()
