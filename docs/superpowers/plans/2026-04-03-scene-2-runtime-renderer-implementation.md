# Scene 2 Runtime Renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render real UI components for `ready` instances in `DragLayoutScene2Page`, including a first-version composite renderer for table plus edit modal form.

**Architecture:** Keep the runtime renderer local to `DragLayoutScene2Page` and interpret `renderSchema`, `dataSchema`, and `actionSchema` there. Each ready instance gets a small runtime data layer keyed by instance id for table data, loading state, and editing row state. `table` maps to `DataTable`, `form` maps to `JsonForm`, and `composite` maps to a table with an edit modal form that submits to `actionSchema.submit.api` and refreshes the main data source after success.

**Tech Stack:** React 19, Next.js App Router, TanStack Query, TypeScript, axios via `@repo/api`, `@repo/ui` DataTable/JsonForm/modal, msw

---

## File Structure

- Modify: `apps/web/src/mocks/handlers/component-palette.ts`
  Responsibility: Add mock remote data endpoints for scene-2 runtime rendering (`/api/users`, `/api/users/update`).
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
  Responsibility: Add runtime renderer branches, remote data loading, and composite edit-submit-refresh behavior.

## Task 1: Extend mock endpoints for runtime data and submit behavior

**Files:**
- Modify: `apps/web/src/mocks/handlers/component-palette.ts`
- Test: `pnpm --filter @repo/web type-check`

- [ ] **Step 1: Write the failing runtime fetch assumption**

In `packages/pages/src/drag-layout-scene-2-page.tsx`, add a placeholder fetch call for the remote data source:

```tsx
await apiGet<Record<string, unknown>>('/users')
```

Run the page without any `/api/users` mock support yet.

- [ ] **Step 2: Run typecheck to verify the page still compiles**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS. This step confirms the missing piece is runtime behavior, not type resolution.

- [ ] **Step 3: Add mock user data and update endpoint**

Update `apps/web/src/mocks/handlers/component-palette.ts`:

```ts
let usersList = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', status: '活跃' },
  { id: '2', name: '李四', email: 'lisi@example.com', status: '离线' },
  { id: '3', name: '王五', email: 'wangwu@example.com', status: '活跃' },
]
```

Add list endpoint:

```ts
http.get('/api/users', () => {
  return HttpResponse.json({
    code: 0,
    message: 'ok',
    data: {
      list: usersList,
    },
  })
})
```

Add update endpoint:

```ts
http.post('/api/users/update', async ({ request }) => {
  const body = (await request.json()) as Record<string, unknown>
  const id = String(body.id ?? '')

  usersList = usersList.map((item) =>
    item.id === id ? { ...item, ...body } : item
  )

  return HttpResponse.json({
    code: 0,
    message: 'ok',
    data: {
      success: true,
    },
  })
})
```

- [ ] **Step 4: Run typecheck to verify mock expansion is valid**

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 5: Commit the runtime mock data endpoints**

```bash
git add apps/web/src/mocks/handlers/component-palette.ts
git commit -m "feat(web): add scene 2 runtime mock endpoints"
```

## Task 2: Add runtime instance state and renderer branches

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

- [ ] **Step 1: Write the failing runtime state shape**

Add instance runtime state maps:

```tsx
const [runtimeData, setRuntimeData] = useState<Record<string, unknown[]>>({})
const [runtimeLoading, setRuntimeLoading] = useState<Record<string, boolean>>({})
```

Reference a missing helper:

```tsx
await loadRuntimeData(instance.id)
```

- [ ] **Step 2: Run page typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL due to missing helper implementation.

- [ ] **Step 3: Add the minimal runtime data loader**

In `packages/pages/src/drag-layout-scene-2-page.tsx`, add:

