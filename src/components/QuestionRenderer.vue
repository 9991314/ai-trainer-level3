<script setup lang="ts">
import { Check, CircleAlert, Code2, Copy, Star } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { Question } from '@/types'
import { copyText } from '@/utils/clipboard'
import { difficultyLabel, questionTypeLabel } from '@/utils/answer'

const props = defineProps<{
  question: Question
  modelValue: string[]
  submitted: boolean
  correct?: boolean
  favorite?: boolean
  examMode?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  submit: []
  favorite: []
}>()

const copiedCodeId = ref<string | null>(null)
const optionEntries = computed(() => Object.entries(props.question.options ?? {}))

function selectOption(key: string) {
  if (props.submitted) return
  if (props.question.type === 'multiple') {
    emit('update:modelValue', props.modelValue.includes(key)
      ? props.modelValue.filter((value) => value !== key)
      : [...props.modelValue, key])
  } else {
    emit('update:modelValue', [key])
  }
}

function optionState(key: string) {
  if (!props.submitted) return { selected: props.modelValue.includes(key) }
  return {
    selected: props.modelValue.includes(key),
    correct: props.question.answer.includes(key),
    wrong: props.modelValue.includes(key) && !props.question.answer.includes(key),
  }
}

async function copyCode(code = props.question.code, id = 'main') {
  if (!code) return
  await copyText(code)
  copiedCodeId.value = id
  window.setTimeout(() => { if (copiedCodeId.value === id) copiedCodeId.value = null }, 1600)
}
</script>

<template>
  <article class="question-panel">
    <header class="question-meta">
      <span>{{ questionTypeLabel(question.type) }}</span>
      <span>{{ question.category }}</span>
      <span>{{ difficultyLabel(question.difficulty) }}</span>
      <span v-if="question.score">{{ question.score }} 分</span>
      <button v-if="!examMode" type="button" :class="['favorite-button', { active: favorite }]" :aria-pressed="favorite" @click="emit('favorite')">
        <Star :size="17" :fill="favorite ? 'currentColor' : 'none'" /> {{ favorite ? '已收藏' : '收藏' }}
      </button>
    </header>

    <h1 class="question-title">{{ question.title ?? question.question }}</h1>
    <p v-if="question.type === 'practical' && question.title" class="practical-prompt">{{ question.question }}</p>
    <p v-if="question.type === 'multiple' && !submitted" class="question-hint">本题有多个正确答案，请选择所有符合项。</p>

    <div v-if="question.type !== 'practical'" class="option-list" role="group" :aria-label="question.type === 'multiple' ? '多选题选项' : '题目选项'">
      <button
        v-for="[key, label] in optionEntries" :key="key" type="button"
        :class="['option-row', optionState(key)]" :aria-pressed="modelValue.includes(key)" :disabled="submitted"
        @click="selectOption(key)"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-label">{{ label }}</span>
        <Check v-if="submitted && question.answer.includes(key)" class="option-status" :size="19" />
        <CircleAlert v-else-if="submitted && modelValue.includes(key)" class="option-status" :size="19" />
      </button>
    </div>

    <div v-else class="practical-brief">
      <section v-if="question.requirements?.length" class="practical-section">
        <h2>作答要求</h2>
        <ul><li v-for="item in question.requirements" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="question.type === 'practical' && question.subquestions?.length" class="practical-section practical-subquestion-list">
        <h2>小题清单 <span>{{ question.subquestions.length }} 小题</span></h2>
        <article v-for="(subquestion, index) in question.subquestions" :key="subquestion.id">
          <header><strong>小题 {{ index + 1 }}</strong><span v-if="subquestion.score">{{ subquestion.score }} 分</span><h3>{{ subquestion.title }}</h3></header>
          <p>{{ subquestion.prompt }}</p>
          <ul><li v-for="item in subquestion.requirements" :key="item">{{ item }}</li></ul>
        </article>
      </section>
      <p v-if="!submitted" class="practical-ready"><Code2 :size="19" /> 先在本地完成操作，确认输出后再查看参考模板。</p>
    </div>

    <div v-if="submitted" :class="['answer-feedback', { success: correct, error: !correct && question.type !== 'practical' }]" aria-live="polite">
      <div v-if="question.type !== 'practical'" class="feedback-title">
        <Check v-if="correct" :size="21" /><CircleAlert v-else :size="21" />
        <strong>{{ correct ? '回答正确' : '这道题需要再看一遍' }}</strong>
      </div>
      <dl v-if="question.type !== 'practical'" class="answer-compare">
        <div><dt>你的答案</dt><dd>{{ modelValue.join('、') || '未作答' }}</dd></div>
        <div><dt>正确答案</dt><dd>{{ question.answer.join('、') }}</dd></div>
      </dl>
      <section>
        <h2>{{ question.type === 'practical' ? '标准模板' : '答案解析' }}</h2>
        <p>{{ question.explanation }}</p>
      </section>
      <section v-if="question.type === 'practical' && question.steps?.length" class="practical-section revealed">
        <h2>答题思路</h2>
        <ol><li v-for="step in question.steps" :key="step">{{ step }}</li></ol>
      </section>
      <section v-if="question.type === 'practical' && question.subquestions?.length" class="practical-subquestion-answers">
        <article v-for="(subquestion, index) in question.subquestions" :key="subquestion.id" class="practical-subquestion-answer">
          <header><strong>小题 {{ index + 1 }}</strong><span v-if="subquestion.score">{{ subquestion.score }} 分</span><h3>{{ subquestion.title }}</h3></header>
          <p class="subquestion-prompt">{{ subquestion.prompt }}</p>
          <section><h2>答题思路</h2><ol><li v-for="step in subquestion.steps" :key="step">{{ step }}</li></ol></section>
          <section><h2>标准说明</h2><p>{{ subquestion.explanation }}</p></section>
          <div v-if="subquestion.code" class="code-block-wrap">
            <button type="button" @click="copyCode(subquestion.code, subquestion.id)"><Copy :size="15" /> {{ copiedCodeId === subquestion.id ? '已复制' : '复制代码' }}</button>
            <pre><code>{{ subquestion.code }}</code></pre>
          </div>
          <section><h2>验收检查</h2><ul><li v-for="item in subquestion.validation" :key="item">{{ item }}</li></ul></section>
          <section v-if="subquestion.pitfalls?.length"><h2>常见扣分点</h2><ul><li v-for="item in subquestion.pitfalls" :key="item">{{ item }}</li></ul></section>
        </article>
      </section>
      <div v-if="question.code" class="code-block-wrap">
        <button type="button" @click="copyCode(question.code, 'main')"><Copy :size="15" /> {{ copiedCodeId === 'main' ? '已复制' : '复制代码' }}</button>
        <pre><code>{{ question.code }}</code></pre>
      </div>
      <section v-if="question.type === 'practical' && question.validation?.length" class="practical-section revealed">
        <h2>验收检查</h2>
        <ul><li v-for="item in question.validation" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="question.pitfalls?.length">
        <h2>常见扣分点</h2>
        <ul><li v-for="item in question.pitfalls" :key="item">{{ item }}</li></ul>
      </section>
      <aside v-if="question.memoryTip" class="memory-tip"><span>速记</span><strong>{{ question.memoryTip }}</strong></aside>
    </div>

    <button v-if="!submitted && !examMode" class="button primary submit-answer" type="button" :disabled="question.type !== 'practical' && modelValue.length === 0" @click="emit('submit')">
      {{ question.type === 'practical' ? '查看参考答案' : '提交答案' }}
    </button>
  </article>
</template>
