# Component Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a backend-shaped left component palette flow for `DragLayoutScene2Page` using shared API types, `@repo/api` requests, and `msw` mocks enabled only in `apps/web` development.

**Architecture:** Extend `@repo/types` with palette list types that sit alongside the existing `ApiResponse<T>`, then have `DragLayoutScene2Page` fetch `/component-palette` through `@repo/api`. In `apps/web`, add a development-only `msw` bootstrap that starts in the browser and serves the same typed response shape as the future real API.

**Tech Stack:** React 19, Next.js App Router, TypeScript, axios via `@repo/api`, `msw`, Tailwind CSS

---

## File Structure

- Modify: `packages/types/src/index.ts`
  Responsibility: Define shared component palette data contracts used by both `msw` and real API clients.
- Modify: `apps/web/package.json`
  Responsibility: Add `msw` as a web-only dependency.
- Create: `apps/web/public/mockServiceWorker.js`
  Responsibility: Generated `msw` service worker asset for browser interception.
- Create: `apps/web/src/mocks/browser.ts`
  Responsibility: Export `setupWorker(...)` for browser-side startup.
- Create: `apps/web/src/mocks/handlers/component-palette.ts`
  Responsibility: Mock `/api/component-palette` with typed data.
- Create: `apps/web/src/mocks/handlers/index.ts`
  Responsibility: Aggregate all `msw` handlers.
- Create: `apps/web/src/components/mock-provider.tsx`
  Responsibility: Start `msw` in development on the client and gate rendering until ready.
- Modify: `apps/web/src/app/layout.tsx`
  Responsibility: Wrap app content in the mock provider.
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
  Responsibility: Request the component palette and render loading, error, and success states in the left sidebar.

## Task 1: Add shared component palette types

**Files:**
- Modify: `packages/types/src/index.ts`
- Test: `pnpm --filter @repo/types type-check`

- [ ] **Step 1: Write the failing type usage in the page before adding the types**

Temporarily update the page import to reference the missing types:

```tsx
import type { ComponentPaletteItem, ComponentPaletteListData } from '@repo/types'
```

Use `ComponentPaletteItem[]` in local state:

```tsx
const [paletteItems, setPaletteItems] = useState<ComponentPaletteItem[]>([])
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL with missing export errors for `ComponentPaletteItem` and `ComponentPaletteListData`.

- [ ] **Step 3: Add the minimal shared types**

Update `packages/types/src/index.ts`:

```ts
export interface LayoutSize {
  w: number
  h: number
}

export interface ComponentPaletteItem {
  id: string
  type: string
  name: string
  description: string
  category: string
  tags: string[]
  icon: string
  thumbnail?: string
  defaultSize: LayoutSize
  minSize: LayoutSize
  configVersion: string
  hasDetail: boolean
}

export interface ComponentPaletteListData {
  list: ComponentPaletteItem[]
}
```

- [ ] **Step 4: Run typecheck to verify the types compile**

Run: `pnpm --filter @repo/types type-check`

Expected: PASS

- [ ] **Step 5: Commit the shared types**

```bash
git add packages/types/src/index.ts
git commit -m "feat(types): add component palette contracts"
```

## Task 2: Add `msw` infrastructure in `apps/web`

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/mocks/browser.ts`
- Create: `apps/web/src/mocks/handlers/component-palette.ts`
- Create: `apps/web/src/mocks/handlers/index.ts`
- Create: `apps/web/src/components/mock-provider.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/public/mockServiceWorker.js`
- Test: `pnpm --filter @repo/web type-check`

- [ ] **Step 1: Add the failing imports for mock startup**

Update the root layout to import a not-yet-created provider:

```tsx
import { MockProvider } from '@/components/mock-provider'
```

Wrap the body content:

```tsx
<body className={inter.className}>
  <MockProvider>{children}</MockProvider>
</body>
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `pnpm --filter @repo/web type-check`

Expected: FAIL with module resolution error for `@/components/mock-provider`.

- [ ] **Step 3: Install `msw` in the web app**

Run:

```bash
pnpm --filter @repo/web add msw
pnpm --filter @repo/web exec msw init public --save
```

Expected:

- `apps/web/package.json` includes `msw`
- `apps/web/public/mockServiceWorker.js` is generated

- [ ] **Step 4: Create the typed handler and worker setup**

Create `apps/web/src/mocks/handlers/component-palette.ts`:

```ts
import type { ApiResponse, ComponentPaletteListData } from '@repo/types'
import { http, HttpResponse } from 'msw'

const componentPaletteResponse: ApiResponse<ComponentPaletteListData> = {
  code: 0,
  message: 'ok',
  data: {
    list: [
      {
        id: 'table-with-edit-actions',
        type: 'table',
        name: '带编辑操作的表格',
        description: '支持操作栏编辑按钮的表格组件',
        category: 'data',
        tags: ['table', 'actions', 'edit'],
        icon: 'table',
        defaultSize: { w: 6, h: 5 },
        minSize: { w: 5, h: 4 },
        configVersion: '1.0.0',
        hasDetail: true,
      },
    ],
  },
}

export const componentPaletteHandlers = [
  http.get('/api/component-palette', () => {
    return HttpResponse.json(componentPaletteResponse)
  }),
]
```

Create `apps/web/src/mocks/handlers/index.ts`:

```ts
import { componentPaletteHandlers } from './component-palette'

export const handlers = [...componentPaletteHandlers]
```

Create `apps/web/src/mocks/browser.ts`:

```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 5: Create the development-only provider**

