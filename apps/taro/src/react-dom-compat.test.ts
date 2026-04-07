import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('react-dom setup for taro h5', () => {
  it('does not keep a local react-dom compatibility shim once taro resolves react 18', () => {
    const compatPath = resolve(process.cwd(), 'apps/taro/src/lib/react-dom-compat.ts')

    expect(existsSync(compatPath)).toBe(false)
  })

  it('does not alias react-dom in taro vite config', () => {
    const configPath = resolve(process.cwd(), 'apps/taro/config/index.ts')
    const config = readFileSync(configPath, 'utf8')

    expect(config).not.toContain('src/lib/react-dom-compat.ts')
    expect(config).not.toContain("find: 'react-dom'")
    expect(config).not.toContain('taro-react-dom-compat')
  })
})
