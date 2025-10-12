<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, Transition } from 'vue'
import { useRouter } from 'vue-router'
import type { AgeGroup } from '@/stores/Exercise'

const routineData = ref<any>(null)
const loading = ref(false)

// age and gender
const AGE_TABS: AgeGroup[] = ['0-1y', '1-3y', '3-5y']
const selectedAge = ref<AgeGroup>('1-3y')
const selectedGender = ref<'girl' | 'boy'>('girl')

const selectorTop = ref<HTMLElement | null>(null)
const erexerciseCardRef = ref<HTMLElement | null>(null)

const showBackBtn = ref(false)

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
</script>

<template>
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
</template>

<style>
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
</style>