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
  <div class="activities">
    <!-- Age selector bar -->
    <nav class="agebar" role="tablist" aria-label="Filter by age group">
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
    </nav>

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise, AgeGroup, Tip } from '@/stores/Exercise'

const router = useRouter()
const exercises = ref<Exercise[]>([]) // API data from back-end
const selectedAge = ref<'all' | AgeGroup>('all')
const loading = ref(true)

// tabs for the selector bar
const AGE_ORDER: AgeGroup[] = ['0-1y', '1-3y', '3-5y']
const AGE_TABS: Array<{ label: string; value: 'all' | AgeGroup }> = [
  // { label: 'All Ages', value: 'all' },
  { label: '0-1', value: '0-1y' },
  { label: '1-3', value: '1-3y' },
  { label: '3-5', value: '3-5y' },
]

// request to backend when loading
onMounted(async () => {
  // read age group selected last time
  const savedAge = localStorage.getItem('selectedAge') as AgeGroup | null
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

// const sourceList = computed<Exercise[]>(() => {
//   return exercises.value
// })

const visible = computed<Exercise[]>(() => {
  // if (selectedAge.value === 'all') {
  //   // for 'all' show every activity and practiceCount is unique tip count across all ages
  //   return exercises.value.map((ex) => ({
  //     ...ex,
  //     practiceCount: new Set((ex.tips || []).map((t: any) => String(t.tip_id))).size,
  //     currentAgeGroup: 'all',
  //   }))
  // }
  // display current age group
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

// function openExercise(ex: Exercise) {
//   // route to detail  or open a modal
//   // router.push({ name: 'ExerciseDetail', params: { id: ex.id } })
//   console.log('open', ex)
// }

const goToTips = (ex: Exercise) => {
  const raw = selectedAge.value
  const normalizedAge = raw === 'all' ? localStorage.getItem('age_code') || '1-3y' : raw

  router.push({
    name: 'TipsDisplay',
    params: { activityId: ex.id },
    query: {
      name: ex.title, // header label on TipsDisplay
      age: normalizedAge,
    },
  })
}
// const grouped = computed(() =>
//   AGE_ORDER.map((label) => ({
//     label,
//     items: exercises.value.filter((e) => e.ageGroup === label),
//   })).filter((g) => g.items.length),
// )

const prevAgeIndex = ref(0)
const direction = ref<'left' | 'right'>('right')

function changeAge(newAge: AgeGroup) {
  const newIndex = AGE_ORDER.indexOf(newAge as AgeGroup)

  direction.value = newIndex > prevAgeIndex.value ? 'right' : 'left'
  prevAgeIndex.value = newIndex

  selectedAge.value = newAge
  localStorage.setItem('selectedAge', newAge)
}
</script>

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
  font-family: Arial, sans-serif;
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
  font-size: 3rem;
}
.hero p {
  margin-bottom: 1.5rem;
  font-size: 24px;
  font-weight: 500;
}
.activities {
  padding: 1rem;
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
