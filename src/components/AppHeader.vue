<script setup lang="ts">
const onSearch = (e: Event) => {
  const q = (e.target as HTMLInputElement).value.trim()
  // TODO: route to search or filter activities with `q`
  // console.log('search:', q)
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="brand">
        <img class="logo" src="/src/assets/logo/Brainlogo.png" alt="BrainBuilder" />
      </div>

      <div class="search">
        <img
          class="search-icon"
          src="/src/assets/Font icons/search_200dp_999999.png"
          alt="search bar"
        />
        <input
          type="search"
          placeholder="Search activities"
          @input="onSearch"
          aria-label="Search activities"
        />
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
