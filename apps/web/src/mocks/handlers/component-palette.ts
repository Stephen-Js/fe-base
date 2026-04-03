import type { ApiResponse, ComponentPaletteListData } from '@repo/types'
import { HttpResponse, http } from 'msw'

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
