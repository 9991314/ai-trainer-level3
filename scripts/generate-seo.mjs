import { mkdir, writeFile } from 'node:fs/promises'

const siteUrl = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '')
const routes = [
  '/', '/practice', '/exam', '/wrong-book', '/knowledge', '/flashcards', '/resources', '/about',
  '/knowledge/softmax', '/knowledge/data-cleaning', '/knowledge/model-evaluation',
  '/knowledge/computer-vision', '/knowledge/practical-workflow',
]
const now = new Date().toISOString().slice(0, 10)
const urls = routes.map((route) => `  <url><loc>${siteUrl}${route}</loc><lastmod>${now}</lastmod></url>`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

await mkdir('dist', { recursive: true })
await writeFile('dist/sitemap.xml', sitemap, 'utf8')
