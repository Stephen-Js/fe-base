import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('nutui import strategy', () => {
  it('routes taro pages through the local nutui adapter', () => {
    const indexPage = readFileSync(resolve(process.cwd(), 'apps/taro/src/pages/index/index.tsx'), 'utf8')
    const chatPage = readFileSync(resolve(process.cwd(), 'apps/taro/src/pages/chat/index.tsx'), 'utf8')

    expect(indexPage).toContain("../../lib/nutui")
    expect(chatPage).toContain("../../lib/nutui")
    expect(indexPage).not.toContain("@nutui/nutui-react-taro")
    expect(chatPage).not.toContain("@nutui/nutui-react-taro")
  })

  it('imports nutui components from direct subpaths to avoid root-entry side effects', () => {
    const adapterPath = resolve(process.cwd(), 'apps/taro/src/lib/nutui.ts')

    expect(existsSync(adapterPath)).toBe(true)

    const adapter = readFileSync(adapterPath, 'utf8')

    expect(adapter).toContain('@nutui/nutui-react-taro/dist/esm/Button.js')
    expect(adapter).toContain('@nutui/nutui-react-taro/dist/esm/Input.js')
    expect(adapter).not.toContain("from '@nutui/nutui-react-taro'")
  })
})
