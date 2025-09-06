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
</script>

<template>
  <div class="page-wrap">
    <!-- HERO CARD -->
    <section class="fav-hero">
      <div class="fav-hero_inner">
        <div class="fav-hero_copy">
          <h1 class="fav-hero_title">Your Favorites</h1>
          <p class="fav-hero_sub">(come up with a better text)</p>
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
        <div class="tip-card-head">
          <span class="activity-chip">{{ t.activityName }}</span>
        </div>
        <h3 class="tip-title">{{ t.tip }}</h3>
        <p v-if="t.tip_des" class="tip-descr">{{ t.tip_des }}</p>
        <ul v-if="t.skills && t.skills.length" class="skills">
          <li v-for="s in t.skills" :key="s.code" class="skill">{{ s.code }}</li>
        </ul>
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
.page-wrap {
  padding: 16px 20px 28px;
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
  padding: 14px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  cursor: pointer;
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
