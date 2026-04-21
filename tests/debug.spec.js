const { test, expect } = require('@playwright/test');

test('debug page errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGEERROR:', err.message);
    errors.push(err.message);
  });
  await page.goto('/');
  await page.waitForTimeout(2000);
  console.log('ERRORS:', errors);
  await expect(errors).toHaveLength(0);
});
