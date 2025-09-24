<script setup lang="ts">
import QuizzesAgeSelector from '@/components/LearningModal/QuizzesAgeSelector.vue'
import QuizModal from '@/components/LearningModal/QuizModal.vue'
import FlashCardModal from '@/components/LearningModal/FlashCardModal.vue'
import FlashCardSummaryModal from '@/components/LearningModal/FlashCardSummaryModal.vue'
import { ref } from 'vue'
import { QUIZ_AGE_IMAGES } from '@/services/quizCsvService'
import type { AgeGroup } from '@/services/quizCsvService'
import { useRouter } from 'vue-router'

const showAgeSelector = ref(false)
const showQuiz = ref(false)
const showFlashcards = ref(false)
const showSummary = ref(false)
const selectedAge = ref<AgeGroup | null>(null)
const ageSelectorMode = ref<'flashcards' | 'quiz' | null>(null)

const ageTarget = ref<'quiz' | 'flashcards' | null>(null)

function showAgeSelectorFor(mode: 'flashcards' | 'quiz') {
  ageSelectorMode.value = mode
  showAgeSelector.value = true
}

function openFlashcards() {
  ageTarget.value = 'flashcards'
  showAgeSelector.value = true
}

function openQuizzes() {
  ageTarget.value = 'quiz'
  showAgeSelector.value = true
}

function onAgeChosen(age: '0-1' | '1-2' | '3-5') {
  selectedAge.value = age
  showAgeSelector.value = false
  if (ageTarget.value === 'quiz') {showQuiz.value = true}
  else if (ageTarget.value === 'flashcards') {showFlashcards.value = true}
}
function goToQuizAgeSelector() {
  showAgeSelectorFor('quiz')
}

function closeAgeSelector() {
  showAgeSelector.value = false
  ageSelectorMode.value = null
}

// function handleAgeStart(age: AgeGroup) {
//   selectedAge.value = age
//   showAgeSelector.value = false
//   showSummary.value = false

//   if (ageSelectorMode.value === 'flashcards') {
//     showFlashcards.value = true
//     showQuiz.value = false
//   } else if (ageSelectorMode.value === 'quiz') {
//     showQuiz.value = true
//     showFlashcards.value = false
//   }

//   ageSelectorMode.value = null
// }

function onFlashcardsCompleted() {
  showFlashcards.value = false
  showSummary.value = true
}
function onSummaryTakeQuiz() {
  showSummary.value = false
  ageTarget.value = 'quiz'
  showAgeSelector.value = true
}
function goToAgeSelector() {
  showQuiz.value = false
  selectedAge.value = null
  showAgeSelector.value = true
}
function restartFlashcards() {
  showSummary.value = false
  showFlashcards.value = false
  requestAnimationFrame(() => {
    showFlashcards.value = true
  })
}

</script>


<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Learning</h1>
      <p>Learn key tips with flashcards. Take short quizzes to check memory and understanding.</p>
    </div>
  </section>

  <section class="learning-start">
    <h1 class="title">Start your learning</h1>

    <div class="cards">
      <!-- Flashcards -->
      <div
        class="card"
        role="button"
        tabindex="0"
        @click.stop="openFlashcards"
        @keydown.enter.prevent="openFlashcards"
        @keydown.space.prevent="openFlashcards"
      >
        <div class="media">
          <img
            class="media-img"
            src="/Learning/Flashcardstart.jpg"
            alt="Flashcards preview"
          />
        </div>
        <div class="body">
          <h2>Flashcards</h2>
          <p>Flip cards to learn the essentials for each age group.</p>
          <!-- <button class="cta" >Start</button> -->
        </div>
      </div>

      <!-- Quizzes -->
      <div
        class="card"
        role="button"
        tabindex="0"
        @click="openQuizzes"
        @keydown.enter.prevent="openQuizzes"
        @keydown.space.prevent="openQuizzes"
      >
        <div class="media">
          <img class="media-img" src="/Learning/QuizStart.jpg" alt="Quizzes preview" />
        </div>
        <div class="body">
          <h2>Quizzes</h2>
          <p>10 questions • 4 choices • 5-7 min.</p>
          <!-- <button class="cta">Start</button> -->
        </div>
      </div>
    </div>

    <QuizzesAgeSelector
      v-if="showAgeSelector"
      :open="showAgeSelector"
      @close="closeAgeSelector"
      @start="onAgeChosen"
      :infant-img="QUIZ_AGE_IMAGES['0-1']"
      :toddler-img="QUIZ_AGE_IMAGES['1-2']"
      :preschooler-img="QUIZ_AGE_IMAGES['3-5']"
    />
    <FlashCardModal
      v-if="selectedAge && showFlashcards"
    :age="selectedAge"
    @close="showFlashcards = false"
    @completed="onFlashcardsCompleted"
    />

    <FlashCardSummaryModal
      v-if="showSummary && selectedAge"
      :age="selectedAge"
      :total="10"
      @review="restartFlashcards"
      @take-quiz="onSummaryTakeQuiz"

      @done="showSummary = false"
    />

    <QuizModal
      v-if="selectedAge"
      :open="showQuiz"
      :age-group="selectedAge"
      @close="showQuiz = false"
      @retry="goToAgeSelector"
    />
  </section>
</template>

<style scoped>
/* HERO CARD */
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url('../assets/learningstart-hero.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  color: #333;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #24242466;
  z-index: 0;
}
.hero > * {
  position: relative;
  z-index: 1;
}
.hero-content {
  position: relative;
  color: white;
  max-width: 700px;
  margin: 20px;
}
.hero h1 {
  font-size: 3.5rem;
}
.hero p {
  margin-bottom: 1.5rem;
  font-size: 26px;
  font-weight: 500;
}

.learning-start {
  padding: 2.5rem 1rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}
.title {
  text-align: center;
  font-weight: 800;
  line-height: 1.1;
  font-size: clamp(2.25rem, 4.6vw, 3.5rem);
  color: #f59e0b;
  margin: 0 0 1.75rem;
  letter-spacing: 0.2px;
}

/* Layout */
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 900px) {
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}

/* Card */
.card {
  background: var(--surface, #fff);
  border-radius: 16px;
  box-shadow: var(--card-shadow, 0 2px 0 #00000005, 0 10px 24px rgba(0, 0, #0000000f));
  border: 1px solid var(--border, #e5e7eb);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
  outline: none;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 2px 0 #00000005,
    0 14px 32px #0000001f;
}
.card:focus-visible {
  box-shadow:
    0 0 0 3px #f59e0b59,
    var(--card-shadow, 0 10px 24px #0000000f);
}

/* Top media areas */
.media {
  overflow: hidden;
  background: transparent;
}
.media-img {
  display: block;
  width: 100%;
  height: 190px;
  object-fit: cover;
}
@media (min-width: 900px) {
  .media-img {
    height: 210px;
  }
}

/* Body */
.body {
  padding: 1.25rem 1.25rem 1.5rem;
  background: var(--surface, #fff);
}
.body h2 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  line-height: 1.3;
}
.body p {
  margin: 0 0 1rem;
  color: #000000bf;
  font-size: 0.98rem;
}

/* CTA button */
.cta {
  appearance: none;
  border: none;
  background: #f59e0b;
  color: #fff;
  font-weight: 700;
  border-radius: 9999px;
  padding: 0.6rem 1.1rem;
  box-shadow: 0 4px 10px #f59e0b59;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
}
</style>
