import { test, expect } from '@playwright/test'; import AxeBuilder from '@axe-core/playwright';
test('home page has no detectable axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-reveal-complete', 'true');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
