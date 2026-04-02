'use client'

import { SplitLayoutToggle, useSplitLayout } from '@repo/ui/custom/split-layout'
import { Home } from 'lucide-react'

function SidebarContent() {
  const { collapsed } = useSplitLayout()

  const navItems = [{ icon: Home, label: '工作台', active: true }]

  return (
    <div className="flex flex-col h-full border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <span className={collapsed ? 'hidden' : 'font-semibold whitespace-nowrap'}>Any Mind</span>
        <SplitLayoutToggle />
      </div>
      <nav className="flex-1 p-2">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors whitespace-nowrap ${
              item.active
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </div>
  )
}

export { SidebarContent }
