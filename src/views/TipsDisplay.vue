<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TipModal from '@/components/TipModal.vue'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'
// fav button
const favorites = useFavoritesStore()
const isFavorited = (id: string | number) => favorites.isFavorite(id)

function toggleFavorite(t: TipFull) {
  favorites.toggle({
    tip_id: t.tip_id,
    tip: t.tip,
    tip_des: t.tip_des,
    skills: t.skills,
    source_url: t.source_url,
    brainy_background: t.brainy_background,
    activityName: activityName.value || '',
    activityId: activityId.value,
    age_code: t.age_code,
  })
}

type Skill = { code: string; weight?: number }
type TipLite = { tip_id: number | string; tip: string; age_code?: string }
type TipFull = {
  tip_id: number | string
  tip: string
  tip_des: string
  brainy_background: string
  source_url: string
  age_code: string
  act_name: string
  act_desc: string
  skills: Skill[]
}
const route = useRoute()
const router = useRouter()

// passed via route
const activityId = computed(() => String(route.params.activityId ?? ''))
const activityName = ref<string>(String(route.query.name ?? ''))
const tipsImage = ref<string>(String(route.query.image ?? ''))
const activityDesc = ref<string>(String(route.query.act_desc ?? ''))
const selectedAge = String(route.query.age ?? (localStorage.getItem('age_code') || '1-3y'))
const gender = String(localStorage.getItem('gender') || 'girl')
const age = ref<string>(String(route.query.age ?? ''))
const period = ref<string>(String(route.query.period ?? ''))

// local state
const loading = ref(true)
const tips = ref<TipFull[]>([])
const notFound = ref(false)

// header data
const tipCount = computed(() => tips.value.length)
const resolvedDesc = computed(
  () => activityDesc.value || (tips.value.find((t) => t.act_desc)?.act_desc ?? ''),
)

const OPTION_URL = 'https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option'

// get tips (lite) for a specific activity id;
// try multiple dayparts because backend may segment options by daypart.
const fetchTipsForActivity = async (actId: string) => {
  const dayparts = ['morning', 'afternoon', 'evening']
  for (const daypart of dayparts) {
    const res = await fetch(OPTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_code: selectedAge, gender, daypart }),
    })
    const data = await res.json()

    const match = (data.options || []).find((o: any) => String(o.id) === String(actId))
    if (match) {
      if (!activityName.value) activityName.value = match.name
      // keep only tips matching the selected age (unique by tip_id)
      const filtered =
        selectedAge === 'all'
          ? match.tips || []
          : (match.tips || []).filter((t: any) => !t.age_code || t.age_code === selectedAge)
      //   .map((t: any) => ({ tip_id: t.tip_id, tip: t.tip, age_code: t.age_code }))

      // const unique = Array.from(new Map(filtered.map((t) => [t.tip_id, t])).values())
      // return unique

      // merge same tip_id
      const tipMap = new Map<string, TipFull>()

      for (const t of filtered) {
        const id = String(t.tip_id)
        if (!tipMap.has(id)) {
          tipMap.set(id, {
            tip_id: id,
            tip: t.tip_name,
            tip_des: t.tip_desc,
            brainy_background: t.brainy_background,
            source_url: t.source_url,
            age_code: t.age_code,
            act_name: t.act_name,
            act_desc: t.act_desc,
            skills: t.skill_code ? [{ code: t.skill_code }] : [],
          })
        } else {
          // merge skills
          const existing = tipMap.get(id)!
          if (t.skill_code && !existing.skills.some((s) => s.code === t.skill_code)) {
            existing.skills.push({ code: t.skill_code })
          }
        }
      }

      return Array.from(tipMap.values())
    }
  }
  return null
}
// CARD IMAGE LOGIC
const CARD_IMAGES = import.meta.glob('../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
// return image url for a tip card based on its activity name
const tipImage = (actName: string): string => {
  if (!actName) return ''
  const target = (actName + '2').toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const [path, url] of Object.entries(CARD_IMAGES)) {
    const file = path.split('/').pop() || ''
    const base = file.replace(/\.[^.]+$/, '')
    const normalized = base.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalized === target) return url
  }
  // fallback
  const kebab = actName.trim().toLowerCase().replace(/\s+/g, '-') + '2.'
  const hit = Object.keys(CARD_IMAGES).find((k) => k.toLowerCase().includes('/' + kebab))
  return hit ? CARD_IMAGES[hit] : ''
}

