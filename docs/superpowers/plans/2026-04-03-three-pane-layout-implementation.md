# Three Pane Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable three-pane layout component with asymmetric left/right collapse behavior and use it to scaffold drag-layout scene 2.

**Architecture:** Add a new `ThreePaneLayout` custom UI component in `packages/ui` with internal context for left/right collapsed state, composition-based slot subcomponents, and a right-edge reopen button rendered from the main area when the right panel is hidden. Then add a new shared page in `packages/pages` and expose it through a new Next.js route that demonstrates the layout using placeholder content only.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react, Next.js App Router, pnpm workspace exports

---

## File Structure

- Create: `packages/ui/src/components/custom/three-pane-layout/index.tsx`
  Responsibility: Reusable three-pane layout container, context, slot subcomponents, and toggle controls.
- Create: `packages/pages/src/drag-layout-scene-2-page.tsx`
  Responsibility: Scene 2 demo page using placeholder left menu, center canvas, and right config content.
- Modify: `packages/pages/src/index.ts`
  Responsibility: Export the new shared page.
- Create: `apps/web/src/app/(app)/drag-layout-scene-2/page.tsx`
  Responsibility: Route entrypoint that re-exports the shared page.
- Modify: `apps/web/src/app/(app)/page.tsx`
  Responsibility: Add a home-page link to the new scene.

## Task 1: Add the failing UI export/import test via typecheck and route usage

**Files:**
- Create: `packages/ui/src/components/custom/three-pane-layout/index.tsx`
- Create: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Modify: `packages/pages/src/index.ts`
- Create: `apps/web/src/app/(app)/drag-layout-scene-2/page.tsx`

- [ ] **Step 1: Write the failing implementation-facing usage code**

Create the new route and shared page with imports that intentionally reference the not-yet-implemented layout component:

```tsx
// apps/web/src/app/(app)/drag-layout-scene-2/page.tsx
'use client'

export { DragLayoutScene2Page as default } from '@repo/pages'
```

```tsx
// packages/pages/src/index.ts
export { DragLayoutScene2Page } from './drag-layout-scene-2-page'
```

```tsx
// packages/pages/src/drag-layout-scene-2-page.tsx
'use client'

import {
  ThreePaneLayout,
  ThreePaneLayoutLeftSidebar,
  ThreePaneLayoutMain,
  ThreePaneLayoutRightSidebar,
} from '@repo/ui/custom/three-pane-layout'

export function DragLayoutScene2Page() {
  return (
    <div className="h-screen bg-background p-4">
      <ThreePaneLayout>
        <ThreePaneLayoutLeftSidebar>left</ThreePaneLayoutLeftSidebar>
        <ThreePaneLayoutMain>main</ThreePaneLayoutMain>
        <ThreePaneLayoutRightSidebar>right</ThreePaneLayoutRightSidebar>
      </ThreePaneLayout>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit`

Expected: FAIL with module resolution or missing export errors for `@repo/ui/custom/three-pane-layout`.

- [ ] **Step 3: Commit the red state only if the team explicitly allows broken intermediate commits**

Do not commit by default. If broken intermediate commits are not acceptable, continue directly to Task 2.

## Task 2: Implement the minimal `ThreePaneLayout` component to satisfy imports and composition

**Files:**
- Create: `packages/ui/src/components/custom/three-pane-layout/index.tsx`
- Test via: `pnpm --filter @repo/ui exec tsc --noEmit`

- [ ] **Step 1: Write the minimal component implementation**

Create the layout component with internal context and named exports:

