#!/usr/bin/env node
const fs = require('node:fs')

const commitMsgFile = process.argv[2]
if (!commitMsgFile) {
  console.error('Error: No commit message file provided')
  process.exit(1)
}

const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim()
const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+/

if (!pattern.test(commitMsg)) {
  console.error('Error: Commit message does not follow Conventional Commits format.')
  console.error('Expected: <type>(<scope>): <description>')
  console.error('Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert')
  console.error('Example: feat(auth): add login form validation')
  console.error('')
  console.error(`Your message: "${commitMsg}"`)
  process.exit(1)
}

process.exit(0)
