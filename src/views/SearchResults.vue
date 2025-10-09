<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import TipModal from '@/components/TipModal.vue'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'

type Skill = { code: string; weight?: number }
type TipFull = {
  tip_id: string | number
  tip: string
  tip_des?: string
  brainy_background?: string
  source_url?: string
  age_code?: string
  act_name?: string
  act_desc?: string
  act_id?: string | number
  skills: Skill[]
}

const route = useRoute()
const rawQ = computed(() => String(route.query.q || ''))

// filters (tip name + skill code)
function matchesQuery(q: string, tip = '', skills: Skill[] = []) {
  const s = q.trim().toLowerCase()
  if (!s) return true
  const inTip = tip.toLowerCase().includes(s)
  const inSkills = skills.some((sk) => (sk.code || '').replace(/_/g, ' ').toLowerCase().includes(s))
  return inTip || inSkills
}

const OPTION_URL = 'https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option'
const selectedAge = String(localStorage.getItem('age_code') || '1-3y')
const gender = String(localStorage.getItem('gender') || 'girl')

const loading = ref(true)
const allTips = ref<TipFull[]>([])
const tips = computed(() => allTips.value.filter((t) => matchesQuery(rawQ.value, t.tip, t.skills)))
const tipCount = computed(() => tips.value.length)

// favorites
const favorites = useFavoritesStore()
const isFavorited = (id: string | number) => favorites.isFavorite(id)
function toggleFavorite(t: TipFull) {
  favorites.toggle({
    tip_id: t.tip_id,
    tip: t.tip,
    tip_des: t.tip_des,
    skills: t.skills,
    source_url: t.source_url,
    activityName: t.act_name || '',
    activityId: t.act_id || '',
    age_code: t.age_code,
    brainy_background: t.brainy_background,
  } as any)
}

// images
const TIP_IMAGES = import.meta.glob('../assets/TipsDisplay/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function slugTipName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
function getTipImage(tipName: string): string {
  if (!tipName) return ''
  const slug = slugTipName(tipName)
  for (const [path, url] of Object.entries(TIP_IMAGES)) {
    const file = path
      .split('/')
      .pop()
      ?.toLowerCase()
      .replace(/\.[^.]+$/, '')
    if (file === slug) return url
  }
  return ''
}

// flip state
const getTipCount = (id: string | number) => {
  const records = JSON.parse(localStorage.getItem('tipDailyCounts') || '{}')
  const todayKey = new Date().toISOString().split('T')[0]
  const entry = records[id]
  return entry && entry.date === todayKey ? entry.count : 0
}

// modal
const showTip = ref(false)
const selectedTip = ref<TipFull | null>(null)
const openTip = (t: TipFull) => {
  selectedTip.value = t
  showTip.value = true
}
const closeTip = () => {
  showTip.value = false
  selectedTip.value = null
}
const openRelated = (tipId: string | number) => {
  const found = tips.value.find((t) => String(t.tip_id) === String(tipId))
  if (found) selectedTip.value = found
}

// fetch everything once
async function fetchAllTips() {
  const dayparts = ['morning', 'afternoon', 'evening']
  const map = new Map<string, TipFull>()

  for (const daypart of dayparts) {
    const res = await fetch(OPTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_code: selectedAge, gender, daypart }),
    })
    const data = await res.json()
    const options = data?.options || []

    for (const opt of options) {
      const actId = String(opt.id)
      const actName = opt.name
      const list = opt.tips || []
      for (const t of list) {
        const id = String(t.tip_id)
        if (!map.has(id)) {
          map.set(id, {
            tip_id: id,
            tip: t.tip_name,
            tip_des: t.tip_desc,
            brainy_background: t.brainy_background,
            source_url: t.source_url,
            age_code: t.age_code,
            act_name: t.act_name || actName,
            act_desc: t.act_desc || '',
            act_id: actId,
            skills: t.skill_code ? [{ code: t.skill_code }] : [],
          })
        } else {
          const existing = map.get(id)!
          if (t.skill_code && !existing.skills.some((s) => s.code === t.skill_code)) {
            existing.skills.push({ code: t.skill_code })
          }
        }
      }
    }
  }
  allTips.value = Array.from(map.values())
}

