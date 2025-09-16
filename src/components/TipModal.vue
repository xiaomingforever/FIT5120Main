<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import heartEmpty from '@/assets/Font icons/favorite_empty.png'
import heartRed from '@/assets/Font icons/favorite_red.png'
import { useProgressStore } from '@/stores/progress'
import TipsCongrats from '@/views/TipsCongrats.vue'  //congrats modal
import confetti from "canvas-confetti"

const showCongrats = ref(false)

type Skill = { code: string; weight?: number }
type TipLite = { tip_id: number | string; tip: string; age_code?: string }
type TipFull = TipLite & {
  tip_des?: string
  skills?: Skill[]
  source?: string
  brainy_background?: string
  source_url?: string
}

const router = useRouter()
const fav = useFavoritesStore()

const props = defineProps<{
  open: boolean
  tip: TipFull
  tips?: TipFull[] //list of tips from the same activity
  activityName: string
  activityId: string | number //correct activity id
  age: string
  gender: string
  period: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-related', tipId: string | number): void
}>()

const DEV_URL = 'https://qr7uehfaof.execute-api.ap-southeast-2.amazonaws.com/dev'

const model = ref<TipFull>({ ...props.tip })

const isFavorited = computed(() => fav.isFavorite(model.value.tip_id))
const toggleFavorite = () => {
  fav.toggle({
    tip_id: model.value.tip_id,
    tip: model.value.tip,
    tip_des: model.value.tip_des,
    skills: model.value.skills,
    source_url: model.value.source,
    activityName: props.activityName,
    activityId: props.activityId,
    age_code: (model.value as any).age_code,
    brainy_background: model.value.brainy_background
  })
}

const progress = useProgressStore()
progress.load()
// const finished = computed(() => progress.isFinished(model.value.tip_id))
const completedCounts = ref<Record<string, number>>({})

onMounted(() => {
  const savedCounts = localStorage.getItem('completedCounts')
  if (savedCounts) {
    completedCounts.value = JSON.parse(savedCounts)
  }
})

const getCompletedCount = (id: string | number) => {
  return completedCounts.value[id] || 0
}

function done() {
  // Save the finished tip with skill tags and timestamp
  completedCounts.value[props.activityId] = (completedCounts.value[props.activityId] || 0) + 1
  localStorage.setItem('completedCounts', JSON.stringify(completedCounts.value))

  progress.record({
    id: model.value.tip_id,
    tip: model.value.tip,
    tip_des: model.value.tip_des,
    activityName: props.activityName,
    activityId: props.activityId,
    age_code: props.age as string,
    skills: (model.value.skills ?? []) as any[],
    source_url: model.value.source || '',
    brainy_background: model.value.brainy_background
  })

  // fireworks animation
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 }, // position
  })

  setTimeout(() => {
    showCongrats.value = true
  }, 500)
}

