import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SplitLayout, SplitLayoutMain, SplitLayoutSidebar } from '@repo/ui/custom/split-layout'
import { NiceModalProvider } from '@/components/nice-modal-provider'
import { SidebarContent } from '@/components/SidebarContent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fe Base',
  description: 'Fe Base Web App',
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SplitLayout sidebarWidth="240px" collapsedWidth="64px">
      <SplitLayoutSidebar>
        <SidebarContent />
      </SplitLayoutSidebar>
      <SplitLayoutMain>{children}</SplitLayoutMain>
    </SplitLayout>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <NiceModalProvider>
          <AppLayout>{children}</AppLayout>
        </NiceModalProvider>
      </body>
    </html>
  )
}
