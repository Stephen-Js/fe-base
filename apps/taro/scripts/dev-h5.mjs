import { spawn } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'

const PORT = 10086

function ensurePortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (error) => {
      reject(error)
    })

    // Bind on all interfaces so IPv4 / IPv6 listeners are both detected.
    server.listen(port, () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError)
          return
        }
        resolve(undefined)
      })
    })
  })
}

async function main() {
  try {
    await ensurePortAvailable(PORT)
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
