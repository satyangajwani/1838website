import { expect, test } from '@playwright/test';
import { openInterest, pasteOtp, reachOtp } from './interest-helpers';

test('opening focuses the phone field with a gold ring and closing restores the trigger', async ({ page }) => {
  await openInterest(page);
  const phone = page.getByLabel('Aadhaar linked number');
  await expect(phone).toBeFocused();
  await expect(phone).toHaveCSS('outline-color', 'rgb(255, 228, 171)');
  await page.getByRole('button', { name: 'Close express interest' }).click();
  await expect(page.getByRole('button', { name: 'Express Interest', exact: true })).toBeFocused();
});

test('Escape closes from mobile, OTP and details', async ({ page }) => {
  await openInterest(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.interest-sheet')).not.toBeVisible();

  await page.getByRole('button', { name: 'Express Interest', exact: true }).click();
  await page.getByLabel('Aadhaar linked number').fill('9876543210');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your number' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.interest-sheet')).not.toBeVisible();

  await page.getByRole('button', { name: 'Express Interest', exact: true }).click();
  await pasteOtp(page, '183838');
  await expect(page.getByRole('heading', { name: 'A few particulars' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog.interest-sheet')).not.toBeVisible();
});

test('Tab cannot reach content behind the modal dialog', async ({ page }) => {
  await openInterest(page);
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog.interest-sheet')))).toBe(true);
  }
});

test('the Indian-number first digit is validated on blur', async ({ page }) => {
  await openInterest(page);
  const phone = page.getByLabel('Aadhaar linked number');
  await phone.fill('5000000000');
  await phone.blur();
  await expect(page.locator('#phone-error')).toContainText('Enter a valid 10-digit Indian mobile number.');
  await phone.fill('9000000001');
  await phone.blur();
  await expect(page.locator('#phone-error')).toHaveCount(0);
});

test('a send failure stays on mobile with an inline described error', async ({ page }) => {
  await openInterest(page);
  const phone = page.getByLabel('Aadhaar linked number');
  await phone.fill('9000000000');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('#phone-error')).toHaveText('We could not send a code. Please try again.');
  await expect(phone).toHaveAttribute('aria-describedby', 'phone-error');
  await expect(page.getByRole('heading', { name: 'Confirm your number' })).toHaveCount(0);
});

test('OTP slots meet the touch target and the real field remains opacity one at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await reachOtp(page);
  const sizes = await page.locator('.otp-slots span').evaluateAll((slots) => slots.map((slot) => {
    const box = slot.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(sizes.every(({ width, height }) => width >= 24 && height >= 24)).toBe(true);
  await expect(page.getByLabel('Six digit verification code')).toHaveCSS('opacity', '1');
});

test('a complete paste fills six slots and submits after the correction delay', async ({ page }) => {
  await reachOtp(page);
  let verificationRequests = 0;
  page.on('request', (request) => { if (request.url().endsWith('/api/otp/verify')) verificationRequests += 1; });
  await pasteOtp(page, '123456');
  await expect(page.locator('.otp-slots span').filter({ hasText: /\d/ })).toHaveCount(6);
  await expect(page.locator('#otp-error')).toContainText('OTP entered is incorrect');
  expect(verificationRequests).toBe(1);
});

test('a partial paste fills three slots without submitting', async ({ page }) => {
  await reachOtp(page);
  let verificationRequests = 0;
  page.on('request', (request) => { if (request.url().endsWith('/api/otp/verify')) verificationRequests += 1; });
  await pasteOtp(page, '123');
  await expect(page.locator('.otp-slots span').filter({ hasText: /\d/ })).toHaveCount(3);
  await page.waitForTimeout(400);
  expect(verificationRequests).toBe(0);
  await expect(page.locator('[id$="-error"]')).toHaveCount(0);
});

test('the polite resend timer updates', async ({ page }) => {
  await reachOtp(page);
  const status = page.locator('[aria-live="polite"]');
  await expect(status).toContainText('Resend available in 30s');
  await expect(status).toContainText('Resend available in 29s', { timeout: 1_500 });
});

test('an incorrect code leaves focus in the described OTP field', async ({ page }) => {
  await reachOtp(page);
  const otp = page.getByLabel('Six digit verification code');
  await pasteOtp(page, '111111');
  await expect(page.locator('#otp-error')).toContainText('OTP entered is incorrect');
  await expect(otp).toHaveAttribute('aria-describedby', 'otp-error');
  await expect(otp).toBeFocused();
});

test('the URL remains unchanged through mobile and OTP', async ({ page }) => {
  await openInterest(page);
  const initial = page.url();
  await page.getByLabel('Aadhaar linked number').fill('9876543210');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your number' })).toBeVisible();
  expect(page.url()).toBe(initial);
  await pasteOtp(page, '183838');
  await expect(page.getByRole('heading', { name: 'A few particulars' })).toBeVisible();
  expect(page.url()).toBe(initial);
});
