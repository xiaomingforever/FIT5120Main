<script setup lang="ts">
import { ref } from 'vue'
// TODO: wire real stats/store
const completedThisMonth = 5
// Temporary history array
interface HistoryItem {
  date: string
  skill: string
  exercise: string
  favorited: boolean
}
// mockup data
const history = ref<HistoryItem[]>([
  { date: 'Fri 22 Aug', skill: 'Creativity', exercise: 'Teeth Together', favorited: true },
  { date: 'Thu 21 Aug', skill: 'Memory', exercise: 'Number Recall', favorited: false },
  { date: 'Wed 20 Aug', skill: 'Focus', exercise: 'Color Match', favorited: false },
])
</script>

<template>
  <div class="page-wrap">
    <!-- HERO CARD -->
    <section class="prog-hero">
      <div class="prog-hero_inner">
        <div class="prog-hero_copy">
          <h1 class="prog-hero_title">Your Progress</h1>
          <p class="prog-hero_sub">
            Way to go! Every practice you complete helps children's brains grow strong and flexible.
          </p>

          <hr class="prog-hero_rule" />

          <p class="prog-hero_stat">
            You have completed
            <span class="prog-hero_count">{{ completedThisMonth }}</span>
            Exercises this month
          </p>
        </div>
      </div>
    </section>

    <!-- (history, charts, etc.) -->
    <section class="history-card">
      <h2>History</h2>

      <div class="history-header">
        <span>Skills</span>
        <span>Exercises</span>
        <!-- add dropdowns for year/month here -->
      </div>

      <div class="history-list">
        <div v-for="(item, index) in history" :key="index" class="history-item">
          <div class="history-date">{{ item.date }}</div>
          <span class="skill-tag">{{ item.skill }}</span>
          <span class="exercise-name">{{ item.exercise }}</span>
          <span class="favorite" :class="{ active: item.favorited }">♥</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-wrap {
  padding: 0 12px 40px;
}

/* HERO */
.prog-hero {
  width: min(1100px, 92vw);
  margin: 16px auto 28px;
}
.prog-hero_inner {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 28px;
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  align-items: center;
  gap: 18px;
}

.prog-hero_title {
  font-size: clamp(30px, 3.4vw, 56px);
  line-height: 1.05;
  margin: 0 0 10px;
}
.prog-hero_sub {
  margin: 0 0 16px;
  font-size: 1.125rem;
  color: #1f1f1fb3;
}
.prog-hero_rule {
  border: none;
  border-top: 3px solid #1f1f1f36;
  margin: 14px 0 12px;
}
.prog-hero_stat {
  margin: 0;
  font-size: clamp(18px, 1.6vw, 26px);
  font-weight: 700;
}
.prog-hero_count {
  color: #2b8df5;
  padding: 0 6px;
}

@media (max-width: 860px) {
  .prog-hero_inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .prog-hero_art {
    justify-self: center;
    width: 180px;
    margin-top: 8px;
  }
}
.history-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-top: 2rem;
  width: min(960px, 88vw);
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: bold;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-date {
  background: #f3f3f3;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.skill-tag {
  background: #d6f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.exercise-name {
  flex: 1;
  font-weight: 500;
}

.favorite {
  cursor: pointer;
  color: #bbb;
}

.favorite.active {
  color: red;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  width: min(960px, 88vw);
  margin: 0 auto;
}
</style>
