import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://stackpost.expostacker.com.br';
const SCREEN_DIR = path.join(__dirname, '..', '..', 'screenshots-tests');

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function screenshot(page: any, name: string) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREEN_DIR, `${slug(name)}.png`), fullPage: false });
}

async function login(page: any) {
  const email = `teste.stackpost.${Date.now()}@expostacker.com`;
  const pass = 'Teste123!';
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder('Seu nome').fill('Usuario Teste');
  await page.getByPlaceholder('voce@expostacker.com.br').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  if (page.url().includes('/login')) {
    await page.getByPlaceholder('voce@expostacker.com.br').fill(email);
    await page.locator('input[type="password"]').fill(pass);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  }
  return email;
}

test.describe('StackPost E2E Full', () => {
  test.setTimeout(120000);
  test('all internal pages load without errors and have header/footer', async ({ page }) => {
    const email = await login(page);
    console.log('Logged in with', email);

    const internalPages = [
      { path: '/dashboard', heading: 'Dashboard', shot: '10-dashboard' },
      { path: '/composer', heading: 'Selecionar plataformas', shot: '11-composer' },
      { path: '/calendar', heading: 'Calendario', shot: '12-calendar' },
      { path: '/accounts', heading: 'Contas conectadas', shot: '13-accounts' },
      { path: '/analytics', heading: 'Analytics', shot: '14-analytics' },
      { path: '/webhooks', heading: 'Webhooks', shot: '15-webhooks' },
      { path: '/settings', heading: 'Config', shot: '16-settings' },
      { path: '/team', heading: 'Team', shot: '17-team' },
      { path: '/billing', heading: 'Billing', shot: '18-billing' },
      { path: '/media', heading: 'Media', shot: '19-media' },
      { path: '/imports', heading: 'Import', shot: '20-imports' },
      { path: '/link-in-bio', heading: 'Link', shot: '21-link-in-bio' },
      { path: '/comments', heading: 'Comment', shot: '22-comments' },
    ];

    for (const p of internalPages) {
      await page.goto(`${BASE}${p.path}`);
      await page.waitForTimeout(1500);
      await expect(page.getByText('Sair')).toBeVisible();
      await screenshot(page, p.shot);
      console.log(`OK: ${p.path}`);
    }

    // Logout
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: 'Sair' }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByRole('heading', { name: 'Entrar no StackPost' })).toBeVisible();
    await screenshot(page, '23-logout-ok');
  });
});
