import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { MockProvider } from '@/components/mock-provider'
import { QueryProvider } from '@/components/query-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fe Base',
  description: 'Fe Base Web App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <MockProvider>
          <QueryProvider>{children}</QueryProvider>
        </MockProvider>
      </body>
    </html>
  )
}
