import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ChatChunkRenderer } from './renderers'

vi.mock('@tarojs/components', () => ({
  Image: ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) =>
    createElement('img', props, children),
  Text: ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) =>
    createElement('span', props, children),
  View: ({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) =>
    createElement('div', props, children),
}))

describe('ChatChunkRenderer', () => {
  beforeAll(() => {
    vi.stubGlobal('ENABLE_INNER_HTML', false)
  })

  it('renders text chunks', () => {
    const html = renderToStaticMarkup(
      <ChatChunkRenderer chunk={{ id: 'c1', type: 'text', status: 'completed', order: 1, text: '你好' }} />
    )

    expect(html).toContain('你好')
  })

  it('renders image chunks', () => {
    const html = renderToStaticMarkup(
      <ChatChunkRenderer
        chunk={{
          id: 'c2',
          type: 'image',
          status: 'completed',
          order: 1,
          url: 'https://example.com/demo.png',
          alt: '示意图',
        }}
      />
    )

    expect(html).toContain('demo.png')
    expect(html).toContain('示意图')
  })

  it('renders form chunks', () => {
    const html = renderToStaticMarkup(
      <ChatChunkRenderer
        chunk={{
          id: 'c3',
          type: 'form',
          status: 'completed',
          order: 1,
          formId: 'contact-form',
          title: '联系信息',
          submitLabel: '提交',
          fields: [
            {
              name: 'name',
              label: '姓名',
              fieldType: 'text',
              placeholder: '请输入姓名',
            },
          ],
        }}
      />
    )

    expect(html).toContain('联系信息')
    expect(html).toContain('姓名')
    expect(html).toContain('提交')
  })
})
