import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, _from, saved) => saved ?? (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/HomePage.vue'), meta: { title: '人工智能刷题平台 - 人工智能训练师考试刷题与学习' } },
    { path: '/practice', name: 'practice', component: () => import('@/pages/PracticeHubPage.vue'), meta: { title: '刷题 - 人工智能训练师三级' } },
    { path: '/practice/:session', name: 'practice-session', component: () => import('@/pages/PracticeSessionPage.vue'), meta: { title: '在线刷题 - 人工智能训练师三级' } },
    { path: '/exam', name: 'exam', component: () => import('@/pages/ExamPage.vue'), meta: { title: '模拟考试 - 人工智能训练师三级' } },
    { path: '/wrong-book', name: 'wrong-book', component: () => import('@/pages/WrongBookPage.vue'), meta: { title: '错题本 - 人工智能刷题平台' } },
    { path: '/knowledge', name: 'knowledge', component: () => import('@/pages/KnowledgeIndexPage.vue'), meta: { title: '知识库 - 人工智能训练师考试' } },
    { path: '/knowledge/:slug', name: 'knowledge-article', component: () => import('@/pages/KnowledgeArticlePage.vue') },
    { path: '/flashcards', name: 'flashcards', component: () => import('@/pages/FlashcardsPage.vue'), meta: { title: '考前速记 - 人工智能训练师三级' } },
    { path: '/resources', name: 'resources', component: () => import('@/pages/ResourcesPage.vue'), meta: { title: '学习资料与工具下载 - 人工智能训练师' } },
    { path: '/about', name: 'about', component: () => import('@/pages/AboutPage.vue'), meta: { title: '关于项目 - 人工智能刷题平台' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? '人工智能刷题平台'
})

export default router
