# TanStack Query Web Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a global TanStack Query foundation to `apps/web` and migrate `DragLayoutScene2Page` left palette loading to `useQuery`.

**Architecture:** Install TanStack Query in `apps/web`, create a client-only `QueryProvider` with a shared `QueryClient`, and mount it at the app root after `MockProvider`. Then replace the scene-2 page's manual `useEffect + useState` fetching with `useQuery`, keeping the existing `@repo/api` request path and `msw` mock behavior unchanged.

**Tech Stack:** React 19, Next.js App Router, TanStack Query, TypeScript, axios via `@repo/api`, msw, Tailwind CSS

---

## File Structure

- Modify: `apps/web/package.json`
  Responsibility: Add `@tanstack/react-query` dependency.
- Create: `apps/web/src/components/query-provider.tsx`
  Responsibility: Instantiate and provide a global `QueryClient` with default query options.
- Modify: `apps/web/src/app/layout.tsx`
  Responsibility: Wrap the app tree with `QueryProvider` under `MockProvider`.
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
  Responsibility: Use `useQuery` for the left component palette instead of manual state/effect management.

## Task 1: Add the global Query provider foundation

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/src/components/query-provider.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Test: `pnpm --filter @repo/web type-check`

- [ ] **Step 1: Write the failing provider import**

Update the root layout to import a provider that does not exist yet:

```tsx
import { QueryProvider } from '@/components/query-provider'
```

Wrap children under `MockProvider`:

```tsx
<MockProvider>
  <QueryProvider>{children}</QueryProvider>
</MockProvider>
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `pnpm --filter @repo/web type-check`

Expected: FAIL with module resolution error for `@/components/query-provider`.

- [ ] **Step 3: Install TanStack Query**

Run:

```bash
pnpm --filter @repo/web add @tanstack/react-query
```

Expected:

- `apps/web/package.json` includes `@tanstack/react-query`

- [ ] **Step 4: Implement the minimal provider**

Create `apps/web/src/components/query-provider.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 30 * 1000,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Update `apps/web/src/app/layout.tsx`:

```tsx
<body className={inter.className}>
  <MockProvider>
    <QueryProvider>{children}</QueryProvider>
  </MockProvider>
</body>
```

- [ ] **Step 5: Run typecheck to verify the provider builds**

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 6: Commit the query foundation**

```bash
git add apps/web/package.json apps/web/src/components/query-provider.tsx apps/web/src/app/layout.tsx
git commit -m "feat(web): add global tanstack query provider"
```

## Task 2: Migrate scene-2 palette loading to `useQuery`

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

- [ ] **Step 1: Write the failing query-driven page imports**

Replace manual React state imports with TanStack Query:

```tsx
import { useQuery } from '@tanstack/react-query'
```

Remove:

```tsx
import { useCallback, useEffect, useState } from 'react'
```

Use:

```tsx
const {
  data,
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: ['component-palette'],
  queryFn: () => apiGet<ComponentPaletteListData>('/component-palette'),
})
```

- [ ] **Step 2: Run page typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL because `packages/pages` does not yet have `@tanstack/react-query` in its dependency graph.

- [ ] **Step 3: Add the missing dependency and implement the minimal query version**

Add to `packages/pages/package.json`:

```json
"@tanstack/react-query": "^5"
```

Then update `packages/pages/src/drag-layout-scene-2-page.tsx`:

```tsx
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['component-palette'],
  queryFn: () => apiGet<ComponentPaletteListData>('/component-palette'),
})

const paletteItems: ComponentPaletteItem[] = data?.data.list ?? []
```

Replace render branches:

```tsx
{isLoading ? (
  <div className="space-y-2">
    <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
      加载组件列表中...
    </div>
  </div>
) : null}

{isError ? (
  <div className="space-y-3 rounded-xl border border-border bg-background p-3">
    <p className="text-sm text-destructive">组件列表加载失败，请重试</p>
    <Button variant="outline" size="sm" onClick={() => void refetch()}>
      重试
    </Button>
  </div>
) : null}

{!isLoading && !isError ? (
  <div className="space-y-2">
    {paletteItems.map((item) => (
      <div key={item.id} className="rounded-lg border border-dashed border-border bg-background p-3">
        <div className="text-sm font-medium text-foreground">{item.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          默认尺寸 {item.defaultSize.w} x {item.defaultSize.h}
        </div>
      </div>
    ))}
  </div>
) : null}
```

- [ ] **Step 4: Run typecheck to verify the migrated page compiles**

Run: `pnpm install`

Expected: workspace dependencies refreshed.

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

- [ ] **Step 5: Commit the page migration**

```bash
git add packages/pages/package.json packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat(pages): use tanstack query for component palette"
```

## Task 3: Verify end-to-end compilation and behavior

**Files:**
- Verify only: files from Tasks 1-2

- [ ] **Step 1: Run targeted typechecks**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 2: Run Biome on touched files**

Run:

```bash
pnpm exec biome check apps/web/package.json apps/web/src/components/query-provider.tsx apps/web/src/app/layout.tsx packages/pages/package.json packages/pages/src/drag-layout-scene-2-page.tsx
```

Expected: PASS

- [ ] **Step 3: Run production build**

Run: `pnpm --filter @repo/web build`

Expected: PASS

- [ ] **Step 4: Manual verification**

Run: `pnpm --filter @repo/web dev`

Manual checks:

- Open `/drag-layout-scene-2`
- Confirm the left palette loads the mock component card
- Confirm refresh does not produce the previous manual-effect duplication pattern
- Confirm retry still works when the palette request is forced to fail

- [ ] **Step 5: Commit the verified final state**

```bash
git add apps/web/package.json apps/web/src/components/query-provider.tsx apps/web/src/app/layout.tsx packages/pages/package.json packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat: add tanstack query foundation for web"
```

## Self-Review

- Spec coverage: the plan covers the global web provider, default query options, scene-2 palette migration, and preserves the existing API/MSW layering. It intentionally excludes query hooks extraction, devtools, details, and mutations.
- Placeholder scan: all steps contain exact file paths, concrete commands, and implementation snippets.
- Type consistency: the plan consistently uses `QueryProvider`, `useQuery`, `queryKey: ['component-palette']`, and `apiGet<ComponentPaletteListData>('/component-palette')`.
