import localFont from 'next/font/local';

export const bodoni = localFont({
  src: '../public/fonts/bodoni-moda-subset.woff2',
  variable: '--font-bodoni',
  display: 'block',
  weight: '400 900',
  fallback: ['Didot', 'Bodoni 72', 'serif'],
  adjustFontFallback: false,
});

export const grotesque = localFont({
  src: '../public/fonts/manrope-subset.woff2',
  variable: '--font-grotesque',
  display: 'block',
  weight: '400 800',
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: false,
});