```tsx
'use client'

import { cn } from '@repo/utils'
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react'
import * as React from 'react'

interface ThreePaneLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
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

interface ThreePaneLayoutContextValue {
  leftCollapsed: boolean
  rightCollapsed: boolean
  setLeftCollapsed: (collapsed: boolean) => void
  setRightCollapsed: (collapsed: boolean) => void
  leftWidth: string
  leftCollapsedWidth: string
  rightWidth: string
}

const ThreePaneLayoutContext = React.createContext<ThreePaneLayoutContextValue | null>(null)

function useThreePaneLayoutContext() {
  const context = React.useContext(ThreePaneLayoutContext)
  if (!context) {
    throw new Error('ThreePaneLayout components must be used within ThreePaneLayout')
  }
  return context
}

function useControllableState(
  controlledValue: boolean | undefined,
  defaultValue: boolean,
  onChange?: (value: boolean) => void
) {
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
      children,
      defaultLeftCollapsed = false,
      defaultRightCollapsed = false,
      leftCollapsed: controlledLeftCollapsed,
      rightCollapsed: controlledRightCollapsed,
      onLeftCollapsedChange,
      onRightCollapsedChange,
      leftWidth = '280px',
      leftCollapsedWidth = '64px',
      rightWidth = '320px',
      ...props
    },
    ref
  ) => {
    const [leftCollapsed, setLeftCollapsed] = useControllableState(
      controlledLeftCollapsed,
      defaultLeftCollapsed,
      onLeftCollapsedChange
    )
    const [rightCollapsed, setRightCollapsed] = useControllableState(
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
        <div
          ref={ref}
          className={cn('flex h-full w-full overflow-hidden', className)}
          {...props}
        >
          {children}
        </div>
      </ThreePaneLayoutContext.Provider>
    )
  }
)

const ThreePaneLayoutLeftSidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { leftCollapsed, leftWidth, leftCollapsedWidth } = useThreePaneLayoutContext()

    return (
      <aside
        ref={ref}
        className={cn('flex h-full flex-col border-r transition-all duration-300', className)}
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

const ThreePaneLayoutMain = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { rightCollapsed, setRightCollapsed } = useThreePaneLayoutContext()

    return (
      <main ref={ref} className={cn('relative flex flex-1 overflow-hidden', className)} {...props}>
        {children}
        {rightCollapsed ? (
          <button
            type="button"
            aria-label="展开右侧边栏"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-l-md rounded-r-none border bg-background shadow-sm"
            onClick={() => setRightCollapsed(false)}
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        ) : null}
      </main>
    )
  }
)

const ThreePaneLayoutRightSidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { rightCollapsed, rightWidth } = useThreePaneLayoutContext()

  if (rightCollapsed) {
    return null
  }

  return (
    <aside
      ref={ref}
      className={cn('flex h-full flex-col border-l transition-all duration-300', className)}
      style={{ width: rightWidth, minWidth: rightWidth }}
      {...props}
    >
      {children}
    </aside>
  )
})

function ThreePaneLayoutLeftToggle(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { leftCollapsed, setLeftCollapsed } = useThreePaneLayoutContext()

  return (
    <button
      type="button"
      aria-label={leftCollapsed ? '展开左侧边栏' : '折叠左侧边栏'}
      onClick={() => setLeftCollapsed(!leftCollapsed)}
      {...props}
    >
      {leftCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </button>
  )
}

function ThreePaneLayoutRightToggle(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { rightCollapsed, setRightCollapsed } = useThreePaneLayoutContext()

  return (
    <button
      type="button"
      aria-label={rightCollapsed ? '展开右侧边栏' : '折叠右侧边栏'}
      onClick={() => setRightCollapsed(!rightCollapsed)}
      {...props}
    >
      {rightCollapsed ? (
        <PanelRightOpen className="h-4 w-4" />
      ) : (
        <PanelRightClose className="h-4 w-4" />
      )}
    </button>
  )
}

export const ThreePaneLayout = Object.assign(ThreePaneLayoutRoot, {
  LeftSidebar: ThreePaneLayoutLeftSidebar,
  Main: ThreePaneLayoutMain,
  RightSidebar: ThreePaneLayoutRightSidebar,
  LeftToggle: ThreePaneLayoutLeftToggle,
  RightToggle: ThreePaneLayoutRightToggle,
})

export {
  ThreePaneLayoutLeftSidebar,
  ThreePaneLayoutMain,
  ThreePaneLayoutRightSidebar,
  ThreePaneLayoutLeftToggle,
  ThreePaneLayoutRightToggle,
}
```

- [ ] **Step 2: Run typecheck to verify the component builds**

Run: `pnpm --filter @repo/ui exec tsc --noEmit`

Expected: PASS

- [ ] **Step 3: Commit the component foundation**

```bash
git add packages/ui/src/components/custom/three-pane-layout/index.tsx
git commit -m "feat(ui): add three pane layout component"
```

## Task 3: Replace the placeholder scene with the real layout shell

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test via: `pnpm --filter @repo/pages exec tsc --noEmit`

- [ ] **Step 1: Write the page implementation using slot content only**

Replace the placeholder page with a structured shell:

