const { test } = require('@playwright/test');

test('visual inspection screenshots', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tests/screenshots/01_title.png' });

  // Click start
  await page.click('#start-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshots/02_started.png' });

  // Move a bit
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshots/03_moving.png' });
});
