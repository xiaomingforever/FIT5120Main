<script setup lang="ts">
import { RouterLink } from 'vue-router'
// import icons
import iconToday from '@/assets/Font icons/today_200dp_000000.png'
import iconActivities from '@/assets/Font icons/monitor_heart_200dp_000000.png'
import iconFavorite from '@/assets/Font icons/favorite_empty.png'
import iconProgress from '@/assets/Font icons/analytics_200dp_1F1F1F.png'

type Item = { label: string; to: string; icon: string }
const items: Item[] = [
  { label: 'Today', to: '/today', icon: iconToday },
  { label: 'Activities', to: '/activities', icon: iconActivities },
  { label: 'Favorite', to: '/favorites', icon: iconFavorite },
  { label: 'progress', to: '/progress', icon: iconProgress },
]
</script>

<template>
  <aside class="sidebar" aria-label="Primary">
    <nav>
      <ul>
        <li v-for="it in items" :key="it.to">
          <RouterLink :to="it.to" custom v-slot="{ navigate, isActive, isExactActive }">
            <button
              class="nav-btn"
              :class="{ active: it.to === '/' ? isExactActive : isActive }"
              @click="navigate"
            >
              <img class="icon-img" :src="it.icon" aria-hidden="true" />
              <span class="label">{{ it.label }}</span>
            </button>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  padding: 24px 14px;
  background: var(--sidebar-bg, #f1edcd);
  border-right: 1px solid #e5e5e5;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 1.25rem;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.nav-btn:hover {
  background: #fff;
  border-color: #e5e5e5;
}
.nav-btn.active {
  background: #fff;
  border-color: #e5e5e5;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  position: relative;
}
.nav-btn.active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 8px;
  background: #ffe500;
  border-radius: 0 8px 8px 0;
}
.icon {
  width: 26px;
  text-align: center;
}
.icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex: 0 0 24px;
}
.logo {
  height: 120px;
  width: auto;
  flex: 0 0 auto;
}
</style>
