import { defineStore } from 'pinia'

export type Skill = { code: string; weight?: number }
export type Completion = {
  id: string | number
  tip: string
  activityName: string
  activityId: string | number
  age_code?: string
  skills: Skill[]
  source?: string
  completedAt: string // ISO timestamp
}

const STORAGE_KEY = 'bb:progress.v1'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    completions: [] as Completion[],
  }),
  getters: {
    total: (s) => s.completions.length,
    skillsCount: (s) => {
      const counts: Record<string, number> = Object.create(null)

      for (const c of s.completions) {
        const seenInThisTip = new Set<string>()
        for (const sk of c.skills || []) {
          const code = (sk.code ?? '').trim()
          if (!code || seenInThisTip.has(code)) continue
          seenInThisTip.add(code)
          counts[code] = (counts[code] ?? 0) + 1 //  increment
        }
      }
      return counts
    },
    byDate: (s) => {
      const map: Record<string, Completion[]> = {}
      for (const c of s.completions) {
        const d = (c.completedAt || '').slice(0, 10)
        ;(map[d] ??= []).push(c)
      }
      return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1))
    },

    // fast lookups
    isFinished: (s) => (id: string | number) =>
      s.completions.some((c) => String(c.id) === String(id)),
  },

  actions: {
    record(payload: Omit<Completion, 'completedAt'> & { completedAt?: string }) {
      const entry: Completion = {
        completedAt: payload.completedAt || new Date().toISOString(),
        ...payload,
      }
      this.completions.push(entry)
      this._save()
    },

    //  no duplicates
    recordOnce(payload: Omit<Completion, 'completedAt'> & { completedAt?: string }) {
      const key = String(payload.id)
      if (this.completions.some((c) => String(c.id) === key)) return false
      this.record(payload)
      return true
    },

    //  de-duplicate legacy data on load
    load() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) this.completions = JSON.parse(raw)
      // const arr = JSON.parse(raw) as Completion[]
      // const seen = new Set<string>()
      // const deduped: Completion[] = []
      // for (const c of arr) {
      //   const key = String(c.id)
      //   if (seen.has(key)) continue
      //   seen.add(key)
      //   deduped.push(c)
      // }
      // this.completions = deduped
      // if (deduped.length !== arr.length) this._save()
    },

    clearAll() {
      this.completions = []
      this._save()
    },
    _save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completions))
    },
  },
})
