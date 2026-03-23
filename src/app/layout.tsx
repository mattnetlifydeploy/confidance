import type { Metadata } from 'next'
import { Quicksand, Inter } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { ScrollReveal } from '@/components/scroll-reveal'
import { ScrollProgress } from '@/components/scroll-progress'
import { AuthProvider } from '@/lib/auth-context'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-quicksand',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
})

const siteUrl = 'https://confidance.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Confidance | Children\'s Dance & Confidence Classes',
    template: '%s | Confidance',
  },
  description: 'Helping children aged 2 to 6 grow in confidence, creativity, and self expression through dance, singing, and movement. Classes in your local area.',
  keywords: ['children dance classes', 'kids confidence', 'baby ballet', 'toddler dance', 'Confidance', 'singing classes', 'kids dance', 'preschool dance', 'children confidence building', 'musical movement'],
  authors: [{ name: 'Jessica Murphy' }],
  creator: 'Bright Loop Media',
  openGraph: {
    title: 'Confidance | Children\'s Dance & Confidence Classes',
    description: 'Helping children aged 2 to 6 grow in confidence, creativity, and self expression through dance, singing, and movement.',
    url: siteUrl,
    siteName: 'Confidance',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Confidance | Children\'s Dance & Confidence Classes',
    description: 'Helping children aged 2 to 6 grow in confidence, creativity, and self expression through dance, singing, and movement.',
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
  description: 'Children\'s dance and confidence building classes for ages 2 to 6. Baby Boogie and Confidance classes featuring dance, singing, and movement.',
  url: siteUrl,
  email: 'confidancejessica@gmail.com',
  founder: {
    '@type': 'Person',
    name: 'Jessica Murphy',
    jobTitle: 'Founder & Lead Teacher',
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Trinity Laban Conservatoire of Music and Dance',
    },
  },
  areaServed: {
    '@type': 'Country',
    name: 'United Kingdom',
  },
  priceRange: '$$',
  serviceType: 'Children\'s Dance Classes',
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
    <html lang="en" className={`${quicksand.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-coral focus:px-4 focus:py-2 focus:text-white focus:shadow-lg">
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
