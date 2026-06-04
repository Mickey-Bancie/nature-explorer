import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nature Explorer',
  description: 'Discover and share amazing nature spots',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
