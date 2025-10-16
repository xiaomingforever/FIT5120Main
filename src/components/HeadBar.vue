<template>
  <link
    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
  <div class="home-page">
    <!-- Navbar -->
    <header class="navbar">
      <!-- <div class="logo">Brain<span>Builder</span></div> -->
      <router-link to="/Home" aria-label="Go to Today">
        <img class="logo" src="/src/assets/logo/Brainlogo.png" alt="BrainBuilder" />
      </router-link>

      <!-- Search  -->
      <div v-if="showSearch" class="header-search" role="search">
        <input
          v-model="search.query"
          class="search-input"
          type="search"
          placeholder="Search tips or skills..."
          aria-label="Search tips or skills"
          @keyup.enter="goSearch"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeydown"
        />
        <!-- <button
          v-if="search.query"
          class="search-clear"
          @click="search.clear()"
          aria-label="Clear search"
        >
          ×
        </button> -->
        <button class="search-btn" @click="goSearch" aria-label="Search">Search</button>
        <!-- Suggestion dropdown -->
        <ul v-show="suggestionsOpen && suggestions.length" class="suggestions" role="listbox">
          <li
            v-for="(code, i) in suggestions"
            :key="code"
            class="suggestion-item"
            :class="{ active: i === focusedIndex }"
            role="option"
            @mousedown.prevent="pickSuggestion(code)"
            :aria-label="prettySkill(code)"
          >
            {{ prettySkill(code) }}
          </li>
        </ul>
      </div>
      <div class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <!-- Nav menu -->
      <div class="nav-container">
        <ul :class="['nav-links', { active: isOpen }]">
          <!-- <li>
            <router-link to="/">
              <font-awesome-icon icon="house" style="color: yellowgreen" /> Home //no need for this right now
            </router-link>
          </li> -->

          <li class="dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <a href="#">
              <font-awesome-icon icon="brain" style="color: skyblue" /> Try Brain Builder ▾
            </a>
            <ul v-if="showDropdown" class="dropdown-menu">
              <li>
                <router-link
                  to="/activities"
                  :class="{ active: $route.path.startsWith('/activities') }"
                >
                  <font-awesome-icon icon="clipboard-list" style="color: green" /> Explore
                  Activities
                </router-link>
              </li>
              <li>
                <router-link to="/today">
                  <font-awesome-icon icon="lightbulb" style="color: orange" /> Today's Tips
                </router-link>
              </li>

              <li>
                <router-link to="/favorites">
                  <font-awesome-icon icon="star" style="color: palevioletred" /> Favorite Tips
                </router-link>
              </li>
              <li>
                <router-link to="/progress">
                  <font-awesome-icon icon="chart-line" style="color: skyblue" /> Tips Progress
                </router-link>
              </li>
            </ul>
          </li>

          <li>
            <router-link to="/DataInsights">
              <font-awesome-icon icon="dashboard" style="color: palevioletred" /> Data Insights
            </router-link>
          </li>

          <li>
            <router-link to="/Stories">
              <font-awesome-icon icon="coffee" style="color: burlywood" /> Stories
            </router-link>
          </li>
          <li>
            <router-link to="/learning-start">
              <font-awesome-icon icon="book" style="color: brown" /> Learning
            </router-link>
          </li>
          <li>
            <router-link to="/AITools">
              <font-awesome-icon icon="robot" style="color: gray" /> AI Tools
            </router-link>
          </li>
        </ul>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useSkillsStore } from '@/stores/skills'

const showDropdown = ref(false)

const isOpen = ref(false)
const toggleMenu = () => {
  isOpen.value = !isOpen.value
}
const route = useRoute()
const router = useRouter()

const search = useSearchStore()
const SHOW_ON = ['Activities', 'TipsDisplay', 'SearchResults', 'Today', 'Progress', 'Favorites']
const showSearch = computed(() => SHOW_ON.includes(String(route.name || '')))

const skills = useSkillsStore()
const prettySkill = (s: string) => s.replace(/_/g, ' ');

onMounted(() => {
  skills.load()
})

// dropdown
const suggestionsOpen = ref(false)
const focusedIndex = ref(-1)
const suggestions = computed(() => skills.filtered(search.query).slice(0, 10)) //number of suggestions

function onFocus() {
  suggestionsOpen.value = true
}

