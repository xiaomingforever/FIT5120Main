<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  type AgeGroup,
  type RuntimeQuestion,
  loadQuizForAge,
  labelForAgeGroup,
} from '@/services/quizCsvService'

const props = defineProps<{ age: AgeGroup }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'completed'): void }>()

const loading = ref(true)
const questions = ref<RuntimeQuestion[]>([])
const currentIndex = ref(0)
const isFlipped = ref(false)

// Image pool
const IMAGE_POOL: Record<AgeGroup, string[]> = {
  '0-1': Array.from({ length: 10 }, (_, i) => `/Learning/infant/infant${i + 1}.jpg`),
  '1-2': Array.from({ length: 10 }, (_, i) => `/Learning/toddler/toddler${i + 1}.jpg`),
  '3-5': Array.from({ length: 10 }, (_, i) => `/Learning/preschooler/preschooler${i + 1}.jpg`),
}
const FALLBACK = '/Learning/Flashcardstart.jpg'
const nunitoStyle = { fontFamily: "'Nunito', sans-serif" }

onMounted(async () => {
  try {
    questions.value = await loadQuizForAge(props.age)
    buildShuffle()
  } finally {
    loading.value = false
  }
})

const total = computed(() => questions.value.length)
const currentQ = computed(() => questions.value[currentIndex.value])
const progressPercent = computed(() =>
  total.value === 0 ? 0 : Math.round(((currentIndex.value + 1) / total.value) * 100),
)

const answerText = computed(() => {
  const q = currentQ.value
  if (!q) return ''
  return q.options.find((o) => o.key === q.correctKey)?.text ?? ''
})
const shuffledIdx = ref<number[]>([])
function buildShuffle() {
  const n = IMAGE_POOL[props.age]?.length ?? 0
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  shuffledIdx.value = arr
}

const currentImage = computed(() => {
  const pool = IMAGE_POOL[props.age] ?? []
  if (!pool.length) return FALLBACK
  const n = pool.length
  const order = shuffledIdx.value.length ? shuffledIdx.value : Array.from({ length: n }, (_, i) => i)
  const pick = order[currentIndex.value % n]
  return pool[pick] ?? FALLBACK
})

function flip() {
  isFlipped.value = !isFlipped.value
}

function next() {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++
    isFlipped.value = false
  } else {
    emit('completed')
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal">
        <!-- Header -->
        <header class="header">
          <h2 class="title">Brain Builder Flashcard: {{ labelForAgeGroup(age) }}</h2>
          <button class="icon-btn" @click="emit('close')" aria-label="Close">✕</button>
        </header>

        <!-- Body -->
        <section class="body">
          <!-- Progress -->
          <div class="progress-wrap">
            <div class="progress">
              <div class="bar" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-text">{{ currentIndex + 1 }} / {{ total }}</div>
          </div>

          <!-- Image -->
          <div class="image">
            <img :src="currentImage" alt="Flashcard visual" />
          </div>

          <!-- Flip card -->
          <div class="flip-wrap">
            <div class="flip" :class="{ flipped: isFlipped }">
              <div class="face front">
                <p class="qa">{{ currentQ?.question }}</p>
              </div>
              <div class="face back">
                <p class="qa">{{ answerText }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <button class="secondary" @click="flip">
            {{ isFlipped ? 'Show Question' : 'Flip' }}
          </button>
          <button class="primary" :disabled="loading || total === 0" @click="next">Next</button>
        </footer>

        <!-- Loading -->
        <section v-if="loading" class="loading">Loading…</section>
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
  z-index: 1000;
}
.modal {
  width: min(880px, 96vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px #00000026;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  font-family: 'Nunito', sans-serif;
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
  padding: 16px 20px;
  overflow: auto;
  display: grid;
  gap: 16px;
}
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.progress {
  flex: 1;
  height: 8px;
  background: #f2f2f2;
  border-radius: 999px;
  overflow: hidden;
}
.bar {
  height: 100%;
  background: #10b981;
}
.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 60px;
  text-align: right;
}

.image {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}
.image img {
  display: block;
  width: 100%;
  height: auto;
}

.flip-wrap {
  perspective: 1000px;
}
.flip {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s;
}
.flip.flipped {
  transform: rotateY(180deg);
}
.face {
  backface-visibility: hidden;
  position: relative;
  padding: 16px;
  border: 1px solid #eef2f1;
  border-radius: 12px;
  min-height: 80px;
}
.face.back {
  transform: rotateY(180deg);
  background: #ecfdf5;
  border-color: #d1fae5;
}
.qa {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
}

.footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}
.primary {
  appearance: none;
  border: none;
  background: #10b981;
  color: #fff;
  font-weight: 800;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}
.secondary {
  appearance: none;
  border: none;
  background: #111827;
  color: #fff;
  font-weight: 800;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

.loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #555;
}
</style>