```tsx
'use client'

import { Button } from '@repo/ui/shadcn/button'
import { ThreePaneLayout } from '@repo/ui/custom/three-pane-layout'
import { Layers3, LayoutPanelLeft, PanelRight, SquareDashedMousePointer } from 'lucide-react'

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export function DragLayoutScene2Page() {
  return (
    <div className="h-screen bg-muted/30 p-4">
      <ThreePaneLayout className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <ThreePaneLayout.LeftSidebar className="bg-card">
          <div className="flex items-center justify-between border-b p-3">
            <SectionTitle title="组件菜单" subtitle="左侧菜单栏" />
            <ThreePaneLayout.LeftToggle className="flex h-8 w-8 items-center justify-center rounded-md border" />
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border bg-background p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Layers3 className="h-4 w-4" />
                基础组件
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-dashed p-3 text-sm">表格组件</div>
                <div className="rounded-lg border border-dashed p-3 text-sm">统计卡片</div>
                <div className="rounded-lg border border-dashed p-3 text-sm">表单组件</div>
              </div>
            </div>
          </div>
        </ThreePaneLayout.LeftSidebar>

        <ThreePaneLayout.Main className="bg-background">
          <div className="flex h-full flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <SectionTitle title="拖拽布局场景 2" subtitle="中间区域作为完整画布区域" />
              <Button variant="outline" size="sm">
                预览布局
              </Button>
            </div>
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed bg-muted/40">
                <div className="flex flex-col items-center gap-3 text-center">
                  <SquareDashedMousePointer className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <div className="text-base font-medium">画布区域</div>
                    <div className="text-sm text-muted-foreground">
                      下一步在这里接入拖拽布局能力
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ThreePaneLayout.Main>

        <ThreePaneLayout.RightSidebar className="bg-card">
          <div className="flex items-center justify-between border-b p-3">
            <SectionTitle title="属性面板" subtitle="右侧固定侧边栏" />
            <ThreePaneLayout.RightToggle className="flex h-8 w-8 items-center justify-center rounded-md border" />
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border bg-background p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LayoutPanelLeft className="h-4 w-4" />
                画布信息
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>当前第一阶段只完成布局壳子。</p>
                <p>右栏折叠后将完全隐藏，并在主区域右侧显示展开按钮。</p>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <PanelRight className="h-4 w-4" />
                配置占位
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded-lg border border-dashed" />
                <div className="h-10 rounded-lg border border-dashed" />
                <div className="h-24 rounded-lg border border-dashed" />
              </div>
            </div>
          </div>
        </ThreePaneLayout.RightSidebar>
      </ThreePaneLayout>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck to verify the page builds**

Run: `pnpm --filter @repo/pages exec tsc --noEmit`

Expected: PASS

- [ ] **Step 3: Commit the shared scene page**

```bash
git add packages/pages/src/drag-layout-scene-2-page.tsx packages/pages/src/index.ts
git commit -m "feat(pages): add drag layout scene 2 shell"
```

## Task 4: Wire the web route and entry link

**Files:**
- Create: `apps/web/src/app/(app)/drag-layout-scene-2/page.tsx`
- Modify: `apps/web/src/app/(app)/page.tsx`
- Test via: `pnpm --filter web exec tsc --noEmit`

- [ ] **Step 1: Add the route file**

```tsx
/**
 * 拖拽布局场景 2 页面
 * 展示三栏布局壳子，左侧菜单、中间画布、右侧配置
 */

'use client'

export { DragLayoutScene2Page as default } from '@repo/pages'
```

- [ ] **Step 2: Add the home-page navigation link**

Update the homepage links:

```tsx
<Link
  href="/drag-layout-scene-2"
  className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
>
  拖拽布局场景 2
</Link>
```

If both secondary-styled buttons would clash visually, change the existing table-form link to `bg-accent` and keep all three links aligned in one row or wrapped row.

- [ ] **Step 3: Run web typecheck**

Run: `pnpm --filter web exec tsc --noEmit`

Expected: PASS

- [ ] **Step 4: Commit the route wiring**

```bash
git add 'apps/web/src/app/(app)/drag-layout-scene-2/page.tsx' 'apps/web/src/app/(app)/page.tsx'
git commit -m "feat(web): expose drag layout scene 2"
```

## Task 5: Verify interactive behavior end-to-end

**Files:**
- Verify only: existing files from Tasks 2-4

- [ ] **Step 1: Run focused workspace typechecks**

Run: `pnpm --filter @repo/ui exec tsc --noEmit`

Expected: PASS

Run: `pnpm --filter @repo/pages exec tsc --noEmit`

Expected: PASS

Run: `pnpm --filter web exec tsc --noEmit`

Expected: PASS

- [ ] **Step 2: Run lint only on touched files if the repo supports it cleanly**

Run: `pnpm exec biome check packages/pages/src/drag-layout-scene-2-page.tsx packages/pages/src/index.ts packages/ui/src/components/custom/three-pane-layout/index.tsx 'apps/web/src/app/(app)/drag-layout-scene-2/page.tsx' 'apps/web/src/app/(app)/page.tsx'`

Expected: PASS

- [ ] **Step 3: Start the web app for manual verification**

Run: `pnpm --filter web dev`

Manual checks:

- Open `http://localhost:3000`
- Confirm the home page shows a link to `/drag-layout-scene-2`
- Open `/drag-layout-scene-2`
- Confirm the left sidebar collapses to a narrow strip and can reopen
- Confirm the right sidebar collapses completely
- Confirm a right-edge reopen button appears inside the main area after the right sidebar is collapsed
- Confirm the center area expands when the right sidebar is hidden

- [ ] **Step 4: Commit the verified final state**

```bash
git add packages/ui/src/components/custom/three-pane-layout/index.tsx packages/pages/src/drag-layout-scene-2-page.tsx packages/pages/src/index.ts 'apps/web/src/app/(app)/drag-layout-scene-2/page.tsx' 'apps/web/src/app/(app)/page.tsx'
git commit -m "feat: add three pane layout scene shell"
```

## Self-Review

- Spec coverage: the plan covers the new `ThreePaneLayout` component, left/right asymmetric collapse behavior, scene 2 shell page, and web route exposure. It intentionally does not add drag/drop or persistence, matching the approved non-goals.
- Placeholder scan: removed generic TODO-style steps; each task names exact files, commands, and expected outcomes.
- Type consistency: all tasks use the same exported names: `ThreePaneLayout`, `DragLayoutScene2Page`, `defaultLeftCollapsed`, `defaultRightCollapsed`, `leftCollapsed`, `rightCollapsed`.
