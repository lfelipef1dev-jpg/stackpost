// Auditoria browser em producao: overflow horizontal, console errors, keyboard nav.
// Uso: node _audit_browser.mjs
import { chromium } from 'playwright';

const BASE = 'https://stackpost.expostacker.com.br';
const EMAIL = 'devin.audit.20260912144121@expostacker.com';
const PASS = 'Audit123!';
const WIDTHS = [320, 375, 390, 768, 1024, 1440, 2560];
const PUBLIC_PAGES = ['/', '/plans', '/login', '/security', '/status'];
const PRIVATE_PAGES = ['/dashboard', '/accounts', '/composer', '/calendar', '/billing', '/settings', '/analytics', '/media'];

const consoleErrors = [];
const failures = [];

async function getToken() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const setCookie = r.headers.get('set-cookie') || '';
  const m = setCookie.match(/token=([^;]+)/);
  return m?.[1];
}

function attachListeners(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${tag}] ${msg.text().slice(0, 160)}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`[${tag}] PAGEERROR ${String(err).slice(0, 160)}`));
  page.on('response', (res) => {
    if (res.status() >= 500) failures.push(`[${tag}] ${res.status()} ${res.url().slice(0, 120)}`);
  });
}

async function checkWidth(page, url, width, tag) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
    failures.push(`[${tag}@${width}] NAV FAIL ${url}`);
  });
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => {
    const d = document.documentElement;
    return d.scrollWidth - d.clientWidth;
  });
  if (overflow > 1) {
    const culprit = await page.evaluate(() => {
      const d = document.documentElement;
      const els = [...document.querySelectorAll('*')];
      const bad = els.filter((e) => e.scrollWidth > d.clientWidth + 4 && e.children.length).slice(0, 3);
      return bad.map((e) => `${e.tagName}.${String(e.className).slice(0, 60)}`).join(' | ');
    });
    failures.push(`[${tag}@${width}] H-OVERFLOW ${overflow}px ${url} :: ${culprit}`);
  }
  return overflow;
}

const browser = await chromium.launch();
const token = await getToken();

// --- Paginas publicas ---
for (const path of PUBLIC_PAGES) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  attachListeners(page, path);
  for (const w of WIDTHS) await checkWidth(page, `${BASE}${path}`, w, path);
  await ctx.close();
  console.log(`public ${path}: done`);
}

// --- Paginas privadas ---
const ctx = await browser.newContext();
await ctx.addCookies([{ name: 'token', value: token, domain: 'stackpost.expostacker.com.br', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
for (const path of PRIVATE_PAGES) {
  const page = await ctx.newPage();
  attachListeners(page, path);
  for (const w of WIDTHS) await checkWidth(page, `${BASE}${path}`, w, path);
  console.log(`private ${path}: done`);
  await page.close();
}

// --- Keyboard nav: dashboard, conta quantos tabs ate sair do header ---
const page = await ctx.newPage();
attachListeners(page, 'kbd');
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
let focusVisible = 0, tabs = 0;
for (let i = 0; i < 15; i++) {
  await page.keyboard.press('Tab');
  tabs++;
  const info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: 'BODY' };
    const st = getComputedStyle(el);
    const outline = st.outlineStyle !== 'none' && st.outlineWidth !== '0px';
    const shadow = st.boxShadow !== 'none';
    return { tag: el.tagName, text: (el.textContent || '').slice(0, 30), outline, shadow };
  });
  if (info.outline || info.shadow) focusVisible++;
}
console.log(`kbd: ${focusVisible}/${tabs} elementos focados com indicador visivel`);

// --- Screenshot evidencia 320px + 1440px dashboard ---
await page.setViewportSize({ width: 320, height: 800 });
await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: '_shot_dashboard_320.png' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: '_shot_dashboard_1440.png', fullPage: false });
await page.goto(`${BASE}/composer`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: '_shot_composer_1440.png' });

await browser.close();

console.log('\n=== FALHAS ===');
console.log(failures.length ? failures.join('\n') : 'nenhuma');
console.log('\n=== CONSOLE ERRORS ===');
console.log(consoleErrors.length ? consoleErrors.join('\n') : 'nenhum');
