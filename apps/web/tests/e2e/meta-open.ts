import { chromium } from 'playwright';
import * as path from 'path';

const userDataDir = path.resolve('C:/Users/lfeli/Desktop/StackPost/sessao_meta');
const screenDir = 'C:/Users/lfeli/Desktop/StackPost/apps/web/screenshots-tests';

(async () => {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized'],
  });
  const page = await context.newPage();
  await page.goto('https://developers.facebook.com/apps');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${screenDir}/meta-apps-home.png`, fullPage: false });
  console.log('Screenshot salvo: meta-apps-home.png');
  await context.close();
})();
