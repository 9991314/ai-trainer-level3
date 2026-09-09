<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, FileQuestion, Search, StickyNote, X } from 'lucide-vue-next'
import questions from '@/data/questions/level3.json'
import flashcards from '@/data/flashcards.json'
import { useKnowledge } from '@/composables/useKnowledge'
import type { Question, Flashcard } from '@/types'

type SearchResult = { id: string; type: '题目' | '知识' | '速记'; title: string; meta: string; to: string }

const emit = defineEmits<{ close: [] }>()
const router = useRouter()
const query = ref('')
const input = ref<HTMLInputElement>()
const { articles } = useKnowledge()

function normalize(value: string) { return value.toLowerCase().replace(/\s+/g, '') }
function fuzzyMatch(haystack: string, needle: string) {
  const source = normalize(haystack)
  const target = normalize(needle)
  if (!target) return true
  if (source.includes(target)) return true
  let cursor = 0
  for (const char of source) if (char === target[cursor]) cursor += 1
  return cursor === target.length
}

const allResults = computed<SearchResult[]>(() => [
  ...(questions as Question[]).map((item) => ({
    id: item.id, type: '题目' as const, title: item.question, meta: `${item.category} · ${item.tags.join(' / ')}`,
    to: `/practice/${item.session}?question=${item.id}`,
  })),
  ...articles.value.map((item) => ({
    id: item.slug, type: '知识' as const, title: item.title, meta: `${item.category} · ${item.description}`, to: `/knowledge/${item.slug}`,
  })),
  ...(flashcards as Flashcard[]).map((item) => ({
    id: item.id, type: '速记' as const, title: `${item.term} → ${item.summary}`, meta: item.category, to: `/flashcards?q=${encodeURIComponent(item.term)}`,
  })),
])

const results = computed(() => {
  const term = query.value.trim()
  if (!term) return allResults.value.slice(0, 7)
  return allResults.value.filter((item) => fuzzyMatch(`${item.title}${item.meta}`, term)).slice(0, 10)
})

function go(to: string) {
  router.push(to)
  emit('close')
}

function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') emit('close') }
onMounted(() => { document.body.classList.add('modal-open'); document.addEventListener('keydown', onKeydown); nextTick(() => input.value?.focus()) })
onBeforeUnmount(() => { document.body.classList.remove('modal-open'); document.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <Teleport to="body">
    <div class="dialog-backdrop" role="presentation" @mousedown.self="emit('close')">
      <section class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <h2 id="search-title" class="sr-only">全局搜索</h2>
        <div class="search-input-wrap">
          <Search :size="20" aria-hidden="true" />
          <input ref="input" v-model="query" type="search" placeholder="搜索题目、知识点、速记…" aria-label="搜索内容" />
          <button class="icon-button" type="button" aria-label="关闭搜索" @click="emit('close')"><X :size="18" /></button>
        </div>
        <div class="search-context"><span>{{ query ? `找到 ${results.length} 项` : '最近常用' }}</span><kbd>ESC 关闭</kbd></div>
        <div class="search-results">
          <button v-for="item in results" :key="`${item.type}-${item.id}`" type="button" @click="go(item.to)">
            <span class="search-result-icon" aria-hidden="true">
              <FileQuestion v-if="item.type === '题目'" :size="18" />
              <BookOpen v-else-if="item.type === '知识'" :size="18" />
              <StickyNote v-else :size="18" />
            </span>
            <span><strong>{{ item.title }}</strong><small>{{ item.type }} · {{ item.meta }}</small></span>
          </button>
          <p v-if="!results.length" class="empty-inline">没有找到相关内容，试试更短的关键词。</p>
        </div>
      </section>
    </div>
  </Teleport>
</template>
