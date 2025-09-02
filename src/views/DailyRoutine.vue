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

const downloadRoutineTxt = () => {
  const current = localStorage.getItem('routine')
  if (!current) {
    alert('No routines found! Please generate one first.')
    return
  }

  const latest =  JSON.parse(current)

  // format to txt
  let content = `Routine: ${latest.name}\nAge Group: ${latest.age_group}, Gender: ${latest.gender}\n\n`
  latest.routine.forEach((item: any) => {
    content += `${item.period} - ${item.activity.name}\n`
    if (item.activity.tip) content += `  Tip: ${item.activity.tip}\n`
    if (item.activity.tip_des) content += `  ${item.activity.tip_des}\n`
    content += '\n'
  })

  // download
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${latest.name || 'routine'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// click to complete routine
const markCompleted = (index: number) => {
  routineData.value.routine[index].completed = true
  // save complete status
  localStorage.setItem("todayRoutine", JSON.stringify(routineData.value))
}
</script>

<template>
  <div class="home-page p-4">
    <h1 class="text-2xl font-bold mb-4">Daily Routine</h1>
    <div v-if="routineData">
      <p>Age Group: {{ routineData.age_group }}, Gender: {{ routineData.gender }}</p>

      <button @click="editRoutine">Edit Routine</button>
      <button @click="downloadRoutineTxt">Download as TXT</button>

      <ul class="mt-4 space-y-4">
        <li v-for="(item, index) in routineData.routine" :key="item.activity.id" class="routine-card p-4 border rounded-lg bg-white">
          <!-- skill badge -->
          <div class="skills-container" v-if="item.activity.skills">
            <span v-for="skill in item.activity.skills.split('|')" :key="skill" class="skill-badge">
                {{ skill }}
            </span>
          </div>

          <h2 class="font-semibold">{{ item.period }}</h2>
          <p><strong>Activity:</strong> {{ item.activity.name }}</p>
          <p v-if="item.activity.tip"><strong>Tip:</strong> {{ item.activity.tip }}</p>
          <p v-if="item.activity.tip_des">{{ item.activity.tip_des }}</p>
          <p v-if="item.activity.sources" class="source">
            <strong>Sources:</strong>
            <a :href="item.activity.sources" target="_blank" rel="noopener noreferrer">
                {{ item.activity.sources }}
            </a>
          </p>
          <button 
            :class="['btn-complete', { done: item.completed }]"
            @click="markCompleted(index)"
            >
            {{ item.completed ? "Done" : "Mark as Done" }}
          </button>
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

.routine-card {
  position: relative; 
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  transition: box-shadow 0.3s;
}

.skills-container {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-badge {
  background: #1eb592;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
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

.source {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #555;
}

.source strong {
  margin-right: 4px;
}

.source a {
  color: #2980b9;         
  text-decoration: underline;
  transition: color 0.2s, transform 0.2s;
}

.source a:hover {
  color: #1c5980;          
  transform: translateX(2px); 
}
</style>