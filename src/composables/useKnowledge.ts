import { computed } from 'vue'
import { marked } from 'marked'
import type { KnowledgeArticle } from '@/types'

const sourceFiles = import.meta.glob('/content/knowledge/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseArticle(path: string, source: string): KnowledgeArticle {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  const metadata: Record<string, string> = {}
  const body = match?.[2] ?? source
  for (const line of (match?.[1] ?? '').split('\n')) {
    const separator = line.indexOf(':')
    if (separator > -1) metadata[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
  }
  return {
    slug: path.split('/').pop()?.replace('.md', '') ?? '',
    title: metadata.title ?? '未命名文章',
    description: metadata.description ?? '',
    category: metadata.category ?? '未分类',
    tags: metadata.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [],
    updatedAt: metadata.updatedAt ?? '',
    order: Number(metadata.order ?? 99),
    body,
    plainText: stripMarkdown(body),
  }
}

const parsedArticles = Object.entries(sourceFiles)
  .map(([path, source]) => parseArticle(path, source))
  .sort((a, b) => a.order - b.order)

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')
}

export function renderMarkdown(body: string) {
  const html = marked.parse(body, { async: false }) as string
  return html.replace(/<h([23])>(.*?)<\/h\1>/g, (_full, level, content: string) => {
    const plain = content.replace(/<[^>]+>/g, '')
    return `<h${level} id="${slugify(plain)}">${content}</h${level}>`
  })
}

export function useKnowledge() {
  const articles = computed(() => parsedArticles)
  const categories = computed(() => [...new Set(parsedArticles.map((item) => item.category))])
  const getArticle = (slug: string) => parsedArticles.find((item) => item.slug === slug)
  return { articles, categories, getArticle }
}
