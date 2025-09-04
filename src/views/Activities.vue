<template>
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
        @click="selectedAge = t.value"
      >
        {{ t.label }}
      </button>
    </nav>
    <h1 class="page-title">Tips Collection</h1>

    <section class="grid">
      <ExerciseCard v-for="ex in visible" :key="ex.id" :exercise="ex" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted  } from 'vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise, AgeGroup, Tip } from '@/stores/Exercise'

const exercises = ref<Exercise[]>([]) // API data
const selectedAge = ref<'all' | AgeGroup>('all')

// tabs for the selector bar
const AGE_ORDER: AgeGroup[] = ['0-1y', '1-3y', '3-5y']
const AGE_TABS: Array<{ label: string; value: 'all' | AgeGroup }> = [
  { label: 'All Ages', value: 'all' },
  { label: '0-1', value: '0-1y' },
  { label: '1-3', value: '1-3y' },
  { label: '3-5', value: '3-5y' },
]

// request to backend when loading
onMounted(async () => {
  try {
    const res = await fetch("https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_code: "1-3y",   // default
        gender: "girl",     // default
        daypart: "morning"  // default
      })
    })
    const data = await res.json()
    
    // map backend data to frontend
    exercises.value = data.options.map((act: any) => ({
      id: act.id,
      title: act.name,
      description: act.desc || "No description available",
      // ageGroup: "1-3", 
      image: act.image,
      tips: act.tips.map((t: any) => ({
        tip_id: t.tip_id,
        tip: t.tip,
        age_code: t.age_code as AgeGroup
      })),
      practiceCount: act.tips?.length || 0
    }))
  } catch (err) {
    console.error("Failed to fetch exercises:", err)
  }
})

const grouped = computed(() => {
  const groups: Record<AgeGroup, Exercise[]> = { '0-1y': [], '1-3y': [], '3-5y': [] }

  exercises.value.forEach((ex) => {
    ex.tips.forEach((tip: Tip) => {
      const age = tip.age_code as AgeGroup
      if (!groups[age]) return

      // check if activity already exist
      let existing = groups[age].find(e => e.id === ex.id)
      if (existing) {
        existing.tips.push(tip) 
      } else {
        groups[age].push({
          ...ex,
          tips: [tip] // only keep current age group's tips
        })
      }
    })
  })

  return AGE_ORDER.map((label) => ({
    label,
    items: groups[label]
  })).filter(g => g.items.length)
})

// const sourceList = computed<Exercise[]>(() => {
//   return exercises.value
// })

const visible = computed<Exercise[]>(() => {
  if (selectedAge.value === 'all') {
    return exercises.value.map(ex => ({
      ...ex,
      practiceCount: ex.tips.length,
      currentAgeGroup: 'all'
    }))
  }

  // display current age group
  const group = grouped.value.find(g => g.label === selectedAge.value)
  if (!group) return []

  // show only once of each activity
  return group.items.map(ex => ({
    ...ex,
    practiceCount: ex.tips.length,
    currentAgeGroup: selectedAge.value
  }))
})

function openExercise(ex: Exercise) {
  // route to detail  or open a modal
  // router.push({ name: 'ExerciseDetail', params: { id: ex.id } })
  console.log('open', ex)
}

// const grouped = computed(() =>
//   AGE_ORDER.map((label) => ({
//     label,
//     items: exercises.value.filter((e) => e.ageGroup === label),
//   })).filter((g) => g.items.length),
// )
</script>

<style scoped>
.activities {
  padding: 1rem;
}
/* age selection bar */
.agebar {
  position: sticky; /* sits under header */
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
