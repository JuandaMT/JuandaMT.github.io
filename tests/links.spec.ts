import { test, expect } from '@playwright/test';

/** Every internal link, image and OG image on the main pages must resolve. */
for (const start of ['/', '/es/', '/projects/agency-console/', '/es/projects/agency-console/']) {
  test(`internal links resolve from ${start}`, async ({ page, request, baseURL }) => {
    await page.goto(start);
    const urls = await page.evaluate(() => {
      const hrefs = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => a.href);
      const srcs = [...document.querySelectorAll<HTMLImageElement>('img[src]')].map((i) => i.src);
      const meta = [...document.querySelectorAll<HTMLMetaElement>('meta[property="og:image"]')].map(
        (m) => m.content,
      );
      return [...hrefs, ...srcs, ...meta];
    });

    const internal = new Set<string>();
    for (const raw of urls) {
      const url = new URL(raw);
      if (url.origin === new URL(baseURL!).origin) {
        url.hash = '';
        internal.add(url.pathname);
      } else if (
        url.hostname === 'juandamt.github.io' &&
        !url.pathname.startsWith('/apuntes-claude-code')
      ) {
        // Absolute URLs to this site (OG images, canonical): check them locally.
        internal.add(url.pathname);
      }
    }

    for (const p of internal) {
      const res = await request.get(p);
      expect(res.status(), p).toBe(200);
    }
  });
}

test('in-page anchors point to existing sections', async ({ page }) => {
  await page.goto('/');
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')]
      .map((a) => new URL(a.href).hash.slice(1))
      .filter(Boolean),
  );
  for (const id of new Set(ids)) {
    await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1);
  }
});

test('external links open safely in a new tab', async ({ page }) => {
  await page.goto('/');
  const external = page.locator('a[target="_blank"]');
  expect(await external.count()).toBeGreaterThan(0);
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('href', /^https:\/\//);
  }
});
