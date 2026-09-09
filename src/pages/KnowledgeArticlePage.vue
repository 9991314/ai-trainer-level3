<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, FileQuestion } from 'lucide-vue-next'
import { renderMarkdown, useKnowledge } from '@/composables/useKnowledge'
import questionsData from '@/data/questions/level3.json'
import type { Question } from '@/types'

const route = useRoute()
const { articles, getArticle } = useKnowledge()
const article = computed(() => getArticle(String(route.params.slug)))
const html = computed(() => article.value ? renderMarkdown(article.value.body) : '')
const currentIndex = computed(() => articles.value.findIndex((item) => item.slug === article.value?.slug))
const previous = computed(() => currentIndex.value > 0 ? articles.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 ? articles.value[currentIndex.value + 1] : undefined)
const toc = computed(() => {
  const items: { id: string; title: string; level: number }[] = []
  html.value.replace(/<h([23]) id="([^"]+)">([^<]+)<\/h\1>/g, (_match, level, id, title) => {
    items.push({ id, title, level: Number(level) }); return ''
  })
  return items
})
const related = computed(() => {
  if (!article.value) return []
  return (questionsData as Question[]).filter((question) => question.category === article.value?.category || question.tags.some((tag) => article.value?.tags.includes(tag))).slice(0, 4)
})

function updateMeta() {
  if (!article.value) return
  document.title = `${article.value.title} - 人工智能训练师知识库`
  document.querySelector('meta[name="description"]')?.setAttribute('content', article.value.description)
}
onMounted(updateMeta)
watch(article, updateMeta)
</script>

<template>
  <div v-if="article" class="knowledge-article shell-wide">
    <aside class="article-sidebar">
      <RouterLink class="back-link" to="/knowledge"><ArrowLeft :size="16" /> 全部文章</RouterLink>
      <strong>知识目录</strong>
      <RouterLink v-for="item in articles" :key="item.slug" :to="`/knowledge/${item.slug}`" :class="{ active: item.slug === article.slug }">{{ item.title }}</RouterLink>
    </aside>

    <article class="article-content">
      <header><span>{{ article.category }}</span><h1>{{ article.title }}</h1><p>{{ article.description }}</p><div><span><CalendarDays :size="15" /> 更新于 {{ article.updatedAt }}</span><em v-for="tag in article.tags" :key="tag">{{ tag }}</em></div></header>
      <div class="markdown-body" v-html="html" />

      <section v-if="related.length" class="related-practice">
        <div><FileQuestion :size="21" /><span><strong>相关练习题</strong><small>检验刚刚读过的知识点</small></span></div>
        <RouterLink v-for="question in related" :key="question.id" :to="`/practice/${question.session}?question=${question.id}`"><span>{{ question.category }}</span><strong>{{ question.question }}</strong><ArrowRight :size="17" /></RouterLink>
      </section>

      <nav class="article-pagination">
        <RouterLink v-if="previous" :to="`/knowledge/${previous.slug}`"><small>上一篇</small><strong><ArrowLeft :size="16" /> {{ previous.title }}</strong></RouterLink><span v-else />
        <RouterLink v-if="next" :to="`/knowledge/${next.slug}`"><small>下一篇</small><strong>{{ next.title }} <ArrowRight :size="16" /></strong></RouterLink>
      </nav>
    </article>

    <aside class="article-toc"><strong>本文目录</strong><a v-for="item in toc" :key="item.id" :href="`#${item.id}`" :class="{ nested: item.level === 3 }">{{ item.title }}</a><div><BookOpen :size="17" /><p>读完后完成相关练习，知识才真正进入你的答题流程。</p></div></aside>
  </div>
  <div v-else class="page-shell shell"><section class="empty-state"><h1>文章不存在</h1><RouterLink class="button primary" to="/knowledge">返回知识库</RouterLink></section></div>
</template>