// Tip Images
const TIP_IMAGES = import.meta.glob('../assets/TipsDisplay/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const Header_IMAGES = import.meta.glob('../assets/Tips/*.{png,jpg,jpeg,webp,svg}', {
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
    const file = path.split('/').pop()?.toLowerCase().replace(/\.[^.]+$/, '')
    if (file === slug) return url
  }
  return '' 
}


onMounted(async () => {
  try {
    const enriched = await fetchTipsForActivity(activityId.value)
    if (!enriched || enriched.length === 0) {
      notFound.value = true
      return
    }
    tips.value = enriched
  } finally {
    loading.value = false
  }
})

const goBack = () => router.push({ name: 'Activities' })

// existing reactive state...
const showTip = ref(false)
const selectedTip = ref<any | null>(null)

const openTip = (t: any) => {
  selectedTip.value = t
  showTip.value = true
}
const closeTip = () => {
  showTip.value = false
  selectedTip.value = null
}

/* When a related tip is clicked inside the modal, swap the selection */
const openRelated = (tipId: string | number) => {
  const found = tips.value.find((t: any) => String(t.tip_id) === String(tipId))
  if (found) selectedTip.value = found
}

// HEADER IMAGE LOGIC
// const TIP_IMAGES = import.meta.glob('../assets/Tips/*.{png,jpg,jpeg,webp,svg}', {
//   eager: true,
//   import: 'default',
//   query: '?url',
// }) as Record<string, string>

// normalize activity names to file bases
const FILENAME_ALIASES: Record<string, string> = {
  'anytime anywhere': 'anytime-anywhere',
  'getting dressed': 'getting-dressed',
  'diaper change': 'diaper-change',
  'cleaning up': 'cleaning-up',
  'bath time': 'bathtime',
  'meal time': 'mealtime',
  'play time': 'playtime',
}
const toFileBase = (s: string) =>
  FILENAME_ALIASES[s.trim().toLowerCase()] ?? s.trim().toLowerCase().replace(/\s+/g, '-')

// compute the URL for the header image
const headerImage = computed(() => {
  const base = toFileBase(activityName.value || '')
  if (!base) return ''

  const candidates = [
    `../assets/Tips/${base}.png`,
    `../assets/Tips/${base}.jpg`,
    `../assets/Tips/${base}.jpeg`,
    `../assets/Tips/${base}.webp`,
    `../assets/Tips/${base}.svg`,
  ]
  for (const k of candidates) {
    if (Header_IMAGES[k]) return Header_IMAGES[k]
  }
  // last resort: any image that contains the base
  // const hit = Object.keys(TIP_IMAGES).find(k => k.toLowerCase().includes(`/${base}.`))
  // return hit ? TIP_IMAGES[hit] : ''
})

const getTipCount = (id: string | number) => {
  const records = JSON.parse(localStorage.getItem('tipDailyCounts') || '{}')
  const todayKey = new Date().toISOString().split('T')[0]
  const entry = records[id]
  return entry && entry.date === todayKey ? entry.count : 0
}
</script>

<template>
  <div class="tips-display">
    <section class="hero" role="banner">
      <button class="btn-back" @click="goBack" aria-label="Back to Activities">
        <span>Back</span>
      </button>

      <div class="hero-inner hero-split">
        <!-- LEFT: text -->
        <div class="hero-copy">
          <h1 class="hero-title">{{ activityName || 'Activity' }}</h1>
          <p v-if="resolvedDesc" class="hero-desc">{{ resolvedDesc }}</p>
          <div class="hero-meta">
            <span class="pill tips-pill">{{ tipCount }} Tips</span>
          </div>
        </div>

        <!-- RIGHT: image -->
        <div v-if="headerImage" class="hero-media" aria-hidden="true">
          <img class="hero-image" :src="headerImage" :alt="`${activityName} illustration`" />
        </div>
      </div>
    </section>

    <section v-if="loading" class="state">Loading tips...</section>
    <section v-else-if="notFound" class="state">No tips found for this activity.</section>

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
        :class="{ flipped: getTipCount(t.tip_id) >= 1,  selected: selectedTip === String(t.tip_id)}"
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
            <!-- <div class="tip-card-head">
          <span class="activity-chip">{{ t.act_name }}</span>
        </div> -->

            <h3 class="tip-title">{{ t.tip }}</h3>
            <p v-if="t.tip_des" class="tip-descr">{{ t.tip_des }}</p>

            <ul v-if="t.skills && t.skills.length" class="skills">
              <li class="skill">{{ t.skills[0].code }}</li>
            </ul>
          </div>
        </div>

        <div class="tip-card-back">
          <template v-if="getTipCount(t.tip_id) === 1">
            ✅ You have completed this tip once today.
          </template>
          <template v-else-if="getTipCount(t.tip_id) === 2">
            🎉 Great job! You have completed this tip twice today.  
            <br />
            <div style="padding-top: 20px;">You've reached today's limit.</div>
          </template>
        </div>
      </div>
      </article>
    </section>
    <!-- tip modal -->
    <TipModal
      v-if="showTip && selectedTip"
      :open="showTip"
      :tip="selectedTip"
      :tips="tips"
      :activity-name="activityName"
      :activity-id="activityId"
      :age="age"
      :gender="gender"
      :period="period || 'Any'"
      @close="closeTip"
      @open-related="openRelated"
    />
  </div>
</template>

<style scoped>
.tips-display {
  padding: 1rem;
  width: 900px;
  margin: 0 auto;
}

/* hero section */
.hero {
  position: relative;
  margin: 0 0 18px;
  padding: clamp(28px, 6vw, 56px) clamp(16px, 5vw, 32px);
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
}

.btn-back {
  position: absolute;
  font-size: 16px;
  top: 15px;
  left: 22px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.btn-back .icon {
  width: 18px;
  height: 18px;
}

.btn-back:hover {
  transform: translateX(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.btn-back:focus {
  outline: 3px solid #bfdbfe;
  outline-offset: 2px;
}

.hero-inner {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.hero-split {
  display: grid;
  grid-template-columns: 1fr minmax(140px, 240px);
  align-items: center;
  gap: clamp(16px, 3vw, 32px);
  max-width: 1000px;
  margin: 0 auto;
}

.hero-copy {
  text-align: left;
}

.hero-title {
  margin: 0 0 8px;
  line-height: 1.15;
  font-weight: 800;
  font-size: clamp(28px, 5vw, 44px);
}

.hero-desc {
  margin: 4px 0 14px;
  color: #2f2f2f;
  max-width: 48ch;
  white-space: pre-line;
  font-size: 22px;
}

.hero-media {
  justify-self: end;
}

.hero-image {
  width: clamp(120px, 18vw, 200px);
  height: auto;
  object-fit: contain;
  display: block;
}

.pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 20px;
  line-height: 1;
  border: 1px solid #efe8b5;
  background: #f7f4d6;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  color: #333;
}

@media (max-width: 768px) {
  .hero-split {
    grid-template-columns: 1fr;
  }

  .hero-media {
    justify-self: start;
  }

  /* image will sit under text on small screens */
}

.back {
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 6px;
}

.title {
  font-size: clamp(1.4rem, 1.1rem + 1vw, 2rem);
  margin: 0;
}

.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
}

.chip {
  background: #eef2ff;
  border-radius: 8px;
  padding: 2px 8px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  align-items: stretch;
}

.tip-card {
  perspective: 1000px;
  position: relative;
  width: 100%;
  height: 380px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.tip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d; 
  transition: transform 0.6s ease-in-out;
  border-radius: 16px;
  /* overflow: hidden; */
}
.tip-card.flipped .tip-card-inner {
  transform: rotateY(180deg);
}
/* flip back on hover */
.tip-card.flipped:hover .tip-card-inner {
  transform: rotateY(0deg);
}
.tip-card-front,
.tip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  border-radius: 16px;
}

.tip-card-front {
  background: #fff;
}

.tip-card-back {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  font-weight: 600;
  font-size: 1.5rem;
  text-align: center;
  /* padding: 20px; */
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.08);
}

.tip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
}
.tip-card.selected {
  border: 2px solid #0d9488;
  box-shadow: 0 8px 20px rgba(0, 148, 136, 0.4);
  transform: scale(1.02);
  transition: all 0.25s ease;
}
.tip-card-head {
  display: flex;
  justify-content: flex-end;
}

.tip-media {
  position: relative;
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

/* .activity-chip {
  font-size: 12px;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 999px;
  padding: 2px 10px;
} */
.tip-title {
  font-size: 22px;
  margin: 8px 0 6px;
}

/* clamp to 4 lines */
.tip-descr {
  margin: 0 0 10px;
  color: #4b5563;
  font-size: 18px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
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
  margin-top: auto;
}

.skill {
  font-size: 14px;
  font-weight: 600;
  color: #007070;
  background: #eaf7f7;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
}

.state {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}

.fav-btn {
  position: absolute;
  bottom: 12px;
  right: 10px;
  z-index: 1;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 999px;
}

.fav-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}

.fav-btn img {
  width: 20px;
  height: 20px;
  display: block;
}
</style>
