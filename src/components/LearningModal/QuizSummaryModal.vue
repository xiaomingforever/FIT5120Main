<script setup lang="ts">
import { computed } from 'vue'
import { labelForAgeGroup } from '@/services/quizCsvService.ts'

const props = defineProps<{
  open: boolean
  score: number
  total: number
  durationMs: number
  ageGroup: '0-1' | '1-2' | '3-5'
}>()

const label = computed(() => labelForAgeGroup(props.ageGroup))
const encouragement = computed(() => {
  const pct = (props.score / Math.max(props.total, 1)) * 100
  if (props.score <= 4) return 'You can do better!'
  if (props.score <= 7) return 'You will be there!'
  return 'Great job!'
})

function prettyMs(ms: number) {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="$emit('done')">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Quiz Summary">
        <header class="header">
          <h2 class="title">Brain Builder Quiz — Summary</h2>
          <button class="icon-btn" @click="$emit('done')" aria-label="Close">✕</button>
        </header>
        <section class="body">
          <div class="score">{{ score }} / {{ total }}</div>
          <div class="encouragement">{{ encouragement }}</div>
          <div class="meta">
            <div><strong>Age group:</strong> {{ label }}</div>
            <div><strong>Time spent:</strong> {{ prettyMs(durationMs) }}</div>
          </div>
        </section>
        <footer class="footer">
          <button class="ghost" @click="$emit('retry')">Retry</button>
          <button class="primary" @click="$emit('done')">Done</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>



<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: #00000080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1001;
}
.modal {
  width: min(680px, 96vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px #00000033;
  display: flex;
  flex-direction: column;
  font-family: 'Nunito', sans-serif;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}
.title {
  font-size: 22px;
  font-weight: 700;
}
.body {
  padding: 24px;
  display: grid;
  gap: 12px;
}
.score {
  font-size: 34px;
  font-weight: 800;
}
.encouragement {
  font-size: 18px;
}
.meta {
  color: #555;
  display: grid;
  gap: 6px;
}
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}
.primary {
  background: #ffb800;
  border: none;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}
.ghost {
  background: #fff;
  border: 1px solid #ddd;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}
</style>
