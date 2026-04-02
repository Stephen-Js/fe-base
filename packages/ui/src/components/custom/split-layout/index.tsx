'use client'

import { cn } from '@repo/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'

interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial collapsed state of the sidebar */
  defaultCollapsed?: boolean
  /** Controlled collapsed state */
  collapsed?: boolean
  /** Callback when collapsed state changes (controlled mode) */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Width of the sidebar when expanded */
  sidebarWidth?: string
  /** Width of the sidebar when collapsed */
  collapsedWidth?: string
  /** Sidebar position */
  sidebarPosition?: 'left' | 'right'
}

interface SplitLayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Make sidebar collapsible */
  collapsible?: boolean
}

interface SplitLayoutMainProps extends React.HTMLAttributes<HTMLDivElement> {}

interface SplitLayoutToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom icon for expand state */
  expandIcon?: React.ReactNode
  /** Custom icon for collapse state */
  collapseIcon?: React.ReactNode
}

interface SplitLayoutContextValue {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  sidebarWidth: string
  collapsedWidth: string
}

const SplitLayoutContext = React.createContext<SplitLayoutContextValue | null>(null)

const useSplitLayoutContext = () => {
  const context = React.useContext(SplitLayoutContext)
  if (!context) {
    throw new Error('SplitLayout components must be used within a SplitLayout')
  }
  return context
}

const useSplitLayout = () => {
  const context = React.useContext(SplitLayoutContext)
  return {
    collapsed: context?.collapsed ?? false,
    setCollapsed: context?.setCollapsed ?? (() => {}),
    sidebarWidth: context?.sidebarWidth ?? '280px',
    collapsedWidth: context?.collapsedWidth ?? '64px',
  }
}

const SplitLayout = React.forwardRef<HTMLDivElement, SplitLayoutProps>(
  (
    {
      className,
      defaultCollapsed = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      sidebarWidth = '280px',
      collapsedWidth = '64px',
      sidebarPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed)
    const isControlled = controlledCollapsed !== undefined
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed

    const setCollapsed = React.useCallback(
      (value: boolean) => {
        if (!isControlled) {
          setInternalCollapsed(value)
        }
        onCollapsedChange?.(value)
      },
      [isControlled, onCollapsedChange]
    )

    const contextValue = React.useMemo(
      () => ({
        collapsed,
        setCollapsed,
        sidebarWidth,
        collapsedWidth,
      }),
      [collapsed, setCollapsed, sidebarWidth, collapsedWidth]
    )

    // Separate children by type
    const sidebarChildren: React.ReactNode[] = []
    const mainChildren: React.ReactNode[] = []
    const otherChildren: React.ReactNode[] = []

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        otherChildren.push(child)
        return
      }
      const childType = child.type as React.ComponentType
      const displayName = childType.displayName || childType.name
      if (displayName === 'SplitLayoutSidebar') {
        sidebarChildren.push(
          React.cloneElement(child as React.ReactElement<{ className?: string }>, {
            className: cn(
              (child.props as { className?: string }).className,
              sidebarPosition === 'left' ? 'order-first' : 'order-last'
            ),
          })
        )
      } else if (displayName === 'SplitLayoutMain') {
        mainChildren.push(
          React.cloneElement(child as React.ReactElement<{ className?: string }>, {
            className: cn(
              (child.props as { className?: string }).className,
              sidebarPosition === 'left' ? 'order-last' : 'order-first'
            ),
          })
        )
      } else {
        otherChildren.push(child)
      }
    })

    return (
      <SplitLayoutContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('flex h-full w-full overflow-hidden', className)}
          data-sidebar-position={sidebarPosition}
          {...props}
        >
          {sidebarChildren}
          {mainChildren}
          {otherChildren}
        </div>
      </SplitLayoutContext.Provider>
    )
  }
)
SplitLayout.displayName = 'SplitLayout'

const SplitLayoutToggle = React.forwardRef<HTMLButtonElement, SplitLayoutToggleProps>(
  ({ className, expandIcon, collapseIcon, onClick, ...props }, ref) => {
    const { collapsed, setCollapsed } = useSplitLayout()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setCollapsed(!collapsed)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
          'transition-colors duration-200',
          className
        )}
        {...props}
      >
        {collapsed
          ? expandIcon || <ChevronRight className="h-4 w-4" />
          : collapseIcon || <ChevronLeft className="h-4 w-4" />}
      </button>
    )
  }
)
SplitLayoutToggle.displayName = 'SplitLayoutToggle'

const SplitLayoutSidebar = React.forwardRef<HTMLDivElement, SplitLayoutSidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { collapsed, sidebarWidth, collapsedWidth } = useSplitLayout()

    return (
      <div
        ref={ref}
        className={cn('flex flex-col border-border transition-all duration-300', className)}
        style={{
          width: collapsed ? collapsedWidth : sidebarWidth,
          minWidth: collapsed ? collapsedWidth : sidebarWidth,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SplitLayoutSidebar.displayName = 'SplitLayoutSidebar'

const SplitLayoutMain = React.forwardRef<HTMLDivElement, SplitLayoutMainProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-1 overflow-hidden', className)} {...props}>
        {children}
      </div>
    )
  }
)
SplitLayoutMain.displayName = 'SplitLayoutMain'

export { SplitLayout, SplitLayoutSidebar, SplitLayoutMain, SplitLayoutToggle, useSplitLayout }

export type {
  SplitLayoutProps,
  SplitLayoutSidebarProps,
  SplitLayoutMainProps,
  SplitLayoutToggleProps,
}
