import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('react version resolution for taro', () => {
  it('does not force the workspace onto react 19 when taro requires react 18', () => {
    const rootPackageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      pnpm?: { overrides?: Record<string, string> }
    }

    expect(rootPackageJson.pnpm?.overrides?.react).toBeUndefined()
    expect(rootPackageJson.pnpm?.overrides?.['react-dom']).toBeUndefined()
    expect(rootPackageJson.pnpm?.overrides?.['@types/react']).toBeUndefined()
  })
})
