<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise, AgeGroup, Tip } from '@/stores/Exercise'

const router = useRouter()
const exercises = ref<Exercise[]>([]) // API data from back-end
// const selectedAge = ref<AgeGroup>('0-1y')
// const loading = ref(true)

const currentAge = computed(() => selectedAge.value)
const gender = computed(() => localStorage.getItem('gender') || 'girl')

// tabs for the selector bar
const AGE_ORDER: AgeGroup[] = ['0-1y', '1-3y', '3-5y']

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

// request to backend when loading
onMounted(async () => {
  // read age group selected last time
  const savedAge = localStorage.getItem('age_code') as AgeGroup | null
  if (savedAge) {
    selectedAge.value = savedAge
    prevAgeIndex.value = AGE_ORDER.indexOf(savedAge as AgeGroup)
  } else {
    selectedAge.value = AGE_ORDER[0]
    prevAgeIndex.value = 0
  }

  loading.value = true
  try {
    const res = await fetch('https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age_code: selectedAge.value, // default
        gender: 'girl', // default
        daypart: 'morning', // default
      }),
    })
    const data = await res.json()

   // map backend data to frontend
    exercises.value = (data.options || []).map((act: any) => {
      // normalize raw tips (keep fields we need)
      const rawTips = (act.tips || []).map((t: any) => ({
        tip_id: String(t.tip_id),
        tip: t.tip_name ?? t.tip ?? '',
        age_code: (t.age_code as AgeGroup) ?? undefined,
        skill_code: t.skill_code ?? undefined,
        tip_desc: t.tip_desc ?? '',
        brainy_background: t.brainy_background ?? '',
        source_url: t.source_url ?? '',
        act_name: t.act_name ?? act.name,
        act_desc: t.act_desc ?? act.desc,
      }))

      // compute unique tip count (dedupe by tip_id) for practiceCount
      const uniqueTipCount = new Set(rawTips.map((rt: { tip_id: any }) => rt.tip_id)).size

      return {
        id: String(act.id),
        title: act.name,
        description: act.desc || 'No description available',
        image: act.image,
        // store full raw tips (may contain duplicates by skill)
        tips: rawTips,
        // set initial practiceCount to unique count
        practiceCount: uniqueTipCount,
      } as Exercise
    })
    }  catch (err) {
    console.error('Failed to fetch exercises:', err)
  } finally {
    loading.value = false
  }
})

/**
 * grouped: produce per-age grouped activities, each activity's tips are unique by tip_id
 * structure: [{ label: '0-1y', items: Exercise[] }, ...]
 */
const grouped = computed(() => {
  // maps to collect activities per age: age -> (activityId -> Exercise)
  const groupsMap: Record<AgeGroup, Map<string, Exercise>> = {
    '0-1y': new Map(),
    '1-3y': new Map(),
    '3-5y': new Map(),
  }

  for (const ex of exercises.value) {
    // ex.tips may contain multiple rows for same tip_id (different skills/ages)
    for (const tipRow of ex.tips as any[]) {
      const age = tipRow.age_code as AgeGroup | undefined
      if (!age || !groupsMap[age]) continue

      const activityMap = groupsMap[age]
      if (!activityMap.has(ex.id)) {
        // create a shallow copy of exercise but with empty tips to fill unique tips
        activityMap.set(ex.id, {
          ...ex,
          tips: [],
        } as Exercise)
      }

      const exInGroup = activityMap.get(ex.id)!
      // push only if this tip_id not yet added for this activity in this age group
      if (!exInGroup.tips.some((t: any) => String(t.tip_id) === String(tipRow.tip_id))) {
        exInGroup.tips.push({
          tip_id: String(tipRow.tip_id),
          tip: tipRow.tip,
          age_code: age,
          tip_desc: tipRow.tip_desc,
          // optionally include other fields if Exercise.Tip type supports them
        } as unknown as Tip)
      }
    }
  }

  return AGE_ORDER.map((label) => ({
    label,
    items: Array.from(groupsMap[label].values()),
  })).filter((g) => g.items.length)
})

const visible = computed<Exercise[]>(() => {
  const group = grouped.value.find((g) => g.label === selectedAge.value)
  if (!group) return []

  // show only once of each activity
  return group.items.map((ex) => ({
    ...ex,
    // ex.tips in group.items are already unique by tip_id, but use Set for safety
    practiceCount: new Set((ex.tips || []).map((t: any) => String(t.tip_id))).size,
    currentAgeGroup: selectedAge.value,
  }))
})

