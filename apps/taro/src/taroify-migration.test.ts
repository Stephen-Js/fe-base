import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('taroify migration', () => {
  it('routes taro pages through the shared ui-taro component exports', () => {
    const indexPage = readFileSync(resolve(process.cwd(), 'apps/taro/src/pages/index/index.tsx'), 'utf8')
    const chatPage = readFileSync(resolve(process.cwd(), 'apps/taro/src/pages/chat/index.tsx'), 'utf8')

    expect(indexPage).toContain("@repo/ui-taro/components")
    expect(chatPage).toContain("@repo/ui-taro/components")
    expect(indexPage).not.toContain("@nutui/nutui-react-taro")
    expect(chatPage).not.toContain("@nutui/nutui-react-taro")
    expect(indexPage).not.toContain("../../lib/nutui")
    expect(chatPage).not.toContain("../../lib/nutui")
  })

  it('re-exports taroify components from the shared ui-taro component entry', () => {
    const componentsEntryPath = resolve(process.cwd(), 'packages/ui-taro/src/components/index.ts')

    expect(existsSync(componentsEntryPath)).toBe(true)

    const componentsEntry = readFileSync(componentsEntryPath, 'utf8')

    expect(componentsEntry).toContain("@taroify/core")
    expect(componentsEntry).toContain("@taroify/core/button/style")
    expect(componentsEntry).toContain("@taroify/core/input/style")
    expect(componentsEntry).not.toContain("@nutui/nutui-react-taro")
  })

  it('removes the local nutui adapter once taro pages use taroify', () => {
    const adapterPath = resolve(process.cwd(), 'apps/taro/src/lib/nutui.ts')

    expect(existsSync(adapterPath)).toBe(false)
  })

  it('replaces nutui dependencies with taroify in taro packages', () => {
    const taroPackageJson = readFileSync(resolve(process.cwd(), 'apps/taro/package.json'), 'utf8')
    const uiTaroPackageJson = readFileSync(resolve(process.cwd(), 'packages/ui-taro/package.json'), 'utf8')

    expect(taroPackageJson).toContain('"@taroify/core"')
    expect(uiTaroPackageJson).toContain('"@taroify/core"')
    expect(taroPackageJson).not.toContain('"@nutui/nutui-react-taro"')
    expect(uiTaroPackageJson).not.toContain('"@nutui/nutui-react-taro"')
  })
})
