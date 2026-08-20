import { expect, test } from '@playwright/test';

test('the home route server-renders a heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
