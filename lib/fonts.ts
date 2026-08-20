import localFont from 'next/font/local';

export const bodoni = localFont({
  src: '../public/fonts/bodoni-moda-subset.woff2',
  variable: '--font-bodoni',
  display: 'block',
  weight: '400 700',
  // Single-word families only. next/font emits fallbacks unquoted, and an
  // unquoted multi-word name (e.g. Bodoni 72) invalidates the whole
  // font-family declaration, silently collapsing every --font-bodoni user
  // to the inherited grotesque. globals.css carries the display fallback face.
  fallback: ['Didot', 'serif'],
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
