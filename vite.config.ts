import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // The question bank is intentionally isolated and compresses to about 85 kB.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          markdown: ['marked'],
          questionBank: ['./src/data/questions/level3.json'],
        },
      },
    },
  },
})
