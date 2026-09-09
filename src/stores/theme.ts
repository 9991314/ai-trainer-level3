import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('ai-trainer-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = ref(stored ? stored === 'dark' : prefersDark)

  function apply() {
    document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
    document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark.value ? '#101113' : '#f7f8fa')
  }

  function toggle() { isDark.value = !isDark.value }
  watch(isDark, () => {
    localStorage.setItem('ai-trainer-theme', isDark.value ? 'dark' : 'light')
    apply()
  })
  apply()

  return { isDark, toggle }
})
