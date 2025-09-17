<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, Transition } from 'vue'
import { useRouter } from 'vue-router'
import CategoryCloudCard from '@/components/CategoryCloudCard.vue'
import { useProgressStore } from '@/stores/progress'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'
import type { AgeGroup } from '@/stores/Exercise'
import confetti from "canvas-confetti"
import TipsCongrats from "@/views/TipsCongrats.vue"

const router = useRouter()
const fav = useFavoritesStore()
const progress = useProgressStore()

const routineData = ref<any>(null)
const loading = ref(false)

// age and gender
const AGE_TABS: AgeGroup[] = ['0-1y', '1-3y', '3-5y']
const selectedAge = ref<AgeGroup>('1-3y')
const selectedGender = ref<'girl' | 'boy'>('girl')

const selectorTop = ref<HTMLElement | null>(null)
const erexerciseCardRef = ref<HTMLElement | null>(null)

const showBackBtn = ref(false)
const showTooltip = ref(false)

const showCongrats = ref(false)

onMounted(() => {
  const ageSaved = localStorage.getItem('age_code') as AgeGroup | null
  const genderSaved = localStorage.getItem('gender') as 'girl' | 'boy' | null
  // const routineSaved = localStorage.getItem('routine')

  if (ageSaved && AGE_TABS.includes(ageSaved)) {
    selectedAge.value = ageSaved
  }
  if (genderSaved) {
    selectedGender.value = genderSaved
  }

  // if (routineSaved) {
  //   try {
  //     routineData.value = JSON.parse(routineSaved)
  //   } catch (e) {
  //     console.error("Failed to parse routine from localStorage:", e)
  //     generateRoutine()
  //   }
  // } else {
  //   generateRoutine()
  // }
  generateRoutine()
})

async function generateRoutine() {
  loading.value = true
  try {
    const res = await fetch('https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age_code: selectedAge.value,
        gender: selectedGender.value
      })
    })
    const data = await res.json()
    if (data.routine && data.routine.length > 0) {
      routineData.value = data
      localStorage.setItem('routine', JSON.stringify(data))
      localStorage.setItem('age_code', selectedAge.value)
      localStorage.setItem('gender', selectedGender.value)
    } else {
      routineData.value = null
    }
  } catch (err) {
    console.error('Failed to generate routine:', err)
    routineData.value = null
  } finally {
    loading.value = false
  }
}

