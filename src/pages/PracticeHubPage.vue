<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, BookCheck, Database, FileQuestion, Image, Network, Shuffle, TextSearch } from 'lucide-vue-next'
import questionsData from '@/data/questions/level3.json'
import { useLearningStore } from '@/stores/learning'
import type { Question } from '@/types'

const questions = questionsData as Question[]
const learning = useLearningStore()
const morningCount = questions.filter((item) => item.session === 'morning').length
const afternoonQuestions = questions.filter((item) => item.session === 'afternoon')
const afternoonCount = afternoonQuestions.length
const afternoonSubquestionCount = afternoonQuestions.reduce((total, item) => total + (item.subquestions?.length ?? 0), 0)

const categoryIcons: Record<string, typeof Database> = {
  '业务流程': TextSearch,
  '效果优化': Image,
  '数据处理': Database,
  '算法测试': Network,
  '系统设计': BookCheck,
}
const practicalCategories = computed(() => [...new Set(afternoonQuestions.map((item) => item.category))].map((label) => ({
  label,
  icon: categoryIcons[label] ?? FileQuestion,
  subquestionCount: afternoonQuestions
    .filter((item) => item.category === label)
    .reduce((total, item) => total + (item.subquestions?.length ?? 0), 0),
})))
</script>

<template>
  <div class="page-shell shell">
    <header class="page-intro split-intro">
      <div><p class="eyebrow">PRACTICE</p><h1>人工智能训练师三级</h1><p>上午练判断，下午练交付。先选考试场次，再按适合你的方式开始。</p></div>
      <dl class="mini-summary"><div><dt>已作答</dt><dd>{{ learning.answeredCount }}</dd></div><div><dt>待复习</dt><dd>{{ learning.wrongCount }}</dd></div></dl>
    </header>

    <section class="session-split">
      <article class="session-panel morning">
        <div class="session-number">AM</div>
        <div class="session-content">
          <p class="session-label">上午 · 理论知识考试</p>
          <h2>把概念辨析练到稳定</h2>
          <p>覆盖机器学习、深度学习、数据处理、计算机视觉、NLP、模型评估和职业规范。</p>
          <div class="session-meta"><span>{{ morningCount }} 道理论题</span><span>单选 / 多选 / 判断</span></div>
          <div class="session-actions">
            <RouterLink class="button primary" to="/practice/morning">顺序刷题 <ArrowRight :size="17" /></RouterLink>
            <RouterLink class="button text-button" to="/practice/morning?mode=random"><Shuffle :size="16" /> 随机刷题</RouterLink>
          </div>
        </div>
      </article>

      <article class="session-panel afternoon">
        <div class="session-number">PM</div>
        <div class="session-content">
          <p class="session-label">下午 · 操作技能考试</p>
          <h2>按阅卷标准完成实操</h2>
          <p>每道题先给作答要求和验收条件，完成后再查看答题思路、标准模板与常见扣分点。</p>
          <div class="session-meta"><span>{{ afternoonCount }} 道实操大题</span><span>{{ afternoonSubquestionCount }} 道小题</span></div>
          <RouterLink class="button primary" to="/practice/afternoon">进入实操专区 <ArrowRight :size="17" /></RouterLink>
        </div>
      </article>
    </section>

    <section class="practice-modes">
      <div class="section-heading"><div><p class="eyebrow">PRACTICE MAP</p><h2>实操知识地图</h2></div><p>先建立标准流程，再补单个工具的操作细节。</p></div>
      <div class="category-line-list">
        <RouterLink v-for="item in practicalCategories" :key="item.label" :to="{ path: '/practice/afternoon', query: { category: item.label } }">
          <component :is="item.icon" :size="19" /><span>{{ item.label }}</span><small>{{ item.subquestionCount }} 小题</small><ArrowRight :size="16" />
        </RouterLink>
      </div>
    </section>

    <aside class="wrongbook-callout">
      <FileQuestion :size="23" /><div><strong>错题不会消失，只会进入复习队列。</strong><p>同一道错题连续答对 3 次后，系统会自动标记为已掌握。</p></div>
      <RouterLink class="button secondary" to="/wrong-book">打开错题本</RouterLink>
    </aside>
  </div>
</template>
