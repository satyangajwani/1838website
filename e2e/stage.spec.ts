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

test('the stage layers the supplied no-name card and supplied pedestal without CSS stand effects', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('The 1838 Reserve Credit Card · Visa Infinite Privilege · October 2026', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Card ownership by invitation only.', { exact: true })).toHaveCount(1);
  await expect(page.getByAltText('The Times of India')).toHaveCount(1);
  await expect(page.getByAltText('ICICI Bank')).toHaveCount(1);
  await expect(page.getByAltText('Visa')).toHaveCount(1);
  await expect(page.locator('img[src*="cardpedestaltext"], img[src*="card-clean-4fd2"]')).toHaveCount(0);

  const crops = await page.locator('[data-layer="card-stand"] img').evaluateAll((images) => images.map((node) => {
    const image = node as HTMLImageElement;
    return { marker: image.dataset.bakedCopy, width: image.naturalWidth, height: image.naturalHeight, src: image.currentSrc };
  }));
  expect(crops).toEqual([expect.objectContaining({ marker: 'excluded' })]);
  expect(crops[0].width).toBeGreaterThan(0);
  expect(crops[0].height).toBeGreaterThan(0);
  expect(crops.every(({ src }) => /card-on-stand-noname/.test(src))).toBe(true);
  await expect(page.locator('[data-layer="pedestal"] img[src*="pedestal-only"]')).toHaveCount(1);
  await expect(page.locator('.stage-stand, .stage-contact-shadow, .stage-reflection')).toHaveCount(0);
});

test('pointer movement gives every physical layer a distinct depth and moves the card least', async ({ page }) => {
  await page.goto('/');
  const stage = page.locator('[data-stage]');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .92, box!.y + box!.height * .12);

  const transforms = await page.locator('[data-layer="wall"], [data-layer="pedestal"], [data-layer="card-stand"], [data-layer="specular"]').evaluateAll((layers) => layers.map((layer) => ({
    name: (layer as HTMLElement).dataset.layer,
    transform: (layer as HTMLElement).style.transform,
  })));
  // wall .09, pedestal .055, specular .045, card .035 — four distinct depths
  expect(new Set(transforms.map(({ transform }) => transform)).size).toBe(4);
  const displacement = (value: string) => Math.hypot(...(value.match(/-?\d+(?:\.\d+)?/g) ?? []).slice(0, 2).map(Number));
  const wall = transforms.find(({ name }) => name === 'wall')!;
  const card = transforms.find(({ name }) => name === 'card-stand')!;
  expect(displacement(card.transform)).toBeLessThan(displacement(wall.transform));
});

test('the CSS ceremony resolves through the proposition sentinel inside five seconds', async ({ page }) => {
  const started = Date.now();
  await page.goto('/');
  const proposition = page.locator('[data-reveal-sentinel]');
  await expect(page.locator('html')).toHaveAttribute('data-reveal-complete', 'true', { timeout: 5_000 });
  await expect(proposition).toHaveCSS('opacity', '1');
  expect(Date.now() - started).toBeLessThanOrEqual(5_000);
  const sentinelAnimations = await proposition.evaluate((node) => node.getAnimations().filter((animation) => animation.playState === 'running').length);
  expect(sentinelAnimations).toBe(0);
});

test('visual ambience runs indefinitely and can be paused and resumed', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-reveal-complete', 'true');
  const stage = page.locator('[data-stage]');
  const wallBreath = page.locator('.stage-wall-breath');
  const cardBreath = page.locator('.stage-card-breath');
  await expect(stage).toHaveAttribute('data-ambience', 'running');
  await expect(wallBreath).toHaveCSS('animation-play-state', 'running');
  await expect(cardBreath).toHaveCSS('animation-play-state', 'running');

  // The audio and visual toggles live behind the consolidated stage-controls popover.
  await page.getByRole('button', { name: 'Stage controls' }).click();
  const pause = page.getByRole('button', { name: 'Pause visual ambience' });
  await pause.click();
  await expect(stage).toHaveAttribute('data-ambience', 'paused');
  await expect(wallBreath).toHaveCSS('animation-play-state', 'paused');
  await expect(cardBreath).toHaveCSS('animation-play-state', 'paused');

  await page.getByRole('button', { name: 'Resume visual ambience' }).click();
  await expect(stage).toHaveAttribute('data-ambience', 'running');
});

test('pointer steering decays to the autonomous light path in two seconds', async ({ page }) => {
  await page.goto('/');
  const stage = page.locator('[data-stage]');
  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .98, box!.y + box!.height * .5);
  await expect.poll(() => stage.evaluate((node) => parseFloat(getComputedStyle(node).getPropertyValue('--light-x')))).toBeGreaterThan(65);
  await expect(stage).toHaveAttribute('data-steering', 'active');
  await expect(stage).not.toHaveAttribute('data-steering', 'active', { timeout: 2_400 });
  expect(await stage.evaluate((node) => parseFloat(getComputedStyle(node).getPropertyValue('--light-x')))).toBeLessThan(65);
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
    const pedestal = await page.locator('[data-layer="pedestal"]').boundingBox();
    const footer = await page.getByText('Card ownership by invitation only.', { exact: true }).boundingBox();
    const cta = await page.getByRole('button', { name: 'Request an Introduction', exact: true }).boundingBox();
    const masthead = await page.locator('.masthead').boundingBox();
    const toi = await page.getByAltText('The Times of India').boundingBox();
    const controls = await page.locator('.stage-controls').boundingBox();
    expect(proposition && card && object && pedestal && footer && cta && masthead && toi && controls).toBeTruthy();
    expect(intersects(proposition!, card!)).toBe(false);
    if (viewport.width <= 768 || viewport.height <= 600) expect(controls!.y).toBeGreaterThanOrEqual(toi!.y + toi!.height - 1);
    for (const box of [object!, pedestal!, footer!, cta!, controls!]) {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    expect(await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }))).toEqual({ width: viewport.width, height: viewport.height });
    await expect(page.locator('[data-device-landscape], [class*="rotate" i], img[src*="orientation"]')).toHaveCount(0);
  });
}

test('portrait footer product line stays below the card layer at 320, 390 and 768 widths', async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    const productLine = await page.getByText('The 1838 Reserve Credit Card · Visa Infinite Privilege · October 2026', { exact: true }).boundingBox();
    const card = await page.locator('[data-layer="card-stand"]').boundingBox();

    expect(productLine && card).toBeTruthy();
    expect(intersects(productLine!, card!)).toBe(false);
    expect(productLine!.y).toBeGreaterThanOrEqual(card!.y + card!.height);
  }
});

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
  await expect(page.locator('[data-stage]')).toHaveAttribute('data-ambience', 'paused');
  await expect(page.locator('.stage-wall-breath')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.stage-card-breath')).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Stage controls' }).click();
  await expect(page.getByRole('button', { name: 'Visual ambience paused for reduced motion' })).toBeDisabled();
});

test('the proposition uses STIX Two Text as display type with tight leading', async ({ page }) => {
  await page.goto('/');
  const proposition = page.getByRole('heading', { level: 1 });
  const type = await proposition.evaluate((node) => {
    const style = getComputedStyle(node);
    return { family: style.fontFamily, size: parseFloat(style.fontSize), leading: parseFloat(style.lineHeight) };
  });
  expect(type.family.toLowerCase()).toContain('stix');
  expect(type.size).toBeGreaterThan(32);
  expect(type.leading / type.size).toBeLessThanOrEqual(.96);
});
