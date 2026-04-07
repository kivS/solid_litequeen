import path from 'node:path'

const DIST = path.resolve(import.meta.dir, '..', 'dist')
const PORT = Number(process.env.PORT ?? 3000)

function contentType(filePath: string) {
  if (filePath.endsWith('.xml')) return 'application/xml; charset=utf-8'
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.woff2')) return 'font/woff2'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  return 'text/html; charset=utf-8'
}

async function resolvePath(pathname: string) {
  const normalizedPath = decodeURIComponent(pathname)
  const directPath = path.join(DIST, normalizedPath)

  if (normalizedPath !== '/' && (await Bun.file(directPath).exists())) {
    return directPath
  }

  const indexPath =
    normalizedPath === '/'
      ? path.join(DIST, 'index.html')
      : path.join(DIST, normalizedPath, 'index.html')

  if (await Bun.file(indexPath).exists()) {
    return indexPath
  }

  if (!path.extname(normalizedPath)) {
    const htmlPath = path.join(DIST, `${normalizedPath}.html`)

    if (await Bun.file(htmlPath).exists()) {
      return htmlPath
    }
  }

  return path.join(DIST, '404.html')
}

Bun.serve({
  port: PORT,
  development: process.env.NODE_ENV !== 'production',
  async fetch(request) {
    const url = new URL(request.url)
    const filePath = await resolvePath(url.pathname)
    const file = Bun.file(filePath)

    return new Response(file, {
      status: filePath.endsWith('404.html') ? 404 : 200,
      headers: {
        'content-type': contentType(filePath),
      },
    })
  },
})

console.log(`Static site available at http://localhost:${PORT}`)
