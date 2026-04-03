# Scene 2 Instance Detail Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-to-canvas instance creation for `DragLayoutScene2Page`, backed by a typed component detail API and instance state transitions (`loading`, `ready`, `error`).

**Architecture:** Extend shared types with component detail and canvas instance contracts, mock the detail API in `msw`, and implement scene-2 page state as two layers: layout coordinates for React Grid Layout and instance records for detail loading status. On drop, the page immediately creates a placeholder instance, then fetches the component detail asynchronously and updates that instance to `ready` or `error`.

**Tech Stack:** React 19, Next.js App Router, TanStack Query, TypeScript, axios via `@repo/api`, msw, react-grid-layout, Tailwind CSS

---

## File Structure

- Modify: `packages/types/src/index.ts`
  Responsibility: Add component detail, action schema, layout item, and canvas instance contracts.
- Modify: `apps/web/src/mocks/handlers/component-palette.ts`
  Responsibility: Add `/api/component-palette/:componentId/detail` mock response using shared types.
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
  Responsibility: Add drag source payloads, canvas layout state, instance state, detail loading, error retry, and status-based cards.

## Task 1: Add shared detail and instance types

**Files:**
- Modify: `packages/types/src/index.ts`
- Test: `pnpm --filter @repo/types type-check`

- [ ] **Step 1: Write the failing page import usage**

Temporarily update `packages/pages/src/drag-layout-scene-2-page.tsx` to import missing types:

```tsx
import type {
  CanvasComponentInstance,
  CanvasInstanceStatus,
  CanvasLayoutItem,
  ComponentDetailData,
} from '@repo/types'
```

Use one of them in local state:

```tsx
const [layoutItems, setLayoutItems] = useState<CanvasLayoutItem[]>([])
```

- [ ] **Step 2: Run page typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL with missing export errors for the newly referenced types.

- [ ] **Step 3: Add the minimal shared contracts**

Extend `packages/types/src/index.ts`:

```ts
export interface CanvasLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  componentId: string
  componentType: string
  minW?: number
  minH?: number
}

export type CanvasInstanceStatus = 'loading' | 'ready' | 'error'

export interface CanvasComponentInstance {
  id: string
  componentId: string
  componentType: string
  name: string
  configVersion: string
  status: CanvasInstanceStatus
  renderSchema?: ComponentRenderSchema
  dataSchema?: ComponentDataSchema
  actionSchema?: ComponentActionSchema
  errorMessage?: string
}

export interface ComponentDetailMeta {
  id: string
  type: string
  name: string
  category: string
  configVersion: string
  renderer: string
}

export interface ComponentRenderSchema {
  kind: 'table' | 'form' | 'composite'
  props: Record<string, unknown>
  slots?: Record<string, unknown>
  events?: Record<string, unknown>
}

export interface ComponentDataSource {
  url: string
  method: 'GET' | 'POST'
  query?: Record<string, unknown>
  body?: Record<string, unknown>
  headers?: Record<string, string>
  dataPath?: string
}

export interface ComponentDataSchema {
  mode: 'static' | 'remote'
  source?: ComponentDataSource
  mockData?: unknown
}

export interface ComponentActionDefinition {
  id: string
  type: string
  label?: string
  target?: string
  payload?: Record<string, unknown>
  api?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  }
}

export interface ComponentActionSchema {
  actions: ComponentActionDefinition[]
}

export interface ComponentDetailData {
  component: ComponentDetailMeta
  renderSchema: ComponentRenderSchema
  dataSchema: ComponentDataSchema
  actionSchema?: ComponentActionSchema
}
```

- [ ] **Step 4: Run typecheck to verify the shared contracts compile**

Run: `pnpm --filter @repo/types type-check`

Expected: PASS

- [ ] **Step 5: Commit the type contracts**

```bash
git add packages/types/src/index.ts
git commit -m "feat(types): add scene 2 detail flow contracts"
```

## Task 2: Add the typed detail API mock

**Files:**
- Modify: `apps/web/src/mocks/handlers/component-palette.ts`
- Test: `pnpm --filter @repo/web type-check`

- [ ] **Step 1: Write the failing handler import usage**

In the handler file, reference the missing detail response type:

```ts
import type { ComponentDetailData } from '@repo/types'
```

Add a typed constant placeholder:

```ts
const componentDetailResponses: Record<string, ApiResponse<ComponentDetailData>> = {}
```

- [ ] **Step 2: Run typecheck to verify it fails if the shared types are not yet in place**

Run: `pnpm --filter @repo/web type-check`

