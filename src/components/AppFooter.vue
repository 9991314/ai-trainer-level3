<script setup lang="ts">
import { Github } from 'lucide-vue-next'
const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/'
</script>

<template>
  <footer class="app-footer">
    <div class="shell footer-inner">
      <div>
        <strong>人工智能刷题平台</strong>
        <p>少走一点弯路，多刷一道会做的题。</p>
      </div>
      <nav aria-label="页脚导航">
        <RouterLink to="/about">关于项目</RouterLink>
        <RouterLink to="/resources">学习资料</RouterLink>
        <a :href="githubUrl" target="_blank" rel="noopener noreferrer"><Github :size="15" /> GitHub</a>
      </nav>
      <small>免费、开放、持续完善 · 内容仅供备考学习</small>
    </div>
  </footer>
</template>
