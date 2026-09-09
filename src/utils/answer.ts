import type { Question } from '@/types'

export function normalizeAnswers(values: string[]) {
  return [...values].sort()
}

export function isAnswerCorrect(question: Question, selected: string[]) {
  const expected = normalizeAnswers(question.answer)
  const actual = normalizeAnswers(selected)
  return expected.length === actual.length && expected.every((value, index) => value === actual[index])
}

export function questionTypeLabel(type: Question['type']) {
  return ({ single: '单选题', multiple: '多选题', boolean: '判断题', practical: '实操题' })[type]
}

export function difficultyLabel(difficulty: Question['difficulty']) {
  return ({ 1: '基础', 2: '进阶', 3: '挑战' })[difficulty]
}
