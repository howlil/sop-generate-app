import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

function readServerPortFromEnvFile(): number {
  try {
    const content = readFileSync(resolve(__dirname, '../server/.env'), 'utf8')
    const match = content.match(/^PORT=(\d+)/m)
    return match ? Number(match[1]) : 3000
  } catch {
    return 3000
  }
}

async function isNestServerAt(target: string): Promise<boolean> {
  try {
    const response = await fetch(`${target}/api/v1/tte/public/pdf-signing/status`, {
      signal: AbortSignal.timeout(1200),
    })
    return response.ok
  } catch {
    return false
  }
}

async function resolveDevApiProxyTarget(): Promise<string> {
  const explicit = process.env.VITE_DEV_SERVER_PROXY_TARGET?.trim()
  if (explicit) {
    return explicit
  }
  const preferredPort = readServerPortFromEnvFile()
  const candidatePorts = [preferredPort, 3000, 3001, 3002].filter(
    (port, index, ports) => ports.indexOf(port) === index,
  )
  for (const port of candidatePorts) {
    const target = `http://localhost:${port}`
    if (await isNestServerAt(target)) {
      if (port !== preferredPort) {
        console.warn(
          `[vite] Proxy API → ${target} (PORT=${preferredPort} di server/.env tidak aktif; hentikan proses di port ${preferredPort} atau set VITE_DEV_SERVER_PROXY_TARGET).`,
        )
      } else {
        console.log(`[vite] Proxy API → ${target}`)
      }
      return target
    }
  }
  const fallback = `http://localhost:${preferredPort}`
  console.warn(`[vite] Proxy API → ${fallback} (server Nest belum terdeteksi; jalankan pnpm start:dev di folder server).`)
  return fallback
}

export default defineConfig(async () => {
  const apiProxyTarget = await resolveDevApiProxyTarget()
  return {
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
        },
      },
      cors: true,
    },
    plugins: [
      devtools(),
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  }
})