function onBlur() {
  // let click/mousedown on an item register first
  setTimeout(() => {
    suggestionsOpen.value = false
    focusedIndex.value = -1
  }, 80)
}
// clear search when leaving the pages where the bar is visible
watch(showSearch, (vis) => {
  if (!vis) search.clear()
})
/**
 * Keyboard controls:
 * ArrowDown / ArrowUp: move focus through suggestions
 * Enter: choose the focused suggestion (or submit current text if none)
 * Escape: close the dropdown
 */
function onKeydown(e: KeyboardEvent) {
  if (!suggestionsOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
    suggestionsOpen.value = true
  }
  if (!suggestions.value.length) return

  if (e.key === 'ArrowDown') {
    focusedIndex.value = (focusedIndex.value + 1) % suggestions.value.length
    e.preventDefault()
  }
  if (e.key === 'ArrowUp') {
    focusedIndex.value =
      (focusedIndex.value + suggestions.value.length - 1) % suggestions.value.length
    e.preventDefault()
  }
  if (e.key === 'Escape') {
    suggestionsOpen.value = false
    focusedIndex.value = -1
  }

  if (e.key === 'Enter') {
    const pick =
      focusedIndex.value >= 0 ? suggestions.value[focusedIndex.value] : search.query.trim()
    if (pick) pickSuggestion(pick)
  }
}
// Apply a clicked (or Enter-selected) suggestion
function pickSuggestion(code: string) {
  search.set(code.replace(/_/g, ' '))
  goSearch()
  suggestionsOpen.value = false
  focusedIndex.value = -1
}
//Navigate to the Search Results page with the current query
function goSearch() {
  const q = search.query.trim()
  if (!q) return
  router.push({ name: 'SearchResults', query: { q } })
}
//Reset the search text
watch(showSearch, (vis) => {
  if (!vis) search.clear()
})
</script>

<style scoped>
.home-page {
  font-family: 'Nunito', sans-serif;
  color: #333;
  line-height: 1.6;
  background-color: #fbf6ef;
  font-weight: 700;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  z-index: 2000;
  height: 80px;
  width: 100%;
  box-sizing: border-box;
}

.nav-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  height: 60px;
  width: auto;
  flex: 0 0;
  margin-right: 200px;
  margin-left: 0;
  margin-top: 10px;
}
/* Searchbar */
.header-search {
  position: relative;
  right: 60px;
  display: flex;
  align-items: center;
  gap: 6px;
  width: min(280px, 38vw);
  /* margin-left: -20px; */
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
}
.search-input:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}
.search-clear {
  position: absolute;
  right: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.search-btn {
  margin-left: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  padding: 8px 10px;
  cursor: pointer;
}
.search-btn:focus {
  outline: 3px solid rgba(20, 184, 166, 0.25);
}
.suggestions {
  position: absolute; z-index: 30; top: calc(100% + 6px); left: 0; right: 0;
  max-height: 280px; overflow: auto; background: #fff;
  border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,.08);
  margin: 0; padding: 6px 0; list-style: none;
}
.suggestion-item { padding: 8px 12px; cursor: pointer; }
.suggestion-item:hover, .suggestion-item.active { background: #ecfeff; }

.nav-links {
  list-style: none;
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-links li {
  display: inline-block;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 20px;
}

.nav-links a:hover {
  background-color: #f2f2f2;
  color: #14b8a6;
  padding: 10px 16px;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  margin: 0;
  list-style: none;
  padding: 8px 0;
  min-width: 260px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.dropdown-menu li {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}

.dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 16px;
  text-decoration: none;
  color: inherit;
  border-radius: 0;
}
.dropdown-menu a:hover,
.dropdown-menu a:focus {
  background-color: #f2f2f2;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #333;
  border-radius: 2px;
}

/* small screen */
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }
  .header-search {
    order: 3; /* push below nav items if any */
    width: 100%;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .search-input {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    padding: 10px 12px;
    font-size: 14px;
  }
  .search-btn {
    flex: 0 0 auto;
    padding: 10px 12px;
    font-size: 14px;
  }

  .nav-links {
    position: absolute;
    top: 60px;
    right: 0;
    width: 200px;
    background: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    display: none;
  }

  .nav-links.active {
    display: flex;
  }
  .nav-right {
    margin-left: auto;
  }
}

.router-link-active {
  background-color: #f2f2f2;
  color: #14b8a6 !important;
  border-radius: 6px;
  padding: 10px 16px;
  /* color: inherit !important; */
  font-weight: bold;
}
</style>
