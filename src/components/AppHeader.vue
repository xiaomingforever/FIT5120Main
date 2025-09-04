<script setup lang="ts">
  import { ref, computed, onMounted } from "vue"
  import { useRouter } from "vue-router"

  const router = useRouter()
  const query = ref("")
  const allActivities = ref<any[]>([])
  const showDropdown = ref(false)

  onMounted(async () => {
    const res = await fetch("https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_code: "1-3y",
        gender: "girl",
        daypart: "morning",
        query: query.value   
      })
    })
    const data = await res.json()
    allActivities.value = data.options || []
  })

  // filter by input
  const filteredActivities = computed(() => {
    if (!query.value) return allActivities.value
    return allActivities.value.filter((a) =>
      a.name.toLowerCase().includes(query.value.toLowerCase())
    )
  })

  const goToTips = (activity: any) => {
    const age = localStorage.getItem("age_code") || "1-3y"
    showDropdown.value = false
    query.value = activity.name
    router.push({
    path: `/activities/${activity.id}`,
    query: {
      name: activity.name,
      age
    }})   // jump to tips page
    showDropdown.value = false
  }
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="brand">
        <router-link to="/Home" aria-label="Go to Today">
          <img class="logo" src="/src/assets/logo/Brainlogo.png" alt="BrainBuilder" />
        </router-link>
      </div>

      <div class="search">
        <img
          class="search-icon"
          src="/src/assets/Font icons/search_200dp_999999.png"
          alt="search bar"
        />
        <input
          type="search"
          v-model="query"
          placeholder="Search activities"
          @focus="showDropdown = true"
          aria-label="Search activities"
        />

        <!-- drop down box -->
        <ul v-if="showDropdown && filteredActivities.length" class="dropdown">
        <li
          v-for="activity in filteredActivities"
          :key="activity.id"
          @click="goToTips(activity)"
        >
          {{ activity.name }}
        </li>
      </ul>
      </div>

      <button class="profile" aria-label="Profile / settings">
        <img class="profile-icon" src="/src/assets/Font icons/monitor_heart_200dp_000000.png" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 100px;
  align-items: center;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  position: sticky;
  top: 0;
  justify-content: space-between;
  gap: 16px;
  z-index: 10;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}
.brand-mark {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.brand-text {
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: 0.2px;
}
.brand-text .accent {
  color: var(--brand-teal);
}
.header-inner {
  width: 100%;
  padding: 0 8px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.logo {
  height: 130px;
  width: auto;
  flex: 0 0;
  margin-right: 200px;
  margin-left: 0;
}
.search {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 700px;
  margin: 0 48px;
  background: #fff;
  border: 2px solid #ccc;
  border-radius: 24px;
  padding: 10px 14px;
}
.search input {
  width: 100%;
  padding: 10px 12px 10px 34px;
  border: none;
  outline: none;
  font-size: 1.125rem;
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
}
.dropdown li {
  padding: 8px 12px;
  cursor: pointer;
}
.dropdown li:hover {
  background: #f5f5f5;
}
.search-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.search input {
  width: 100%;
  padding: 10px 12px 10px 34px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  outline: none;
  font-size: 1.125rem;
}
.profile {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.profile-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
</style>
