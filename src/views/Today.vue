<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import CategoryCloudCard from '@/components/CategoryCloudCard.vue'
  import { useProgressStore } from '@/stores/progress'
  import { useFavoritesStore } from '@/stores/favorites'
  import heartEmpty from '@/assets/Font icons/favorite_empty.png'
  import heartRed from '@/assets/Font icons/favorite_red.png'

  const router = useRouter()
  const fav = useFavoritesStore()
  const progress = useProgressStore()

  const routineData = ref<any>(null)
  // const showSelector = ref(false)

//   const activityImages: Record<string, string> = {
//   "diaper-change": "src/assets/Activities/Excercise/diaper-change2.png",
//   "playtime": "src\assets\Activities\Excercise\playtime2.png",
//   "bath-time": "src\assets\Activities\Excercise\bathtime2.png"
// }

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

  // --- favorites
  const isFavorited = computed(() => {
    const act = routineData.value?.routine?.[0]?.activity
    return act ? fav.isFavorite(act.id) : false
  })
  const toggleFavorite = () => {
    const act = routineData.value?.routine?.[0]?.activity
    if (!act) return
    fav.toggle({
      tip_id: act.id,
      tip: act.tip,
      tip_des: act.tip_des,
      skills: act.skills,
      source: act.source,
      activityName: act.name,
      activityId: act.id,
      age_code: routineData.value.age_code,
    })
  }

  // --- progress
  progress.load()
  // completed count of each activity
  const completedCounts = ref<Record<string, number>>({})

  onMounted(() => {
    const savedCounts = localStorage.getItem('completedCounts')
    if (savedCounts) {
      completedCounts.value = JSON.parse(savedCounts)
    }
  })

  const getCompletedCount = (id: string) => {
    return completedCounts.value[id] || 0
  }

  function handleDone(activity: any) {
    const act = routineData.value.routine[0].activity
    const id = act.id

    completedCounts.value[id] = (completedCounts.value[id] || 0) + 1
    localStorage.setItem('completedCounts', JSON.stringify(completedCounts.value))
    
    progress.record({
    id: act.id,
    tip: act.tip,
    activityName: act.name,
    activityId: act.id,
    age_code: routineData.value.age_code,
    skills: act.skills ?? [],
    source: act.source || '',
  })
    router.push({
      name: 'TipsCongrats',
      params: {
        activityId: act.id, 
      },
      query: {
        name: act.name,
        age: routineData.value.age_code,
        gender: routineData.value.gender,
      },
    })
}

// --- image glob
const TIP_IMAGES = import.meta.glob('../assets/Tips/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const IMAGES_B = import.meta.glob('../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
const IMAGE_MAP = { ...TIP_IMAGES, ...IMAGES_B }

function slug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-')
}
function toFileBase(name: string) {
  return slug(name)
}
const imageUrl = computed(() => {
  const act = routineData.value?.routine?.[0]?.activity
  if (!act) return ''
  const base = toFileBase(act.name)
  const candidates = [
    `../assets/Tips/${base}.png`,
    `../assets/Activities/Excercise/${base}.png`,
  ]
  for (const k of candidates) if (IMAGE_MAP[k]) return IMAGE_MAP[k]
  return ''
})
</script>

