#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Loga no Supabase, vai no SQL Editor, cola e executa a migracao 001."""
import os, sys, time, uuid
from playwright.sync_api import sync_playwright

EMAIL = "lfelipef1.dev@gmail.com"
PASSWORD = "BrUphi@te#13"
PROJECT_REF = "aaynzvvoeufunbpzblwa"
SQL_FILE = r"C:\Users\lfeli\Desktop\StackPost\migrations\001_align_schema.sql"

def log(msg):
    from datetime import datetime
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

log("[*] Iniciando Supabase SQL Editor...")

pw = sync_playwright().start()
session_dir = os.path.join(os.environ['TEMP'], f"supabase_session_login")
browser = pw.chromium.launch_persistent_context(
    user_data_dir=session_dir,
    headless=False,
    locale="pt-BR",
    viewport={"width": 1366, "height": 900},
    args=["--disable-blink-features=AutomationControlled", "--start-maximized"],
)
page = browser.new_page()

try:
    # 1. Login
    log("[*] Fazendo login...")
    page.goto(f"https://supabase.com/dashboard/sign-in", wait_until="domcontentloaded", timeout=60000)
    time.sleep(3)
    
    email_input = page.locator("input[type='email']").first
    email_input.fill(EMAIL)
    
    password_input = page.locator("input[type='password']").first
    password_input.fill(PASSWORD)
    
    sign_in = page.locator("button:has-text('Sign in'), button:has-text('Entrar'), button[type='submit']").first
    sign_in.click(timeout=10000)
    
    log("[*] Aguardando login...")
    try:
        page.wait_for_url("**/projects", timeout=120000)
    except:
        pass
    time.sleep(10)
    
    # 2. Abrir projeto
    log(f"[*] Abrindo projeto {PROJECT_REF}...")
    page.goto(f"https://supabase.com/dashboard/project/{PROJECT_REF}/sql", wait_until="domcontentloaded", timeout=60000)
    time.sleep(8)
    
    # 3. Criar nova query
    log("[*] Criando nova query...")
    new_query_btn = page.locator("button:has-text('New query'), a:has-text('New query')").first
    if new_query_btn.is_visible():
        new_query_btn.click(timeout=10000)
        time.sleep(3)
    
    # 4. Ler SQL
    with open(SQL_FILE, encoding='utf-8') as f:
        sql = f.read()
    
    # Aguardar carregamento do editor
    log("[*] Aguardando SQL Editor carregar...")
    time.sleep(15)
    
    # 5. Colar no editor
    log("[*] Colando SQL...")
    # Procurar editor de codigo (CodeMirror ou Monaco)
    try:
        editor = page.locator(".cm-content").first
        editor.click(timeout=5000)
        editor.fill(sql)
    except:
        try:
            editor = page.locator(".monaco-editor textarea").first
            editor.click(timeout=5000)
            editor.fill(sql)
        except:
            log("[!] Nao encontrei editor. Fazendo paste via clipboard...")
            import pyperclip
            pyperclip.copy(sql)
            editor = page.locator(".cm-content").first
            editor.click()
            editor.press("Control+a")
            editor.press("Control+v")
    
    time.sleep(2)
    
    # 6. Executar
    log("[*] Executando SQL...")
    run_btn = page.locator("button:has-text('Run'), button:has-text('Run query'), button[aria-label='Run']").first
    run_btn.click(timeout=10000)
    
    log("[*] Aguardando resultado...")
    time.sleep(15)
    
    # Verificar sucesso
    body = page.locator("body").text_content()
    if "success" in body.lower() or "rows" in body.lower() or "error" not in body.lower():
        log("[+] Migração executada com sucesso!")
    else:
        log("[!] Verifique manualmente o resultado na tela.")
    
    log("[*] NAVEGADOR ABERTO. Fechar quando quiser.")
    
    while True:
        time.sleep(60)

except Exception as e:
    log(f"[!] Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    try:
        browser.close()
    except:
        pass
    pw.stop()
