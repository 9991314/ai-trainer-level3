<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, Check, Cloud, Copy, Download, FileArchive, PackageOpen } from 'lucide-vue-next'
import resourcesData from '@/data/resources.json'
import type { ResourceItem } from '@/types'
import { copyText } from '@/utils/clipboard'

const resources = resourcesData as ResourceItem[]
const copiedId = ref('')

async function copyCode(item: ResourceItem) {
  if (!item.code) return
  await copyText(item.code)
  copiedId.value = item.id
  window.setTimeout(() => { copiedId.value = '' }, 1600)
}

function iconFor(type: ResourceItem['type']) {
  if (type === 'baidu') return Cloud
  if (type === 'tool') return PackageOpen
  return FileArchive
}
</script>

<template>
  <div class="page-shell shell">
    <header class="page-intro resources-intro"><p class="eyebrow">RESOURCES & TOOLS</p><h1>资料放对地方，<br>需要时就能找到。</h1><p>视频不在网页内播放，大型工具也不塞进网站构建包。统一通过安全的外部入口获取，提取码可以一键复制。</p></header>

    <aside class="resource-safety"><Download :size="19" /><p><strong>下载建议：</strong>大型资料优先转存到个人网盘；安装工具前检查文件来源，并使用系统安全软件扫描。</p></aside>

    <section class="resource-list">
      <article v-for="item in resources" :key="item.id">
        <div class="resource-icon"><component :is="iconFor(item.type)" :size="22" /></div>
        <div class="resource-copy"><div><span>{{ item.session === 'morning' ? '上午理论' : item.session === 'afternoon' ? '下午实操' : '综合资料' }}</span><span>{{ item.size }}</span><span>更新于 {{ item.updatedAt }}</span></div><h2>{{ item.title }}</h2><p>{{ item.description }}</p><ul><li v-for="tag in item.tags" :key="tag">{{ tag }}</li></ul></div>
        <div v-if="item.status !== 'coming-soon'" class="resource-actions">
          <button v-if="item.code" type="button" class="code-copy" @click="copyCode(item)"><span>提取码 <strong>{{ item.code }}</strong></span><span><Check v-if="copiedId === item.id" :size="15" /><Copy v-else :size="15" />{{ copiedId === item.id ? '已复制' : '复制' }}</span></button>
          <a v-if="item.url" class="button primary" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.type === 'tool' ? '打开工具包' : '前往百度网盘' }} <ArrowUpRight :size="16" /></a>
        </div>
        <div v-else class="coming-soon"><span>即将提供</span><p>独立下载地址与文件校验信息正在整理。</p></div>
      </article>
    </section>
  </div>
</template>
