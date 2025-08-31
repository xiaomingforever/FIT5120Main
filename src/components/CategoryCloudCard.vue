<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
  { key: 'mealtime', label: 'Mealtime', icon: mealtime },
  { key: 'bathtime', label: 'Bathtime', icon: bathtime },
  { key: 'learning', label: 'Learning Time', icon: learning },
  { key: 'outdoor', label: 'Outdoor Play', icon: outdoor },
  { key: 'problem', label: 'Problem Solving', icon: problem },
  { key: 'language', label: 'Language Moments', icon: language },
  { key: 'gardening', label: 'Gardening', icon: gardening },
  { key: 'dressing', label: 'Getting Dressed', icon: dressing },
]
</script>

<template>
  <section class="card">
    <h2 class="heading">Browse Exercises by Activity</h2>
    <ul class="pill-grid">
      <li v-for="c in cats" :key="c.label">
        <!-- Send users to the Activities page with a category query -->
        <RouterLink class="pill" :to="{ name: 'Activities', query: { category: c.key } }">
          <img class="pill-icon" :src="c.icon" :alt="c.label" aria-hidden="true" />
          <span>{{ c.label }}</span>
        </RouterLink>
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
}
.heading {
  font-size: 1.4rem;
  margin-bottom: 14px;
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
  transition:
    background 0.15s,
    transform 0.05s,
    box-shadow 0.15s;
}
.pill:hover {
  background: #fff;
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
