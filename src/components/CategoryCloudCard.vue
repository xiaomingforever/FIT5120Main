<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import bedtime from '@/assets/Activities/ActivityCard/Bedtime1.png'
import mealtime from '@/assets/Activities/ActivityCard/Mealtime1.png'
import bathtime from '@/assets/Activities/ActivityCard/Bathtime1.png'
import learning from '@/assets/Activities/ActivityCard/LearningTime1.png'
import outdoor from '@/assets/Activities/ActivityCard/Outdoor1.png'
import problem from '@/assets/Activities/ActivityCard/Problem1.png'
import language from '@/assets/Activities/ActivityCard/Language1.png'
import gardening from '@/assets/Activities/ActivityCard/Gardening1.png'
import dressing from '@/assets/Activities/ActivityCard/Dressing1.png'

type Cat = { key: string; label: string; icon: string }
const cats: Cat[] = [
  /* cat means category */
  { key: 'bedtime', label: 'Bedtime', icon: bedtime },
  { key: 'playtime', label: 'Playtime', icon: mealtime },
  { key: 'bathtime', label: 'Bathtime', icon: bathtime },
  { key: 'mealtime', label: 'Mealtime', icon: learning },
  { key: 'anytime-anywhere', label: 'Anytime Anywhere', icon: outdoor },
  { key: 'diaper-change', label: 'Diaper Change', icon: problem },
  { key: 'cleaning-up', label: 'Cleaning Up', icon: language },
  { key: 'getting-dressed', label: 'Getting Dressed', icon: dressing },
]

const router = useRouter()

const goToActivity = (c: Cat) => {
  const activityIdMap: Record<string, string> = {
    'bedtime': '1',
    'playtime': '2',
    'bathtime': '3',
    'mealtime': '4',
    'anytime-anywhere': '5',
    'diaper-change': '6',
    'cleaning-up': '7',
    'getting-dressed': '8',
  }
  const id = activityIdMap[c.key] || '1'
  router.push({
    name: 'TipsDisplay',            // router name
    params: { activityId: id },
    query: {
      name: c.key,
      age: localStorage.getItem('age_code') || '3-5y'
    }
  })
}
</script>

<template>
  <section class="card">
    <h2 class="heading">Browse Exercises by Activity</h2>
    <ul class="pill-grid">
      <li v-for="c in cats" :key="c.label">
        <!-- Send users to the Activities page with a category query -->
        <button 
          class="pill" 
          @click="goToActivity(c)"
        >
          <img class="pill-icon" :src="c.icon" :alt="c.label" aria-hidden="true" />
          <span>{{ c.label }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  box-shadow: var(--card-shadow);
  width: min(960px, 88vw);
  margin: 0 auto;
  width: 702px;
}
.heading {
  font-size: 2rem;
  margin-bottom: 14px;
  text-align: center;
  padding-bottom: 10px ;
}
.pill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  text-decoration: none;
  color: inherit;
  font-weight: 600;
  font-size: 16px;
  transition:
    background 0.15s,
    transform 0.05s,
    box-shadow 0.15s;
}
.pill:hover {
  background: #ceebd8;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.pill:active {
  transform: translateY(1px);
}

.pill-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex: 0 0 24px;
}
.icn {
  margin-right: 8px;
}
</style>
