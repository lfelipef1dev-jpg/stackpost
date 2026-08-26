import os
import sys
import time
from playwright.sync_api import sync_playwright

STATE_FILE = r"C:\Users\lfeli\Desktop\LinkedIn_Bot\linkedin_state.json"
LOG_FILE = r"C:\Users\lfeli\Desktop\StackPost\videos\motor_linkedin.log"

def log(msg):
    t = time.strftime("%H:%M:%S")
    line = f"[{t}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def postar(arquivo, texto):
    log("=" * 60)
    log("FLUXO LINKEDIN - StackPost")
    log("=" * 60)

    if not os.path.exists(STATE_FILE):
        log(f"[!] Estado nao encontrado: {STATE_FILE}")
        return False

    pw = sync_playwright().start()
    browser = pw.chromium.launch(
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    context = browser.new_context(
        viewport={"width": 1366, "height": 768},
        locale="pt-BR",
        storage_state=STATE_FILE
    )
    page = context.new_page()

    try:
        page.goto("https://www.linkedin.com/feed/", wait_until="domcontentloaded", timeout=45000)
        time.sleep(8)

        # Fechar modais
        for aria in ['Fechar Confira quem viu seu perfil',
                     'Fechar promoção de Pessoas buscando emprego que talvez você conheça']:
            try:
                page.locator(f"button[aria-label='{aria}']").first.click(timeout=2000)
                time.sleep(1)
            except Exception:
                pass

        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(2)

        # 1. Clicar em Foto COM expect_file_chooser
        coords_foto = page.evaluate("""() => {
            const els = document.querySelectorAll('div[role="button"]');
            for (let el of els) {
                if (!el.offsetParent) continue;
                if ((el.innerText || '').trim() === 'Foto') {
                    const r = el.getBoundingClientRect();
                    if (r.y < 400 && r.width > 50) return { x: r.left + r.width/2, y: r.top + r.height/2 };
                }
            }
            return null;
        }""")

        if not coords_foto:
            log("[!] Botao Foto nao encontrado")
            return False

        log(f"[*] Clicando em Foto: {coords_foto}")
        with page.expect_file_chooser(timeout=15000) as fc_info:
            page.mouse.click(coords_foto['x'], coords_foto['y'])
        fc = fc_info.value
        fc.set_files(arquivo)
        log(f"[+] Imagem anexada: {os.path.basename(arquivo)}")

        time.sleep(3)

        # 2. Clicar em Avancar
        log("[*] Clicando em Avancar...")
        page.locator("button:has-text('Avançar')").first.click(timeout=5000)
        log("[+] Avancar clicado!")
        time.sleep(5)

        # 3. Ativar editor
        log("[*] Ativando editor...")
        page.mouse.click(655, 300)
        time.sleep(2)

        # 4. Digitar
        log(f"[*] Digitando texto ({len(texto)} chars)")
        page.keyboard.type(texto, delay=15)
        log("[+] Texto digitado!")
        time.sleep(3)

        # 5. Clicar em Publicar
        log("[*] Clicando em Publicar...")
        page.locator("button:has-text('Publicar')").first.click(timeout=5000)
        log("[+] Publicar clicado!")
        time.sleep(10)
        log("[+] POST PUBLICADO!")

        return True
    except Exception as e:
        log(f"[!] Erro: {e}")
        import traceback; traceback.print_exc()
        return False
    finally:
        context.close()
        browser.close()
        pw.stop()
        log("[*] Navegador fechado.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        log("Uso: py motor_linkedin.py <imagem> <texto>")
        sys.exit(1)
    postar(sys.argv[1], sys.argv[2])