const extractHttpsLink = (text?: string): string | null => {
  if (!text) return null
  const match = text.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

const TIP_IMAGES = import.meta.glob('../assets/Tips/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>
// secondary image handling if previous failed
const IMAGES_B = import.meta.glob('../assets/Activities/Excercise/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const IMAGE_MAP = { ...TIP_IMAGES, ...IMAGES_B }

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-')
// Map any exceptions here (key = lowercased activity name).
const FILENAME_ALIASES: Record<string, string> = {
  'anytime anywhere': 'anytime-anywhere',
  'getting dressed': 'getting-dressed',
}

const toFileBase = (name: string) => {
  const key = name.trim().toLowerCase()
  return FILENAME_ALIASES[key] ?? slug(name)
}

const imageUrl = computed(() => {
  const base = toFileBase(props.activityName)
  const candidates = [
    `../assets/Tips/${base}.png`,
    `../assets/Tips/${base}.jpg`,
    `../assets/Tips/${base}.jpeg`,
    `../assets/Tips/${base}.webp`,
    `../assets/Tips/${base}.svg`,
    `../assets/Activities/Excercise/${base}.png`,
  ]
  for (const k of candidates) {
    if (IMAGE_MAP[k]) return IMAGE_MAP[k]
  }
  // last resort: any image that contains the slug
  const hit = Object.keys(IMAGE_MAP).find((k) => k.toLowerCase().includes(`/${base}.`))
  return hit ? IMAGE_MAP[hit] : ''
})

// treat undefined/null/empty-string as missing
const needEnrich = () =>
  !model.value.tip_des ||
  !Array.isArray(model.value.skills) ||
  !(model.value.source && model.value.source.trim().length > 0)

let enrichSeq = 0
const enrich = async () => {
  const seq = ++enrichSeq
  const payload = {
    age_code: props.age,
    gender: props.gender,
    routine: [
      {
        period: props.period, // keep period pinned/consistent
        activity: {
          id: Number(props.activityId), //correct activity id
          name: props.activityName,
          tip_id: model.value.tip_id,
        },
      },
    ],
  }
  try {
    const res = await fetch(DEV_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (seq !== enrichSeq) return // If another enrich started after this one, drop this result
    const act = data?.routine?.[0]?.activity ?? {}

    if (act.tip_id !== undefined && String(act.tip_id) !== String(model.value.tip_id)) {
      console.warn('Dropped mismatched enrich result', {
        asked: model.value.tip_id,
        got: act.tip_id,
      })
      return
    }
    model.value = {
      ...model.value,
      tip: act.tip || model.value.tip,
      tip_des: act.tip_des || model.value.tip_des,
      skills: act.skills || model.value.skills || [],
      source: (act.source ?? '').trim() || (model.value.source ?? '').trim() || '',
      brainy_background: act.brainy_background || model.value.brainy_background,
      source_url: act.source_url || model.value.source_url,
    }
  } catch (e) {
    // fail-soft: keep what we have
    console.warn('Tip enrich failed:', e)
  }
}

// fetch when opened
watch(
  () => props.open,
  (o) => {
    if (o) {
      model.value = { ...props.tip } // refresh from parent
      if (needEnrich()) enrich()
      setTimeout(() => {
        ;(document.getElementById('tip-close-btn') as HTMLButtonElement | null)?.focus()
      }, 0)
    }
  },
  { immediate: true },
)
// update local model, re-enrich if needed, and scroll to top.
watch(
  () => props.tip,
  async (t) => {
    if (!t) return
    model.value = { ...t }
    if (needEnrich()) await enrich()
    await nextTick()
    document.querySelector('.tipmodal')?.scrollTo({ top: 0, behavior: 'smooth' })
  },
)

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// const done = () => {
//   router.push({
//     name: 'TipsCongrats',
//     params: { activityId: String(props.activityId) },
//     query: {
//       name: props.activityName,
//       age: props.age,
//       gender: props.gender,
//       period: props.period,
//       completedTipId: String(model.value.tip_id),
//     },
//   })
// }

// const related = computed(() => {
//   const all = props.tips || []
//   const others = all.filter((t) => String(t.tip_id) !== String(model.value.tip_id))
//   // stable: pick first 2 by id
//   return others
//     .slice()
//     .sort((a: any, b: any) => Number(a.tip_id) - Number(b.tip_id))
//     .slice(0, 2)
// })

const previousTip = computed(() => {
  const all = (props.tips || []).sort((a, b) => Number(a.tip_id) - Number(b.tip_id))
  const idx = all.findIndex(t => String(t.tip_id) === String(model.value.tip_id))
  return idx > 0 ? all[idx - 1] : null
})

const nextTip = computed(() => {
  const all = (props.tips || []).sort((a, b) => Number(a.tip_id) - Number(b.tip_id))
  const idx = all.findIndex(t => String(t.tip_id) === String(model.value.tip_id))
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null
})
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="tipmodal-overlay" @click.self="emit('close')">
      <div class="tipmodal" role="dialog" aria-modal="true" aria-label="Tip details">
        <!-- close button-->
        <button id="tip-close-btn" class="close" @click="emit('close')" aria-label="Close">
          ✕
        </button>
        <!-- favorite button -->
        <button
          class="fav-btn"
          :aria-pressed="isFavorited"
          :title="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
          @click.stop="toggleFavorite"
        >
          <img :src="isFavorited ? heartRed : heartEmpty" alt="" />
        </button>
        <img v-if="imageUrl" class="hero" :src="imageUrl" :alt="activityName" />

        <div class="meta">
          <span class="activity">{{ activityName }}</span>
        </div>

        <h2 class="title">{{ model.tip }}</h2>

        <p v-if="model.tip_des" class="desc">{{ model.tip_des }}</p>

        <ul v-if="model.skills?.length" class="skills">
          <li v-for="s in model.skills" :key="s.code" class="chip">{{ s.code }}</li>
        </ul>
        <div class="completed-info">
          <span class="count">Completed: {{ getCompletedCount(props.activityId) }} times</span>
          <p class="explain">
            Each time you complete this activity, it helps track your child's progress and growth journey.
          </p>
        </div>
        <!-- Brainy Background -->
        <section v-if="model.brainy_background" class="brainy">
          <h3>Why it matters</h3>
          <p>{{ model.brainy_background }}</p>
        </section>
        <!-- Source -->
        <p v-if="model.source_url" class="source">
          <a
            :href="extractHttpsLink(model.source_url || model.source) || model.source_url || model.source"
            target="_blank"
            rel="noopener noreferrer"
            class="source-link"
          >
            <strong>View Related Research</strong>
          </a>
        </p>

        <!-- <section v-if="related.length" class="related">
          <h3 class="related-title">Related tips</h3>
          <ul class="related-list">
            <li v-for="r in related" :key="r.tip_id">
              <button class="related-link" @click="emit('open-related', r.tip_id)">
                {{ r.tip }}
              </button>
            </li>
          </ul>
        </section> -->

        <section v-if="previousTip || nextTip" class="related">
          <h3 class="related-title">✨Related tips</h3>
          <p class="related-desc">Explore more tips connected to this activity. </p>
          <p class="related-desc-2">Go back to the previous one or discover what comes next.</p>
          <div class="related-buttons">
            <button 
              v-if="previousTip" 
              class="related-btn prev" 
              @click="emit('open-related', previousTip.tip_id)"
            >
              <span class="arrow">←</span> {{ previousTip.tip }}
            </button>

            <button 
              v-if="nextTip" 
              class="related-btn next" 
              @click="emit('open-related', nextTip.tip_id)"
            >
              {{ nextTip.tip }} <span class="arrow">→</span>
            </button>
          </div>
        </section>

        <div class="footer">
          <button class="start-btn" @click="done">Done</button>
        </div>
      </div>
    </div>
  </teleport>
  <TipsCongrats
   v-if="showCongrats"
      :open="showCongrats"
      :activity-name="activityName || ''"
      :activity-id="activityId || ''"
      @close="showCongrats = false"
  />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
</template>

<style scoped>
.tipmodal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 100;
}
.tipmodal {
  width: min(720px, 92vw);
  max-height: 88vh;
  overflow: auto;
  background: #fff;
  border-radius: 16px;
  padding: 18px 18px 22px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  font-family: 'Nunito', sans-serif;
}
.close {
  position: fixed;
  margin-bottom: 10px;
  top: 50px;         
  right: 300px; 
  z-index: 200;
  border: 0;
  background: #dfdfe0;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
}
.hero {
  width: 55%;
  height: 250px;
  object-fit: fill;
  border-radius: 12px;
  display: block;
  margin: 0 auto;
  margin-bottom: 10px;
}
.meta {
  display: flex;
  justify-content: flex-start;
  padding-bottom: 10px;
}
.activity {
  font-size: 16px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  margin-right: 20px;
  border-radius: 999px;
}
.title {
  margin: 0 0 6px;
  font-size: 24px;
}
.desc {
  color: #4b5563;
  line-height: 1.3;
  font-size: 20px;
  text-align: justify;
}
.skills {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 0;
}
.chip {
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
  color: #007070;
  background: #eaf7f7;
}
.brainy {
  margin-top: 14px;
  padding: 10px;
  background: #f9fafb;
  border-left: 4px solid #0ea641;
  border-radius: 4px;
  color: #555;
  font-size: 18px;
}
.brainy h3 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #065f46;
}
.source {
  margin-top: 14px;
  font-size: 16px;
}
.source a {
  text-decoration: underline;
  color: #065f46;
}

.related {
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f0fdfa, #ecfdf5);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.related-title {
  font-size: 22px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 700;
  color: #064e3b;
}
.related-desc {
  font-size: 18px;
  color: #4b5563;
  text-align: center;
  margin: 0;
  line-height: 1.3;
}
.related-desc-2 {
  font-size: 18px;
  color: #4b5563;
  text-align: center;
  margin: 0;
  padding-bottom: 20px;
  line-height: 1.3;
}
.related-buttons {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.related-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 18px;
  border-radius: 14px;
  border: none;
  background: #ffffff;
  color: #047857;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-btn.prev {
  justify-content: flex-start;
}

.related-btn.next {
  justify-content: flex-end;
}

.related-btn:hover {
  background: #d1fae5;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.related-btn .arrow {
  font-size: 18px;
  font-weight: 700;
  color: #065f46;
}

/* the done button */
.footer {
  position: sticky; /* stays at bottom while scrolling in the modal */
  bottom: -22px;
  background: #fff;
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.start-btn {
  padding: 10px 16px;
  margin: 0 auto;
  margin-bottom: 10px;
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  background: #007070;
  color: #fff;
  font-size: 16px;
}
.start-btn:hover{
  background: #0d9488;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.start-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}

.fav-btn {
  position: absolute;
  top: 305px;
  right: 60px;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  border-radius: 999px;
}
.fav-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}
.fav-btn img {
  width: 26px;
  height: 26px;
  display: block;
}
.completed-info {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
  font-size: 1.2rem;
}

.completed-info .count {
  font-weight: 700;
  color: #2a7;
  margin-right: 0.5rem;
}

.completed-info .explain {
  margin: 0.25rem 0 0;
  font-size: 1.1rem;
  color: #555;
}

</style>
