<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, CheckCircle2, CircleAlert, RotateCcw } from 'lucide-vue-next'
import questionsData from '@/data/questions/level3.json'
import { useLearningStore } from '@/stores/learning'
import { questionTypeLabel } from '@/utils/answer'
import type { Question } from '@/types'

type Filter = 'active' | 'all' | 'morning' | 'afternoon' | 'mastered'
const learning = useLearningStore()
const questions = questionsData as Question[]
const filter = ref<Filter>('active')

const wrongItems = computed(() => Object.entries(learning.wrongs).map(([id, record]) => ({ question: questions.find((item) => item.id === id), record })).filter((item): item is { question: Question; record: typeof item.record } => Boolean(item.question)).filter((item) => {
  if (filter.value === 'active') return !item.record.mastered
  if (filter.value === 'mastered') return item.record.mastered
  if (filter.value === 'morning' || filter.value === 'afternoon') return item.question.session === filter.value
  return true
}).sort((a, b) => b.record.lastWrongAt.localeCompare(a.record.lastWrongAt)))

const filters: { key: Filter; label: string }[] = [
  { key: 'active', label: '待复习' }, { key: 'all', label: '全部错题' }, { key: 'morning', label: '上午理论' },
  { key: 'afternoon', label: '下午实操' }, { key: 'mastered', label: '已掌握' },
]
</script>

<template>
  <div class="page-shell shell">
    <header class="page-intro split-intro">
      <div><p class="eyebrow">REVIEW QUEUE</p><h1>错题本</h1><p>答错不是结束，而是进入下一轮复习。连续答对 3 次，系统会自动标记为已掌握。</p></div>
      <dl class="mini-summary"><div><dt>累计错题</dt><dd>{{ Object.keys(learning.wrongs).length }}</dd></div><div><dt>待复习</dt><dd>{{ learning.wrongCount }}</dd></div></dl>
    </header>

    <nav class="filter-tabs" aria-label="错题筛选">
      <button v-for="item in filters" :key="item.key" type="button" :class="{ active: filter === item.key }" @click="filter = item.key">{{ item.label }}</button>
    </nav>

    <section v-if="wrongItems.length" class="wrong-list">
      <article v-for="item in wrongItems" :key="item.question.id">
        <div class="wrong-state"><CircleAlert v-if="!item.record.mastered" :size="19" /><CheckCircle2 v-else :size="19" /><span>{{ item.record.mastered ? '已掌握' : `错 ${item.record.count} 次` }}</span></div>
        <div class="wrong-copy"><div><span>{{ item.question.category }}</span><span>{{ questionTypeLabel(item.question.type) }}</span><code>{{ item.question.id }}</code></div><h2>{{ item.question.question }}</h2><p>最近答错：{{ new Date(item.record.lastWrongAt).toLocaleDateString('zh-CN') }} · 连续答对 {{ item.record.correctStreak }} / 3 次</p></div>
        <div class="wrong-actions"><button type="button" @click="learning.setMastered(item.question.id, !item.record.mastered)">{{ item.record.mastered ? '移回待复习' : '标记已掌握' }}</button><RouterLink class="button secondary" :to="`/practice/${item.question.session}?question=${item.question.id}`">重新练习 <ArrowRight :size="16" /></RouterLink></div>
      </article>
    </section>

    <section v-else class="empty-state"><RotateCcw :size="30" /><h2>{{ filter === 'active' ? '当前没有待复习的错题' : '这个分类还没有错题' }}</h2><p>开始刷题后，答错的题会自动出现在这里。</p><RouterLink class="button primary" to="/practice">开始刷题 <ArrowRight :size="17" /></RouterLink></section>
  </div>
</template>
