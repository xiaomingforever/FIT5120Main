<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CategoryCloudCard from '@/components/CategoryCloudCard.vue'
import { useProgressStore } from '@/stores/progress'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'
import type { AgeGroup } from '@/stores/Exercise'
import confetti from "canvas-confetti"
import TipsCongrats from "@/views/TipsCongrats.vue"
import TipModal from '@/components/TipModal.vue'

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
const showCongrats = ref(false)

// Daily update countdown
const timeUntilReset = ref('')
let countdownInterval: number | null = null

// Modal state
const showTip = ref(false)
const selectedTip = ref<any | null>(null)

// Calculate time until midnight
function updateCountdown() {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  
  const diff = midnight.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  timeUntilReset.value = `${hours}h ${minutes}m ${seconds}s`
}

// Check if tips need refresh (new day)
function shouldRefreshTips(): boolean {
  const savedDate = localStorage.getItem('tips_date')
  const today = new Date().toISOString().split('T')[0]
  return savedDate !== today
}

// Load tips from cache or API
async function loadTips() {
  if (shouldRefreshTips()) {
    console.log('New day detected, fetching new tips...')
    await generateRoutine()
  } else {
    console.log('Loading cached tips...')
    const cached = localStorage.getItem('routine')
    if (cached) {
      try {
        routineData.value = JSON.parse(cached)
        console.log('Loaded cached routine:', routineData.value)
      } catch (e) {
        console.error('Failed to parse cached routine:', e)
        await generateRoutine()
      }
    } else {
      console.log('No cache found, fetching tips...')
      await generateRoutine()
    }
  }
}

onMounted(async () => {
  const ageSaved = localStorage.getItem('age_code') as AgeGroup | null
  const genderSaved = localStorage.getItem('gender') as 'girl' | 'boy' | null

  if (ageSaved && AGE_TABS.includes(ageSaved)) {
    selectedAge.value = ageSaved
  }
  if (genderSaved) {
    selectedGender.value = genderSaved
  }
  
  // Load tips
  await loadTips()
  
  // Start countdown
  updateCountdown()
  countdownInterval = window.setInterval(updateCountdown, 1000)
  
  // Listen for scroll
  window.addEventListener('scroll', handleScroll)
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
      // Save today's date
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('tips_date', today)
      console.log('Saved new routine with date:', today)
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
  showBackBtn.value = rect.top < 0
}

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
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

// favorites
const isFavorited = (tipId: string | number) => {
  return fav.isFavorite(tipId)
}

const toggleFavorite = (item: any) => {
  const act = item.activity
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

// progress
progress.load()
const completedCounts = ref<Record<string, number>>({})

onMounted(() => {
  const savedCounts = localStorage.getItem('completedCounts')
  if (savedCounts) {
    completedCounts.value = JSON.parse(savedCounts)
  }
})

const getCompletedCount = (id: string) => {
  const savedCounts = JSON.parse(localStorage.getItem('completedCounts') || '{}')
  return savedCounts[id] || 0
}

const todayKey = new Date().toISOString().split('T')[0]

function getTipCount(id: string | number) {
  const records = JSON.parse(localStorage.getItem('tipDailyCounts') || '{}')
  const todayKey = new Date().toISOString().split('T')[0]
  const entry = records[id]
  return entry && entry.date === todayKey ? entry.count : 0
}

function handleDone(item: any) {
  const act = item.activity
  const id = act.tip_id
  const records = JSON.parse(localStorage.getItem('tipDailyCounts') || '{}')
  let entry = records[id] || { date: todayKey, count: 0 }

  completedCounts.value[id] = (completedCounts.value[id] || 0) + 1
  localStorage.setItem('completedCounts', JSON.stringify(completedCounts.value))

  if (entry.date !== todayKey) {
    entry = { date: todayKey, count: 0 }
  }

  if (entry.count >= 2) {
    alert("Each tip can only be completed twice per day. You cannot complete it again today.")
    return
  }

  if (entry.count === 1) {
    const confirmAgain = confirm("You have already completed this tip once today. Do you want to complete it again?")
    if (!confirmAgain) return
  }

  entry.count++
  records[id] = entry
  localStorage.setItem('tipDailyCounts', JSON.stringify(records))

  progress.record({
    id: act.tip_id,
    tip: act.tip,
    tip_des: act.tip_des,
    activityName: act.name,
    activityId: act.id,
    age_code: routineData.value.age_code,
    skills: act.skills ?? [],
    source_url: act.source || '',
    completedAt: new Date().toISOString(),
  })

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
  })

  setTimeout(() => {
    showCongrats.value = true
  }, 500)
  
  closeTip()
}

