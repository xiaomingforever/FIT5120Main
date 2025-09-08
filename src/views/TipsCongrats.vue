<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'

type Skill = { code: string; weight?: number }
type TipLite = { tip_id: number | string; tip: string; age_code?: string }
type TipFull = TipLite & {
  tip_des?: string
  skills?: Skill[]
  source?: string
  activityName: string
}

const route = useRoute()
const router = useRouter()
const favorites = useFavoritesStore()

// route
const activityId = computed(() => String(route.params.activityId ?? ''))
const activityName = ref<string>(String(route.query.name ?? ''))
const excludeTipId = String(route.query.completedTipId ?? '') // optional
const selectedAge = String(route.query.age ?? (localStorage.getItem('age_code') || '1-3y'))
const gender = String(localStorage.getItem('gender') || 'girl')

// local state
const loading = ref(true)
const moreTips = ref<TipFull[]>([])

const isFavorited = (id: string | number) => favorites.isFavorite(id)
function toggleFavorite(t: TipFull) {
  favorites.toggle({
    tip_id: t.tip_id,
    tip: t.tip,
    tip_des: t.tip_des,
    skills: t.skills || [],
    source: t.source || '',
    activityName: t.activityName,
    activityId: activityId.value,
    age_code: selectedAge,
  })
}

const OPTION_URL = 'https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option'
const DEV_URL = 'https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev'

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
      // unique by tip_id & for the selected age
      const seen = new Set<string>()
      return (match.tips || [])
        .filter((t: any) => !t.age_code || t.age_code === selectedAge)
        .filter((t: any) => {
          const k = String(t.tip_id)
          if (seen.has(k)) return false
          seen.add(k)
          return true
        })
        .map((t: any) => ({ tip_id: t.tip_id, tip: t.tip, age_code: t.age_code })) as TipLite[]
    }
  }
  return [] as TipLite[]
}

const hydrateTip = async (t: TipLite): Promise<TipFull> => {
  try {
    const payload = {
      age_code: selectedAge,
      gender,
      period: 'Any',
      routine: [
        {
          activity: { id: Number(activityId.value), name: activityName.value, tip_id: t.tip_id },
        },
      ],
    }
    const res = await fetch(DEV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    const act = data?.routine?.[0]?.activity ?? {}
    return {
      ...t,
      tip: act.tip || t.tip,
      tip_des: act.tip_des || '',
      skills: act.skills || [],
      source: (act.source ?? '').trim(),
      activityName: activityName.value,
    }
  } catch {
    return { ...t, tip_des: '', skills: [], source: '', activityName: activityName.value }
  }
}

onMounted(async () => {
  try {
    const lite = await fetchTipsForActivity(activityId.value)
    const filtered = lite.filter((t) => String(t.tip_id) !== excludeTipId)
    const pick = filtered.slice(0, 2) // show two cards
    const enriched = await Promise.all(pick.map(hydrateTip))
    moreTips.value = enriched
  } finally {
    loading.value = false
  }
})

function goActivities() {
  router.push({ name: 'Activities' })
}
function goProgress() {
  router.push({ name: 'Progress' })
}
function openTipsList() {
  router.push({
    name: 'TipsDisplay',
    params: { activityId: activityId.value },
    query: { name: activityName.value, age: selectedAge },
  })
}
</script>

<template>
  <div class="congrats">
    <header class="hero">
      <h1 class="hero-title">Congratulations!</h1>
      <p class="hero-sub">
        You just finished a <span class="chip">{{ activityName }} </span> tip. Every small step
        helps your child grow.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary" @click="goActivities">Back to Activities</button>
        <button class="btn" @click="goProgress">View Progress</button>
      </div>
    </header>

    <section class="more">
      <div class="more-head">
        <h2 class="more-title">More tips you may like</h2>
        <button class="link" @click="openTipsList">See all {{ activityName }} tips</button>
      </div>

      <div v-if="loading" class="state">Loading...</div>
      <div v-else class="grid">
        <article
          v-for="t in moreTips"
          :key="t.tip_id"
          class="tip-card"
          role="button"
          tabindex="0"
          @click="openTipsList"
          @keydown.enter.prevent="openTipsList"
          @keydown.space.prevent="openTipsList"
        >
          <button
            class="fav-btn"
            :aria-pressed="isFavorited(t.tip_id)"
            :title="isFavorited(t.tip_id) ? 'Remove from favorites' : 'Add to favorites'"
            @click.stop="toggleFavorite(t)"
          >
            <img :src="isFavorited(t.tip_id) ? heartRed : heartEmpty" alt="" />
          </button>

          <div class="tip-card-head">
            <span class="activity-chip">{{ t.activityName }}</span>
          </div>

          <h3 class="tip-title">{{ t.tip }}</h3>
          <p v-if="t.tip_des" class="tip-descr">{{ t.tip_des }}</p>

          <ul v-if="t.skills?.length" class="skills">
            <li v-for="s in t.skills" :key="s.code" class="skill">{{ s.code }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.congrats {
  padding: 18px 20px 40px;
  width: 750px;
  margin: 0 auto;
}
.hero {
  background: #eef2ff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}
.hero-title {
  font-size: clamp(1.4rem, 1.1rem + 1vw, 2rem);
  margin: 0;
}
.hero-sub {
  margin: 6px 0 12px;
  color: #475569;
}
.chip {
  background: #e0fbeb;
  border-radius: 8px;
  padding: 2px 8px;
}
.hero-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 8px;
}
.btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
}
.btn-primary {
  background: #08cd22;
  color: #fff;
}

.more {
  margin-top: 24px;
}
.more-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.more-title {
  margin: 0;
}
.link {
  background: transparent;
  border: 0;
  color: #5985e1;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  align-items: stretch;
}
.tip-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 14px;
  display: flex;
  flex-direction: column;
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
  background: #dcfce7;
  border: 1px solid #86efac;
  color: #14532d;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
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
  margin-top: auto;
}
.skill {
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
}
.fav-btn {
  position: absolute;
  left: 8px;
  top: 8px;
  border: 0;
  background: #fff;
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
.state {
  text-align: center;
  padding: 30px 0;
  color: #6b7280;
}
</style>
