import type { Metadata } from 'next'
import { Poppins, Outfit, Dancing_Script } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ScrollProgress } from '@/components/scroll-progress'
import { AuthProvider } from '@/lib/auth-context'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-script',
})

const siteUrl = 'https://www.confidancecommunity.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Confidance | Building Confidence Through Performing Arts',
    template: '%s | Confidance',
  },
  description: 'Performer-led after-school performing arts clubs in partner schools. Jessica, a professional musical theatre performer, builds children\'s confidence through singing, acting and dance.',
  keywords: ['performing arts clubs', 'after school clubs', 'school performing arts', 'musical theatre for children', 'singing acting dance', 'children confidence building', 'Confidance', 'KS1 KS2 drama club', 'performer-led clubs', 'school enrichment'],
  authors: [{ name: 'Jessica Murphy' }],
  creator: 'Bright Loop Media',
  openGraph: {
    title: 'Confidance | Building Confidence Through Performing Arts',
    description: 'Performer-led after-school performing arts clubs in partner schools. Singing, acting and dance that build children\'s confidence, creativity and stage presence.',
    url: siteUrl,
    siteName: 'Confidance',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Confidance | Building Confidence Through Performing Arts',
    description: 'Performer-led after-school performing arts clubs in partner schools. Singing, acting and dance that build children\'s confidence.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Confidance',
  description: 'Performer-led after-school performing arts clubs hosted in partner schools. Singing, acting and dance that build children\'s confidence, creativity and stage presence.',
  url: siteUrl,
  email: 'confidancejessica@gmail.com',
  founder: {
    '@type': 'Person',
    name: 'Jessica Murphy',
    jobTitle: 'Founder, Musical Theatre Performer and Lead Teacher',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United Kingdom',
  },
  priceRange: '££',
  serviceType: 'After-school performing arts clubs',
  slogan: 'Building confidence through performing arts',
  sameAs: [
    'https://instagram.com/confidancecommunity',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className={`${poppins.variable} ${outfit.variable} ${dancingScript.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-teal focus:px-4 focus:py-2 focus:text-white focus:shadow-lg">
            Skip to content
          </a>
          <ScrollProgress />
          <Nav />
          <main id="main-content">{children}</main>
          <Footer />
          <ScrollReveal />
        </AuthProvider>
      </body>
    </html>
  )
}
