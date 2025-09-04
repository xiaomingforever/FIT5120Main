<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

type Skill = { code: string; weight?: number }
type TipLite = { tip_id: number | string; tip: string; age_code?: string }
type TipFull = TipLite & { tip_des?: string; skills?: Skill[]; source?: string }

const router = useRouter()

const props = defineProps<{
  open: boolean
  tip: TipFull
  tips?: TipFull[] //list of tips from the same activity
  activityName: string
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

/** ---------- Local image handling ----------
 * Map activity name -> local asset image.

 * The backend usually sends filenames like "bedtime2.png" etc., so we try a few variants.
 */
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

/** ---------- Enrich single tip if needed ----------
 * request tip_des / skills / source from the /dev endpoint if missing
 */
const needEnrich = () =>
  !model.value.tip_des || !Array.isArray(model.value.skills) || !('source' in model.value)

const enrich = async () => {
  const payload = {
    age_code: props.age,
    gender: props.gender,
    routine: [
      {
        period: props.period, // keep period pinned/consistent
        activity: {
          id: Number.NaN, // optional; not required for enrich by tip_id
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
    const act = data?.routine?.[0]?.activity ?? {}
    model.value = {
      ...model.value,
      tip: act.tip || model.value.tip,
      tip_des: act.tip_des || model.value.tip_des,
      skills: act.skills || model.value.skills || [],
      source: act.source || model.value.source || '',
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

const openSourceHref = computed(() => {
  const s = model.value.source?.trim() || ''
  // if it already looks like a URL, use it; otherwise leave as text
  if (/^https?:\/\//i.test(s)) return s
  const m = s.match(/https?:\/\/\S+/i)
  return m ? m[0] : ''
})

const startRoutine = () => {
  router.push({
    name: 'Today',
    query: {
      age: props.age,
      gender: props.gender,
      period: props.period,
    },
  })
}

const related = computed(() => {
  const all = props.tips || []
  const others = all.filter((t) => String(t.tip_id) !== String(model.value.tip_id))
  // stable: pick first 2 by id
  return others
    .slice()
    .sort((a: any, b: any) => Number(a.tip_id) - Number(b.tip_id))
    .slice(0, 2)
})
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="tipmodal-overlay" @click.self="emit('close')">
      <div class="tipmodal" role="dialog" aria-modal="true" aria-label="Tip details">
        <button id="tip-close-btn" class="close" @click="emit('close')" aria-label="Close">
          ✕
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

        <div class="source" v-if="model.source || openSourceHref">
          <strong>Source:</strong>
          <template v-if="openSourceHref">
            <a :href="openSourceHref" target="_blank" rel="noopener">{{ model.source }}</a>
          </template>
          <template v-else>{{ model.source }}</template>
        </div>

        <section v-if="related.length" class="related">
          <h3 class="related-title">Related tips</h3>
          <ul class="related-list">
            <li v-for="r in related" :key="r.tip_id">
              <button class="related-link" @click="emit('open-related', r.tip_id)">
                {{ r.tip }}
              </button>
            </li>
          </ul>
        </section>

        <div class="footer">
          <button class="start-btn" @click="startRoutine">Start routine</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.tipmodal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 60;
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
}
.close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: 0;
  background: #f3f4f6;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  cursor: pointer;
}
.hero {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
}
.meta {
  display: flex;
  justify-content: flex-end;
}
.activity {
  font-size: 12px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  padding: 3px 10px;
  border-radius: 999px;
}
.title {
  margin: 10px 0 6px;
  font-size: 22px;
}
.desc {
  color: #4b5563;
  line-height: 1.5;
}
.skills {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 0;
}
.chip {
  font-size: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 4px 10px;
}
.source {
  margin-top: 14px;
  font-size: 14px;
}
.source a {
  text-decoration: underline;
}
/* related tips */
.related {
  margin-top: 16px;
}
.related-title {
  font-size: 16px;
  margin: 0 0 8px;
}
.related-list {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.related-link {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
}
.related-link:hover {
  background: #f3f4f6;
}
/* the button */
.footer {
  position: sticky; /* stays at bottom while scrolling in the modal */
  bottom: 0;
  background: #fff;
  padding-top: 12px;
  margin-top: 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.start-btn {
  padding: 10px 16px;
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  background: #0ea641;
  color: #fff;
}
.start-btn:focus {
  outline: 2px solid #a7f3d0;
  outline-offset: 2px;
}
</style>
