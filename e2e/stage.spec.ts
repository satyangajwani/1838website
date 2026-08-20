import { expect, test, type Page } from '@playwright/test';

type LcpWindow = Window & { __reserveLcp?: 'stage-image' | 'other' };

async function keepPosterTier(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 2 });
  });
}

function intersects(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test.beforeEach(async ({ page }) => keepPosterTier(page));

test('a server-rendered stage image is the LCP element in Chromium', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Largest Contentful Paint PerformanceObserver entries are unavailable in WebKit.');
  await page.addInitScript(() => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries.at(-1) as PerformanceEntry & { element?: Element };
      (window as LcpWindow).__reserveLcp = entry?.element?.matches('[data-lcp-stage-image]') ? 'stage-image' : 'other';
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto('/');
  await expect(page.locator('[data-lcp-stage-image]')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => (window as LcpWindow).__reserveLcp)).toBe('stage-image');
});

test('the stage contains a clean card crop and no plinth fragments', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Artwork by Krishen Khanna', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Joining Fee ₹1,75,000 + GST', { exact: false })).toHaveCount(1);
  await expect(page.getByAltText('Visa')).toHaveCount(1);
  await expect(page.locator('img[src*="cardpedestaltext"], img[src*="card-stand-9c28"], img[src*="wall-8d3a"]')).toHaveCount(0);

  const crops = await page.locator('[data-layer="card-stand"] img').evaluateAll((images) => images.map((node) => {
    const image = node as HTMLImageElement;
    return { marker: image.dataset.bakedCopy, width: image.naturalWidth, height: image.naturalHeight, src: image.currentSrc };
  }));
  expect(crops).toEqual([
    expect.objectContaining({ marker: 'excluded', width: 1598, height: 823 }),
  ]);
  expect(crops.every(({ src }) => /card-clean-4fd2/.test(src))).toBe(true);
  await expect(page.locator('[data-layer="plinth"], .stage-plinth, img[src*="plinth"]')).toHaveCount(0);
  await expect(page.locator('.stage-stand, .stage-contact-shadow, .stage-reflection')).toHaveCount(3);
});

test('pointer movement gives every physical layer a distinct depth and moves the card least', async ({ page }) => {
  await page.goto('/');
  const stage = page.locator('[data-stage]');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .92, box!.y + box!.height * .12);

  const transforms = await page.locator('[data-layer="wall"], [data-layer="card-stand"], [data-layer="specular"]').evaluateAll((layers) => layers.map((layer) => ({
    name: (layer as HTMLElement).dataset.layer,
    transform: (layer as HTMLElement).style.transform,
  })));
  expect(new Set(transforms.map(({ transform }) => transform)).size).toBe(3);
  const displacement = (value: string) => Math.hypot(...(value.match(/-?\d+(?:\.\d+)?/g) ?? []).slice(0, 2).map(Number));
  const wall = transforms.find(({ name }) => name === 'wall')!;
  const card = transforms.find(({ name }) => name === 'card-stand')!;
  expect(displacement(card.transform)).toBeLessThan(displacement(wall.transform));
});

test('the reveal is complete inside five seconds and no animation remains at six seconds', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  await expect(page.locator('.stage-copy')).toHaveCSS('opacity', '1', { timeout: 5_000 });
  expect(Date.now() - started).toBeLessThanOrEqual(5_000);
  await page.waitForTimeout(Math.max(0, 6_050 - (Date.now() - started)));
  const running = await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length);
  expect(running).toBe(0);
});

for (const viewport of [
  { name: '320 portrait', width: 320, height: 568 },
  { name: '320 landscape', width: 568, height: 320 },
  { name: '768 portrait', width: 768, height: 1024 },
  { name: '768 landscape', width: 1024, height: 768 },
  { name: '1440 landscape', width: 1440, height: 900 },
  { name: '1440 portrait', width: 900, height: 1440 },
  { name: '1920 landscape', width: 1920, height: 1080 },
  { name: '1920 portrait', width: 1080, height: 1920 },
  { name: '3840 landscape', width: 3840, height: 2160 },
  { name: '3840 portrait', width: 2160, height: 3840 },
]) {
  test(`${viewport.name} keeps type, card, terms and CTA inside one collision-free frame`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    const proposition = await page.getByRole('heading', { level: 1 }).boundingBox();
    const card = await page.locator('[data-layer="card-stand"]').boundingBox();
    const object = await page.locator('[data-stage-object]').boundingBox();
    const shadow = await page.locator('.stage-contact-shadow').boundingBox();
    const reflection = await page.locator('.stage-reflection').boundingBox();
    const terms = await page.getByRole('link', { name: 'Terms apply' }).boundingBox();
    const cta = await page.getByRole('button', { name: 'Express Interest', exact: true }).boundingBox();
    const masthead = await page.locator('.masthead').boundingBox();
    const audio = await page.getByRole('button', { name: /ambience/i }).boundingBox();
    expect(proposition && card && object && shadow && reflection && terms && cta && masthead && audio).toBeTruthy();
    expect(intersects(proposition!, card!)).toBe(false);
    expect(intersects(masthead!, audio!)).toBe(false);
    for (const box of [object!, shadow!, reflection!, terms!, cta!, audio!]) {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    expect(await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }))).toEqual({ width: viewport.width, height: viewport.height });
    await expect(page.locator('[data-device-landscape], [class*="rotate" i], img[src*="orientation"]')).toHaveCount(0);
  });
}

test('the Visa mark is white, fully opaque and outside filtered ancestors', async ({ page, request }) => {
  await page.goto('/');
  const mark = page.getByAltText('Visa');
  await expect(mark).toHaveCSS('opacity', '1');
  const unsafeAncestor = await mark.evaluate((node) => {
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.filter !== 'none' || style.backdropFilter !== 'none') return true;
    }
    return false;
  });
  expect(unsafeAncestor).toBe(false);
  expect(await (await request.get('/visa-mark.svg')).text()).toContain('fill="#ffffff"');
});

test('reduced motion keeps every layer static on pointer movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const before = await page.locator('[data-depth]').evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).style.transform));
  await page.mouse.move(10, 10);
  await page.mouse.move(310, 500);
  const after = await page.locator('[data-depth]').evaluateAll((layers) => layers.map((layer) => (layer as HTMLElement).style.transform));
  expect(after).toEqual(before);
});
