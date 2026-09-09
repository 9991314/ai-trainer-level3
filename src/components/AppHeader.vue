<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Github, Menu, Moon, Search, Sun, X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import SearchDialog from './SearchDialog.vue'

const route = useRoute()
const theme = useThemeStore()
const mobileOpen = ref(false)
const searchOpen = ref(false)
const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/'

const nav = [
  { label: '首页', to: '/' },
  { label: '刷题', to: '/practice' },
  { label: '模拟考试', to: '/exam' },
  { label: '错题本', to: '/wrong-book' },
  { label: '知识库', to: '/knowledge' },
  { label: '学习资料', to: '/resources' },
  { label: '关于项目', to: '/about' },
]

function active(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner shell">
      <RouterLink class="brand" to="/" aria-label="人工智能刷题平台首页">
        <span class="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span class="brand-copy"><strong>人工智能刷题平台</strong><small>AI TRAINER · LEVEL 3</small></span>
      </RouterLink>

      <nav class="desktop-nav" aria-label="主导航">
        <RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: active(item.to) }">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <button class="icon-button search-button" type="button" aria-label="搜索，快捷键 Ctrl K" @click="searchOpen = true">
          <Search :size="18" /> <kbd>Ctrl K</kbd>
        </button>
        <button class="icon-button" type="button" :aria-label="theme.isDark ? '切换到浅色模式' : '切换到深色模式'" @click="theme.toggle">
          <Sun v-if="theme.isDark" :size="18" />
          <Moon v-else :size="18" />
        </button>
        <a class="icon-button desktop-only" :href="githubUrl" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 项目">
          <Github :size="18" />
        </a>
        <button class="icon-button mobile-menu-button" type="button" :aria-expanded="mobileOpen" :aria-label="mobileOpen ? '关闭导航' : '打开导航'" @click="mobileOpen = !mobileOpen">
          <X v-if="mobileOpen" :size="20" /><Menu v-else :size="20" />
        </button>
      </div>
    </div>

    <nav v-if="mobileOpen" class="mobile-nav" aria-label="移动端主导航">
      <RouterLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: active(item.to) }" @click="mobileOpen = false">
        {{ item.label }}
      </RouterLink>
      <a :href="githubUrl" target="_blank" rel="noopener noreferrer"><Github :size="17" /> GitHub 项目</a>
    </nav>
  </header>
  <SearchDialog v-if="searchOpen" @close="searchOpen = false" />
</template>
