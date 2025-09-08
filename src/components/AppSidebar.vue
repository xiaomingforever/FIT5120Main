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
  { label: 'Progress', to: '/progress', icon: iconProgress },
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
  position: sticky;
  top: 108px; 
  height: calc(100vh - 80px);
  width: 300px;
  padding: 24px 14px;
  background: var(--sidebar-bg, #fbf6ef);
  border-right: 1px solid #e5e5e5;
}
/* 小屏幕时（宽度 <= 768px）改为底部导航 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    top: auto;
    width: 100%;
    height: 70px;
    padding: 0;
    border-right: none;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    z-index: 1000;
  }

  .sidebar nav ul {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }

  .nav-btn {
    flex-direction: column;
    justify-content: center;
    font-size: 0.75rem;
    padding: 6px;
    border-radius: 8px;
  }

  .icon-img {
    width: 22px;
    height: 22px;
  }

  .nav-btn.active::before {
    display: none; 
  }

  .nav-btn.active {
    background: #ffe50033;
    border-color: transparent;
    box-shadow: none;
  }
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
