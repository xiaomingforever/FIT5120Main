<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProgressStore } from '@/stores/progress'
// import TipModal from '@/components/TipModal.vue'

const showTip = ref(false)
const selectedTip = ref<any | null>(null)

const progress = useProgressStore()
progress.load()

type TimeRange = 'today' | 'all'
const timeRange = ref<TimeRange>('all')

const dayKeyFromISO = (input: string | Date | number) => {
  const d = input instanceof Date ? input : new Date(input)
  if (isNaN(d.getTime())) return String(input).slice(0, 10) // best effort
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}` // local YYYY-MM-DD
}
const todayKey = () => dayKeyFromISO(new Date().toISOString())

/** Completions after applying the time filter */
const filteredCompletions = computed(() => {
  const list = progress.completions ?? []
  if (timeRange.value === 'today') {
    const k = todayKey()
    return list.filter((c) => dayKeyFromISO(c.completedAt) === k)
  }
  return list
})

/** Count for the hero pill */
const total = computed(() => filteredCompletions.value.length)

const normalizeCompletion = (c: any) => ({
  tip_id: c.id,
  tip: c.tip,
  tip_des: c.tip_des || '',
  brainy_background: c.brainy_background || '',
  source_url: c.source_url || c.source || '',
  skills: c.skills || [],
  age_code: c.age_code || '',
  activityName: c.activityName || '',
  activityId: c.activityId ?? '',
})

const openFromCompletion = (c: any) => {
  selectedTip.value = normalizeCompletion(c)
  showTip.value = true
}

const activeTab = ref<'skills' | 'history'>('skills')

// Skills tab data
const skillsList = computed(() => {
  const counts: Record<string, number> = {}
  for (const c of filteredCompletions.value) {
    const seen = new Set<string>()
    for (const sk of c.skills || []) {
      const code = (sk.code ?? '').trim()
      if (!code || seen.has(code)) continue
      seen.add(code)
      counts[code] = (counts[code] ?? 0) + 1
    }
  }
  const rows = Object.entries(counts).map(([code, count]) => ({ code, count }))
  return rows.sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
})

// History tab data sorted by date desc in the getter
// const groupedHistory = computed(() => {
//   const byDate: Record<string, typeof filteredCompletions.value> = {}
//   for (const c of filteredCompletions.value) {
//     const k = dayKeyFromISO(c.completedAt)
//     ;(byDate[k] ||= []).push(c)
//   }
//   // sort descending by date key
//   return Object.fromEntries(Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0])))
// })
// 按天 + tip 去重后的 history
const groupedHistory = computed(() => {
  const byDate: Record<string, any[]> = {}

  for (const c of filteredCompletions.value) {
    const k = dayKeyFromISO(c.completedAt)
    const tipKey = c.id

    if (!byDate[k]) byDate[k] = []

    // 找当天是否已有这个 tip
    const existing = byDate[k].find((item) => item.id === tipKey)
    if (existing) {
      existing.count = (existing.count || 1) + 1
      // 保留最新完成时间
      if (c.completedAt > existing.completedAt) {
        existing.completedAt = c.completedAt
      }
    } else {
      byDate[k].push({ ...c, count: 1 })
    }
  }

  // 日期降序
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  // 每天的卡片再按最新完成时间排序
  const sorted = Object.fromEntries(
    sortedDates.map((date) => [
      date,
      byDate[date].sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    ]),
  )

  return sorted
})

const fmtDate = (input: string | Date | number | null | undefined) => {
  if (input == null) return ''
  let d: Date

  if (input instanceof Date) {
    d = input
  } else if (typeof input === 'number') {
    d = new Date(input)
  } else if (typeof input === 'string') {
    // supports 'YYYY-MM-DD' and full ISO strings
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, day] = input.split('-').map(Number)
      d = new Date(y, m - 1, day)
    } else {
      const t = Date.parse(input)
      d = isNaN(t) ? new Date() : new Date(t)
    }
  } else {
    d = new Date()
  }

  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
// load activity image
const PROGRESS_IMAGES = import.meta.glob(
  '../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}',
  { eager: true, import: 'default', query: '?url' },
) as Record<string, string>

const progressImage = (actName?: string): string => {
  if (!actName) return ''
  const variants = [
    actName + '2',
    actName.replace(/\s+/g, '-') + '2',
    actName.replace(/\s+/g, '') + '2',
  ].map((v) => v.toLowerCase().replace(/[^a-z0-9]/g, ''))

  for (const [path, url] of Object.entries(PROGRESS_IMAGES)) {
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
  <section class="hero-top">
    <div class="hero-content">
      <h1>Progress</h1>
      <p>
        Monitor your child's progress and celebrate achievements. Easily track your child's growing
        skills and browse the full history of personalized tips.
      </p>
    </div>
  </section>
  <div class="progress">
    <!-- Hero -->
    <section class="progress-hero">
      <div class="progress-hero_inner">
        <div class="progress-hero_copy">
          <h1 class="progress-hero_title">Your Progress</h1>
          <p class="progress-hero_sub">Track your achievements and celebrate growth!</p>
          <span class="progress-hero_pill"
            >You've completed <span style="font-size: 20px">{{ total }}</span> Tips
          </span>

          <p class="storage-hint">
            💡 Your progress is stored locally in your browser (localStorage).
          </p>
        </div>
        <img class="progress-hero_img" src="/public/progress.png" alt="" />
        <!-- Selector -->
        <div class="time-filter" role="tablist" aria-label="Time range">
          <button
            class="time-pill"
            :class="{ active: timeRange === 'today' }"
            @click="timeRange = 'today'"
          >
            Today
          </button>
          <button
            class="time-pill"
            :class="{ active: timeRange === 'all' }"
            @click="timeRange = 'all'"
          >
            All time
          </button>
        </div>
      </div>
    </section>

    <!-- Dashboard -->
    <section class="panel">
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'skills' }]" @click="activeTab = 'skills'">
          Skill Progress
        </button>
        <button
          :class="['tab', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          Tip History
        </button>
      </div>

      <!-- Skills tab -->
      <div v-if="activeTab === 'skills'" class="skills">
        <p v-if="!skillsList.length" class="empty">
          No finished tips yet - complete a tip to see your skill stats.
        </p>
        <ul v-else class="skill-list">
          <li v-for="row in skillsList" :key="row.code" class="skill-row">
            <span class="skill-tag">{{ row.code }}</span>
            <div class="skill-bar">
              <div
                class="skill-bar-fill"
                :style="{ width: (row.count / skillsList[0]?.count) * 100 + '%' }"
              ></div>
              <span class="skill-count">{{ row.count }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- History tab -->
      <div v-else class="history">
        <p v-if="Object.keys(groupedHistory).length === 0" class="empty">
          Nothing here yet - finish a tip to build your history.
        </p>

        <div v-for="(items, date) in groupedHistory" :key="date" class="day">
          <div class="day-header">{{ fmtDate(date) }}</div>

          <!-- Card grid -->
          <div class="tip-grid">
            <article
              v-for="c in [...items].sort((a, b) => b.completedAt.localeCompare(a.completedAt))"
              :key="c.completedAt + ':' + c.id"
              class="tip-card"
              role="button"
              tabindex="0"
              @click="openFromCompletion(c)"
              @keydown.enter="openFromCompletion(c)"
              @keydown.space.prevent="openFromCompletion(c)"
            >
              <div class="fav-media" v-if="progressImage(c.activityName)">
                <img
                  :src="progressImage(c.activityName)"
                  :alt="`${c.activityName} illustration`"
                  loading="lazy"
                />
              </div>
              <div class="fav-media" v-else>
                <img src="/public/process.png" alt="default progress illustration" loading="lazy" />
              </div>

              <div class="fav-content">
                <h3 class="tip-title">{{ c.tip }}</h3>
                <p class="tip-activity">{{ c.activityName }}</p>
                <ul v-if="c.skills?.length" class="history-skills">
                  <li class="history-skill">{{ c.skills[0].code }}</li>
                </ul>
                <p></p>
                <p class="tip-count">Completed {{ c.count }} time<span v-if="c.count > 1">s</span></p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
  <link
    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
</template>

<style scoped>
.hero-top {
  position: relative;
  width: 100%;
  height: 300px;
  background: url('../assets/progress.png') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: 'Nunito', sans-serif;
  color: #333;
}
.hero-top::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(36, 36, 36, 0.4);
  z-index: 0;
}
.hero-top > * {
  position: relative;
  z-index: 1;
}
.hero-content {
  position: relative;
  color: white;
  max-width: 700px;
  margin: 20px;
}
.hero-top h1 {
  font-size: 3.5rem;
}
.hero-top p {
  margin-bottom: 1.5rem;
  font-size: 26px;
  font-weight: 500;
}
.progress {
  padding: 20px;
  width: 900px;
  margin: 0 auto;
}

/* Hero */
.progress-hero {
  margin: 0 0 18px;
}

.progress-hero_inner {
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

.progress-hero_title {
  font-size: clamp(1.6rem, 1.2rem + 1vw, 2.2rem);
  margin: 0;
}

.progress-hero_sub {
  margin: 6px 0 10px;
  color: #6b7280;
  font-size: clamp(1.2rem, 0.5rem + 1vw, 2rem);
}

.progress-hero_pill {
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
.progress-hero_img {
  width: 160px;
  justify-self: end;
}
.storage-hint {
  margin-top: 8px;
  font-size: 16px;
  color: #6b7280;
  /* font-style: italic; */
}

/* Panel & tabs */
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 0;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}
.tab {
  flex: 1 1 0;
  padding: 12px 14px;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 600;
}
.tab.active {
  background: #d9f8f6;
}

/* Skills tab */
.skills {
  padding: 14px;
}
.skill-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.skill-row {
  display: grid;
  grid-template-columns: 250px 1fr; /* left tag ficed, right tag auto */
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
.skill-tag {
  color: #007070;
  background: #eaf7f7;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  font-weight: 600;
  text-align: center;
}
.skill-bar {
  position: relative;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  height: 28px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  overflow: hidden;
}
.skill-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(52, 211, 153, 0.7), rgba(5, 150, 105, 0.8));
  border-radius: 999px;
  z-index: 0;
}
.skill-count {
  position: relative;
  z-index: 1;
  font-weight: 700;
  color: #111827;
  margin-left: auto;
}

/* History tab (cards) */
.history {
  padding: 14px;
}

/* Day header */
.day + .day {
  margin-top: 18px;
}
.day-header {
  display: inline-block;
  background: #eef3ff;
  color: #1e3a8a;
  font-weight: 700;
  font-size: 16px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 2px solid #c7d2fe;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  margin: 0 0 14px;
  cursor: default;
  transition: background 0.2s ease;
  text-transform: uppercase;
}
.tip-count {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  background: #eaf7f7;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 2px 10px;
  color: #007070;
  margin: 0;
}
/* Card grid */
.tip-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .tip-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .tip-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Individual tip card */
.tip-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
  cursor: pointer;
}
.tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.08);
}
/* image */
.fav-media {
  position: relative;
  width: 100%;
  height: 160px;
  background: #f7f7f7;
}

.fav-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* content */
.fav-content {
  padding: 12px 16px 16px;
}

.tip-title {
  font-size: 18px;
  margin: 8px 0 6px;
  font-weight: 700;
  color: #0f172a;
}

.tip-activity {
  font-size: 14px;
  color: #475569;
  margin: 0 0 8px;
}

.history-skills {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-skill {
  font-size: 12px;
  background: #d1fae5;
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid #e5e7eb;
  font-weight: 600;
}

.time-filter {
  /* Selector style */
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin: 8px 0 16px;
}

.time-pill {
  font: inherit;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}
.time-pill.active {
  border-color: #5985e1;
  background: #eef3ff;
  font-weight: 600;
}

/* Empty state */
.empty {
  color: #6b7280;
  padding: 18px 8px;
  text-align: center;
}
</style>
