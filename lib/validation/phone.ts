export const phoneError = (value: string) => /^[6-9]\d{9}$/.test(value) ? undefined : 'Enter a valid 10-digit Indian mobile number.';
