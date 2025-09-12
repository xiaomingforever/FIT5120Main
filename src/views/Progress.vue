<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useProgressStore } from '@/stores/progress'

const store = useProgressStore()
onMounted(() => store.load())

const activeTab = ref<'skills' | 'history'>('skills')

// Skills tab data
const skillsList = computed(() => {
  const rows = Object.entries(store.skillsCount).map(([code, count]) => ({ code, count }))
  // sort by count desc, then alpha
  return rows.sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
})

// History tab data sorted by date desc in the getter
const groupedHistory = computed(() => store.byDate)

function fmtDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map((x) => parseInt(x, 10))
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <!-- Hero Section -->
  <section class="hero-top">
    <div class="hero-content">
      <h1>Progress</h1>
      <p>
        Monitor your child's progress and celebrate achievements.
        Easily track your child's growing skills and browse the full history of personalized tips.
      </p>
    </div>
  </section>
  <div class="progress">
    <!-- Hero -->
    <section class="hero">
      <h1 class="title">Your progress</h1>
      <p class="subtitle">You've completed</p>
      <div class="counter">{{ store.total }}</div>
      <p class="caption">total tips</p>
    </section>

    <!-- Dashboard -->
    <section class="panel">
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'skills' }]" @click="activeTab = 'skills'">
          Skills
        </button>
        <button
          :class="['tab', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          History
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
            <span class="skill-count">{{ row.count }}</span>
          </li>
        </ul>
      </div>

      <!-- History tab -->
      <div v-else class="history">
        <p v-if="!groupedHistory.length" class="empty">
          Nothing here yet - finish a tip to build your history.
        </p>

        <div v-for="[date, items] in groupedHistory" :key="date" class="day">
          <h3 class="day-title">{{ fmtDate(date) }}</h3>
          <ul class="day-list">
            <li v-for="c in items" :key="c.completedAt + ':' + c.id" class="tip-item">
              <div class="tip-line">
                <span class="tip-name">{{ c.tip }}</span>
                <span class="dot">.</span>
                <span class="tip-activity">{{ c.activityName }}</span>
              </div>
              <ul v-if="c.skills?.length" class="tip-skills">
                <li v-for="s in c.skills" :key="s.code" class="chip">{{ s.code }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-top {
  position: relative;
  width: 100%;
  height: 300px;
  background: url("../assets/progress.png") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: Arial, sans-serif;
  color: #333;
}
.hero-top::before {
  content: "";
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
  font-size: 3rem;
}
.hero-top p {
  margin-bottom: 1.5rem;
  font-size: 24px;
  font-weight: 500;
}
.progress {
  padding: 20px;
  width: 750px;
  margin: 0 auto;
}

/* Hero */
.hero {
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  text-align: center;
  margin-bottom: 18px;
}
.title {
  margin: 0 0 4px;
  font-size: clamp(1.25rem, 0.9rem + 1vw, 1.75rem);
}
.subtitle {
  margin: 0;
  color: #475569;
}
.counter {
  font-size: clamp(2.25rem, 1.6rem + 3vw, 3.25rem);
  font-weight: 800;
  line-height: 1;
  margin: 6px 0;
}
.caption {
  margin: 0;
  color: #64748b;
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
  grid-template-columns: 1fr auto;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
}
.skill-tag {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 2px 8px;
}
.skill-count {
  font-weight: 700;
}

/* History tab */
.history {
  padding: 14px;
}
.day + .day {
  margin-top: 14px;
}
.day-title {
  margin: 0 0 8px;
  color: #334155;
  font-weight: 700;
}
.day-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}
.tip-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
}
.tip-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}
.tip-name {
  font-weight: 600;
}
.tip-activity {
  color: #64748b;
}
.dot {
  color: #cbd5e1;
}
.tip-skills {
  list-style: none;
  padding: 6px 0 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  font-size: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 2px 8px;
}

.empty {
  color: #6b7280;
  padding: 18px 8px;
  text-align: center;
}
</style>