onMounted(async () => {
  await fetchAllTips()
  loading.value = false
})

// keep list reactive if user tweaks the query param manually
watch(
  () => route.query.q,
  () => {
    /* tips computed will react */
  },
)
</script>

<template>
  <div class="tips-display">
    <section class="hero" role="banner">
      <div class="hero-inner hero-split">
        <div class="hero-copy">
          <h1 class="hero-title">Search results</h1>
          <p class="hero-desc" v-if="rawQ">Showing matches for “{{ rawQ }}” ({{ tipCount }})</p>
        </div>
      </div>
    </section>

    <section v-if="loading" class="state">Loading…</section>
    <section v-else-if="!tips.length" class="state">No tips matched your search.</section>

    <section v-else class="grid">
      <article
        v-for="t in tips"
        :key="t.tip_id"
        class="tip-card"
        @click="openTip(t)"
        role="button"
        tabindex="0"
        @keydown.enter="openTip(t)"
        @keydown.space.prevent="openTip(t)"
        :class="{
          flipped: getTipCount(t.tip_id) >= 1,
          selected: selectedTip && String(selectedTip.tip_id) === String(t.tip_id),
        }"
      >
        <div class="tip-card-inner">
          <div class="tip-card-front">
            <button
              class="fav-btn"
              :aria-pressed="isFavorited(t.tip_id)"
              :title="isFavorited(t.tip_id) ? 'Remove from favorites' : 'Add to favorites'"
              @click.stop="toggleFavorite(t)"
            >
              <img :src="isFavorited(t.tip_id) ? heartRed : heartEmpty" alt="" />
            </button>

            <div class="tip-media" v-if="getTipImage(t.tip)">
              <img :src="getTipImage(t.tip)" :alt="`${t.tip} illustration`" loading="lazy" />
            </div>

            <div class="tip-content">
              <h3 class="tip-title">{{ t.tip }}</h3>
              <p v-if="t.tip_des" class="tip-descr">{{ t.tip_des }}</p>
              <ul v-if="t.skills && t.skills.length" class="skills">
                <li v-for="(s, i) in t.skills" :key="i" class="skill">{{ s.code }}</li>
              </ul>
            </div>
          </div>

          <div class="tip-card-back">
            <template v-if="getTipCount(t.tip_id) === 1"
              >✅ You have completed this tip once today.</template
            >
            <template v-else-if="getTipCount(t.tip_id) === 2">
              🎉 Great job! You have completed this tip twice today.
              <div style="padding-top: 20px">You've reached today's limit.</div>
            </template>
          </div>
        </div>
      </article>
    </section>

    <TipModal
      v-if="showTip && selectedTip"
      :open="showTip"
      :tip="selectedTip"
      :tips="tips"
      :activity-name="selectedTip.act_name || ''"
      :activity-id="selectedTip.act_id || ''"
      :age="selectedAge"
      :gender="gender"
      :period="'Any'"
      @close="closeTip"
      @open-related="openRelated"
    />
  </div>
</template>

<style scoped>

.hero {
  display: grid;
  padding: 20px 16px 6px;
  background: transparent;
}
.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: #f97316;
  margin: 0;
}
.hero-desc {
  color: #6b7280;
  margin-top: 6px;
}

.state {
  padding: 24px 16px;
  text-align: center;
  color: #6b7280;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
  padding: 16px;
}
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.tip-card {
  perspective: 1000px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  position: relative;
}
.tip-card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.tip-card.flipped .tip-card-inner {
  transform: rotateY(180deg);
}
.tip-card-front,
.tip-card-back {
  position: relative;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.tip-card-back {
  transform: rotateY(180deg);
  padding: 18px;
  color: #111827;
}

.tip-media {
  width: 100%;
  aspect-ratio: 16/9;
  background: #f6f6f6;
}
.tip-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.tip-content {
  padding: 0.9rem 1rem 1.1rem;
}
.tip-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 6px;
}
.tip-descr {
  color: #374151;
  margin: 0 0 10px;
  min-height: 44px;
}
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.skill {
  background: #ecfeff;
  color: #155e75;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
}

.fav-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 2;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 6px;
  cursor: pointer;
}
.fav-btn img {
  width: 20px;
  height: 20px;
  display: block;
}
.fav-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}
</style>
