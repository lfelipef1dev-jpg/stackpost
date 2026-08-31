#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre SQL Editor do Supabase usando sessao ja logada."""
import os, sys, time
from playwright.sync_api import sync_playwright

PROJECT_REF = "aaynzvvoeufunbpzblwa"
SQL_FILE = r"C:\Users\lfeli\Desktop\StackPost\migrations\001_align_schema.sql"

def log(msg):
    from datetime import datetime
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

log("[*] Reabrindo navegador com a sessao ja logada...")

pw = sync_playwright().start()
session_dir = r"C:\Users\lfeli\Desktop\StackPost\migrations\supabase_session"
browser = pw.chromium.launch_persistent_context(
    user_data_dir=session_dir,
    headless=False,
    locale="pt-BR",
    viewport={"width": 1366, "height": 900},
    args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
)
page = browser.new_page()

try:
    log("[*] Abrindo SQL Editor...")
    page.goto(f"https://supabase.com/dashboard/project/{PROJECT_REF}/sql", wait_until="domcontentloaded", timeout=60000)
    time.sleep(10)
    
    # Criar nova query
    new_query_btn = page.locator("button:has-text('New query'), a:has-text('New query')").first
    if new_query_btn.is_visible():
        new_query_btn.click(timeout=10000)
        time.sleep(5)
    
    # Ler SQL
    with open(SQL_FILE, encoding='utf-8') as f:
        sql = f.read()
    
    log("[*] Colando SQL no editor...")
    # Supabase usa Monaco ou CodeMirror
    try:
        editor = page.locator(".monaco-editor textarea").first
        editor.fill(sql, timeout=30000)
    except:
        try:
            editor = page.locator(".cm-content").first
            editor.fill(sql, timeout=30000)
        except:
            log("[!] Nao conseguiu colar automaticamente. COLE MANUALMENTE e clique Run.")
    
    log("[*] NAVEGADOR ABERTO. COLE O SQL e clique Run.")
    log("[*] Caso nao tenha colado automatico, abra este arquivo e copie:")
    log(f"    {SQL_FILE}")
    
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
