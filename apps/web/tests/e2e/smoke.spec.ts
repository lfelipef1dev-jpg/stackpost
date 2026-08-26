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

const TEST_EMAIL = `teste.stackpost.${Date.now()}@expostacker.com`;
const TEST_PASS = 'Teste123!';

test.describe('StackPost E2E Smoke', () => {
  test('Home + Planos + Cadastro + Login + Dashboard + Contas + Composer + Logout', async ({ page }) => {
    // 1) Home
    await page.goto(BASE);
    await expect(page.locator('text=StackPost').first()).toBeVisible();
    await screenshot(page, '01-home');

    // 2) Planos
    await page.goto(`${BASE}/plans`);
    await expect(page.getByRole('heading', { name: 'Free' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business' }).first()).toBeVisible();
    await screenshot(page, '02-plans');

    // 3) Cadastro
    await page.goto(`${BASE}/register`);
    const nameInput = page.getByPlaceholder('Seu nome');
    const emailInput = page.getByPlaceholder('voce@expostacker.com.br');
    const passInput = page.locator('input[type="password"]');
    await nameInput.fill('Usuario Teste');
    await emailInput.fill(TEST_EMAIL);
    await passInput.fill(TEST_PASS);
    await screenshot(page, '03-register-filled');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    await screenshot(page, '04-register-result');

    // 4) Login (se register nao redirecionou pro dashboard)
    if (page.url().includes('/login')) {
      await page.getByPlaceholder('voce@expostacker.com.br').fill(TEST_EMAIL);
      await page.locator('input[type="password"]').fill(TEST_PASS);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2500);
      await screenshot(page, '05-login-result');
    }

    // 5) Dashboard
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(1500);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await screenshot(page, '06-dashboard');

    // 6) Contas
    await page.goto(`${BASE}/accounts`);
    await page.waitForTimeout(1500);
    await expect(page.getByText('Contas conectadas')).toBeVisible();
    // verifica se os icones oficiais aparecem (Instagram svg do react-icons)
    const instagramIcon = page.locator('svg:below(:text("Conectar nova conta"))').first();
    await screenshot(page, '07-accounts');

    // 7) Composer
    await page.goto(`${BASE}/composer`);
    await page.waitForTimeout(1500);
    await expect(page.getByText('Selecionar plataformas')).toBeVisible();
    await page.locator('textarea').first().fill('Post de teste automatizado do StackPost.');
    await page.getByLabel('Instagram').locator('..').click();
    await page.getByLabel('LinkedIn').locator('..').click();
    await screenshot(page, '08-composer');

    // 8) Logout
    await page.getByRole('button', { name: 'Sair' }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByRole('heading', { name: 'Entrar no StackPost' })).toBeVisible();
    await screenshot(page, '09-after-logout');
  });
});
