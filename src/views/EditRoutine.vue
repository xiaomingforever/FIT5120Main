<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const routine = ref<any[]>([])
  const optionsByDaypart = ref<Record<string, any[]>>({}) 

  // read current routine
  onMounted(async () => {
    const current = localStorage.getItem('routine')
    if (!current) {
      alert('No routine found! Please generate a routine first.')
      router.push('/')
      return
    }
    const parsed = JSON.parse(current)
    routine.value = parsed.routine

    // get each daypart's activity and tips
    for (const item of routine.value) {
      await fetchOptions(item.period.toLowerCase())
    }
  })

  // API get activities and tips
  const fetchOptions = async (daypart: string) => {
    const age_code = localStorage.getItem('age_code') || '0-1y'
    const gender = localStorage.getItem('gender') || 'girl'

    const res = await fetch('https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age_code, gender, daypart })
    })
    const data = await res.json()

    // map keys
    const mapped = (data.options || []).map((act: { id: any; name: any; tips: any }) => ({
      id: act.id,
      act_name: act.name,
      tips: (act.tips || []).map((tip: { tip_id: any; tip: any; age_code: string }) => ({
        tip_code: tip.tip_id,
        tip_name: tip.tip,
        age_code: tip.age_code
      }))
    }))

    optionsByDaypart.value[daypart] = mapped
  }

  // return daypart list
  const activitiesByDaypart = (daypart: string) => {
    return optionsByDaypart.value[daypart] || []
  }

  // return activity's tip list
  const tipsByActivity = (actId: number, daypart: string) => {
    const age_code = localStorage.getItem('age_code') || '0-1y'
    const acts = activitiesByDaypart(daypart)
    const act = acts.find(a => a.id === actId)
    if (!act) return []

    // 只返回 age_code 匹配的 tips，并去重
    const filtered = act.tips
      .filter(t => t.age_code === age_code)
    // 按 tip_id 去重
    const unique = Array.from(new Map(filtered.map(t => [t.tip_code, t])).values())
    return unique
  }

  // set default tip
  const setDefaultTip = (index: number) => {
    const dp = routine.value[index].period.toLowerCase()
    const actId = routine.value[index].activity.id
    const tips = tipsByActivity(actId, dp)
    if (tips.length) {
      routine.value[index].activity.tip = tips[0].tip_name
      routine.value[index].activity.tip_id = tips[0].tip_code
    } else {
      routine.value[index].activity.tip = ''
      routine.value[index].activity.tip_id = null
    }
  }

  // change tip when update activity 
  const updateActivity = (index: number, newActId: number) => {
    const dp = routine.value[index].period.toLowerCase()
    const acts = activitiesByDaypart(dp)
    const selected = acts.find(a => a.id === newActId)
    if (selected) {
      routine.value[index].activity.id = selected.id
      routine.value[index].activity.name = selected.act_name
      // set dufault tip
      setDefaultTip(index)
    }
  }

  // save to localStorage
  const saveRoutine = () => {
    const now = new Date()
    const formatted = now.toLocaleString()
    const saved = {
      age_code: localStorage.getItem('age_code') || '0-1',
      gender: localStorage.getItem('gender') || 'Both',
      routine: routine.value,
      name: `Routine ${formatted}`
    }
    // update current routine
    localStorage.setItem('routine', JSON.stringify(saved))

    // save to reuse list
    let stored = JSON.parse(localStorage.getItem('saved_routines') || '[]')
    stored.push(saved)
    localStorage.setItem('saved_routines', JSON.stringify(stored))
    alert('Saved!')
    router.push('/today')
  }
</script>

<template>
  <div class="edit-routine">
    <h2>Edit Routine</h2>
    <ul>
      <li v-for="(item, index) in routine" :key="index">
        <strong>{{ item.period }}:</strong>
        <select v-model="item.activity.id" @change="updateActivity(index, item.activity.id)">
          <option v-for="act in activitiesByDaypart(item.period.toLowerCase())" :value="act.id" :key="act.id">
            {{ act.act_name }}
          </option>
        </select>

        <select v-model="item.activity.tip">
          <option v-for="tip in tipsByActivity(item.activity.id, item.period.toLowerCase())" :value="tip.tip_name" :key="tip.tip_code">
            {{ tip.tip_name }}
          </option>
        </select>
      </li>
    </ul>

    <button @click="saveRoutine">Save Routine</button>
    <button @click="router.back()" class="btn-back">Back</button>
  </div>
</template>

<style scoped>
.edit-routine {
  max-width: 900px;
  margin: auto 120px;
  font-family: 'Segoe UI', sans-serif;
}

h2 {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

li:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2980b9;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
}

select {
  width: 100%;
  padding: 8px 12px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

button {
  display: inline-block;
  padding: 12px 24px;
  margin-right: 10px;
  border: none;
  border-radius: 10px;
  background: #3498db;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

button:hover {
  background: #2980b9;
  transform: translateY(-2px);
}
</style>

