import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('taro h5 entry', () => {
  it('includes the src/index.html entry required by the h5 build', () => {
    const entryPath = resolve(process.cwd(), 'apps/taro/src/index.html')

    expect(existsSync(entryPath)).toBe(true)
  })

  it('declares a favicon to avoid a browser 404 for /favicon.ico', () => {
    const entryPath = resolve(process.cwd(), 'apps/taro/src/index.html')
    const html = readFileSync(entryPath, 'utf8')

    expect(html).toContain('rel="icon"')
  })

  it('uses the non-deprecated mobile web app meta tag for h5', () => {
    const entryPath = resolve(process.cwd(), 'apps/taro/src/index.html')
    const html = readFileSync(entryPath, 'utf8')

    expect(html).toContain('name="mobile-web-app-capable"')
    expect(html).not.toContain('name="apple-mobile-web-app-capable"')
  })

  it('uses app.config.ts as the taro h5 entry module so dev and build both bootstrap the router', () => {
    const entryPath = resolve(process.cwd(), 'apps/taro/src/index.html')
    const html = readFileSync(entryPath, 'utf8')

    expect(html).toContain('src="./app.config.ts"')
  })
})
