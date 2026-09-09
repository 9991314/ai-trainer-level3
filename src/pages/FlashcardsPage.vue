<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Star } from 'lucide-vue-next'
import flashcardData from '@/data/flashcards.json'
import type { Flashcard } from '@/types'
import { useLearningStore } from '@/stores/learning'

const route = useRoute()
const learning = useLearningStore()
const cards = flashcardData as Flashcard[]
const query = ref(String(route.query.q ?? ''))
const category = ref('全部')
const favoriteOnly = ref(false)
const categories = ['全部', ...new Set(cards.map((item) => item.category))]

const filtered = computed(() => cards.filter((item) => {
  const categoryMatch = category.value === '全部' || item.category === category.value
  const favoriteMatch = !favoriteOnly.value || learning.flashcardFavorites.includes(item.id)
  const text = `${item.term}${item.summary}${item.detail ?? ''}`.toLowerCase()
  return categoryMatch && favoriteMatch && text.includes(query.value.trim().toLowerCase())
}))
</script>

<template>
  <div class="page-shell shell flashcard-page">
    <header class="page-intro flashcard-intro"><p class="eyebrow">LAST-MINUTE NOTES</p><h1>考前速记</h1><p>只保留能在考场里立即调用的结论。短、准、可搜索，也可以收藏成自己的最后一页。</p></header>
    <div class="flashcard-toolbar">
      <label><Search :size="18" /><input v-model="query" type="search" placeholder="搜索术语或结论" /></label>
      <div class="filter-tabs compact"><button v-for="item in categories" :key="item" type="button" :class="{ active: category === item }" @click="category = item">{{ item }}</button></div>
      <button type="button" :class="['favorite-filter', { active: favoriteOnly }]" :aria-pressed="favoriteOnly" @click="favoriteOnly = !favoriteOnly"><Star :size="16" :fill="favoriteOnly ? 'currentColor' : 'none'" /> 只看收藏</button>
    </div>
    <section class="flashcard-list">
      <article v-for="card in filtered" :key="card.id">
        <span class="flash-category">{{ card.category }}</span><h2>{{ card.term }}</h2><span class="flash-arrow">→</span><div><strong>{{ card.summary }}</strong><p v-if="card.detail">{{ card.detail }}</p></div>
        <button type="button" :aria-label="learning.flashcardFavorites.includes(card.id) ? `取消收藏 ${card.term}` : `收藏 ${card.term}`" @click="learning.toggleFlashcardFavorite(card.id)"><Star :size="17" :fill="learning.flashcardFavorites.includes(card.id) ? 'currentColor' : 'none'" /></button>
      </article>
      <p v-if="!filtered.length" class="empty-inline">没有匹配的速记内容。</p>
    </section>
  </div>
</template>
