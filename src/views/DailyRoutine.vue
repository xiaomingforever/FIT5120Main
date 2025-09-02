<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const routineData = ref<any>(null)
const showSelector = ref(false)
const router = useRouter()

onMounted(() => {
  const stored = localStorage.getItem('routine')
  if (stored) routineData.value = JSON.parse(stored)
  // show only if no profile saved yet
  showSelector.value = false
})

const editRoutine = () => {
  router.push('/edit')
}

const loadSavedRoutine = () => {
  const saved = JSON.parse(localStorage.getItem('saved_routines') || '[]')
  if (saved.length) {
    routineData.value = saved[saved.length - 1].routine
  }
}
</script>

<template>
  <div class="home-page p-4">
    <h1 class="text-2xl font-bold mb-4">Daily Routine</h1>
    <div v-if="routineData">
      <p>Age Group: {{ routineData.age_group }}, Gender: {{ routineData.gender }}</p>

      <button @click="editRoutine">Edit Routine</button>
      <button @click="loadSavedRoutine">Load Saved Routine</button>

      <ul class="mt-4 space-y-4">
        <li v-for="item in routineData.routine" :key="item.activity.id" class="p-4 border rounded-lg bg-white">
          <h2 class="font-semibold">{{ item.period }}</h2>
          <p><strong>Activity:</strong> {{ item.activity.name }}</p>
          <p v-if="item.activity.tip"><strong>Tip:</strong> {{ item.activity.tip }}</p>
          <p v-if="item.activity.tip_des">{{ item.activity.tip_des }}</p>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No routine generated yet. Go back to <router-link to="/selector">Selector</router-link>.</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 950px;
  margin: auto;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
}

.info {
  margin-bottom: 16px;
  color: #555;
}

.buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

button {
  flex: 1;
  padding: 10px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  background: #3498db;
  color: white;
}

button:hover {
  transform: translateY(-2px);
}

button.edit {
  background: #3498db;
  color: white;
}

button.edit:hover {
  background: #2980b9;
}

button.load {
  background: #ecf0f1;
  color: #2c3e50;
}

button.load:hover {
  background: #d5dbdb;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  transition: box-shadow 0.3s;
}

li:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

li h2 {
  color: #2980b9;
  margin-bottom: 6px;
}

.tip {
  color: #27ae60;
  font-size: 14px;
  margin-top: 6px;
}
</style>
