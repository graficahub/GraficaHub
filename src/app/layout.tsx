import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GraficaHub',
  description: 'Aplicação GraficaHub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} style={{ height: '100%', width: '100%' }}>
      <body className="font-sans" style={{ margin: 0, padding: 0, minHeight: '100%', width: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
        {children}
      </body>
    </html>
  )
}

