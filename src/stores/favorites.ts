import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Skill = { code: string; weight?: number }
export type FavoriteTip = {
  tip_id: string | number
  tip: string
  tip_des?: string
  skills?: Skill[]
  source?: string
  activityName: string
  activityId: string | number
  age_code?: string
}

const LS_KEY = 'bb:favorites.v1'

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<Record<string | number, FavoriteTip>>({})

  const load = () => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) items.value = JSON.parse(raw)
    } catch {}
  }
  const save = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(items.value))
    } catch {}
  }

  const list = computed(() => Object.values(items.value))
  const count = computed(() => list.value.length)
  const isFavorite = (id: string | number) => Boolean(items.value[id])

  const add = (t: FavoriteTip) => {
    items.value[t.tip_id] = t
    save()
  }
  const remove = (id: string | number) => {
    delete items.value[id]
    save()
  }
  const toggle = (t: FavoriteTip) => {
    isFavorite(t.tip_id) ? remove(t.tip_id) : add(t)
  }

  // initialize from localStorage
  load()

  return { list, count, isFavorite, add, remove, toggle, load }
})
