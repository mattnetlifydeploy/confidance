import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free Confidance account to book children\'s dance classes in Hammersmith, London.',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
