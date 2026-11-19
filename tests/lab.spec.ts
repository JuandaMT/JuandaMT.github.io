import { test, expect } from '@playwright/test';

test('the classic site links to the interactive version and back', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-lab-link]').click();
  await expect(page).toHaveURL(/\/lab\/$/);
  await page.locator('[data-classic-link]').click();
  await expect(page).toHaveURL(/\/$/);
});

test('lab language switch keeps the lab page', async ({ page }) => {
  await page.goto('/lab/');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/es\/lab\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('#flow-title')).toHaveText('Cada cambio pasa por el mismo ciclo.');
});

test('with reduced motion the lab is a static, complete document', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/lab/');
  await expect(page.locator('html')).not.toHaveClass(/motion/);
  await expect(page.locator('[data-flow]')).not.toHaveClass(/is-pinned/);
  const steps = page.locator('[data-step]');
  await expect(steps).toHaveCount(5);
  for (const step of await steps.all()) await expect(step).toBeVisible();
  await expect(page.locator('[data-card]').first()).toBeVisible();
  await expect(page.locator('#contact-title')).toBeVisible();
  await expect(page.locator('[data-stamp]')).toBeVisible();
});

test('with motion the loop is pinned and the agents finish the drawing', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'checked on desktop');
  await page.goto('/lab/');
  await expect(page.locator('[data-flow]')).toHaveClass(/is-pinned/);
  await expect(page.locator('[data-stamp]')).toHaveClass(/is-on/, { timeout: 30_000 });
  await expect(page.locator('[data-log]')).toContainText('100%');
});

const bg = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());

test('the lab follows the system theme until the visitor chooses', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/lab/');
  expect(await bg(page)).toBe('#123a66');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/lab/');
  expect(await bg(page)).toBe('#f2efe6');
});

test('the theme toggle switches light/dark, is remembered and shared with the classic site', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/lab/');
  const html = page.locator('html');
  await expect(html).toHaveClass(/light/);
  await page.locator('[data-theme-toggle]').click();
  await expect(html).toHaveClass(/dark/);
  expect(await bg(page)).toBe('#123a66');
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await page.goto('/es/');
  await expect(html).toHaveClass(/dark/);
});
