<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, BookOpen, BrainCircuit, Clock3, FileQuestion, Hammer, RotateCcw, Sparkles } from 'lucide-vue-next'
import questionsData from '@/data/questions/level3.json'
import resourcesData from '@/data/resources.json'
import flashcardsData from '@/data/flashcards.json'
import { useKnowledge } from '@/composables/useKnowledge'
import { useLearningStore } from '@/stores/learning'
import type { Question, ResourceItem } from '@/types'

const questions = questionsData as Question[]
const resources = resourcesData as ResourceItem[]
const learning = useLearningStore()
const { articles } = useKnowledge()

const stats = computed(() => [
  { value: questions.length, label: '已收录题目', note: '理论 + 实操' },
  { value: articles.value.length, label: '知识文章', note: 'Markdown 驱动' },
  { value: 1, label: '模拟试卷', note: '90 分钟模式' },
  { value: resources.filter((item) => item.type === 'tool').length, label: '实操资料', note: '网盘与工具包' },
])

const completed = computed(() => questions.filter((item) => learning.answers[item.id]).length)
const progress = computed(() => Math.round(completed.value / questions.length * 100))
const continueId = computed(() => learning.recentQuestionId || questions[0]?.id)
const continueQuestion = computed(() => questions.find((item) => item.id === continueId.value) ?? questions[0])

const entries = [
  { title: '上午理论', note: '单选 · 多选 · 判断', to: '/practice/morning', icon: FileQuestion },
  { title: '下午实操', note: '思路 · 模板 · 扣分点', to: '/practice/afternoon', icon: Hammer },
  { title: '模拟考试', note: '计时 · 答题卡 · 分析', to: '/exam', icon: Clock3 },
  { title: '错题本', note: '自动归集 · 三次掌握', to: '/wrong-book', icon: RotateCcw },
  { title: '知识库', note: '概念 · 代码 · 相关题', to: '/knowledge', icon: BookOpen },
  { title: '考前速记', note: `${flashcardsData.length} 条高频结论`, to: '/flashcards', icon: Sparkles },
]
</script>

<template>
  <div class="home-page">
    <section class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow"><span /> 免费、开放、持续完善</p>
        <h1>把零散的备考资料，<br><em>整理成一条学习路径。</em></h1>
        <p class="hero-lead">面向人工智能训练师职业技能等级考试的在线刷题与复习平台。整理题目、知识点、解析和实操资料，帮你少花时间找资料，多留时间真正掌握。</p>
        <div class="hero-actions">
          <RouterLink class="button primary" to="/practice">开始刷题 <ArrowRight :size="17" /></RouterLink>
          <RouterLink class="button secondary" to="/knowledge">进入知识库</RouterLink>
        </div>
      </div>

      <aside class="hero-rail" aria-label="三级考试学习路径">
        <div class="rail-heading"><span>LEVEL 03</span><small>考试资料整理</small></div>
        <div class="rail-track" aria-hidden="true">
          <span v-for="n in 10" :key="n" :class="{ major: n === 1 || n === 6 || n === 10 }" />
        </div>
        <div class="rail-stages">
          <div><span>09:00</span><strong>上午理论</strong><small>概念理解与判断</small></div>
          <ArrowRight :size="17" />
          <div><span>14:00</span><strong>下午实操</strong><small>流程、代码与交付</small></div>
        </div>
        <div class="rail-quote"><BrainCircuit :size="19" /><p>知识 → 练题 → 复盘<br><strong>让每一道错题都有下一步。</strong></p></div>
      </aside>
    </section>

    <section class="stat-strip" aria-label="内容收录概览">
      <div class="shell stat-grid">
        <div v-for="item in stats" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span><small>{{ item.note }}</small></div>
      </div>
    </section>

    <section class="dashboard-section shell">
      <div class="section-heading">
        <div><p class="eyebrow">YOUR ROUTE</p><h2>继续学习</h2></div>
        <span class="section-note">学习记录只保存在当前浏览器</span>
      </div>
      <article class="continue-panel">
        <div class="continue-main">
          <span class="session-badge">人工智能训练师三级 · {{ continueQuestion?.session === 'morning' ? '上午理论' : '下午实操' }}</span>
          <h3>{{ continueQuestion?.question }}</h3>
          <p>{{ completed }} / {{ questions.length }} 道已完成</p>
        </div>
        <div class="continue-progress" :style="{ '--progress': `${progress}%` }">
          <strong>{{ progress }}<small>%</small></strong><span>当前进度</span>
        </div>
        <RouterLink class="button secondary" :to="`/practice/${continueQuestion?.session}?question=${continueQuestion?.id}`">继续答题 <ArrowRight :size="17" /></RouterLink>
      </article>
    </section>

    <section class="entry-section shell">
      <div class="section-heading"><div><p class="eyebrow">QUICK ACCESS</p><h2>常用入口</h2></div><p>按考试节奏组织，不让你在目录里迷路。</p></div>
      <div class="entry-list">
        <RouterLink v-for="(entry, index) in entries" :key="entry.to" :to="entry.to">
          <span class="entry-index">0{{ index + 1 }}</span><component :is="entry.icon" :size="20" />
          <span><strong>{{ entry.title }}</strong><small>{{ entry.note }}</small></span><ArrowRight class="entry-arrow" :size="18" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