function scrollToSelector() {
  if (selectorTop.value) {
    selectorTop.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollToExerciseCard() {
  if (erexerciseCardRef.value) {
    erexerciseCardRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleScroll() {
  if (!selectorTop.value) return
  const rect = selectorTop.value.getBoundingClientRect()
  // if age selector scroll to top, display button
  showBackBtn.value = rect.top < 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function changeAge(age: AgeGroup) {
  selectedAge.value = age
  localStorage.setItem('age_code', age)
  generateRoutine()
  scrollToExerciseCard()
}

function changeGender(g: 'girl' | 'boy') {
  selectedGender.value = g
  localStorage.setItem('gender', g)
  generateRoutine()
}

const extractHttpsLink = (text: string): string | null => {
  const match = text.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

// --- favorites
const isFavorited = computed(() => {
  const act = routineData.value?.routine?.[0]?.activity
  return act ? fav.isFavorite(act.tip_id) : false
})

const toggleFavorite = () => {
  const act = routineData.value?.routine?.[0]?.activity
  if (!act) return
  fav.toggle({
    tip_id: act.tip_id,
    tip: act.tip,
    tip_des: act.tip_des,
    skills: act.skills,
    source_url: act.source,
    activityName: act.name,
    activityId: act.id,
    age_code: routineData.value.age_code,
  })
}

// --- progress
progress.load()
const completedCounts = ref<Record<string, number>>({})

onMounted(() => {
  const savedCounts = localStorage.getItem('completedCounts')
  if (savedCounts) {
    completedCounts.value = JSON.parse(savedCounts)
  }
})

const getCompletedCount = (id: string) => {
  return completedCounts.value[id] || 0
}

function handleDone(activity: any) {
  const act = routineData.value.routine[0].activity
  const id = act.id

  completedCounts.value[id] = (completedCounts.value[id] || 0) + 1
  localStorage.setItem('completedCounts', JSON.stringify(completedCounts.value))

  progress.record({
    id: act.id,
    tip: act.tip,
    activityName: act.name,
    activityId: act.id,
    age_code: routineData.value.age_code,
    skills: act.skills ?? [],
    source_url: act.source || '',
  })

  // fireworks animation
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 }, // position
  })

  setTimeout(() => {
    showCongrats.value = true
  }, 500)
}

// --- image glob
const TIP_IMAGES = import.meta.glob('../assets/Tips/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const IMAGES_B = import.meta.glob('../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const IMAGE_MAP = { ...TIP_IMAGES, ...IMAGES_B }

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-')
}
function toFileBase(name: string) {
  return slug(name)
}
// const imageUrl = computed(() => {
//   const act = routineData.value?.routine?.[0]?.activity
//   if (!act) return ''
//   const base = toFileBase(act.name)
//   const candidates = [
//     `../assets/Tips/${base}.png`,
//     `../assets/Activities/ActivityCard/${base}1.png`,
//   ]
//   for (const k of candidates) {
//     if (IMAGE_MAP[k]) return IMAGE_MAP[k]
//   } 
//   return ''
// })

function getImageUrl(actName: string) {
  const base = toFileBase(actName)
  const candidates = [
    `../assets/Tips/${base}.png`,
    `../assets/Activities/ActivityCard/${base}.png`,
  ]
  for (const k of candidates) {
    if (IMAGE_MAP[k]) return IMAGE_MAP[k]
  }
  return ''
}

const currentIndex = ref(0)

function nextCard() {
  if (routineData.value && currentIndex.value < routineData.value.routine.length - 1) {
    currentIndex.value++
  }
}

function prevCard() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<template>
  <main class="main">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Today's Tips</h1>
        <p>
          These tips are updated daily and based on your child's age group.
          Discover fun activities to boost your child's brain development.
        </p>
      </div>
    </section>

    <!-- Selector -->
    <section class="selector-hero">
      <div class="selector-hero-content">
        <h2 class="section-title">Personalize Your Tips</h2>
        <p class="selector-sub">
          Choose gender and age group to tailor activities for your child.
        </p>

        <!-- Gender + Age grouped together -->
        <div class="selectors-wrapper">
          <!-- Gender -->
          <div class="selector-group">
            <h3 class="group-title">Select Gender</h3>
            <div class="selector">
              <div :class="['selector-card', { active: selectedGender === 'girl' }]" @click="changeGender('girl')">
                <img src="/src/assets/selector page/girl.png" alt="Girl" class="icon" />
                Girl
              </div>
              <div :class="['selector-card', { active: selectedGender === 'boy' }]" @click="changeGender('boy')">
                <img src="/src/assets/selector page/boy.png" alt="Boy" class="icon" />
                Boy
              </div>
            </div>
          </div>

          <!-- Age -->
          <div class="selector-group">
            <h3 class="group-title">Choose Age Group</h3>
            <div class="selector">
              <div v-for="age in AGE_TABS" :key="age" :class="['selector-card', { active: selectedAge === age }]"
                @click="changeAge(age)">
                {{ age.replace('y', '') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Exercise Section Intro -->
    <div class="exercise-intro" ref="erexerciseCardRef">
      <h2 class="section-title">Daily Exercise Tips</h2>
      <p class="exercise-sub">
        Each card gives you a fun and simple activity designed to nurture your childs brain.
        Browse through, save favorites, and mark them as done to track progress.
      </p>
    </div>

    <!-- Exercise Card Carousel -->
    <div class="exercise-card">
      <div v-if="loading" class="loading">
        Loading activities...
      </div>

      <div v-if="routineData" class="carousel">
        <div class="carousel-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
          <div v-for="(item, index) in routineData.routine" :key="item.activity.id" class="carousel-item">
            <p style="font-size: 18px;">Age Group: {{ routineData.age_code }}, Gender: {{ routineData.gender }}</p>
            <p class="activity-name">Activity: {{ item.activity.name.toUpperCase() }}</p>

            <div class="card-header">
              <div class="tags" v-if="item.activity.skills && item.activity.skills.length">
                <span v-for="skill in item.activity.skills" :key="skill.code" class="tag">
                  {{ skill.code.toUpperCase() }}
                </span>
              </div>
              <button class="fav-btn" :aria-pressed="isFavorited"
                :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'" @click.stop="toggleFavorite">
                <img :src="isFavorited ? heartRed : heartEmpty" alt="" />
              </button>
            </div>

            <!-- title -->
            <h2 class="title" v-if="item.activity.tip">{{ item.activity.tip }}</h2>
            <!-- description -->
            <p class="desc" v-if="item.activity.tip_des">{{ item.activity.tip_des }}</p>
            <!-- Image -->
            <!-- <img class="illustration" src="/src/assets/Activities/ActivityCard/LearningTime1.png" alt="image" /> -->
            <img class="illustration" :src="getImageUrl(item.activity.name)" :alt="item.activity.name" />
            <!-- Why this matters -->
            <div class="why" v-if="item.activity.brainyBackground">
              <h3>Why this matters</h3>
              <p>{{ item.activity.brainyBackground }}</p>
            </div>
            <!-- source -->
            <div v-if="item.activity.source" class="source">
              <strong>Source: </strong>
              <span v-if="extractHttpsLink(item.activity.source)">
                <a :href="extractHttpsLink(item.activity.source)!" target="_blank" rel="noopener noreferrer">
                  View related research
                </a>
              </span>
              <span v-else>
                {{ item.activity.source }}
              </span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="carousel-controls">
          <button @click="prevCard" :disabled="currentIndex === 0">‹</button>
          <button @click="nextCard" :disabled="currentIndex === routineData.routine.length - 1">›</button>
        </div>
      </div>

      <button class="done-btn" @click="handleDone">
        Done
      </button>

      <!-- Completed times -->
      <div class="completed-times">
        <p v-if="routineData" class="complete-count">
          Completed: {{ getCompletedCount(routineData.routine[0].activity.id) }} times
        </p>
        <div class="info-wrapper" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false"
          @click="showTooltip = !showTooltip">
          <!-- info icon -->
          <span class="info-icon">ℹ️</span>

          <!-- info -->
          <transition name="fade">
            <div v-if="showTooltip" class="tooltip">
              <p>The number of times you have completed the activity, </p>
              <p>used to track progress.</p>
              <div class="tooltip-arrow"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Sidebar with Back button -->
    <Transition name="fade-slide">
      <div class="sidebar" v-if="showBackBtn">
        <button class="back-btn" @click="scrollToSelector">Back to selector↑</button>
      </div>
    </Transition>

    <!-- Exercise Section Intro -->
    <div class="exercise-intro">
      <h2 class="section-title">Browse Tips by Activity type</h2>
      <p class="exercise-sub">
        Browse tips by different activity types to discover ideas that match your child's needs.
      </p>
    </div>

    <!-- Activity Grid -->
    <CategoryCloudCard />

    <TipsCongrats v-if="showCongrats" :open="showCongrats"
      :activity-name="routineData?.routine?.[0]?.activity.name || ''"
      :activity-id="routineData?.routine?.[0]?.activity.id || ''" @close="showCongrats = false" />
  </main>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
</template>

<style scoped>
.main {
  font-family: 'Nunito', sans-serif;
  color: #333;
  background-color: #fbf6ef;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
}

.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url("../assets/hero-bg.png") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(36, 36, 36, 0.4);
  z-index: 0;
}

.hero>* {
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

.selector-hero {
  position: relative;
  width: 100%;
  padding: 0 20px;
  /* background: url("../assets/selector-hero.jpg") center/cover no-repeat; */
  text-align: center;
  margin: 0;
  font-size: 22px;
}

/* .selector-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(36, 36, 36, 0.55);
  z-index: 0;
  border-radius: 20px;
} */
.selectors-wrapper {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 30px;
}

.selector-group {
  display: flex;
  align-items: center;   
  gap: 1.5rem;             
  justify-content: center; 
  flex-wrap: wrap; 
}

.group-title {
  font-size: 1.5rem;
  color: #f97316;
  white-space: nowrap;
  margin: 0;
}
.selector {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap; 
}
.selector-card {
  background: white;
  border-radius: 16px;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 22px;
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 180px;
  margin: 0 auto;
}

.selector-card:hover {
  transform: translateY(-5px);
}

.selector-card.active {
  background: #14b8a6;
  color: white;
}

.selector-block {
  text-align: center;
  margin: 20px auto;
}

.section-title {
  color: #f97316;
  font-size: 2rem;
  margin-bottom: -10px;
}

.selector-sub {
  color: #555;
  font-size: 22px;
  margin-bottom: -10px;
}
.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.exercise-card {
  background: #fff;
  border-radius: 20px;
  margin: 10px auto;
  padding: 40px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  width: 900px;
}

.exercise-intro {
  text-align: center;
  margin-bottom: 24px;
  margin-top: 40px;
}

.exercise-intro .section-title {
  color: #f97316;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.exercise-sub {
  color: #555;
  font-size: 22px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.exercise-card .activity-name {
  font-size: 16px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 0;
  border-radius: 999px;
  width: 300px;
  text-align: center;
}

.carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.carousel-track {
  display: flex;
  transition: transform 0.4s ease-in-out;
}

.carousel-item {
  min-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  padding-top: 0;
}

.carousel-controls {
  position: absolute;
  top: 51%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
}

.carousel-controls button {
  pointer-events: all;
  background: #007070;
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
}

.carousel-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.carousel-controls button:hover {
  background: #0d9488;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  gap: 6px;
}

.fav-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 999px;
  margin-right: 40px;
}

.fav-btn img {
  width: 36px;
  height: 36px;
}

.exercise-card .tag {
  font-size: 16px;
  font-weight: 600;
  color: #007070;
  background: #eaf7f7;
  padding: 4px 8px;
  border-radius: 6px;
}

.exercise-card .title {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 12px;
}

.exercise-card .desc {
  margin-bottom: 16px;
  line-height: 1.4;
  font-size: 24px;
}

.exercise-card .illustration {
  width: 200px;
  margin: 0 auto 16px;
  display: block;
}

.exercise-card .why h3 {
  color: #007070;
  margin-bottom: 6px;
  font-size: 30px;
}

.exercise-card .why p {
  font-size: 24px;
}

.source {
  margin-top: 12px;
  font-size: 20px;
  color: #026060;
}

.source a {
  text-decoration: underline;
  color: #007070;
  font-size: 20px;
}

.source a:hover {
  color: #2e9e55;
}

.exercise-card .done-btn {
  width: 150px;
  height: 40px;
  display: block;
  margin: 20px auto 0;
  background: #007070;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.exercise-card .done-btn:hover {
  background: #0d9488
}

.completed-times {
  display: flex;
  align-items: center;
  /* gap: 6px; */
  /* position: relative; */
}

.complete-count {
  font-size: 18px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
  width: 200px;
  text-align: center;
  margin: 0 auto;
  margin-top: 10px;
}

.info-wrapper {
  position: relative;
  display: inline-block;
  right: 36%;
  margin-top: 7px;
}

.info-icon {
  cursor: pointer;
  font-size: 20px;
}

.tooltip {
  position: absolute;
  top: -320%;
  left: -20%;
  /* transform: translateX(-50%); */
  white-space: normal;
  text-align: center;
  background: #fff;
  color: #333;
  padding: 0 10px;
  border-radius: 20px;
  font-size: 16px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar container */
.sidebar {
  position: fixed;
  top: 50%;
  right: 20px;
  /* transform: translateY(-50%); */
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

/* Back button */
.back-btn {
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background 0.2s;
}

.back-btn:hover {
  background: #0d9488;
}

/* transition of enter and leave */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
