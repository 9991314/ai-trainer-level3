import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { AnswerRecord, LearningState, Question } from '@/types'
import { isAnswerCorrect } from '@/utils/answer'

const STORAGE_KEY = 'ai-trainer-learning-v2'

function loadState(): LearningState {
  const empty: LearningState = { answers: {}, wrongs: {}, favorites: [], flashcardFavorites: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...empty, ...JSON.parse(raw) as LearningState } : empty
  } catch {
    return empty
  }
}

export const useLearningStore = defineStore('learning', () => {
  const initial = loadState()
  const answers = ref(initial.answers)
  const wrongs = ref(initial.wrongs)
  const favorites = ref(initial.favorites)
  const flashcardFavorites = ref(initial.flashcardFavorites)
  const recentQuestionId = ref(initial.recentQuestionId)

  const answeredCount = computed(() => Object.keys(answers.value).length)
  const wrongCount = computed(() => Object.values(wrongs.value).filter((item) => !item.mastered).length)

  function submitAnswer(question: Question, selected: string[]) {
    const correct = isAnswerCorrect(question, selected)
    const record: AnswerRecord = { selected: [...selected], correct, answeredAt: new Date().toISOString() }
    answers.value[question.id] = record
    recentQuestionId.value = question.id

    const existing = wrongs.value[question.id]
    if (!correct) {
      wrongs.value[question.id] = {
        count: (existing?.count ?? 0) + 1,
        lastWrongAt: record.answeredAt,
        mastered: false,
        correctStreak: 0,
      }
    } else if (existing) {
      existing.correctStreak += 1
      if (existing.correctStreak >= 3) existing.mastered = true
    }
    return correct
  }

  function toggleFavorite(id: string) {
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter((item) => item !== id)
      : [...favorites.value, id]
  }

  function toggleFlashcardFavorite(id: string) {
    flashcardFavorites.value = flashcardFavorites.value.includes(id)
      ? flashcardFavorites.value.filter((item) => item !== id)
      : [...flashcardFavorites.value, id]
  }

  function setMastered(id: string, mastered: boolean) {
    const item = wrongs.value[id]
    if (item) item.mastered = mastered
  }

  watch(
    [answers, wrongs, favorites, flashcardFavorites, recentQuestionId],
    () => localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: answers.value,
      wrongs: wrongs.value,
      favorites: favorites.value,
      flashcardFavorites: flashcardFavorites.value,
      recentQuestionId: recentQuestionId.value,
    } satisfies LearningState)),
    { deep: true },
  )

  return {
    answers, wrongs, favorites, flashcardFavorites, recentQuestionId,
    answeredCount, wrongCount, submitAnswer, toggleFavorite, toggleFlashcardFavorite, setMastered,
  }
})