<template>
  <main class="main">
    <!-- tool bar -->
    <!-- <div class="toolbar">
      <button class="edit-btn" @click="editProfile">
        Edit Child's Profile
      </button>
    </div> -->

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Today's Tips</h1>
        <p>
          These tips are updated daily.
          Discover fun activities to boost your child's brain development. 
        </p>
      </div>
    </section>

    <!-- Exercise Card -->
    <div class="exercise-card">
      <div v-if="routineData">
        <p>Age Group: {{ routineData.age_code }}, Gender: {{ routineData.gender }}</p>
      
        <div v-for="(item, index) in routineData.routine" :key="item.activity.id" class="p-4 border rounded-lg bg-white">
          <p class="activity-name">Activity: {{ item.activity.name.toUpperCase() }}</p>
          <div class="card-header">
            <div class="tags" v-if="item.activity.skills && item.activity.skills.length">
              <span v-for="skill in item.activity.skills" :key="skill.code" class="tag">
                {{ skill.code.toUpperCase() }}
              </span>
            </div>

            <button
              class="fav-btn"
              :aria-pressed="isFavorited"
              :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
              @click.stop="toggleFavorite"
            >
              <img :src="isFavorited ? heartRed : heartEmpty" alt="" />
            </button>
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
            <strong>Source: </strong>
            <span v-if="extractHttpsLink(item.activity.source)">
              <a 
                :href="extractHttpsLink(item.activity.source)!" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View related research
              </a>
            </span>
            <span v-else>
              {{ item.activity.source }}
            </span>
          </div>
        </div>
      </div>
      <button class="done-btn" @click="handleDone">
        Done
      </button>
      <p v-if="routineData" class="complete-count">
        Completed: {{ getCompletedCount(routineData.routine[0].activity.id) }} times
      </p>
    </div>

    <!-- Activity Grid -->
    <CategoryCloudCard />
  </main>

  <!-- Modal -->
  <!-- <SelectorModal v-model:open="showSelector" @submit="handleSubmit" /> -->
</template>

<style scoped>
.main {
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #fbf6ef;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;  
  min-height: 100vh;
}

/* .toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
} */

.hero {
  position: relative;
  width: 100%;
  height: 300px;
  background: url("../assets/hero-bg.png") center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.hero::before {
  content: "";
  position: absolute;
  inset: 0; 
  background: rgba(36, 36, 36, 0.4); 
  z-index: 0;
}
.hero > * {
  position: relative;
  z-index: 1;
}
.hero-content {
  position: relative;
  color: white;
  max-width: 700px;
  margin: 20px;
}
.hero h1 {
  font-size: 3rem;
}
.hero p {
  margin-bottom: 1.5rem;
  font-size: 24px;
  font-weight: 500;
}

.edit-btn {
  display: block;
  margin: 20px auto 0;
  background: #007070;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  height: 50px;
  width: 200px;
  margin-top: -15px;
}
.edit-btn:hover {
  background: #1fab45;
}

/* Exercise card */
.exercise-card {
  background: #fff;
  border-radius: 12px;
  margin: 100px 200px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.exercise-card .activity-name {
  font-size: 16px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
  width: 300px;
  text-align: center;
}
.card-header {
  display: flex;
  justify-content: space-between; 
  align-items: center;          
  margin-bottom: 8px;           
}
.tags {
  display: flex;
  gap: 6px;
}
.fav-btn {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 999px;
  margin-right: 40px;
}
.fav-btn img {
  width: 36px;
  height: 36px;
}
.exercise-card .tags {
  font-size: 16px;
  font-weight: bold;
  color: #008080;
  background: #eaf7f7;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  /* margin-bottom: 8px; */
}
.exercise-card .tag {
  font-size: 16px;
  font-weight: 600;
  color: #007070;
  background: #eaf7f7;
  padding: 4px 8px;
  border-radius: 6px;
}
.exercise-card .title {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 12px;
}
.exercise-card .desc {
  margin-bottom: 16px;
  line-height: 1.4;
  font-size: 24px;
}
.exercise-card .illustration {
  width: 100px;
  margin: 0 auto 16px;
  display: block;
}
.exercise-card .why h3 {
  color: #007070;
  margin-bottom: 6px;
  font-size: 30px;
}
.exercise-card .why p {
  font-size: 24px;
}
.source {
  margin-top: 12px;
  font-size: 20px;
  color:#026060;
}
.source a {
  text-decoration: underline;
  color:#007070;
  font-size: 20px;
}
.source a:hover {
  color: #2e9e55;
}
.exercise-card .done-btn {
  width: 150px;
  height: 40px;
  display: block;
  margin: 20px auto 0;
  background: #007070;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.exercise-card .done-btn:hover {
  background:#1fab45
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
.complete-count {
  font-size: 18px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
  width: 200px;
  text-align: center;
  margin: 0 auto;
  margin-top: 10px;
}
</style>
