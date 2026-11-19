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

test('the paper toggle switches to tracing paper and is remembered', async ({ page }) => {
  await page.goto('/es/lab/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-paper', 'cyan');
  await page.locator('[data-paper-toggle]').click();
  await expect(html).toHaveAttribute('data-paper', 'calco');
  await expect(page.locator('[data-paper-toggle]')).toContainText('calco');
  await page.reload();
  await expect(html).toHaveAttribute('data-paper', 'calco');
});

test('the papers keep their colours when the system is in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const bg = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  await page.goto('/lab/');
  expect(await bg()).toBe('#123a66');
  await page.locator('[data-paper-toggle]').click();
  expect(await bg()).toBe('#f2efe6');
});
