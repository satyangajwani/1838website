import localFont from 'next/font/local';

export const stixTwoText = localFont({
  src: '../public/fonts/stix-two-text-subset.woff2',
  variable: '--font-stix-two-text',
  display: 'block',
  weight: '400 700',
  fallback: ['Georgia'],
  adjustFontFallback: false,
});

export const montserrat = localFont({
  src: '../public/fonts/montserrat-subset.woff2',
  variable: '--font-montserrat',
  display: 'block',
  weight: '400 800',
  fallback: ['Arial'],
  adjustFontFallback: false,
});
