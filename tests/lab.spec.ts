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
});

test('with motion the workflow is pinned and the WebGL scene starts', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'checked on desktop');
  await page.goto('/lab/');
  await expect(page.locator('[data-flow]')).toHaveClass(/is-pinned/);
  await expect(page.locator('html')).toHaveAttribute('data-webgl', /on|fallback/, {
    timeout: 10_000,
  });
});