const goToTips = (ex: Exercise) => {
  const normalizedAge = selectedAge.value

  router.push({
    name: 'TipsDisplay',
    params: { activityId: ex.id },
    query: {
      name: ex.title, // header label on TipsDisplay
      age: normalizedAge,
      act_desc: ex.description,
      image: ex.image,
    },
  })
}

const prevAgeIndex = ref(0)
const direction = ref<'left' | 'right'>('right')
</script>

<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Activities</h1>
      <p>
        Parents can view tips for different types of activities tailored to each age group,
        helping to promote their child's overall brain development.
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

  <!-- HERO CARD -->
  <section class="act-hero" ref="erexerciseCardRef">
    <div class="act-hero_inner">
      <div class="act-hero_copy">
        <h1 class="act-hero_title">Explore Activities</h1>
        <p class="act-hero_sub">
          Activities tailored for different age groups
          to boost learning and fun.
        </p>
        <span class="act-hero_pill">
          {{ selectedGender }} · {{ selectedAge }}
        </span>
      </div>
      <img class="act-hero_img" src="/src/assets/Activities/OutdoorPlay/exercise-headline.png" alt="Activities illustration" />
    </div>
  </section>

  <div class="activities">
    <!-- Age selector bar -->
    <!-- <nav class="agebar" role="tablist" aria-label="Filter by age group">
      <button
        v-for="t in AGE_TABS"
        :key="t.value"
        class="age-tab"
        :class="{ active: selectedAge === t.value }"
        role="tab"
        :aria-selected="selectedAge === t.value"
        @click="changeAge(t.value)"
      >
        {{ t.label }}
      </button>
    </nav> -->

    <h1 class="page-title">Tips Collection</h1>

    <div v-if="loading" class="loading">Loading...</div>

    <transition :name="direction === 'right' ? 'slide-left' : 'slide-right'" mode="out-in">
      <section class="grid" :key="selectedAge">
        <ExerciseCard
          v-for="ex in visible"
          :key="ex.id"
          :exercise="ex"
          @open="goToTips"
        />
      </section>
    </transition>
  </div>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url("../assets/Activity.png") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  color: #333;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(36, 36, 36, 0.4);
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
.act-hero {
  margin: 60px auto;
  width: 900px;
}
.act-hero_inner {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 28px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 16px;
}
.act-hero_title {
  font-size: clamp(1.6rem, 1.2rem + 1vw, 2.2rem);
  margin: 0;
}
.act-hero_sub {
  margin: 6px 0 10px;
  color: #6b7280;
  font-size: clamp(1.2rem, 0.5rem + 1vw, 2rem);
}
.act-hero_pill {
  display: inline-block;
  background: #f0f4ff;
  border: 1px solid #dbeafe;
  color: #1e3a8a;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 700;
}
.act-hero_img {
  width: 240px;
  justify-self: end;
}
.selector-hero {
  position: relative;
  width: 100%;
  padding: 0 20px;
  text-align: center;
  margin: 0 auto;
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
.activities {
  /* padding: 1rem; */
  width: 900px;
  margin: 0 auto;
}
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.25rem;
  color: #1ea672;
  font-weight: bold;
}
/* age selection bar */
.agebar {
  /* position: sticky; */
  top: 72px; /* adjust to header height */
  z-index: 5;
  display: flex;
  gap: 0.5rem;
  padding: 0.35rem;
  margin: 0 0 1rem;
  background: #1ea672;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) inset;
}

.age-tab {
  appearance: none;
  border: 0;
  background: transparent;
  color: #fff;
  padding: 0.45rem 1rem;
  border-radius: 0.45rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.9;
  cursor: pointer;
  font-size: 20px;
}

.age-tab.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 -3px 0 rgba(255, 255, 255, 0.45);
  opacity: 1;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
  position: absolute;
  width: 100%;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.page-title {
  font-size: clamp(1.4rem, 1.2rem + 1vw, 2rem);
  text-align: center;
  margin: 0.5rem 0 1rem;
}
.search {
  display: block;
  width: min(680px, 100%);
  margin: 0.25rem auto 1rem;
  padding: 0.65rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #fff;
}
.grid {
  --min: 260px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--min), 1fr));
  gap: 1rem;
}
.empty {
  text-align: center;
  color: #6b7280;
  padding: 2rem 0;
}
</style>
