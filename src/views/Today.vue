<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SelectorModal from '@/components/SelectorModal.vue'
import CategoryCloudCard from '@/components/CategoryCloudCard.vue'

const showSelector = ref(false)

onMounted(() => {
  // show only if no profile saved yet
  const saved = localStorage.getItem('bbProfile')
  showSelector.value = true // change to !saved for one time pop up only
})

function handleSubmit(payload: { age: string | null; gender: string | null }) {
  if (payload.age && payload.gender) {
    localStorage.setItem('bbProfile', JSON.stringify(payload))
  }
  showSelector.value = false
}
</script>

<template>
  <main class="main">
    <CategoryCloudCard />
  </main>
  <!-- Modal -->
  <SelectorModal v-model:open="showSelector" @submit="handleSubmit" />
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text);
}
.shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
  align-items: start;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
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
  .main {
    padding-top: 10px;
  }
}
</style>
