<template>
  <Teleport to="body">
    <div v-if="open" v-show="!showSummary" class="overlay" @click.self="requestClose">
      <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
        <!-- Header -->
        <header class="header">
          <h2 class="title">{{ title }}</h2>
          <button class="icon-btn" @click="requestClose" aria-label="Close">✕</button>
        </header>

        <!-- Body -->
        <section v-if="loaded && !showSummary" class="body">
          <!-- Hero image-->
          <div v-if="ageImage" class="age-hero">
            <img :src="ageImage" :alt="`Quiz for ${labelForAgeGroup(props.ageGroup)}`" />
          </div>
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
                <!-- tick or cross -->
                <span class="mark" v-if="locked && (showTick(opt.key) || showCross(opt.key))">
                  <img :src="showTick(opt.key) ? marks.tick : marks.cross" alt="" />
                </span>
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
          @retry="onRetry"
          @done="onClose"
        />
      </div>
    </div>

    <!-- Exit confirmation modal -->
    <div v-if="showExitConfirm" class="confirm-overlay" @click.self="cancelExit">
      <div class="confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm exit">
        <header class="confirm-header">
          <h3 class="confirm-title">Exit the quiz?</h3>
        </header>
        <div class="confirm-body">
          <p>Your current progress ({{ answered }}/{{ total }}) will be lost.</p>
        </div>
        <footer class="confirm-footer">
          <button class="btn-secondary" @click="cancelExit">Cancel</button>
          <button class="btn-primary" @click="confirmExit">OK</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import QuizSummaryModal from './QuizSummaryModal.vue'
import {
  loadQuizForAge,
  type RuntimeQuestion,
  labelForAgeGroup,
  QUIZ_AGE_IMAGES,
  QUIZ_MARKS,
} from '@/services/quizCsvService'

const props = defineProps<{
  open: boolean
  ageGroup: '0-1' | '1-2' | '3-5'
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'retry'): void
}>()

// state
const ageImage = computed(() => QUIZ_AGE_IMAGES[props.ageGroup] || '')
const marks = QUIZ_MARKS
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
  total.value === 0 ? 0 : Math.round(((currentIndex.value + 1) / total.value) * 100),
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
// when to show tick/cross
function showTick(key: 'a' | 'b' | 'c') {
  const q = currentQ.value
  return !!(locked.value && q && key === q.correctKey)
}

function showCross(key: 'a' | 'b' | 'c') {
  const q = currentQ.value
  // show a cross only on the wrong option
  return !!(locked.value && q && selectedKey.value === key && key !== q.correctKey)
}

function onRetry() {
  emit('retry')
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
// If the quiz is still in progress, confirm before closing
const showExitConfirm = ref(false)
const answered = computed(

  () => currentIndex.value + (locked.value ? 1 : 0),
)
function requestClose() {

  if (!showSummary.value) {
    showExitConfirm.value = true
    return
  }
  emit('close')
}

function cancelExit() {
  showExitConfirm.value = false
}

function confirmExit() {
  showExitConfirm.value = false
  emit('close')
}
</script>

<style scoped>
/* basic modal */
.overlay {
  position: fixed;
  inset: 0;
  background: #00000080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 3000; /* Headbar: 2000 */
}
.modal {
  width: min(880px, 96vw);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px #00000033;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  font-family: 'Nunito', sans-serif;
}
.age-hero img {
  width: 33%;
  height: 90%;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
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
  align-items: center;
  cursor: pointer;
}
.option .text {
  flex: 1;
} /* push the mark to the right */
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
.option .mark {
  display: inline-flex;
  width: 24px;
  height: 24px;
}
.option .mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
/* Exit confirmation modal */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 4000;
  display: grid;
  place-items: center;
  padding: 16px;

}

.confirm-modal {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  font-family: 'Nunito', sans-serif;
}

.confirm-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}
.confirm-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.confirm-body {
  padding: 16px 20px;
}

.confirm-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 12px 16px 16px;
}

.btn-secondary,
.btn-primary {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: #f2f2f2;
}
.btn-primary {
  background: #ffb800;
}
</style>
