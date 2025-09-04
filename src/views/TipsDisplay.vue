<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type Skill = { code: string; weight?: number }
type TipLite = { tip_id: number | string; tip: string; age_code?: string }
type TipFull = TipLite & { tip_des?: string; skills?: Skill[]; activityName: string }

const route = useRoute()
const router = useRouter()

// passed via route
const activityId = computed(() => String(route.params.activityId ?? ''))
const activityName = ref<string>(String(route.query.name ?? ''))
const selectedAge = String(route.query.age ?? (localStorage.getItem('age_code') || '1-3y'))
const gender = String(localStorage.getItem('gender') || 'girl')

// local state
const loading = ref(true)
const tips = ref<TipFull[]>([])
const notFound = ref(false)

/**
 * - /option returns activities + (tip_id, tip, age_code) lists
 * - /dev enriches a given activity+tip_id with tip_des & skills
 */
const OPTION_URL = 'https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option'
const DEV_URL = 'https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev'

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
      const filtered: TipLite[] = (match.tips || [])
        .filter((t: any) => !t.age_code || t.age_code === selectedAge)
        .map((t: any) => ({ tip_id: t.tip_id, tip: t.tip, age_code: t.age_code }))

      const unique = Array.from(new Map(filtered.map((t) => [t.tip_id, t])).values())
      return unique
    }
  }
  return null
}

// a single tip with description + skills using the /dev endpoint
const hydrateTip = async (t: TipLite): Promise<TipFull> => {
  try {
    // pass back an explicit routine with the chosen activity+tip_id
    const payload = {
      age_code: selectedAge,
      gender,
      routine: [
        {
          period: 'Any',
          activity: {
            id: Number(activityId.value),
            name: activityName.value || '',
            tip_id: t.tip_id,
          },
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
      activityName: activityName.value,
    }
  } catch {
    // graceful fallback: still render the lite tip
    return { ...t, tip_des: '', skills: [], activityName: activityName.value }
  }
}

onMounted(async () => {
  try {
    const lite = await fetchTipsForActivity(activityId.value)
    if (!lite || lite.length === 0) {
      notFound.value = true
      return
    }
    const enriched = await Promise.all(lite.map(hydrateTip))
    tips.value = enriched
  } finally {
    loading.value = false
  }
})

const goBack = () => router.push({ name: 'Activities' })
</script>

<template>
  <div class="tips-display">
    <header class="header">
      <button class="back" @click="goBack" aria-label="Back to Activities">←</button>
      <h1 class="title">{{ activityName || 'Activity' }}</h1>
      <p class="subtitle">
        All tips for <span class="chip">{{ activityName || 'Activity' }}</span>
      </p>
    </header>

    <section v-if="loading" class="state">Loading tips...</section>
    <section v-else-if="notFound" class="state">No tips found for this activity.</section>

    <section v-else class="grid">
      <article v-for="t in tips" :key="t.tip_id" class="tip-card">
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
  </div>
</template>

<style scoped>
.tips-display {
  padding: 16px 20px 28px;
}
.header {
  text-align: center;
  margin-bottom: 18px;
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
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.tip-card-head {
  display: flex;
  justify-content: flex-end;
}
.activity-chip {
  font-size: 12px;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5; /* decorative green */
  border: 1px solid #a7f3d0;
  border-radius: 999px;
  padding: 2px 10px;
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
.state {
  text-align: center;
  padding: 40px 0;
  color: #6b7280;
}
</style>
