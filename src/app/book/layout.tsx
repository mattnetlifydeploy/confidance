import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Class',
  description: 'Book a children\'s dance class at Confidance in Hammersmith. Free trial available. Baby Boogie (ages 2-4) and Confidance Kids (ages 3-6) every Thursday.',
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
