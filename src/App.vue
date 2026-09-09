<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

function onShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    document.querySelector<HTMLButtonElement>('.search-button')?.click()
  }
}
onMounted(() => document.addEventListener('keydown', onShortcut))
onBeforeUnmount(() => document.removeEventListener('keydown', onShortcut))
</script>

<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <AppHeader />
  <main id="main-content"><RouterView /></main>
  <AppFooter />
</template>
