<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const routine = ref<any[]>([])
const optionsByDaypart = ref<Record<string, any[]>>({}) // 后端返回的活动和 tips

// 读取当前 routine
onMounted(async () => {
  const current = localStorage.getItem('routine')
  if (!current) {
    alert('No routine found! Please generate a routine first.')
    router.push('/')
    return
  }
  const parsed = JSON.parse(current)
  routine.value = parsed.routine

  // 获取每个 daypart 的活动和 tips
  for (const item of routine.value) {
    await fetchOptions(item.period.toLowerCase())
  }

  // 初始化默认 tip
//   routine.value.forEach((item, index) => setDefaultTip(index))
})

// 调用后端 API 获取活动和 tips
const fetchOptions = async (daypart: string) => {
  const age_code = localStorage.getItem('age_group') || '0-1'
  const gender = localStorage.getItem('gender') || 'girl'

  const res = await fetch('https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age_code, gender, daypart })
  })
  const data = await res.json()

  // 映射字段
  const mapped = (data.options || []).map(act => ({
    id: act.id,
    act_name: act.name,
    tips: (act.tips || []).map(tip => ({
      tip_code: tip.tip_id,
      tip_name: tip.tip
    }))
  }))

  optionsByDaypart.value[daypart] = mapped
}

// 返回 daypart 活动列表
const activitiesByDaypart = (daypart: string) => {
  return optionsByDaypart.value[daypart] || []
}

// 返回 activity 的 tip 列表
const tipsByActivity = (actId: number, daypart: string) => {
  const acts = activitiesByDaypart(daypart)
  const act = acts.find(a => a.id === actId)
  return act?.tips || []
}

// 设置默认 tip
// const setDefaultTip = (index: number) => {
//   const dp = routine.value[index].period
//   const tips = tipsByActivity(routine.value[index].activity.id, dp)
//   if (tips.length) routine.value[index].activity.tip = tips[0].tip_name
//   else routine.value[index].activity.tip = ''
// }

// activity 改变时更新 tip
const updateActivity = (index: number) => {
  setDefaultTip(index)
}

// 保存到 localStorage
const saveRoutine = () => {
  const saved = {
    age_group: localStorage.getItem('age_group') || '0-1',
    gender: localStorage.getItem('gender') || 'Both',
    routine: routine.value,
    name: 'Routine_' + Date.now()
  }
  // 更新当前 routine
  localStorage.setItem('routine', JSON.stringify(saved))

  // 保存到复用列表
  let stored = JSON.parse(localStorage.getItem('saved_routines') || '[]')
  stored.push(saved)
  localStorage.setItem('saved_routines', JSON.stringify(stored))
  alert('Saved!')
  router.push('/')
}
</script>

<template>
  <div class="edit-routine">
    <h2>Edit Routine</h2>
    <ul>
      <li v-for="(item, index) in routine" :key="index">
        <strong>{{ item.period }}:</strong>
        <select v-model="item.activity.id" @change="updateTips(index)">
          <option v-for="act in activitiesByDaypart(item.period)" :value="act.id" :key="act.id">
            {{ act.act_name }}
          </option>
        </select>

        <select v-model="item.activity.tip">
          <option v-for="tip in tipsByActivity(item.activity.id, item.period)" :value="tip.tip_name" :key="tip.tip_code">
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

