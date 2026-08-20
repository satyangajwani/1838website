import { describe, expect, it } from 'vitest';
import { validateApplicant } from './applicant';
it('rejects an alternate number equal to primary', () => expect(validateApplicant({ alternateMobile: '9876543210', primaryMobile: '9876543210' }).alternateMobile).toMatch(/cannot be same/i));
