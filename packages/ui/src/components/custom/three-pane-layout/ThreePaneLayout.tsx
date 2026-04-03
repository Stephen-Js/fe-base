'use client'

import { cn } from '@repo/utils'
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react'
import * as React from 'react'

export interface ThreePaneLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultLeftCollapsed?: boolean
  defaultRightCollapsed?: boolean
  leftCollapsed?: boolean
  rightCollapsed?: boolean
  onLeftCollapsedChange?: (collapsed: boolean) => void
  onRightCollapsedChange?: (collapsed: boolean) => void
  leftWidth?: string
  leftCollapsedWidth?: string
  rightWidth?: string
}

export interface ThreePaneLayoutSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ThreePaneLayoutMainProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ThreePaneLayoutToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  expandIcon?: React.ReactNode
  collapseIcon?: React.ReactNode
}

interface ThreePaneLayoutContextValue {
  leftCollapsed: boolean
  rightCollapsed: boolean
  setLeftCollapsed: (value: boolean) => void
  setRightCollapsed: (value: boolean) => void
  leftWidth: string
  leftCollapsedWidth: string
  rightWidth: string
}

const ThreePaneLayoutContext = React.createContext<ThreePaneLayoutContextValue | null>(null)

const useThreePaneLayoutContext = () => {
  const context = React.useContext(ThreePaneLayoutContext)

  if (!context) {
    throw new Error('ThreePaneLayout components must be used within a ThreePaneLayout')
  }

  return context
}

const useControllableCollapsedState = (
  controlledValue: boolean | undefined,
  defaultValue: boolean,
  onChange?: (value: boolean) => void
) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const setValue = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }

      onChange?.(nextValue)
    },
    [isControlled, onChange]
  )

  return [value, setValue] as const
}

const ThreePaneLayoutRoot = React.forwardRef<HTMLDivElement, ThreePaneLayoutProps>(
  (
    {
      className,
      defaultLeftCollapsed = false,
      defaultRightCollapsed = false,
      leftCollapsed: controlledLeftCollapsed,
      rightCollapsed: controlledRightCollapsed,
      onLeftCollapsedChange,
      onRightCollapsedChange,
      leftWidth = '280px',
      leftCollapsedWidth = '64px',
      rightWidth = '320px',
      children,
      ...props
    },
    ref
  ) => {
    const [leftCollapsed, setLeftCollapsed] = useControllableCollapsedState(
      controlledLeftCollapsed,
      defaultLeftCollapsed,
      onLeftCollapsedChange
    )
    const [rightCollapsed, setRightCollapsed] = useControllableCollapsedState(
      controlledRightCollapsed,
      defaultRightCollapsed,
      onRightCollapsedChange
    )

    const contextValue = React.useMemo(
      () => ({
        leftCollapsed,
        rightCollapsed,
        setLeftCollapsed,
        setRightCollapsed,
        leftWidth,
        leftCollapsedWidth,
        rightWidth,
      }),
      [
        leftCollapsed,
        rightCollapsed,
        setLeftCollapsed,
        setRightCollapsed,
        leftWidth,
        leftCollapsedWidth,
        rightWidth,
      ]
    )

    return (
      <ThreePaneLayoutContext.Provider value={contextValue}>
        <div ref={ref} className={cn('flex h-full w-full overflow-hidden', className)} {...props}>
          {children}
        </div>
      </ThreePaneLayoutContext.Provider>
    )
  }
)
ThreePaneLayoutRoot.displayName = 'ThreePaneLayout'

const ThreePaneLayoutLeftSidebar = React.forwardRef<HTMLDivElement, ThreePaneLayoutSidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { leftCollapsed, leftWidth, leftCollapsedWidth } = useThreePaneLayoutContext()

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-full flex-col border-r border-border transition-all duration-300',
          className
        )}
        style={{
          width: leftCollapsed ? leftCollapsedWidth : leftWidth,
          minWidth: leftCollapsed ? leftCollapsedWidth : leftWidth,
        }}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
