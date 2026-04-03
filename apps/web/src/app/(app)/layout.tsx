/**
 * 应用主布局 - 包含侧边栏的受保护页面
 * 所有需要登录后才能访问的页面都使用此布局
 */

'use client'

import { useAuthGuard } from '@repo/hooks'
import { SplitLayout, SplitLayoutMain, SplitLayoutSidebar } from '@repo/ui/custom/split-layout'
import { NiceModalProvider } from '@/components/nice-modal-provider'
import { SidebarContent } from '@/components/SidebarContent'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthGuard({
    mode: 'protected',
  })

  if (!isHydrated || !isAuthenticated) {
    return null
  }

  return (
    <NiceModalProvider>
      <SplitLayout sidebarWidth="240px" collapsedWidth="64px">
        <SplitLayoutSidebar>
          <SidebarContent />
        </SplitLayoutSidebar>
        <SplitLayoutMain>{children}</SplitLayoutMain>
      </SplitLayout>
    </NiceModalProvider>
  )
}