// image handling
const TIP_IMAGES = import.meta.glob('../assets/TipsDisplay/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function slugTipName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getTipImage(tipName: string): string {
  if (!tipName) return ''
  const slug = slugTipName(tipName)
  for (const [path, url] of Object.entries(TIP_IMAGES)) {
    const file = path.split('/').pop()?.toLowerCase().replace(/\.[^.]+$/, '')
    if (file === slug) return url
  }
  return ''
}

// Modal functions
const openTip = (item: any) => {
  selectedTip.value = item
  showTip.value = true
}

const closeTip = () => {
  showTip.value = false
  selectedTip.value = null
}

const openRelated = (tipId: string | number) => {
  const found = routineData.value?.routine?.find((item: any) => 
    String(item.activity.tip_id) === String(tipId)
  )
  if (found) selectedTip.value = found
}

// Compute flattened tips array for modal
const allTips = computed(() => {
  if (!routineData.value?.routine) return []
  return routineData.value.routine.map((item: any) => ({
    tip_id: item.activity.tip_id,
    tip: item.activity.tip,
    tip_des: item.activity.tip_des,
    brainy_background: item.activity.brainyBackground,
    source_url: item.activity.source,
    age_code: routineData.value.age_code,
    act_name: item.activity.name,
    act_desc: '',
    skills: item.activity.skills || []
  }))
})
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
    <section class="selector-hero" ref="selectorTop">
      <div class="selector-hero-content">
        <h2 class="section-title">Personalize Your Tips</h2>
        <p class="selector-sub">
          Choose gender and age group to tailor activities for your child.
        </p>
        
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
      <h2 class="section-title">Daily Exercise Tips (Daily Update)</h2>
      <p class="exercise-sub">
        Each card gives you a fun and simple activity designed to nurture your child's brain.
        Click on cards to view details, save favorites, and mark them as done to track progress.
      </p>
      
      <!-- Countdown Timer -->
      <div class="countdown-badge">
        <span class="countdown-icon">🔄</span>
        <span class="countdown-text">Update tips in: <strong>{{ timeUntilReset }}</strong></span>
      </div>
    </div>

    <!-- Tips Grid -->
    <div class="tips-container">
      <div v-if="loading" class="loading">
        Loading activities...
      </div>
      
      <section v-else-if="routineData" class="grid">
        <article
          v-for="item in routineData.routine"
          :key="item.activity.id"
          class="tip-card"
          @click="openTip(item)"
          role="button"
          tabindex="0"
          @keydown.enter="openTip(item)"
          @keydown.space.prevent="openTip(item)"
          :class="{ flipped: getTipCount(item.activity.tip_id) >= 1 }"
        >
          <div class="tip-card-inner">
            <div class="tip-card-front">
              <button
                class="fav-btn"
                :aria-pressed="isFavorited(item.activity.tip_id)"
                :title="isFavorited(item.activity.tip_id) ? 'Remove from favorites' : 'Add to favorites'"
                @click.stop="toggleFavorite(item)"
              >
                <img :src="isFavorited(item.activity.tip_id) ? heartRed : heartEmpty" alt="" />
              </button>
              
              <div class="tip-media" v-if="getTipImage(item.activity.tip)">
                <img :src="getTipImage(item.activity.tip)" :alt="`${item.activity.tip} illustration`" loading="lazy" />
              </div>
              
              <div class="tip-content">
                <h3 class="tip-title">{{ item.activity.tip }}</h3>
                <p v-if="item.activity.tip_des" class="tip-descr">{{ item.activity.tip_des }}</p>
                <ul v-if="item.activity.skills && item.activity.skills.length" class="skills">
                  <li class="skill">{{ item.activity.skills[0].code }}</li>
                </ul>
              </div>
            </div>
            
            <div class="tip-card-back">
              <template v-if="getTipCount(item.activity.tip_id) === 1">
                ✅ You have completed this tip once today.
              </template>
              <template v-else-if="getTipCount(item.activity.tip_id) === 2">
                🎉 Great job! You have completed this tip twice today.
                <br />
                <div style="padding-top: 20px;">You've reached today's limit.</div>
              </template>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- Sidebar with Back button -->
    <Transition name="fade-slide">
      <div class="sidebar" v-if="showBackBtn">
        <button class="back-btn" @click="scrollToSelector">Back to selector↑</button>
      </div>
    </Transition>

    <!-- Browse by Activity Type -->
    <div class="exercise-intro">
      <h2 class="section-title">Browse Tips by Activity type</h2>
      <p class="exercise-sub">
        Browse tips by different activity types to discover ideas that match your child's needs.
      </p>
    </div>

    <CategoryCloudCard />

    <!-- Tip Modal -->
    <TipModal
      v-if="showTip && selectedTip"
      :open="showTip"
      :tip="selectedTip.activity"
      :tips="allTips"
      :activity-name="selectedTip.activity.name"
      :activity-id="selectedTip.activity.id"
      :age="selectedAge"
      :gender="selectedGender"
      period="Any"
      @close="closeTip"
      @open-related="openRelated"
      @done="handleDone(selectedTip)"
    />

    <TipsCongrats 
      v-if="showCongrats" 
      :open="showCongrats"
      :activity-name="routineData?.routine?.[0]?.activity.name || ''"
      :activity-id="routineData?.routine?.[0]?.activity.id || ''" 
      @close="showCongrats = false" 
    />
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
  text-align: center;
  margin: 0;
  font-size: 22px;
}

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