```tsx
const loadRuntimeData = useCallback(
  async (instanceId: string) => {
    const instance = instances[instanceId]
    const source = instance?.dataSchema?.source

    if (!instance || !source || instance.dataSchema?.mode !== 'remote') {
      return
    }

    setRuntimeLoading((prev) => ({ ...prev, [instanceId]: true }))

    try {
      const response =
        source.method === 'GET'
          ? await apiGet<Record<string, unknown>>(source.url.replace(/^\/api/, ''))
          : await apiPost<Record<string, unknown>>(source.url.replace(/^\/api/, ''), source.body)

      const list =
        source.dataPath === 'data.list'
          ? (((response.data as Record<string, unknown>).list ?? []) as unknown[])
          : []

      setRuntimeData((prev) => ({
        ...prev,
        [instanceId]: list,
      }))
    } finally {
      setRuntimeLoading((prev) => ({ ...prev, [instanceId]: false }))
    }
  },
  [instances]
)
```

Use an effect-like transition after detail load by invoking `loadRuntimeData(instanceId)` inside the detail success path when `response.data.dataSchema.mode === 'remote'`.

- [ ] **Step 4: Implement renderer helpers inside the page**

Add local helpers:

```tsx
function getCompositeTableConfig(instance: CanvasComponentInstance) {
  const props = instance.renderSchema?.props ?? {}
  return (props.table ?? {}) as Record<string, unknown>
}

function getCompositeModalFormConfig(instance: CanvasComponentInstance) {
  const props = instance.renderSchema?.props ?? {}
  return (props.modalForm ?? {}) as Record<string, unknown>
}

function getCompositeModalConfig(instance: CanvasComponentInstance) {
  const props = instance.renderSchema?.props ?? {}
  return (props.modal ?? {}) as Record<string, unknown>
}
```

- [ ] **Step 5: Replace the ready-state summary with renderer branches**

For `table`:

```tsx
<DataTable
  data={(runtimeData[instance.id] ?? []) as RowData[]}
  columns={(instance.renderSchema?.props.columns ?? []) as ColumnConfig[]}
  actions={instance.renderSchema?.props.actions as ActionsConfig | undefined}
  loading={runtimeLoading[instance.id]}
  pagination={{ show: false }}
/>
```

For `form`:

```tsx
<JsonForm
  config={{
    fields: (instance.renderSchema?.props.fields ?? []) as JsonFormConfig['fields'],
  }}
  submit={false}
/>
```

For `composite`, use `DataTable` with mapped edit action (implemented in Task 3).

- [ ] **Step 6: Run page typecheck**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

- [ ] **Step 7: Commit the runtime renderer foundation**

```bash
git add packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat(pages): add scene 2 runtime renderer foundation"
```

## Task 3: Implement the composite edit modal submit-refresh flow

**Files:**
- Modify: `packages/pages/src/drag-layout-scene-2-page.tsx`
- Test: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

- [ ] **Step 1: Write the failing modal action wiring**

Add a missing helper call in the composite action:

```tsx
void openCompositeEdit(instance.id, row)
```

- [ ] **Step 2: Run page typecheck to verify it fails**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: FAIL because `openCompositeEdit` is not implemented yet.

- [ ] **Step 3: Implement the composite edit helper**

Import:

```tsx
import { modal } from '@repo/ui/custom/modal'
import { JsonForm, type JsonFormConfig } from '@repo/ui/custom/json-form'
import { DataTable, type ActionsConfig, type ColumnConfig, type RowData } from '@repo/ui/custom/data-table'
import { apiPost } from '@repo/api'
```

Add helper:

```tsx
const openCompositeEdit = useCallback(
  async (instanceId: string, row: RowData) => {
    const instance = instances[instanceId]
    if (!instance) return

    const modalForm = getCompositeModalFormConfig(instance)
    const modalConfig = getCompositeModalConfig(instance)
    const submitAction = instance.actionSchema?.actions.find((action) => action.id === 'submit')

    let currentFormData: Record<string, unknown> = { ...row }

    await modal.confirm({
      title: (modalConfig.title as string | undefined) ?? '编辑',
      width: ((modalConfig.width as number | undefined) ?? 500) as number,
      confirmText: (modalConfig.confirmText as string | undefined) ?? '保存',
      cancelText: (modalConfig.cancelText as string | undefined) ?? '取消',
      content: (
        <div className="py-4">
          <JsonForm
            config={{
              fields: (modalForm.fields ?? []) as JsonFormConfig['fields'],
              submit: false,
            }}
            defaultValues={row}
            onValuesChange={(values) => {
              currentFormData = { ...row, ...values }
            }}
          />
        </div>
      ),
      onConfirm: async () => {
        if (submitAction?.api) {
          await apiPost(
            submitAction.api.url.replace(/^\/api/, ''),
            currentFormData
          )
        }

        await loadRuntimeData(instanceId)
      },
    })
  },
  [instances, loadRuntimeData]
)
```

- [ ] **Step 4: Map composite table actions to real row callbacks**

In the `composite` renderer branch:

```tsx
const tableConfig = getCompositeTableConfig(instance)
const rawActions = tableConfig.actions as ActionsConfig | undefined

const mappedActions: ActionsConfig | undefined = rawActions
  ? {
      ...rawActions,
      buttons: rawActions.buttons.map((button) => ({
        ...button,
        onClick: (row, _rowIndex) => {
          if (button.id === 'edit') {
            void openCompositeEdit(instance.id, row)
          }
        },
      })),
    }
  : undefined
```

Render:

```tsx
<DataTable
  data={(runtimeData[instance.id] ?? []) as RowData[]}
  columns={(tableConfig.columns ?? []) as ColumnConfig[]}
  actions={mappedActions}
  loading={runtimeLoading[instance.id]}
  pagination={{ show: false }}
/>
```

- [ ] **Step 5: Run page typecheck**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

- [ ] **Step 6: Commit the composite flow**

```bash
git add packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat(pages): support composite crud rendering in scene 2"
```

## Task 4: Verify the runtime renderer flow

**Files:**
- Verify only: files from Tasks 1-3

- [ ] **Step 1: Run targeted typechecks**

Run: `pnpm --filter @repo/pages exec tsc --noEmit -p tsconfig.json`

Expected: PASS

Run: `pnpm --filter @repo/web type-check`

Expected: PASS

- [ ] **Step 2: Run Biome on touched files**

Run:

```bash
pnpm exec biome check apps/web/src/mocks/handlers/component-palette.ts packages/pages/src/drag-layout-scene-2-page.tsx
```

Expected: PASS

- [ ] **Step 3: Run production build**

Run: `pnpm --filter @repo/web build`

Expected: PASS

- [ ] **Step 4: Manual verification**

Run: `pnpm --filter @repo/web dev`

Manual checks:

- Open `/drag-layout-scene-2`
- Drag the mock palette item into the canvas
- Confirm the card becomes `ready` and renders a real table instead of summary text
- Click “编辑”
- Confirm a modal form opens
- Edit a field and submit
- Confirm `/api/users/update` is called
- Confirm the table refreshes and shows the updated row data

- [ ] **Step 5: Commit the verified final state**

```bash
git add apps/web/src/mocks/handlers/component-palette.ts packages/pages/src/drag-layout-scene-2-page.tsx
git commit -m "feat: add scene 2 runtime renderer flow"
```

## Self-Review

- Spec coverage: the plan covers table/form/composite runtime rendering, remote main-data loading, composite edit modal flow, submit API invocation, and post-submit refresh. It intentionally excludes public renderer extraction and non-edit CRUD actions.
- Placeholder scan: all tasks include exact files, concrete commands, and implementation snippets.
- Type consistency: the plan consistently uses `renderSchema`, `dataSchema`, `actionSchema`, `loadRuntimeData`, and `openCompositeEdit`.
