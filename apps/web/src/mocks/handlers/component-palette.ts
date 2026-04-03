import type {
  ApiResponse,
  ComponentDetailData,
  ComponentPaletteListData,
  PaginatedData,
} from '@repo/types'
import { HttpResponse, http } from 'msw'

interface UserItem {
  id: string
  name: string
  email: string
  status: string
}

const USER_STATUSES = ['活跃', '离线', '待审核']

let usersList: UserItem[] = Array.from({ length: 57 }, (_, index) => {
  const id = String(index + 1)
  return {
    id,
    name: `用户${id}`,
    email: `user${id}@example.com`,
    status: USER_STATUSES[index % USER_STATUSES.length] ?? '活跃',
  }
})

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
            pagination: {
              show: true,
              mode: 'server',
              pageSizeOptions: [10, 20, 50],
              defaultPageSize: 10,
              showTotal: true,
              showJumper: true,
            },
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
          pagination: {
            enabled: true,
            pageParam: 'page',
            pageSizeParam: 'pageSize',
            listPath: 'data.list',
            totalPath: 'data.total',
          },
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

export const componentPaletteHandlers = [
  http.get('/api/component-palette', () => {
    return HttpResponse.json(componentPaletteResponse)
  }),
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1
    const currentPageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10
    const startIndex = (currentPage - 1) * currentPageSize
    const list = usersList.slice(startIndex, startIndex + currentPageSize)

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: {
        list,
        total: usersList.length,
        page: currentPage,
        pageSize: currentPageSize,
      } satisfies PaginatedData<UserItem>,
    } satisfies ApiResponse<PaginatedData<UserItem>>)
  }),
  http.post('/api/users/update', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const id = String(body.id ?? '')

    usersList = usersList.map((item) => (item.id === id ? { ...item, ...body } : item))

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: {
        success: true,
      },
    })
  }),
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
            renderSchema: {
              kind: 'table',
              props: {},
            },
            dataSchema: {
              mode: 'static',
              mockData: [],
            },
          },
        } satisfies ApiResponse<ComponentDetailData>,
        { status: 404 }
      )
    }

    return HttpResponse.json(response)
  }),
]
