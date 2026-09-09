<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, BookOpen, Search } from 'lucide-vue-next'
import { useKnowledge } from '@/composables/useKnowledge'

const { articles, categories } = useKnowledge()
const query = ref('')
const category = ref('全部')

const filtered = computed(() => articles.value.filter((item) => {
  const categoryMatch = category.value === '全部' || item.category === category.value
  const text = `${item.title}${item.description}${item.tags.join('')}${item.plainText}`.toLowerCase()
  return categoryMatch && text.includes(query.value.trim().toLowerCase())
}))
</script>

<template>
  <div class="page-shell shell">
    <header class="page-intro knowledge-intro">
      <p class="eyebrow">KNOWLEDGE BASE</p><h1>先理解，再做对。</h1>
      <p>知识库按考试能力组织，不照搬教材目录。每篇文章都连接到相关练习，把“看懂”变成“会做”。</p>
      <label class="large-search"><Search :size="20" /><input v-model="query" type="search" placeholder="搜索 Softmax、Pandas、Recall…" aria-label="搜索知识库" /><kbd>/</kbd></label>
    </header>

    <div class="knowledge-layout">
      <aside class="knowledge-categories">
        <strong>主题</strong>
        <button type="button" :class="{ active: category === '全部' }" @click="category = '全部'">全部文章 <span>{{ articles.length }}</span></button>
        <button v-for="item in categories" :key="item" type="button" :class="{ active: category === item }" @click="category = item">{{ item }} <span>{{ articles.filter((article) => article.category === item).length }}</span></button>
      </aside>

      <main class="article-index">
        <div class="article-index-heading"><span>{{ category }}</span><small>{{ filtered.length }} 篇文章</small></div>
        <RouterLink v-for="article in filtered" :key="article.slug" :to="`/knowledge/${article.slug}`" class="article-row">
          <span class="article-glyph"><BookOpen :size="19" /></span>
          <span class="article-row-copy"><small>{{ article.category }}</small><strong>{{ article.title }}</strong><p>{{ article.description }}</p><em><span v-for="tag in article.tags" :key="tag">{{ tag }}</span></em></span>
          <span class="article-date">更新于 {{ article.updatedAt }}</span><ArrowRight :size="18" />
        </RouterLink>
        <p v-if="!filtered.length" class="empty-inline">没有找到相关文章，试试其他关键词或分类。</p>
      </main>
    </div>
  </div>
</template>