.section-title {
  color: #f97316;
  font-size: 2rem;
  margin-bottom: 10px;
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

.exercise-intro {
  text-align: center;
  margin-bottom: 24px;
  margin-top: 40px;
}

.exercise-sub {
  color: #555;
  font-size: 22px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #fbbf24;
  border-radius: 24px;
  padding: 10px 20px;
  margin-top: 16px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.countdown-icon {
  font-size: 20px;
}

.countdown-text {
  font-size: 18px;
  color: #92400e;
  font-weight: 500;
}

.countdown-text strong {
  font-weight: 700;
  color: #b45309;
}

.tips-container {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 20px;
  color: #666;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  align-items: stretch;
  margin-bottom: 40px;
}

.tip-card {
  perspective: 1000px;
  position: relative;
  width: 100%;
  height: 380px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
  border-radius: 16px;
}

.tip-card.flipped .tip-card-inner {
  transform: rotateY(180deg);
}

.tip-card.flipped:hover .tip-card-inner {
  transform: rotateY(0deg);
}

.tip-card-front,
.tip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  border-radius: 16px;
}

.tip-card-front {
  background: #fff;
}

.tip-card-back {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  font-weight: 600;
  font-size: 1.5rem;
  text-align: center;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.08);
  padding: 5px;
}

.tip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
}

.tip-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #f6f6f6;
}

.tip-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.tip-content {
  padding: 0.9rem 1rem 1.1rem;
}

.tip-title {
  font-size: 22px;
  margin: 8px 0 6px;
}

.tip-descr {
  margin: 0 0 10px;
  color: #4b5563;
  font-size: 18px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  max-height: calc(1.45em * 4);
  white-space: normal;
  word-break: break-word;
}

.skills {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.skill {
  font-size: 14px;
  font-weight: 600;
  color: #007070;
  background: #eaf7f7;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
}

.fav-btn {
  position: absolute;
  bottom: 12px;
  right: 10px;
  z-index: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 999px;
}

.fav-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}

.fav-btn img {
  width: 20px;
  height: 20px;
  display: block;
}

.sidebar {
  position: fixed;
  top: 50%;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

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