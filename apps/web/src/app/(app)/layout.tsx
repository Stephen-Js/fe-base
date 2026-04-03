/**
 * 应用主布局 - 包含侧边栏的受保护页面
 * 所有需要登录后才能访问的页面都使用此布局
 */

'use client'

import { SplitLayout, SplitLayoutMain, SplitLayoutSidebar } from '@repo/ui/custom/split-layout'
import { NiceModalProvider } from '@/components/nice-modal-provider'
import { SidebarContent } from '@/components/SidebarContent'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // TODO: 添加登录状态检查，未登录时重定向到 /login
  // const router = useRouter()
  // const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     router.push('/login')
  //   }
  // }, [isLoggedIn, router])

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