Create `apps/web/src/components/mock-provider.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

interface MockProviderProps {
  children: React.ReactNode
}

export function MockProvider({ children }: MockProviderProps) {
  const [isReady, setIsReady] = useState(process.env.NODE_ENV !== 'development')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    let isMounted = true

    async function startWorker() {
      const { worker } = await import('@/mocks/browser')
      await worker.start({
        onUnhandledRequest: 'bypass',
      })

      if (isMounted) {
        setIsReady(true)
      }
    }

    startWorker().catch(() => {
      if (isMounted) {
        setIsReady(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (!isReady) {
    return null
  }

  return <>{children}</>
}
```

- [ ] **Step 6: Run typecheck to verify the mock layer builds**

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 7: Commit the mock infrastructure**

```bash
git add apps/web/package.json apps/web/public/mockServiceWorker.js apps/web/src/mocks/browser.ts apps/web/src/mocks/handlers/component-palette.ts apps/web/src/mocks/handlers/index.ts apps/web/src/components/mock-provider.tsx apps/web/src/app/layout.tsx
git commit -m "feat(web): add msw mock infrastructure"
```

## Task 3: Fetch and render the left component palette

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

- [ ] **Step 1: Write the failing fetch-driven page code**

Update the page to request the palette through `@repo/api`:

```tsx
import { apiGet } from '@repo/api'
import type { ComponentPaletteItem, ComponentPaletteListData } from '@repo/types'
import { useEffect, useState } from 'react'
```

Add state:

```tsx
const [paletteItems, setPaletteItems] = useState<ComponentPaletteItem[]>([])
const [isLoadingPalette, setIsLoadingPalette] = useState(true)
const [paletteError, setPaletteError] = useState<string | null>(null)
```

Add request function:

```tsx
async function loadPalette() {
  setIsLoadingPalette(true)
  setPaletteError(null)

  try {
    const response = await apiGet<ComponentPaletteListData>('/component-palette')
    setPaletteItems(response.data.list)
  } catch {
    setPaletteError('组件列表加载失败，请重试')
  } finally {
    setIsLoadingPalette(false)
  }
}
```

Run it in `useEffect`.

Replace the left panel static items with three states:

```tsx
{isLoadingPalette ? <div>加载组件列表中...</div> : null}
{paletteError ? (
  <div className="space-y-3 rounded-xl border border-border bg-background p-3">
    <p className="text-sm text-destructive">{paletteError}</p>
    <Button variant="outline" size="sm" onClick={() => void loadPalette()}>
      重试
    </Button>
  </div>
) : null}
{!isLoadingPalette && !paletteError ? (
  <div className="space-y-2">
    {paletteItems.map((item) => (
      <div key={item.id} className="rounded-lg border border-dashed border-border p-3">
        <div className="text-sm font-medium">{item.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          默认尺寸 {item.defaultSize.w} x {item.defaultSize.h}
        </div>
      </div>
    ))}
  </div>
) : null}
```

- [ ] **Step 2: Run page typecheck to verify it fails for missing dependency or import issues**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: if `@repo/api` is not yet listed in `packages/pages/package.json`, FAIL with import resolution error. If it already resolves, proceed immediately to Step 3 and treat this step as a pass-through verification.

- [ ] **Step 3: Add the minimal dependency wiring if needed**

If `packages/pages/package.json` does not yet list `@repo/api`, add:

```json
"@repo/api": "workspace:*"
```

Then keep the page implementation minimal:

- one request on mount
- one retry button
- one mock item card layout

- [ ] **Step 4: Run typecheck to verify the page compiles**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

- [ ] **Step 5: Commit the left palette page logic**

```bash
git add packages/pages/package.json packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat(pages): load component palette in scene 2"
```

## Task 4: Verify request flow end-to-end

**Files:**
- Verify only: files from Tasks 1-3

- [ ] **Step 1: Run targeted typechecks**

Run: `pnpm --filter @repo/types type-check`

Expected: PASS

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 2: Run Biome on touched files**

Run:

```bash
pnpm exec biome check packages/types/src/index.ts packages/pages/src/drag-layout-scene-2-page.tsx apps/web/src/app/layout.tsx apps/web/src/components/mock-provider.tsx apps/web/src/mocks/browser.ts apps/web/src/mocks/handlers/component-palette.ts apps/web/src/mocks/handlers/index.ts
```

Expected: PASS

- [ ] **Step 3: Run a production build to verify the mock bootstrap does not break production**

Run: `pnpm --filter @repo/web build`

Expected: PASS

- [ ] **Step 4: Run the development server for manual verification**

Run: `pnpm --filter @repo/web dev`

Manual checks:

- Open `/drag-layout-scene-2`
- Confirm the left sidebar initially shows a loading state
- Confirm the loading state is replaced by the mock component card
- Confirm the mock card shows “带编辑操作的表格”
- Stop `msw` handler or change the request URL temporarily to verify the error state and retry button if needed

- [ ] **Step 5: Commit the verified final state**

```bash
git add packages/types/src/index.ts apps/web/package.json apps/web/public/mockServiceWorker.js apps/web/src/app/layout.tsx apps/web/src/components/mock-provider.tsx apps/web/src/mocks/browser.ts apps/web/src/mocks/handlers/component-palette.ts apps/web/src/mocks/handlers/index.ts packages/pages/package.json packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat: add typed component palette mock flow"
```

## Self-Review

- Spec coverage: the plan covers shared API typing, web-only `msw`, typed mock response shape, left sidebar request flow, and loading/error/success rendering. It intentionally excludes detail APIs and drag/drop instance creation, matching the approved scope.
- Placeholder scan: all steps include exact files, commands, and concrete code shapes. The only conditional step is dependency wiring in `packages/pages/package.json`, which is necessary because that dependency may already exist by execution time.
- Type consistency: all tasks use `ApiResponse<ComponentPaletteListData>`, `ComponentPaletteItem`, `LayoutSize`, and the `/component-palette` request path consistently.
