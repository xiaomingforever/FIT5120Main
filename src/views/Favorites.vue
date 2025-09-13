<script setup lang="ts">
import { computed, ref } from 'vue'
import TipModal from '@/components/TipModal.vue'
import { useFavoritesStore, type FavoriteTip } from '@/stores/favorites'

const fav = useFavoritesStore()

const favorites = computed(() => fav.list)
const total = computed(() => fav.count)
const countLabel = computed(() => `${total.value} ${total.value === 1 ? 'Tip' : 'Tips'}`)

const showTip = ref(false)
const selectedTip = ref<FavoriteTip | null>(null)
const activityName = computed(() => selectedTip.value?.activityName || '')
const activityId = computed(() => selectedTip.value?.activityId || '')
const gender = String(localStorage.getItem('gender') || 'girl')
const age = String(localStorage.getItem('age_code') || '1-3y')
const period = 'Any'

const openTip = (t: FavoriteTip) => {
  selectedTip.value = t
  showTip.value = true
}
const closeTip = () => {
  showTip.value = false
  selectedTip.value = null
}
const openRelated = (tipId: string | number) => {
  const found = favorites.value.find((t) => String(t.tip_id) === String(tipId))
  if (found) selectedTip.value = found
}

const FAV_IMAGES = import.meta.glob(
  '../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}',
  { eager: true, import: 'default', query: '?url' }
) as Record<string, string>

const favImage = (actName?: string): string => {
  if (!actName) return ''
  const variants = [
    actName + '2',
    actName.replace(/\s+/g, '-') + '2',
    actName.replace(/\s+/g, '') + '2',
  ].map(v => v.toLowerCase().replace(/[^a-z0-9]/g, ''))

  for (const [path, url] of Object.entries(FAV_IMAGES)) {
    const file = path.split('/').pop() || ''
    const stem = file.replace(/\.[^.]+$/, '')
    const normalized = stem.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (variants.includes(normalized)) return url
  }
  return ''
}
</script>

<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Favorite Tips</h1>
      <p>
        Collection of your favorite tips,
        do the same thing again and again...
      </p>
    </div>
  </section>
  <div class="page-wrap">
    <!-- HERO CARD -->
    <section class="fav-hero">
      <div class="fav-hero_inner">
        <div class="fav-hero_copy">
          <h1 class="fav-hero_title">Your Favorites</h1>
          <p class="fav-hero_sub">Doing the same thing over and over again...</p>
          <span class="fav-hero_pill">{{ countLabel }}</span>
        </div>
        <img class="fav-hero_img" src="/src/assets/favorite page/favorite page.png" alt="" />
      </div>
    </section>

    <!-- LIST -->
    <section v-if="favorites.length" class="grid">
      <article
        v-for="t in favorites"
        :key="t.tip_id"
        class="tip-card"
        role="button"
        tabindex="0"
        @click="openTip(t)"
        @keydown.enter="openTip(t)"
        @keydown.space.prevent="openTip(t)"
      >
      <div class="fav-media" v-if="favImage(t.activityName || (t as any).act_name)">
        <img
          :src="favImage(t.activityName || (t as any).act_name)"
          :alt="`${t.activityName || (t as any).act_name} illustration`"
          loading="lazy"
        />
      </div>
        <!-- <div class="tip-card-head">
          <span class="activity-chip">{{ t.activityName }}</span>
        </div> -->
        <div class="fav-content">
          <h3 class="tip-title">{{ t.tip }}</h3>
          <p v-if="t.tip_des" class="tip-descr">{{ t.tip_des }}</p>
          <ul v-if="t.skills && t.skills.length" class="skills">
            <li v-for="s in t.skills" :key="s.code" class="skill">{{ s.code }}</li>
          </ul>
        </div>
      </article>
    </section>

    <section v-else class="empty">
      You haven't favorited any tips yet. Open an activity, tap the heart to save one!
    </section>

    <TipModal
      v-if="showTip && selectedTip"
      :open="showTip"
      :tip="selectedTip"
      :tips="favorites"
      :activity-name="activityName"
      :activity-id="activityId"
      :age="age"
      :gender="gender"
      :period="period"
      @close="closeTip"
      @open-related="openRelated"
    />
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url("../assets/favorite.png") center/cover no-repeat;
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
  background: rgba(23, 23, 23, 0.5);
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
.page-wrap {
  padding: 16px 20px 28px;
  width: 750px;
  margin: 0 auto;
}

.fav-hero {
  margin: 0 0 18px;
}
.fav-hero_inner {
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
.fav-hero_title {
  font-size: clamp(1.6rem, 1.2rem + 1vw, 2.2rem);
  margin: 0;
}
.fav-hero_sub {
  margin: 6px 0 10px;
  color: #6b7280;
}
.fav-hero_pill {
  display: inline-block;
  background: #f0f4ff;
  border: 1px solid #dbeafe;
  color: #1e3a8a;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 700;
}
.fav-hero_img {
  width: 160px;
  justify-self: end;
}
 /* Image for fav tips */
.fav-media {
  position: relative;
  width: 100%;
  height: 200px;  /* tweak to change the height of the image  */
  background: #f7f7f7;
}
.fav-media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}
.fav-content {
  padding: 12px 16px 16px;
}

/* LIST GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.tip-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}
.tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
}
.tip-card-head {
  display: flex;
  justify-content: flex-end;
}
.activity-chip {
  font-size: 12px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
}
.tip-title {
  font-size: 18px;
  margin: 8px 0 6px;
}
.tip-descr {
  margin: 0 0 10px;
  color: #4b5563;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
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
}
.skill {
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
}

.empty {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}
</style>
