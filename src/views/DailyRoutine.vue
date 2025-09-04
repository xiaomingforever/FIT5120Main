<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const routineData = ref<any>(null)
const showSelector = ref(false)
const router = useRouter()

const downloadRoutineTxt = () => {
  const current = localStorage.getItem('routine')
  if (!current) {
    alert('No routines found! Please generate one first.')
    return
  }

  const latest = JSON.parse(current)

  let content = `Routine\nAge Group: ${latest.age_code}, Gender: ${latest.gender}\n\n`
  latest.routine.forEach((item: any) => {
    content += `${item.period} - ${item.activity.name}\n`
    if (item.activity.tip) content += `  Tip: ${item.activity.tip}\n`
    if (item.activity.tip_des) content += `  ${item.activity.tip_des}\n`
    if (item.activity.source) content += `  Source: ${item.activity.source}\n`
    content += '\n'
  })

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `routine_${latest.age_code}_${latest.gender}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// click to complete routine
const markCompleted = (index: number) => {
  routineData.value.routine[index].completed = true
  // save complete status
  localStorage.setItem("todayRoutine", JSON.stringify(routineData.value))
}

// saved routines
const savedRoutines = ref<any[]>(JSON.parse(localStorage.getItem('saved_routines') || '[]'))
// select the latest one
const selectedRoutineIndex = ref<number|null>(null)

const loadRoutine = (e: Event) => {
  const index = parseInt((e.target as HTMLSelectElement).value,10)
  selectedRoutineIndex.value = index
  routineData.value = savedRoutines.value[index]
  localStorage.setItem('routine', JSON.stringify(routineData.value))
}

// regenerate routine
const refreshRoutine = async () => {
  try {
    const age_code = localStorage.getItem('age_code') || '0-1y'
    const gender = localStorage.getItem('gender') || 'girl'
    const res = await fetch('https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_code, gender })
    })
    const data = await res.json()
    // const parsed = JSON.parse(data.body) 
    localStorage.setItem('routine', JSON.stringify(data))
    routineData.value = data,age_code,gender
  } catch (err) {
    console.error(err)
    alert('Failed to generate routine.')
  }
}

onMounted(() => {
  const stored = localStorage.getItem('routine')
  if (stored) routineData.value = JSON.parse(stored)
  // show only if no profile saved yet
  showSelector.value = true
})

  if (savedRoutines.value.length > 0) {
      selectedRoutineIndex.value = savedRoutines.value.length - 1
      routineData.value = JSON.parse(JSON.stringify(savedRoutines.value[selectedRoutineIndex.value]))
      localStorage.setItem('routine', JSON.stringify(routineData.value))
    }

  const editRoutine = () => {
    router.push('/edit')
}

const extractHttpsLink = (text: string): string | null => {
  const match = text.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}
</script>

<template>
  <div class="home-page p-4">
    <h1 class="text-2xl font-bold mb-4">Daily Routine</h1>
    <p class="update-info">
        Routine is updated daily. You can also update manually.
    </p>
    <div v-if="routineData">
      <p>Age Group: {{ routineData.age_code }}, Gender: {{ routineData.gender }}</p>

      <button @click="editRoutine">Edit Routine</button>
      <button @click="downloadRoutineTxt">Download as TXT</button>
      <button @click="refreshRoutine" class="btn-refresh">Update Routine Now</button>
      
      <div class="saved-routines">
        <label for="saved">Load Saved Routine:</label>
        <select id="saved" @change="loadRoutine($event)" v-model="selectedRoutineIndex">
            <option v-for="(r, i) in savedRoutines" :key="i" :value="i">{{ r.name || `Routine ${i+1}` }}</option>
        </select>
      </div>

      <ul class="mt-4 space-y-4">
        <li v-for="(item, index) in routineData.routine" :key="item.activity.id" class="routine-card p-4 border rounded-lg bg-white">
          <!-- skill badge -->
          <div class="skills-container" v-if="item.activity.skills && item.activity.skills.length">
            <span v-for="skill in item.activity.skills" :key="skill.code" class="skill-badge">
              {{ skill.code }}
            </span>
          </div>

          <h2 class="font-semibold">{{ item.period }}</h2>
          <p><strong>Activity:</strong> {{ item.activity.name }}</p>
          <p v-if="item.activity.tip"><strong>Tip:</strong> {{ item.activity.tip }}</p>
          <p v-if="item.activity.tip_des">{{ item.activity.tip_des }}</p>
          <p v-if="item.activity.source" class="source">
            <strong>Source:</strong>
            <span v-if="extractHttpsLink(item.activity.source)">
              <a 
                :href="extractHttpsLink(item.activity.source)!" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {{ extractHttpsLink(item.activity.source) }}
              </a>
            </span>
            <span v-else>
              {{ item.activity.source }}
            </span>
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

.update-info {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 12px;
  text-align: center;
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