<script setup lang="ts">
import { ArrowUpRight, Github, HeartHandshake, Route, ShieldCheck } from 'lucide-vue-next'
const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/'
</script>

<template>
  <div class="page-shell shell about-page">
    <header class="about-hero"><p class="eyebrow">ABOUT THIS PROJECT</p><h1>少走一点弯路，<br><em>多刷一道会做的题。</em></h1><p>这个项目来自人工智能训练师三级备考过程中整理的资料。它不卖课、不做广告，只想把零散经验变成后来者能直接使用的学习工具。</p></header>
    <section class="about-principles">
      <article><HeartHandshake :size="22" /><span><strong>免费开放</strong><p>题库结构、知识文章和产品代码都适合公开协作。</p></span></article>
      <article><Route :size="22" /><span><strong>学习闭环</strong><p>知识、练题、错题和复习互相连接，不做资料堆砌。</p></span></article>
      <article><ShieldCheck :size="22" /><span><strong>尊重来源</strong><p>资料仅用于备考学习，外部资源保持来源说明和安全跳转。</p></span></article>
    </section>
    <section class="about-story"><p class="eyebrow">WHY</p><div><h2>整理资料花掉的时间，下一位考生不该再花一次。</h2><p>人工智能训练师考试同时包含理论与实操，信息分散在课程、文档、题库和工具中。这个平台把它们重新组织成可检索、可练习、可复盘的结构，后续会持续校对并扩充题库与知识文章。</p></div></section>
    <section class="contribute-section"><div><p class="eyebrow">CONTRIBUTE</p><h2>这会是一份持续生长的公共笔记。</h2><p>欢迎贡献勘误、解析、知识文章和地区考情。提交前请隐去个人信息，并确认内容可以公开分享。</p></div><a class="button primary" :href="githubUrl" target="_blank" rel="noopener noreferrer"><Github :size="17" /> 前往 GitHub <ArrowUpRight :size="16" /></a></section>
    <aside class="disclaimer"><strong>免责声明</strong><p>本项目不是官方考试机构，不保证内容覆盖全部考点。考试政策与要求可能变化，请以当地鉴定机构发布的最新通知为准。</p></aside>
  </div>
</template>
