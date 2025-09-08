<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="page">
    <AppHeader />
    <div class="shell">
      <AppSidebar />
      <main class="main">
        <!-- Child pages render  -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--page-bg, #fbf6ef);
}
.shell {
  width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  align-items: start;
}
.main {
  padding: 22px 24px 40px;
  display: grid;
  gap: 28px;
}
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }
}
</style>
