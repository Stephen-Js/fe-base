#!/usr/bin/env node
/**
 * shadcn 组件安装脚本
 * Usage: pnpm ui:add <component> [component2 ...]
 *
 * 流程: shadcn add → 修复 cn 导入(→ @repo/utils) → Biome 格式化
 */
import { spawn } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uiDir = join(__dirname, '..')
const shadcnDir = join(uiDir, 'src', 'components', 'shadcn')

const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('Usage: pnpm ui:add <component> [options]')
  process.exit(0)
}

const INCORRECT_IMPORTS = [
  /from\s+['"]src\/lib\/utils['"]/g,
  /from\s+['"]@\/lib\/utils['"]/g,
  /from\s+['"]\.\.\/lib\/utils['"]/g,
  /from\s+['"]\.\.\/\.\.\/lib\/utils['"]/g,
]
const CORRECT_IMPORT = "from '@repo/utils'"

async function fixImports() {
  const files = await readdir(shadcnDir)
  const tsxFiles = files.filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
  let fixedCount = 0
  for (const file of tsxFiles) {
    const filePath = join(shadcnDir, file)
    let content = await readFile(filePath, 'utf-8')
    let modified = false
    for (const pattern of INCORRECT_IMPORTS) {
      if (pattern.test(content)) {
        content = content.replace(pattern, CORRECT_IMPORT)
        modified = true
      }
      pattern.lastIndex = 0
    }
    if (modified) {
      await writeFile(filePath, content)
      console.log(`  Fixed: ${file}`)
      fixedCount++
    }
  }
  return fixedCount
}

function run(cmd, cmdArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { stdio: 'inherit', shell: true, ...options })
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))))
    child.on('error', reject)
  })
}

async function main() {
  try {
    await run('pnpm', ['dlx', 'shadcn@latest', 'add', '--cwd', uiDir, ...args])
    console.log('\nFixing cn imports...')
    const fixedCount = await fixImports()
    console.log(fixedCount === 0 ? '  All imports are correct.' : `  Fixed ${fixedCount} file(s).`)
    console.log('\nFormatting...')
    await run('pnpm', ['biome', 'check', '--write', shadcnDir])
    console.log('\nDone!')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
main()
