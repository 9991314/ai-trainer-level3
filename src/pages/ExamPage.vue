<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { AlarmClock, ArrowLeft, ArrowRight, BarChart3, CircleAlert, FileCheck2, ShieldCheck, TimerReset } from 'lucide-vue-next'
import QuestionRenderer from '@/components/QuestionRenderer.vue'
import questionsData from '@/data/questions/level3.json'
import { isAnswerCorrect, questionTypeLabel } from '@/utils/answer'
import { useLearningStore } from '@/stores/learning'
import type { Question, QuestionType } from '@/types'

type ExamState = 'intro' | 'running' | 'result'
const learning = useLearningStore()
const theoryQuestions = (questionsData as Question[]).filter((item) => item.session === 'morning')
function stableScore(id: string) {
  let score = 2166136261
  for (const char of id) {
    score ^= char.charCodeAt(0)
    score = Math.imul(score, 16777619)
  }
  return score >>> 0
}

function pickQuestions(type: Question['type'], count: number) {
  return theoryQuestions.filter((item) => item.type === type).sort((a, b) => stableScore(a.id) - stableScore(b.id)).slice(0, count)
}

const examQuestions = [
  ...pickQuestions('single', 70),
  ...pickQuestions('multiple', 10),
  ...pickQuestions('boolean', 20),
]
const state = ref<ExamState>('intro')
const index = ref(0)
const answers = ref<Record<string, string[]>>({})
const secondsLeft = ref(90 * 60)
const showCard = ref(false)
let timer: number | undefined

const current = computed(() => examQuestions[index.value])
const selected = computed({
  get: () => current.value ? answers.value[current.value.id] ?? [] : [],
  set: (value: string[]) => { if (current.value) answers.value[current.value.id] = value },
})
const answeredCount = computed(() => Object.values(answers.value).filter((item) => item.length).length)
const timeText = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')}:${String(secondsLeft.value % 60).padStart(2, '0')}`)
const resultItems = computed(() => examQuestions.map((question) => ({ question, correct: isAnswerCorrect(question, answers.value[question.id] ?? []) })))
const score = computed(() => resultItems.value.filter((item) => item.correct).length)
const categoryStats = computed(() => {
  const map = new Map<string, { total: number; correct: number }>()
  for (const item of resultItems.value) {
    const currentValue = map.get(item.question.category) ?? { total: 0, correct: 0 }
    currentValue.total += 1
    if (item.correct) currentValue.correct += 1
    map.set(item.question.category, currentValue)
  }
  return [...map.entries()].map(([category, value]) => ({ category, ...value, rate: Math.round(value.correct / value.total * 100) })).sort((a, b) => a.rate - b.rate)
})
const typeStats = computed(() => (['single', 'multiple', 'boolean'] as QuestionType[]).map((type) => {
  const items = resultItems.value.filter((item) => item.question.type === type)
  return { type, total: items.length, correct: items.filter((item) => item.correct).length }
}).filter((item) => item.total))

function start() {
  state.value = 'running'
  timer = window.setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) finish(true)
  }, 1000)
}

