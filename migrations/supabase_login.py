#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre Supabase para o usuario logar e depois executa migracao."""
import os, sys, time, uuid
from playwright.sync_api import sync_playwright

PROJECT_REF = "aaynzvvoeufunbpzblwa"
SQL_FILE = r"C:\Users\lfeli\Desktop\StackPost\migrations\001_align_schema.sql"

def log(msg):
    from datetime import datetime
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

log("[*] Abrindo navegador no login do Supabase...")

pw = sync_playwright().start()
session_dir = os.path.join(os.environ['TEMP'], f"supabase_session_{uuid.uuid4().hex[:8]}")
browser = pw.chromium.launch_persistent_context(
    user_data_dir=session_dir,
    headless=False,
    locale="pt-BR",
    viewport={"width": 1366, "height": 900},
    args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
)
page = browser.new_page()

try:
    page.goto(f"https://supabase.com/dashboard/sign-in", wait_until="domcontentloaded", timeout=60000)
    log("[*] Pagina de login aberta. Faca login manualmente.")
    log("[*] Depois que logar, me avisa que eu executo a migracao.")
    
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
