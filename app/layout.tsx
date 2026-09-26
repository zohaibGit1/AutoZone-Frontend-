import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'
import { PageLoader } from '@/components/page-loader'

const heading = Barlow_Condensed({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-heading', display: 'swap' })
const body = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'AutoZone — Detailing & Accessories',
  description: 'AutoZone Detailing & Accessories — Full-service car detailing, paint protection, ceramic coating, steam cleaning, and premium automotive care.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/images/autozone-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'AutoZone — Detailing & Accessories',
    description: 'AutoZone Detailing & Accessories — Full-service car detailing, paint protection, ceramic coating, and automotive care.',
    url: 'https://autozone-detailing.com',
    siteName: 'AutoZone Detailing & Accessories',
    images: [
      {
        url: '/images/autozone-logo.png',
        width: 1024,
        height: 1024,
        alt: 'AutoZone Detailing & Accessories Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoZone — Detailing & Accessories',
    description: 'AutoZone Detailing & Accessories — Full-service car detailing, paint protection, ceramic coating, and automotive care.',
    images: ['/images/autozone-logo.png'],
  },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0d0c0f' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <PageLoader />
        {children}
      </body>
    </html>
  )
}