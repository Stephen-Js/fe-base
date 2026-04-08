import { spawn } from 'node:child_process'
import process from 'node:process'
import { execFileSync } from 'node:child_process'

const PORT = 10086

function ensurePortAvailable(port) {
  try {
    const output = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()

    if (output) {
      throw new Error(`Listener pids: ${output}`)
    }
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 1) {
      return
    }
    throw error
  }
}

async function main() {
  try {
    ensurePortAvailable(PORT)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[taro:h5] Port ${PORT} is already in use. Aborting startup.`)
    console.error(`[taro:h5] ${message}`)
    process.exit(1)
  }

  const child = spawn(
    'pnpm',
    ['exec', 'taro', 'build', '--type', 'h5', '--watch', '--port', String(PORT)],
    {
      cwd: new URL('..', import.meta.url),
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  )

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(code ?? 0)
  })
}

void main()
