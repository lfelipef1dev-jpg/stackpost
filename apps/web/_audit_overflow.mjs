import { chromium } from 'playwright';
const BASE = 'https://stackpost.expostacker.com.br';
const WIDTHS = [320, 375, 390, 768, 1024, 1440, 2560];
const PUBLIC_PAGES = ['/', '/plans', '/login', '/security', '/status'];
const PRIVATE_PAGES = ['/dashboard', '/accounts', '/composer', '/calendar', '/billing', '/settings', '/analytics', '/media'];
const failures = [];
const errs = [];

const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'devin.audit.20260912144121@expostacker.com', password: 'Audit123!' }) });
const token = (r.headers.get('set-cookie') || '').match(/token=([^;]+)/)?.[1];

const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.addCookies([{ name: 'token', value: token, domain: 'stackpost.expostacker.com.br', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
page.on('response', (res) => { if (res.status() >= 500) failures.push(`5xx ${res.status()} ${res.url().slice(0, 100)}`); });

for (const path of [...PUBLIC_PAGES, ...PRIVATE_PAGES]) {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1200);
      const res = await page.evaluate(() => {
        const d = document.documentElement;
        const overflow = d.scrollWidth - d.clientWidth;
        let culprit = '';
        if (overflow > 1) {
          const bad = [...document.querySelectorAll('*')].filter((e) => e.scrollWidth > d.clientWidth + 4 && e.children.length).slice(0, 3);
          culprit = bad.map((e) => `${e.tagName}.${String(e.className).slice(0, 50)}`).join('|');
        }
        return { overflow, culprit };
      });
      if (res.overflow > 1) console.log(`FAIL ${path}@${w}: +${res.overflow}px :: ${res.culprit}`);
      else console.log(`ok ${path}@${w}`);
    } catch (e) {
      console.log(`NAVFAIL ${path}@${w}`);
    }
  }
}
await browser.close();
console.log('\n5xx:', failures.length ? failures.join('\n') : 'nenhum');
console.log('console errors:', errs.length ? errs.join('\n') : 'nenhum');
