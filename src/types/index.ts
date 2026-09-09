export type QuestionType = 'single' | 'multiple' | 'boolean' | 'practical'
export type SessionType = 'morning' | 'afternoon'

export interface Question {
  id: string
  level: number
  session: SessionType
  category: string
  type: QuestionType
  title?: string
  question: string
  options?: Record<string, string>
  answer: string[]
  explanation: string
  memoryTip?: string
  difficulty: 1 | 2 | 3
  tags: string[]
  score?: number
  code?: string
  requirements?: string[]
  validation?: string[]
  steps?: string[]
  pitfalls?: string[]
  subquestions?: PracticalSubquestion[]
}

export interface PracticalSubquestion {
  id: string
  title: string
  prompt: string
  requirements: string[]
  validation: string[]
  explanation: string
  steps?: string[]
  code?: string
  pitfalls?: string[]
  score?: number
}

export interface AnswerRecord {
  selected: string[]
  correct: boolean
  answeredAt: string
}

export interface WrongRecord {
  count: number
  lastWrongAt: string
  mastered: boolean
  correctStreak: number
}

export interface LearningState {
  answers: Record<string, AnswerRecord>
  wrongs: Record<string, WrongRecord>
  favorites: string[]
  recentQuestionId?: string
  flashcardFavorites: string[]
}

export interface KnowledgeArticle {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  updatedAt: string
  order: number
  body: string
  plainText: string
}

export interface Flashcard {
  id: string
  term: string
  summary: string
  category: string
  detail?: string
}

export interface ResourceItem {
  id: string
  title: string
  description: string
  type: 'baidu' | 'tool' | 'document' | 'external'
  session: 'general' | SessionType
  url?: string
  code?: string
  updatedAt: string
  size?: string
  status?: 'available' | 'coming-soon'
  tags: string[]
}
