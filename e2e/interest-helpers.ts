import { expect, type Page } from '@playwright/test';

export async function openInterest(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Express Interest', exact: true }).click();
  await expect(page.locator('dialog.interest-sheet')).toBeVisible();
}

export async function reachOtp(page: Page, phone = '9876543210') {
  await openInterest(page);
  await page.getByLabel('Aadhaar linked number').fill(phone);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm your number' })).toBeVisible();
}

export async function pasteOtp(page: Page, code: string) {
  await page.getByLabel('Six digit verification code').evaluate((element, pasted) => {
    const transfer = new DataTransfer();
    transfer.setData('text', pasted);
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer }));
  }, code);
}

export async function reachDetails(page: Page, phone = '9876543210') {
  await reachOtp(page, phone);
  await pasteOtp(page, '183838');
  await expect(page.getByRole('heading', { name: 'A few particulars' })).toBeVisible();
}

export async function fillValidDetails(page: Page, values?: { email?: string; alternateMobile?: string }) {
  const formValues = {
    firstName: 'Asha',
    lastName: 'Mehta',
    email: values?.email ?? 'asha@example.com',
    alternateMobile: values?.alternateMobile ?? '8765432109',
    city: 'Mumbai',
    pincode: '400001',
    pan: 'ABCDE1234F',
    dob: '1988-08-18',
  };
  await page.getByLabel('First name').fill(formValues.firstName);
  await page.getByLabel('Last name').fill(formValues.lastName);
  await page.getByLabel('Email address').fill(formValues.email);
  await page.getByLabel('Alternate mobile').fill(formValues.alternateMobile);
  await page.getByLabel('City').fill(formValues.city);
  await page.getByLabel('Pincode').fill(formValues.pincode);
  await page.getByLabel('PAN').fill(formValues.pan);
  await page.getByLabel('Date of birth').fill(formValues.dob);
  await page.getByLabel('Employment status').selectOption('employed');
  await page.getByLabel('Annual income range').selectOption('₹50L+');
  return formValues;
}
