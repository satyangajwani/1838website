import type { Metadata } from 'next';
import './globals.css';
import { montserrat, stixTwoText } from '@/lib/fonts';
import { FontGate } from '@/components/system/font-gate';
import { structuredData } from '@/lib/seo/structured-data';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://preview.1838reserve.com');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '1838 Reserve',
  description: 'For those who script India’s future',
  robots: { index: false, follow: false },
  openGraph: { title: '1838 Reserve', description: 'For those who script India’s future', images: ['/og.png'], type: 'website' },
  twitter: { card: 'summary_large_image', title: '1838 Reserve', description: 'For those who script India’s future', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${stixTwoText.variable} ${montserrat.variable}`}><body><FontGate />{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
