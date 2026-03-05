import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SHARED_SOURCE = path.join(ROOT, 'packages/ui/public')
const APPS = ['web', 'desktop'] // Mobile 不需要 public 同步
const SHARED_DIRS = ['icons', 'images']

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0
  fs.mkdirSync(dest, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
      count++
    }
  }
  return count
}

function main() {
  console.log('Syncing shared public assets...\n')
  for (const app of APPS) {
    const appPublic = path.join(ROOT, 'apps', app, 'public')
    fs.mkdirSync(appPublic, { recursive: true })
    console.log(`→ apps/${app}/public/`)
    for (const dir of SHARED_DIRS) {
      const destDir = path.join(appPublic, dir)
      if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true })
      const count = copyDir(path.join(SHARED_SOURCE, dir), destDir)
      console.log(`  └─ ${dir}/ (${count} files)`)
    }
  }
  console.log('\nDone!')
}
main()