ThreePaneLayoutLeftSidebar.displayName = 'ThreePaneLayoutLeftSidebar'

const ThreePaneLayoutMain = React.forwardRef<HTMLDivElement, ThreePaneLayoutMainProps>(
  ({ className, children, ...props }, ref) => {
    const { rightCollapsed, setRightCollapsed } = useThreePaneLayoutContext()

    return (
      <main ref={ref} className={cn('relative flex flex-1 overflow-hidden', className)} {...props}>
        {children}
        {rightCollapsed ? (
          <button
            type="button"
            aria-label="展开右侧边栏"
            className={cn(
              'absolute right-0 top-6 z-10 flex h-12 w-9 -translate-y-1/2 items-center justify-center',
              'rounded-l-md border border-r-0 border-border bg-background text-foreground shadow-sm',
              'transition-colors hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => setRightCollapsed(false)}
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        ) : null}
      </main>
    )
  }
)
ThreePaneLayoutMain.displayName = 'ThreePaneLayoutMain'

const ThreePaneLayoutRightSidebar = React.forwardRef<HTMLDivElement, ThreePaneLayoutSidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { rightCollapsed, rightWidth } = useThreePaneLayoutContext()

    if (rightCollapsed) {
      return null
    }

    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-full flex-col border-l border-border transition-all duration-300',
          className
        )}
        style={{ width: rightWidth, minWidth: rightWidth }}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
ThreePaneLayoutRightSidebar.displayName = 'ThreePaneLayoutRightSidebar'

const ThreePaneLayoutLeftToggle = React.forwardRef<HTMLButtonElement, ThreePaneLayoutToggleProps>(
  ({ className, expandIcon, collapseIcon, onClick, ...props }, ref) => {
    const { leftCollapsed, setLeftCollapsed } = useThreePaneLayoutContext()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setLeftCollapsed(!leftCollapsed)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label={leftCollapsed ? '展开左侧边栏' : '折叠左侧边栏'}
        onClick={handleClick}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background',
          'text-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          className
        )}
        {...props}
      >
        {leftCollapsed
          ? expandIcon || <ChevronRight className="h-4 w-4" />
          : collapseIcon || <ChevronLeft className="h-4 w-4" />}
      </button>
    )
  }
)
ThreePaneLayoutLeftToggle.displayName = 'ThreePaneLayoutLeftToggle'

const ThreePaneLayoutRightToggle = React.forwardRef<HTMLButtonElement, ThreePaneLayoutToggleProps>(
  ({ className, expandIcon, collapseIcon, onClick, ...props }, ref) => {
    const { rightCollapsed, setRightCollapsed } = useThreePaneLayoutContext()

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setRightCollapsed(!rightCollapsed)
      onClick?.(event)
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-label={rightCollapsed ? '展开右侧边栏' : '折叠右侧边栏'}
        onClick={handleClick}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background',
          'text-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          className
        )}
        {...props}
      >
        {rightCollapsed
          ? expandIcon || <PanelRightOpen className="h-4 w-4" />
          : collapseIcon || <PanelRightClose className="h-4 w-4" />}
      </button>
    )
  }
)
ThreePaneLayoutRightToggle.displayName = 'ThreePaneLayoutRightToggle'

const ThreePaneLayout = Object.assign(ThreePaneLayoutRoot, {
  LeftSidebar: ThreePaneLayoutLeftSidebar,
  Main: ThreePaneLayoutMain,
  RightSidebar: ThreePaneLayoutRightSidebar,
  LeftToggle: ThreePaneLayoutLeftToggle,
  RightToggle: ThreePaneLayoutRightToggle,
})

export {
  ThreePaneLayout,
  ThreePaneLayoutLeftSidebar,
  ThreePaneLayoutMain,
  ThreePaneLayoutRightSidebar,
  ThreePaneLayoutLeftToggle,
  ThreePaneLayoutRightToggle,
}