function finish(force = false) {
  if (!force && answeredCount.value < examQuestions.length && !window.confirm(`还有 ${examQuestions.length - answeredCount.value} 道题未答，仍要交卷吗？`)) return
  if (timer) window.clearInterval(timer)
  for (const question of examQuestions) learning.submitAnswer(question, answers.value[question.id] ?? [])
  state.value = 'result'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function reset() {
  answers.value = {}
  index.value = 0
  secondsLeft.value = 90 * 60
  state.value = 'intro'
}

onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <div class="page-shell shell">
    <template v-if="state === 'intro'">
      <header class="page-intro exam-intro">
        <p class="eyebrow">MOCK EXAM</p><h1>把会做，练成按时做完。</h1>
        <p>模拟真实上午理论考试的时间压力与答题节奏。试卷从完整理论题库中按 70 道单选、10 道多选、20 道判断组成，共 100 题。</p>
      </header>
      <section class="exam-brief">
        <div class="exam-paper-mark"><span>LEVEL</span><strong>03</strong><small>理论知识模拟卷</small></div>
        <div class="exam-rules">
          <h2>本次模拟考试</h2>
          <dl><div><dt>题目</dt><dd>{{ examQuestions.length }} 题</dd></div><div><dt>时间</dt><dd>90 分钟</dd></div><div><dt>交卷</dt><dd>自动判分</dd></div></dl>
          <ul>
            <li><TimerReset :size="18" /> 倒计时结束后自动交卷。</li>
            <li><FileCheck2 :size="18" /> 可随时打开答题卡检查未答题。</li>
            <li><BarChart3 :size="18" /> 交卷后按题型与知识点分析。</li>
          </ul>
          <button class="button primary start-exam" type="button" @click="start">开始模拟考试 <ArrowRight :size="17" /></button>
        </div>
      </section>
      <aside class="notice-line"><ShieldCheck :size="19" /><p>考试进度保存在当前页面。刷新或关闭页面会结束本次考试。</p></aside>
    </template>

    <template v-else-if="state === 'running' && current">
      <header class="exam-toolbar">
        <div><span>人工智能训练师三级</span><strong>理论知识模拟考试</strong></div>
        <div :class="['exam-timer', { urgent: secondsLeft < 600 }]"><AlarmClock :size="19" /><span>{{ timeText }}</span></div>
        <button class="button secondary" type="button" @click="showCard = !showCard">答题卡 {{ answeredCount }}/{{ examQuestions.length }}</button>
        <button class="button primary" type="button" @click="finish(false)">交卷</button>
      </header>

      <div class="exam-layout">
        <section class="exam-question">
          <div class="question-count"><span>第 <strong>{{ index + 1 }}</strong> / {{ examQuestions.length }} 题</span><code>{{ questionTypeLabel(current.type) }}</code></div>
          <QuestionRenderer v-model="selected" :question="current" :submitted="false" exam-mode />
          <nav class="question-pagination">
            <button class="button secondary" type="button" :disabled="index === 0" @click="index--"><ArrowLeft :size="17" /> 上一题</button>
            <span>已答 {{ answeredCount }} 题 · 未答 {{ examQuestions.length - answeredCount }} 题</span>
            <button class="button primary" type="button" :disabled="index === examQuestions.length - 1" @click="index++">下一题 <ArrowRight :size="17" /></button>
          </nav>
        </section>
        <aside :class="['exam-card', { open: showCard }]">
          <div class="navigator-heading"><span>答题卡</span><small>点击题号跳转</small></div>
          <div class="question-number-grid"><button v-for="(item, itemIndex) in examQuestions" :key="item.id" type="button" :class="{ current: itemIndex === index, answered: answers[item.id]?.length }" @click="index = itemIndex; showCard = false">{{ itemIndex + 1 }}</button></div>
          <div class="exam-card-summary"><span><i class="answered-dot" /> 已答 {{ answeredCount }}</span><span><i /> 未答 {{ examQuestions.length - answeredCount }}</span></div>
        </aside>
      </div>
    </template>

    <template v-else>
      <header class="result-header">
        <p class="eyebrow">EXAM RESULT</p><div class="result-score"><strong>{{ score }}</strong><span>/ {{ examQuestions.length }}</span></div>
        <div><h1>{{ score / examQuestions.length >= 0.8 ? '基础很稳，继续保持。' : '方向已经清楚，接下来补薄弱项。' }}</h1><p>本次结果已同步到错题本，答错的题会进入复习队列。</p></div>
      </header>
      <section class="result-grid">
        <div class="type-result"><h2>题型得分</h2><dl><div v-for="item in typeStats" :key="item.type"><dt>{{ questionTypeLabel(item.type) }}</dt><dd>{{ item.correct }} / {{ item.total }}</dd></div></dl></div>
        <div class="knowledge-result"><h2>知识点掌握</h2><div v-for="item in categoryStats" :key="item.category" class="mastery-row"><span>{{ item.category }}</span><div><i :style="{ width: `${item.rate}%` }" /></div><strong>{{ item.rate }}%</strong></div></div>
      </section>
      <aside v-if="categoryStats[0]" class="weakest-callout"><CircleAlert :size="21" /><p>当前最薄弱知识点：<strong>{{ categoryStats[0].category }}</strong></p><RouterLink :to="`/practice/morning?mode=random`">针对练习 <ArrowRight :size="16" /></RouterLink></aside>
      <div class="result-actions"><button class="button secondary" type="button" @click="reset">重新考试</button><RouterLink class="button primary" to="/wrong-book">复习本次错题 <ArrowRight :size="17" /></RouterLink></div>
    </template>
  </div>
</template>
