<script setup lang="ts">
import { labelForAgeGroup, type AgeGroup } from '@/services/quizCsvService'

const props = defineProps<{ total: number; age: AgeGroup }>()
const emit = defineEmits<{ (e: 'review'): void; (e: 'take-quiz'): void; (e: 'done'): void }>()

const nunitoStyle = { fontFamily: "'Nunito', sans-serif" }
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('done')">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Flashcard Summary">
        <header class="header">
          <h3 class="title">All done!</h3>
          <button class="icon-btn" @click="emit('done')" aria-label="Close">✕</button>
        </header>

        <section class="body">
          <p class="subtitle">
            You’ve viewed {{ total }} flashcards for {{ labelForAgeGroup(age) }}.
          </p>

          <div class="actions">
            <button class="btn dark" @click="emit('review')">Review (restart)</button>
            <button class="btn primary" @click="emit('take-quiz')">Take the quiz</button>
            <button class="btn ghost" @click="emit('done')">Done</button>
          </div>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: #0008;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1100;
}
.modal {
  width: min(560px, 96vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px #00000026;
  font-family: 'Nunito', sans-serif;
  overflow: hidden;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}
.icon-btn {
  appearance: none;
  border: none;
  background: #eee;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.body {
  padding: 20px;
  display: grid;
  gap: 16px;
}
.subtitle {
  margin: 0;
  color: #333;
  font-weight: 600;
}
.actions {
  display: grid;
  gap: 10px;
}

.btn {
  appearance: none;
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}
.btn.primary {
  background: #10b981;
  color: #fff;
}
.btn.dark {
  background: #111827;
  color: #fff;
}
.btn.ghost {
  background: #fff;
  color: #111827;
  border: 1px solid #ddd;
  font-weight: 700;
}
</style>
