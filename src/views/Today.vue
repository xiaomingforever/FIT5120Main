<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import CategoryCloudCard from '@/components/CategoryCloudCard.vue'

  const router = useRouter()

  const routineData = ref<any>(null)
  // const showSelector = ref(false)

  const activityImages: Record<string, string> = {
  "diaper-change": "src/assets/Activities/Excercise/diaper-change2.png",
  "playtime": "src\assets\Activities\Excercise\playtime2.png",
  "bath-time": "src\assets\Activities\Excercise\bathtime2.png"
}

  onMounted(() => {
    const ageSaved = localStorage.getItem('age_code')
    const routineSaved = localStorage.getItem('routine')
    // showSelector.value = true // change false to show the selector only once
    if (!ageSaved || !routineSaved) {
      router.push('/selector')
    } else {
      try {
        const parsed = JSON.parse(routineSaved)
        // randomly choose one routine item
        if (parsed.routine && parsed.routine.length > 0) {
          const randomIndex = Math.floor(Math.random() * parsed.routine.length)
          routineData.value = {
            age_code: parsed.age_code,
            gender: parsed.gender,
            routine: [parsed.routine[randomIndex]] 
          }
        }
      } catch (e) {
        console.error("Failed to parse routine from localStorage:", e)
      }
    }
  })

  // function handleSubmit(payload: { age: string | null; gender: string | null }) {
  //   if (payload.age && payload.gender) {
  //     localStorage.setItem('bbProfile', JSON.stringify(payload))
  //   }
  //   showSelector.value = false
  // }

  function editProfile() {
    // remove olad profile data
    localStorage.removeItem('age_code')
    localStorage.removeItem('gender')
    localStorage.removeItem('routine')

    router.push('/selector')
  }

  const extractHttpsLink = (text: string): string | null => {
    const match = text.match(/https?:\/\/[^\s]+/i)
    return match ? match[0] : null
  }
</script>

<template>
  <main class="main">
    <!-- tool bar -->
    <div class="toolbar">
      <button class="edit-btn" @click="editProfile">
        Edit Child's Profile
      </button>
    </div>

    <!-- Exercise Card -->
    <div class="exercise-card">
      <div v-if="routineData">
        <p>Age Group: {{ routineData.age_code }}, Gender: {{ routineData.gender }}</p>
      
        <div v-for="(item, index) in routineData.routine" :key="item.activity.id" class="p-4 border rounded-lg bg-white">
          <!-- skills tags -->
          <div class="tags" v-if="item.activity.skills && item.activity.skills.length">
            <span v-for="skill in item.activity.skills" :key="skill.code" class="tag">
              {{ skill.code.toUpperCase() }}
            </span>
          </div>

          <!-- title -->
          <h2 class="title" v-if="item.activity.tip">{{  item.activity.tip  }}</h2>
          <!-- description -->
          <p class="desc" v-if="item.activity.tip_des">{{ item.activity.tip_des }}</p>
          <!-- Image -->
           <img class="illustration" src="/src/assets/Activities/ActivityCard/LearningTime1.png" alt="image"/>
          <!-- Why this matters -->
          <div class="why" v-if="item.activity.brainyBackground">
            <h3>Why this matters</h3>
            <p>{{ item.activity.brainyBackground }}</p>
          </div>
          <!-- source -->
          <div v-if="item.activity.source" class="source">
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
          </div>
        </div>
      </div>
      <button class="done-btn">Done</button>
    </div>

    <!-- Activity Grid -->
    <CategoryCloudCard />
  </main>

  <!-- Modal -->
  <!-- <SelectorModal v-model:open="showSelector" @submit="handleSubmit" /> -->
</template>

<style scoped>
.main {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.edit-btn {
  display: block;
  margin: 20px auto 0;
  background: #007070;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
}
.edit-btn:hover {
  background: #1fab45;
}

/* Exercise card */
.exercise-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.exercise-card .tags {
  font-size: 12px;
  font-weight: bold;
  color: #008080;
  background: #eaf7f7;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  margin-bottom: 8px;
}
.exercise-card .tag {
  font-size: 12px;
  font-weight: 600;
  color: #007070;
  background: #eaf7f7;
  padding: 4px 8px;
  border-radius: 6px;
}
.exercise-card .title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}
.exercise-card .desc {
  margin-bottom: 16px;
  line-height: 1.4;
}
.exercise-card .illustration {
  width: 100px;
  margin: 0 auto 16px;
  display: block;
}
.exercise-card .why h3 {
  color: #007070;
  margin-bottom: 6px;
}
.source {
  margin-top: 12px;
  font-size: 13px;
}
.exercise-card .done-btn {
  display: block;
  margin: 20px auto 0;
  background: #007070;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
}

/* Activity grid */
.activity-grid h3 {
  font-size: 18px;
  margin-bottom: 16px;
}
.activity-grid .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(140px,1fr));
  gap: 12px;
}
.activity-grid .activity {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
</style>
