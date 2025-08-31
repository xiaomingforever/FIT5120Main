<template>
  <article class="card" @click="$emit('open', exercise)">
    <div class="media">
      <img :src="imageSrc" :alt="exercise.title" loading="lazy" />
    </div>

    <div class="body">
      <h3 class="title">{{ exercise.title }}</h3>
      <p class="desc">{{ exercise.description }}</p>

      <ul class="meta">
        <span class="pill">Age {{ exercise.ageGroup }}</span>
        <span class="badge">{{ exercise.practiceCount }} Practices</span>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Exercise } from '@/stores/Exercise'

const IMAGES = import.meta.glob('../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const props = defineProps<{ exercise: Exercise }>()

const imageSrc = computed(() => {
  const img = props.exercise.image
  if (!img) return ''

  const direct = `../assets/Activities/Excercise/${img}`
  if (IMAGES[direct]) return IMAGES[direct]

  const hit = Object.entries(IMAGES).find(([k]) =>
    k.toLowerCase().endsWith('/' + img.toLowerCase()),
  )
  return hit?.[1] ?? ''
})
</script>

<style scoped>
.card {
  display: grid;
  grid-template-rows: auto 1fr;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
}

.media {
  position: relative;
  aspect-ratio: 16/9;
  background: #f6f6f6;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fav {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border: 0;
  background: #fff;
  border-radius: 999px;
  padding: 0.35rem 0.5rem;
  font-size: 1rem;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.body {
  padding: 0.9rem 1rem 1.1rem;
}
.title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
}

.meta {
  display: flex;
  gap: 0.6rem;
  list-style: none;
  padding: 0;
  margin: 0 0 0.6rem;
  color: #444;
}
.meta .pill {
  text-transform: capitalize;
  background: #f2f2f2;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
}

.tags {
  display: flex;
  gap: 0.4rem;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
