import { expect, test } from '@playwright/test';
import { fillValidDetails, reachDetails } from './interest-helpers';

test.beforeEach(async ({ page }) => reachDetails(page));

test('every details control has an associated label and consent starts unticked', async ({ page }) => {
  const unlabelled = await page.locator('[data-step="details"] input, [data-step="details"] select').evaluateAll((controls) => controls.filter((control) => !(control as HTMLInputElement).labels?.length).map((control) => (control as HTMLInputElement).name));
  expect(unlabelled).toEqual([]);
  await expect(page.getByLabel('I consent to the processing of my information.')).not.toBeChecked();
});

test('submitting without consent blocks with the consent error', async ({ page }) => {
  await fillValidDetails(page);
  await page.getByRole('button', { name: 'Record my interest' }).click();
  await expect(page.locator('#details-error')).toHaveText('Please confirm your consent before continuing.');
  await expect(page.getByRole('heading', { name: 'Interest recorded' })).toHaveCount(0);
});

test('an alternate mobile matching the primary mobile is rejected', async ({ page }) => {
  await fillValidDetails(page, { alternateMobile: '9876543210' });
  await page.getByLabel('I consent to the processing of my information.').check();
  await page.getByRole('button', { name: 'Record my interest' }).click();
  await expect(page.locator('#details-error')).toHaveText('Alternate mobile cannot be same as primary mobile');
});

test('PAN validation appears on blur, not while typing', async ({ page }) => {
  const pan = page.getByLabel('PAN');
  await pan.fill('abc');
  await expect(page.getByText('Enter a valid PAN.')).toHaveCount(0);
  await pan.blur();
  await expect(page.getByText('Enter a valid PAN.')).toBeVisible();
  await expect(pan).toHaveAttribute('aria-describedby', 'pan-error');
});

test('a valid submission renders the artifact reference without share, referral or queue affordances', async ({ page }) => {
  await fillValidDetails(page);
  await page.getByLabel('I consent to the processing of my information.').check();
  await page.getByRole('button', { name: 'Record my interest' }).click();
  await expect(page.getByRole('heading', { name: 'Interest recorded' })).toBeVisible();
  await expect(page.locator('output.reference')).toHaveText(/^1838-[A-Z0-9]{8}$/);
  await expect(page.getByText('1838 Reserve Private Office', { exact: true })).toBeVisible();
  // Scoped to the sheet: the stage footer also names October 2026.
  await expect(page.locator('dialog.interest-sheet').getByText(/October 2026/)).toBeVisible();
  await expect(page.getByRole('link', { name: /share|refer|queue/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /share|refer|queue/i })).toHaveCount(0);
  await expect(page.getByText(/queue position|referral|share (?:this|your)/i)).toHaveCount(0);
});

test('the nested consent dialog traps focus and returns it to the checkbox', async ({ page }) => {
  const consent = page.getByLabel('I consent to the processing of my information.');
  await page.getByRole('button', { name: 'Read data-sharing terms' }).click();
  const dialog = page.locator('dialog.consent-dialog');
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog.consent-dialog')))).toBe(true);
  }
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(consent).toBeFocused();
});

test('a submit failure preserves every value and focuses the inline error', async ({ page }) => {
  const values = await fillValidDetails(page, { email: 'fail@example.com' });
  await page.getByLabel('I consent to the processing of my information.').check();
  await page.getByRole('button', { name: 'Record my interest' }).click();
  const error = page.locator('#details-error');
  await expect(error).toHaveText('We could not submit your interest. Please try again.');
  await expect(error).toBeFocused();
  await expect(page.getByLabel('First name')).toHaveValue(values.firstName);
  await expect(page.getByLabel('Last name')).toHaveValue(values.lastName);
  await expect(page.getByLabel('Email address')).toHaveValue(values.email);
  await expect(page.getByLabel('Alternate mobile')).toHaveValue(values.alternateMobile);
  await expect(page.getByLabel('City')).toHaveValue(values.city);
  await expect(page.getByLabel('Pincode')).toHaveValue(values.pincode);
  await expect(page.getByLabel('PAN')).toHaveValue(values.pan);
  await expect(page.getByLabel('Date of birth')).toHaveValue(values.dob);
  await expect(page.getByLabel('I consent to the processing of my information.')).toBeChecked();
});
