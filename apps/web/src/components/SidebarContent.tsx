'use client'

import { useAuthStore } from '@repo/store'
import { SplitLayoutToggle, useSplitLayout } from '@repo/ui/custom/split-layout'
import { Grid3X3, Home, LayoutDashboard, LogOut, Table2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

function SidebarContent() {
  const { collapsed } = useSplitLayout()
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const navItems = [
    { icon: Home, label: '工作台', href: '/' },
    { icon: LayoutDashboard, label: '组件库', href: '/ui-library' },
    { icon: Table2, label: '表格表单联动', href: '/table-form-demo' },
    { icon: Grid3X3, label: '拖拽布局', href: '/drag-layout' },
  ]

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className={collapsed ? 'hidden' : 'font-semibold whitespace-nowrap'}>Any Mind</span>
        <SplitLayoutToggle />
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors whitespace-nowrap mb-1 ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </a>
          )
        })}
      </nav>
      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors whitespace-nowrap ${
            collapsed
              ? 'justify-center'
              : 'hover:bg-accent hover:text-accent-foreground'
          } hover:bg-accent hover:text-accent-foreground`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </div>
  )
}

export { SidebarContent }