Expected: If Task 1 is complete, this will pass through and you can continue immediately. If Task 1 is incomplete, it should fail for missing detail types.

- [ ] **Step 3: Implement the detail mock response**

Update `apps/web/src/mocks/handlers/component-palette.ts`:

```ts
const componentDetailResponses: Record<string, ApiResponse<ComponentDetailData>> = {
  'table-with-edit-actions': {
    code: 0,
    message: 'ok',
    data: {
      component: {
        id: 'table-with-edit-actions',
        type: 'table',
        name: '带编辑操作的表格',
        category: 'data',
        configVersion: '1.0.0',
        renderer: 'crud-table',
      },
      renderSchema: {
        kind: 'composite',
        props: {
          table: {
            columns: [
              { id: 'name', header: '姓名', accessor: 'name' },
              { id: 'email', header: '邮箱', accessor: 'email' },
              { id: 'status', header: '状态', accessor: 'status' },
            ],
            actions: {
              id: 'actions',
              header: '操作',
              buttons: [{ id: 'edit', label: '编辑', variant: 'ghost' }],
            },
          },
          modalForm: {
            fields: [
              { name: 'name', type: 'text', label: '姓名' },
              { name: 'email', type: 'email', label: '邮箱' },
            ],
          },
          modal: {
            title: '编辑用户',
            confirmText: '保存',
            cancelText: '取消',
          },
        },
      },
      dataSchema: {
        mode: 'remote',
        source: {
          url: '/api/users',
          method: 'GET',
          dataPath: 'data.list',
        },
      },
      actionSchema: {
        actions: [
          { id: 'edit', type: 'open-modal', target: 'modalForm' },
          {
            id: 'submit',
            type: 'submit-form',
            target: 'modalForm',
            api: {
              url: '/api/users/update',
              method: 'POST',
            },
          },
        ],
      },
    },
  },
}
```

Add the new route:

```ts
http.get('/api/component-palette/:componentId/detail', ({ params }) => {
  const componentId = String(params.componentId)
  const response = componentDetailResponses[componentId]

  if (!response) {
    return HttpResponse.json(
      {
        code: 40401,
        message: '组件详情不存在',
        data: {
          component: {
            id: componentId,
            type: 'unknown',
            name: '未知组件',
            category: 'unknown',
            configVersion: '0.0.0',
            renderer: 'unknown',
          },
          renderSchema: { kind: 'table', props: {} },
          dataSchema: { mode: 'static', mockData: [] },
        },
      },
      { status: 404 }
    )
  }

  return HttpResponse.json(response)
})
```

- [ ] **Step 4: Run typecheck to verify the mock handler builds**

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 5: Commit the detail mock**

```bash
git add apps/web/src/mocks/handlers/component-palette.ts
git commit -m "feat(web): mock component detail api"
```

## Task 3: Implement drag-to-canvas instance creation and detail loading

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

- [ ] **Step 1: Write the failing state shape for layout and instances**

Replace the current page-only palette consumption with new scene state:

```tsx
const [layoutItems, setLayoutItems] = useState<CanvasLayoutItem[]>([])
const [instances, setInstances] = useState<Record<string, CanvasComponentInstance>>({})
```

Add a missing helper call:

```tsx
await loadComponentDetail(item.id, instanceId)
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL for missing helper implementation or unused/incorrect state until the full drag flow is wired.

- [ ] **Step 3: Implement drag source payloads in the left palette**

In each palette item card, add drag behavior:

```tsx
draggable
onDragStart={(event) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData(
    'application/json',
    JSON.stringify({
      componentId: item.id,
      componentType: item.type,
      name: item.name,
      configVersion: item.configVersion,
      defaultSize: item.defaultSize,
      minSize: item.minSize,
    })
  )
}}
```

- [ ] **Step 4: Implement the detail loader helper**

Add to the page:

```tsx
const loadComponentDetail = useCallback(async (componentId: string, instanceId: string) => {
  try {
    const response = await apiGet<ComponentDetailData>(`/component-palette/${componentId}/detail`)

    setInstances((prev) => {
      const current = prev[instanceId]
      if (!current) return prev

      return {
        ...prev,
        [instanceId]: {
          ...current,
          status: 'ready',
          renderSchema: response.data.renderSchema,
          dataSchema: response.data.dataSchema,
          actionSchema: response.data.actionSchema,
          errorMessage: undefined,
        },
      }
    })
  } catch {
    setInstances((prev) => {
      const current = prev[instanceId]
      if (!current) return prev

      return {
        ...prev,
        [instanceId]: {
          ...current,
          status: 'error',
          errorMessage: '组件详情加载失败，请重试',
        },
      }
    })
  }
}, [])
```

- [ ] **Step 5: Implement the canvas with external drop**

Use `ReactGridLayout` directly in the main area, following the existing drag-layout canvas pattern:

```tsx
const { width, containerRef, mounted } = useContainerWidth()
```

Add drop handler:

```tsx
const handleDrop = useCallback(
  (_currentLayout: Layout, item: Layout[number] | undefined, event: Event) => {
    const dragEvent = event as DragEvent
    const rawPayload = dragEvent.dataTransfer?.getData('application/json')
    if (!rawPayload || !item) return

    const payload = JSON.parse(rawPayload) as {
      componentId: string
      componentType: string
      name: string
      configVersion: string
      defaultSize: { w: number; h: number }
      minSize?: { w: number; h: number }
    }

    const instanceId = `instance-${Date.now()}`

    setLayoutItems((prev) => [
      ...prev,
      {
        i: instanceId,
        x: item.x,
        y: item.y,
        w: item.w ?? payload.defaultSize.w,
        h: item.h ?? payload.defaultSize.h,
        componentId: payload.componentId,
        componentType: payload.componentType,
        minW: payload.minSize?.w,
        minH: payload.minSize?.h,
      },
    ])

    setInstances((prev) => ({
      ...prev,
      [instanceId]: {
        id: instanceId,
        componentId: payload.componentId,
        componentType: payload.componentType,
        name: payload.name,
        configVersion: payload.configVersion,
        status: 'loading',
      },
    }))

    void loadComponentDetail(payload.componentId, instanceId)
  },
  [loadComponentDetail]
)
```

Add layout change handler that preserves `componentId` and `componentType` from previous layout entries.

- [ ] **Step 6: Render status-based instance cards**

Inside each grid item:

```tsx
const instance = instances[item.i]
```

Render:

```tsx
{instance.status === 'loading' ? (
  <div className="text-sm text-muted-foreground">加载组件配置中...</div>
) : null}

{instance.status === 'error' ? (
  <div className="space-y-3">
    <p className="text-sm text-destructive">{instance.errorMessage}</p>
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setInstances((prev) => ({
          ...prev,
          [instance.id]: {
            ...prev[instance.id],
            status: 'loading',
            errorMessage: undefined,
          },
        }))
        void loadComponentDetail(instance.componentId, instance.id)
      }}
    >
      重试
    </Button>
  </div>
) : null}

{instance.status === 'ready' ? (
  <div className="space-y-2 text-sm">
    <div>渲染协议：{instance.renderSchema?.kind}</div>
    <div>配置版本：{instance.configVersion}</div>
    <div>
      动作数：
      {instance.actionSchema?.actions.length ?? 0}
    </div>
  </div>
) : null}
```

- [ ] **Step 7: Run typecheck to verify the page compiles**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

- [ ] **Step 8: Commit the scene-2 drag flow**

```bash
git add packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat(pages): add scene 2 drag instance flow"
```

## Task 4: Verify the complete flow

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
pnpm exec biome check packages/types/src/index.ts apps/web/src/mocks/handlers/component-palette.ts packages/pages/src/drag-layout-scene-2-page.tsx
```

Expected: PASS

- [ ] **Step 3: Run production build**

Run: `pnpm --filter @repo/web build`

Expected: PASS

- [ ] **Step 4: Manual verification**

Run: `pnpm --filter @repo/web dev`

Manual checks:

- Open `/drag-layout-scene-2`
- Drag “带编辑操作的表格” into the canvas
- Confirm a card appears immediately
- Confirm the card first shows loading text
- Confirm the card then shows ready-state summary
- Temporarily change the detail URL or mock response key to verify error state
- Confirm error cards can retry successfully

- [ ] **Step 5: Commit the verified final state**

```bash
git add packages/types/src/index.ts apps/web/src/mocks/handlers/component-palette.ts packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat: add scene 2 instance detail flow"
```

## Self-Review

- Spec coverage: the plan covers drag-drop creation, two-layer scene state, typed detail API, `msw` detail mocking, loading/error/ready transitions, and retry behavior. It intentionally excludes persistence, right-panel editing, and real renderer execution.
- Placeholder scan: all tasks include exact file paths, concrete commands, and implementation snippets.
- Type consistency: the plan consistently uses `CanvasLayoutItem`, `CanvasComponentInstance`, `ComponentDetailData`, `renderSchema`, `dataSchema`, and `actionSchema`.
