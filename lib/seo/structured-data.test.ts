import { expect, it } from 'vitest'; import { structuredData } from './structured-data';
it('describes only 1838 Reserve and the correct fee', () => { const text = JSON.stringify(structuredData); expect(text).not.toContain('Times Black'); expect(text).not.toContain('undefined'); expect(structuredData.offers.price).toBe(175000); });
