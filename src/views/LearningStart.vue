<script setup lang="ts">
import QuizzesAgeSelector from '@/components/LearningModal/QuizzesAgeSelector.vue'
import QuizModal from '@/components/LearningModal/QuizModal.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showAgeSelector = ref(false)
const showQuiz = ref(false)
const showAgeModal = ref(false)
const selectedAge = ref<'0-1' | '1-2' | '3-5' | null>(null)
const openAgeModal = () => {
  showAgeModal.value = true
}
// const closeAgeModal = () => {
//   showAgeModal.value = false
// }

function openQuizzes() {
  showAgeSelector.value = true
}
function startQuiz(age: '0-1' | '1-2' | '3-5') {
  selectedAge.value = age
  showAgeSelector.value = false
  showQuiz.value = true
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
        @click="openAgeModal"
        @keydown.enter.prevent="openAgeModal"
        @keydown.space.prevent="openAgeModal"
      >
        <div class="media">
          <img
            class="media-img"
            src="/public/Learning/Flashcardstart.jpg"
            alt="Flashcards preview"
          />
        </div>
        <div class="body">
          <h2>Flashcards</h2>
          <p>Flip cards to learn the essentials for each age group.</p>
          <button class="cta" @click.stop="openAgeModal">Start</button>
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
          <img class="media-img" src="/public/Learning/QuizStart.jpg" alt="Quizzes preview" />
        </div>
        <div class="body">
          <h2>Quizzes</h2>
          <p>10 questions • 4 choices • 5-7 min.</p>
          <button class="cta">Start</button>
        </div>
      </div>
    </div>

    <QuizzesAgeSelector
      :open="showAgeSelector"
      @close="showAgeSelector = false"
      @start="startQuiz"
      infant-img="/public/Learning/Infant.jpg"
      toddler-img="/public/Learning/Toddler.jpg"
      preschooler-img="/public/Learning/Preschooler.jpg"
    />

    <QuizModal
      v-if="selectedAge"
      :open="showQuiz"
      :age-group="selectedAge"
      @close="showQuiz = false"
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
