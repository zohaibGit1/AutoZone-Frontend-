import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'
import { PageLoader } from '@/components/page-loader'

const heading = Barlow_Condensed({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-heading', display: 'swap' })
const body = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: 'AutoZone — Car Detailing, Shop & Repair',
  description: 'Full-service car detailing, paint protection, ceramic coating and automotive care.',
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