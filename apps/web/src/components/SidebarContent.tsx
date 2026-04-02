'use client'

import { SplitLayoutToggle, useSplitLayout } from '@repo/ui/custom/split-layout'
import { Home, LayoutDashboard } from 'lucide-react'
import { usePathname } from 'next/navigation'

function SidebarContent() {
  const { collapsed } = useSplitLayout()
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: '工作台', href: '/' },
    { icon: LayoutDashboard, label: '组件库', href: '/components' },
  ]

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
    </div>
  )
}

export { SidebarContent }
