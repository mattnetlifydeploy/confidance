import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Confidance bookings, view upcoming classes, and update your child\'s details.',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
