import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', lang: 'en' },
  { path: '/es/', lang: 'es' },
  { path: '/projects/agency-console/', lang: 'en' },
  { path: '/projects/coaching-platform/', lang: 'en' },
  { path: '/projects/ecommerce-monorepo/', lang: 'en' },
  { path: '/es/projects/agency-console/', lang: 'es' },
  { path: '/es/projects/coaching-platform/', lang: 'es' },
  { path: '/es/projects/ecommerce-monorepo/', lang: 'es' },
  { path: '/lab/', lang: 'en' },
  { path: '/es/lab/', lang: 'es' },
];

for (const { path, lang } of pages) {
  test(`loads ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/Juan David Mayorga/);

    // SEO basics
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${path}$`),
    );
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="es"]')).toHaveCount(1);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og\/.+\.png$/,
    );

    // Production builds never show TODO placeholders.
    await expect(page.locator('[data-todo]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('unknown routes serve the 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
});

test('sitemap lists both languages', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBeTruthy();
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('https://juandamt.github.io/es/');
  expect(sitemap).toContain('hreflang="es"');
  expect(sitemap).not.toContain('404');
});
