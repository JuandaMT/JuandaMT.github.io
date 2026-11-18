import { test, expect } from '@playwright/test';

test('language switch goes to the same page in the other language and back', async ({ page }) => {
  await page.goto('/projects/agency-console/');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/es\/projects\/agency-console\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/projects\/agency-console\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('home switches between English and Spanish', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#projects-title')).toHaveText('Projects');
  await page.locator('[data-lang-switch]').click();
  await expect(page).toHaveURL(/\/es\/$/);
  await expect(page.locator('#projects-title')).toHaveText('Proyectos');
});

test('follows the system color scheme by default', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await ctx.close();
});

test('theme toggle switches and persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const html = page.locator('html');
  const toggle = page.locator('[data-theme-toggle]');
  await expect(html).toHaveClass(/light/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.click();
  await expect(html).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(html).toHaveClass(/dark/);
});

test('skip link moves focus to the main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is checked on desktop');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
