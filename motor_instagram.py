import os
import sys
import time
import json
from playwright.sync_api import sync_playwright

STATE_FILE = r"C:\Users\lfeli\Desktop\Instagram_Bot\instagram_state.json"
HISTORICO_FILE = os.path.join(os.path.dirname(__file__), "historico_instagram.json")

def log(msg):
    t = time.strftime("%H:%M:%S")
    print(f"[{t}] {msg}", flush=True)

def postar(imagem_path, legenda):
    log("=== MOTOR INSTAGRAM - StackPost ===")

    if not os.path.exists(STATE_FILE):
        log(f"[!] Estado nao encontrado: {STATE_FILE}")
        return False

    pw = sync_playwright().start()
    browser = pw.chromium.launch(
        headless=False,
        args=["--disable-blink-features=AutomationControlled", "--start-maximized", "--foreground"]
    )
    context = browser.new_context(
        viewport={"width": 1366, "height": 768},
        locale="pt-BR",
        storage_state=STATE_FILE
    )
    page = context.new_page()

    try:
        log("[*] Abrindo /create/select/")
        page.goto("https://www.instagram.com/create/select/", wait_until="domcontentloaded", timeout=60000)
        time.sleep(8)

        log("[*] Enviando imagem")
        file_input = page.locator('input[type="file"]').first
        file_input.set_input_files(imagem_path)
        log("[+] Imagem enviada")
        time.sleep(8)

        log("[*] Clicando Avancar")
        avancar = page.evaluate("""() => {
            const all = document.querySelectorAll('button, div[role="button"]');
            for (let el of all) {
                if (!el.offsetParent) continue;
                const t = (el.innerText || '').trim().toLowerCase();
                if (t === 'avançar' || t === 'avancar' || t === 'next') {
                    const r = el.getBoundingClientRect();
                    if (r.y > 0 && r.y < 100) return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
                }
            }
            return null;
        }""")

        if avancar:
            page.mouse.move(avancar['x'] - 10, avancar['y'] - 5, steps=5)
            time.sleep(0.3)
            page.mouse.click(avancar['x'], avancar['y'])
            time.sleep(5)

        log("[*] Procurando editor de legenda")
        legenda_info = page.evaluate("""() => {
            const eds = document.querySelectorAll('div[contenteditable="true"], textarea');
            for (let e of eds) {
                if (!e.offsetParent) continue;
                const r = e.getBoundingClientRect();
                const aria = (e.getAttribute('aria-label') || '').toLowerCase();
                if (aria.includes('legenda') || aria.includes('caption') || aria.includes('escreva') || r.y > 100) {
                    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), aria: aria };
                }
            }
            return null;
        }""")

        if legenda_info:
            page.mouse.move(legenda_info['x'] - 10, legenda_info['y'] - 5, steps=5)
            time.sleep(0.3)
            page.mouse.click(legenda_info['x'], legenda_info['y'])
            time.sleep(1)
            log(f"[*] Digitando legenda ({len(legenda)} chars)")
            page.keyboard.type(legenda, delay=15)
            log("[+] Legenda digitada")
            time.sleep(2)
        else:
            log("[!] Editor nao encontrado")
            return False

        log("[*] Clicando Compartilhar")
        compartilhar = page.evaluate("""() => {
            const all = document.querySelectorAll('button, div[role="button"]');
            for (let el of all) {
                if (!el.offsetParent) continue;
                const t = (el.innerText || '').trim().toLowerCase();
                if (t === 'compartilhar' || t === 'share') {
                    const r = el.getBoundingClientRect();
                    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) };
                }
            }
            return null;
        }""")

        if compartilhar:
            page.mouse.move(compartilhar['x'] - 10, compartilhar['y'] - 5, steps=5)
            time.sleep(0.3)
            page.mouse.click(compartilhar['x'], compartilhar['y'])
            log("[+] Compartilhar clicado!")
            time.sleep(15)
            log("[+] POST PUBLICADO!")
            return True
        else:
            log("[!] Compartilhar nao encontrado")
            return False
    except Exception as e:
        log(f"[!] Erro: {e}")
        import traceback; traceback.print_exc()
        return False
    finally:
        try:
            context.storage_state(path=STATE_FILE)
        except: pass
        context.close()
        browser.close()
        pw.stop()
        log("[*] Fechado")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        log("Uso: py motor_instagram.py <imagem> <legenda>")
        sys.exit(1)
    postar(sys.argv[1], sys.argv[2])
