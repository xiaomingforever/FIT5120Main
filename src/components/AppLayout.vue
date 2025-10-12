<script setup lang="ts">
// import AppHeader from '@/components/AppHeader.vue'
// import AppSidebar from '@/components/AppSidebar.vue'
import HeadBar from './HeadBar.vue';
</script>

<template>
  <div class="page">
    <HeadBar />
    <div class="shell">
      <!-- <AppSidebar /> -->
      <main class="main">
        <!-- Child pages render  -->
         <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  margin-top: 80px;
}
.main {
  font-family: 'Nunito', sans-serif;
  background: #fbf6ef;
}
/* .page {
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
  margin-top: 80px;
}
.main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100vh;
  padding: 22px 24px 40px;
}
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }
} */
</style>
