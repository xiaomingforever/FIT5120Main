<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="onClose">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <!-- Header -->
        <header class="header">
          <h2 class="title">{{ title }}</h2>
          <button class="icon-btn" @click="onClose" aria-label="Close">✕</button>
        </header>

        <!-- Body -->
        <section v-if="loaded && !showSummary" class="body">
          <!-- Progress -->
          <div class="progress-wrap">
            <div class="progress">
              <div class="bar" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="progress-text">Question {{ currentIndex + 1 }} / {{ total }}</div>
          </div>

          <!-- Question -->
          <div class="question">{{ currentQ.question }}</div>

          <!-- Options -->
          <ul class="options">
            <li v-for="opt in currentQ.options" :key="opt.key">
              <button
                class="option"
                :class="optionClass(opt.key)"
                :disabled="locked"
                @click="select(opt.key)"
              >
                <span class="key">{{ opt.key.toUpperCase() }})</span>
                <span class="text">{{ opt.text }}</span>
              </button>
            </li>
          </ul>

          <!-- Feedback -->
          <Transition name="fade">
            <div v-if="locked" class="feedback" :class="{ correct: isCorrect, wrong: !isCorrect }">
              <strong v-if="isCorrect"></strong>
              <strong v-else></strong>
              <span class="msg">{{ feedbackMsg }}</span>
            </div>
          </Transition>
        </section>

        <!-- Loading state -->
        <section v-else-if="!loaded && !loadError" class="loading">Loading quiz...</section>
        <section v-else-if="loadError" class="error">{{ loadError }}</section>

        <!-- Footer -->
        <footer v-if="open" class="footer">
          <button class="primary" :disabled="!locked" @click="next">{{ nextLabel }}</button>
        </footer>

        <!-- Summary Modal -->
        <QuizSummaryModal
          v-if="showSummary"
          :open="showSummary"
          :age-group="ageGroup"
          :score="score"
          :total="total"
          :duration-ms="elapsedMs"
          @retry="retry"
          @done="onClose"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QuizSummaryModal from './QuizSummaryModal.vue'
import { loadQuizForAge, type RuntimeQuestion, labelForAgeGroup } from '@/services/quizCsvService'

const props = defineProps<{
  open: boolean
  ageGroup: '0-1' | '1-2' | '3-5'
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

// state
const loaded = ref(false)
const loadError = ref<string | null>(null)
const questions = ref<RuntimeQuestion[]>([])
const total = computed(() => questions.value.length)
const currentIndex = ref(0)
const selectedKey = ref<'a' | 'b' | 'c' | null>(null)
const locked = ref(false) // once a choice is made
const score = ref(0)
const startTs = ref<number | null>(null)
const showSummary = ref(false)

const title = computed(() => `Brain Builder Quiz: ${labelForAgeGroup(props.ageGroup)}`)
const currentQ = computed(() => questions.value[currentIndex.value])
const isCorrect = computed(() => selectedKey.value === currentQ.value?.correctKey)
const feedbackMsg = computed(() => {
  const q = currentQ.value
  if (!q || !selectedKey.value) return ''
  if (selectedKey.value === q.correctKey) return q.feedback.correct
  return q.feedback[selectedKey.value]
})
const progressPct = computed(() =>
  Math.round((currentIndex.value / Math.max(total.value, 1)) * 100),
)
const nextLabel = computed(() => (currentIndex.value + 1 === total.value ? 'See summary' : 'Next'))
const elapsedMs = computed(() => (startTs.value ? Date.now() - startTs.value : 0))

function optionClass(key: 'a' | 'b' | 'c') {
  if (!locked.value) return ''
  const q = currentQ.value
  if (!q) return ''
  return {
    selected: selectedKey.value === key,
    correct: key === q.correctKey,
    wrong: selectedKey.value === key && key !== q.correctKey,
  }
}

async function init() {
  try {
    loaded.value = false
    loadError.value = null
    startTs.value = Date.now()
    questions.value = await loadQuizForAge(props.ageGroup)
    currentIndex.value = 0
    selectedKey.value = null
    locked.value = false
    score.value = 0
    showSummary.value = false
    loaded.value = true
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load quiz file.'
  }
}

function select(key: 'a' | 'b' | 'c') {
  if (locked.value) return
  selectedKey.value = key
  locked.value = true
  if (isCorrect.value) score.value += 1
}

function next() {
  if (!locked.value) return
  if (currentIndex.value + 1 >= total.value) {
    showSummary.value = true
    return
  }
  currentIndex.value += 1
  selectedKey.value = null
  locked.value = false
}

function retry() {
  init()
}

function onClose() {
  emit('close')
}

watch(
  () => props.open,
  (v) => {
    if (v) init()
  },
)

onMounted(() => {
  if (props.open) init()
})
</script>

<style scoped>
/* basic modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 92vh;
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
.icon-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
.body {
  padding: 24px;
  overflow: auto;
}
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
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
  background: #0077ff;
}
.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 120px;
  text-align: right;
}
.question {
  font-size: 20px;
  font-weight: 600;
  margin: 8px 0 16px;
}
.options {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}
.option {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e6e6e6;
  background: #fff;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  cursor: pointer;
}
.option:hover {
  border-color: #d0d0d0;
}
.option .key {
  font-weight: 700;
  width: 28px;
}
.option.correct {
  border-color: #2ecc71;
  background: #ecf9f1;
}
.option.wrong {
  border-color: #ff6b6b;
  background: #fff1f1;
}
.option.selected {
  box-shadow: inset 0 0 0 2px #0077ff;
}
.feedback {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  background: #fafafa;
  display: flex;
  gap: 10px;
  align-items: center;
}
.feedback.correct {
  border-color: #2ecc71;
  background: #ecf9f1;
}
.feedback.wrong {
  border-color: #ff6b6b;
  background: #fff1f1;
}
.loading,
.error {
  padding: 24px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
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
.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
