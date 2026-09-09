<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, Circle, List, PanelLeftClose } from 'lucide-vue-next'
import QuestionRenderer from '@/components/QuestionRenderer.vue'
import questionsData from '@/data/questions/level3.json'
import type { Question } from '@/types'
import { useLearningStore } from '@/stores/learning'

const route = useRoute()
const router = useRouter()
const learning = useLearningStore()
const allQuestions = questionsData as Question[]
const showNavigator = ref(false)

const session = computed(() => route.params.session === 'afternoon' ? 'afternoon' : 'morning')
const categoryFilter = computed(() => typeof route.query.category === 'string' ? route.query.category : undefined)
const sessionQuestions = computed(() => {
  const items = allQuestions.filter((item) => item.session === session.value && (!categoryFilter.value || item.category === categoryFilter.value))
  if (route.query.mode === 'random') return [...items].sort((a, b) => a.id.localeCompare(b.id)).sort(() => Math.random() - 0.5)
  return items
})
const initialIndex = computed(() => {
  const questionId = route.query.question as string | undefined
  const index = sessionQuestions.value.findIndex((item) => item.id === questionId)
  return index >= 0 ? index : 0
})
const currentIndex = ref(initialIndex.value)
const current = computed(() => sessionQuestions.value[currentIndex.value])
const selected = ref<string[]>([])
const submitted = ref(false)
const correct = ref(false)
const progress = computed(() => Math.round((currentIndex.value + 1) / sessionQuestions.value.length * 100))
const answeredInSession = computed(() => sessionQuestions.value.filter((item) => learning.answers[item.id]).length)

function loadQuestion() {
  const answer = current.value ? learning.answers[current.value.id] : undefined
  selected.value = answer?.selected ? [...answer.selected] : []
  submitted.value = Boolean(answer)
  correct.value = answer?.correct ?? false
  if (current.value) router.replace({ query: { ...route.query, question: current.value.id } })
}

function submit() {
  if (!current.value) return
  if (current.value.type === 'practical') selected.value = ['reference']
  correct.value = learning.submitAnswer(current.value, selected.value)
  submitted.value = true
}

function go(index: number) {
  if (index < 0 || index >= sessionQuestions.value.length) return
  currentIndex.value = index
  showNavigator.value = false
  loadQuestion()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return
  if (!submitted.value && ['1', '2', '3', '4', '5'].includes(event.key) && current.value?.options) {
    const key = Object.keys(current.value.options)[Number(event.key) - 1]
    if (!key) return
    if (current.value.type === 'multiple') selected.value = selected.value.includes(key) ? selected.value.filter((item) => item !== key) : [...selected.value, key]
    else selected.value = [key]
  } else if (event.key === 'Enter' && !submitted.value && (selected.value.length || current.value?.type === 'practical')) submit()
  else if (event.key === 'ArrowLeft') go(currentIndex.value - 1)
  else if (event.key === 'ArrowRight') go(currentIndex.value + 1)
}

watch(() => route.params.session, () => { currentIndex.value = 0; loadQuestion() })
onMounted(() => { loadQuestion(); document.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="current" class="practice-workspace shell-wide">
    <header class="practice-topline">
      <RouterLink to="/practice"><ArrowLeft :size="17" /> 返回刷题中心</RouterLink>
      <div><strong>{{ session === 'morning' ? '上午理论' : '下午实操' }}</strong><span>{{ current.category }}</span></div>
      <button type="button" class="button secondary mobile-navigator-button" @click="showNavigator = !showNavigator"><List :size="17" /> 答题卡</button>
    </header>

    <div class="progress-line"><span :style="{ width: `${progress}%` }" /></div>

    <div class="practice-grid">
      <aside :class="['question-navigator', { open: showNavigator }]">
        <div class="navigator-heading"><span>{{ session === 'afternoon' ? '大题导航' : '题目导航' }}</span><small>{{ answeredInSession }} / {{ sessionQuestions.length }} 已答</small></div>
        <div class="question-number-grid">
          <button v-for="(item, index) in sessionQuestions" :key="item.id" type="button"
            :class="{ current: index === currentIndex, answered: learning.answers[item.id], wrong: learning.answers[item.id] && !learning.answers[item.id]?.correct }"
            :aria-label="`第 ${index + 1} ${session === 'afternoon' ? '大题' : '题'}${learning.answers[item.id] ? '，已作答' : ''}`" @click="go(index)">
            {{ index + 1 }}
          </button>
        </div>
        <div class="navigator-legend"><span><Circle :size="10" /> 未答</span><span><Check :size="12" /> 已答</span></div>
        <RouterLink v-if="session === 'morning'" class="button secondary navigator-exam-link" to="/exam">切换模拟考试</RouterLink>
      </aside>

      <main class="question-stage">
        <div class="question-count"><span>第 <strong>{{ currentIndex + 1 }}</strong> / {{ sessionQuestions.length }} {{ session === 'afternoon' ? '大题' : '题' }}</span><code>{{ current.id }}</code></div>
        <QuestionRenderer v-model="selected" :question="current" :submitted="submitted" :correct="correct"
          :favorite="learning.favorites.includes(current.id)" @submit="submit" @favorite="learning.toggleFavorite(current.id)" />
        <nav class="question-pagination" aria-label="题目切换">
          <button class="button secondary" type="button" :disabled="currentIndex === 0" @click="go(currentIndex - 1)"><ArrowLeft :size="17" /> 上一题</button>
          <span v-if="session === 'morning'">快捷键 <kbd>1–5</kbd> 选项 · <kbd>Enter</kbd> 提交 · <kbd>← →</kbd> 切题</span>
          <span v-else>快捷键 <kbd>Enter</kbd> 查看参考答案 · <kbd>← →</kbd> 切换大题</span>
          <button class="button primary" type="button" :disabled="currentIndex === sessionQuestions.length - 1" @click="go(currentIndex + 1)">下一题 <ArrowRight :size="17" /></button>
        </nav>
      </main>

      <aside class="practice-sidebar">
        <div><span>本组进度</span><strong>{{ progress }}%</strong><div class="mini-progress"><i :style="{ width: `${progress}%` }" /></div></div>
        <div><span>本题标签</span><ul><li v-for="tag in current.tags" :key="tag">{{ tag }}</li></ul></div>
        <div class="sidebar-tip"><PanelLeftClose :size="18" /><p>{{ current.type === 'practical' ? '完成本题操作后查看模板，解析与验收要点会留在本题下方。' : '选择答案后提交，解析与速记会留在本题下方。' }}</p></div>
      </aside>
    </div>
  </div>
</template>
