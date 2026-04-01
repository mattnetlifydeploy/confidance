import type { Metadata } from 'next'
import { Quicksand, Outfit } from 'next/font/google'
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

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-outfit',
})

const siteUrl = 'https://confidancecommunity.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Confidance | Children\'s Dance & Confidence Classes',
    template: '%s | Confidance',
  },
  description: 'Helping children aged 2 to 6 grow in confidence, creativity, and self expression through dance, singing, and movement. Classes in your local area.',
  keywords: ['children dance classes Hammersmith', 'kids confidence classes London', 'baby dance classes W6', 'toddler dance Hammersmith', 'Confidance', 'singing classes for toddlers', 'kids dance classes near me', 'preschool dance Hammersmith', 'children confidence building through dance', 'musical movement classes ages 2 to 6'],
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
  description: 'Children\'s dance and confidence building classes for ages 2 to 6 in Hammersmith, London. Baby Boogie and Confidance Kids classes featuring dance, singing, and movement.',
  url: siteUrl,
  email: 'confidancejessica@gmail.com',
  telephone: '',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '7 Bradmore Park Road',
    addressLocality: 'Hammersmith',
    addressRegion: 'London',
    postalCode: 'W6 0DT',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.4928,
    longitude: -0.2342,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Thursday',
    opens: '15:45',
    closes: '16:50',
  },
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
    '@type': 'City',
    name: 'Hammersmith',
    containedInPlace: {
      '@type': 'City',
      name: 'London',
    },
  },
  priceRange: '£10-£12 per session',
  serviceType: 'Children\'s Dance Classes',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Dance Classes',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Baby Boogie',
          description: 'Dance, singing and movement class for children aged 2 to 4',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Confidance Kids',
          description: 'Structured dance, singing and confidence class for children aged 3 to 6',
        },
      },
    ],
  },
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
    <html lang="en" className={`${quicksand.variable} ${outfit.variable}`}>
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
