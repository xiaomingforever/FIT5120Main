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
    <h1 class="page-title">Exercise Collection</h1>

    <section class="grid">
      <ExerciseCard v-for="ex in visible" :key="ex.id" :exercise="ex" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ExerciseCard from '@/components/ExerciseCard.vue'
import type { Exercise, AgeGroup } from '@/stores/Exercise'

// mock data. Replace with API/store later if needed.
const exercises = ref<Exercise[]>([
  {
    id: 'ex-1',
    title: 'BedTime',
    description:
      'End the day with calm voices and gentle talk. It helps your child feel safe and ready for sleep.',
    ageGroup: '0-1',
    image: 'Bedtime2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-2',
    title: 'MealTime',
    description:
      'Share stories or name foods while you eat. It turns mealtime into a moment for learning and connection.',
    ageGroup: '1-3',
    image: 'Mealtime2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-3',
    title: 'BathTime',
    description: 'Make bathtime a place for fun and learning. These tips make bathtime a splash!',
    ageGroup: '0-1',
    image: 'Bathtime2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-4',
    title: 'LearningTime',
    description:
      'Use puzzles or blocks to explore shapes and numbers. Small steps like these build strong thinking skills.',
    ageGroup: '3-5',
    image: 'LearningTime2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-5',
    title: 'Outdoor Play',
    description:
      'Run, jump, and explore outside together.Fresh air and movement build strong bodies and happy minds.',
    ageGroup: '1-3',
    image: 'Outdoor2.png',
    practiceCount: 102,
  },

  {
    id: 'ex-6',
    title: 'Problem Solving',
    description:
      'Try puzzles, blocks, or matching games together. These playful challenges grow patience and thinking skills.',
    ageGroup: '3-5',
    image: 'Problem2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-7',
    title: 'Language Moments',
    description:
      'Talk about what you see and hear during the day. Simple words and chats help your child grow strong language skills.',
    ageGroup: '3-5',
    image: 'Language2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-8',
    title: 'Getting Dressed',
    description: 'Teach your child what you know by naming clothing colors as you go!',
    ageGroup: '0-1',
    image: 'Dressing2.png',
    practiceCount: 102,
  },
  {
    id: 'ex-9',
    title: 'Gardening',
    description:
      'Let your child dig, plant, and water with you. Caring for plants teaches patience and love for nature.',
    ageGroup: '3-5',
    image: 'Gardening2.png',
    practiceCount: 102,
  },
])

const query = ref('')

// tabs for the selector bar
const AGE_TABS: Array<{ label: string; value: 'all' | AgeGroup }> = [
  { label: 'All Ages', value: 'all' },
  { label: '0-1', value: '0-1' },
  { label: '1-3', value: '1-3' },
  { label: '3-5', value: '3-5' },
]

// active tab
const selectedAge = ref<'all' | AgeGroup>('all')

const sourceList = computed<Exercise[]>(() => {
  return exercises.value
})

const visible = computed<Exercise[]>(() => {
  if (selectedAge.value === 'all') return sourceList.value
  return sourceList.value.filter((ex) => ex.ageGroup === selectedAge.value)
})

function openExercise(ex: Exercise) {
  // route to detail  or open a modal
  // router.push({ name: 'ExerciseDetail', params: { id: ex.id } })
  console.log('open', ex)
}

const AGE_ORDER: AgeGroup[] = ['0-1', '1-3', '3-5']
const grouped = computed(() =>
  AGE_ORDER.map((label) => ({
    label,
    items: exercises.value.filter((e) => e.ageGroup === label),
  })).filter((g) => g.items.length),
)
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
