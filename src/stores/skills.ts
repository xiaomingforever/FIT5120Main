// src/stores/skills.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSkillsStore = defineStore('skills', () => {
  const codes = ref<string[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Uses the same API shape your tips use
  const OPTION_URL = 'https://zdwzxd4laj.execute-api.ap-southeast-2.amazonaws.com/option'

  async function load() {
    if (loaded.value || loading.value) return
    loading.value = true
    try {
      const age_code = String(localStorage.getItem('age_code') || '1-3y')
      const gender = String(localStorage.getItem('gender') || 'girl')
      const dayparts = ['morning', 'afternoon', 'evening']
      const set = new Set<string>()

      for (const daypart of dayparts) {
        const res = await fetch(OPTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ age_code, gender, daypart }),
        })
        const data = await res.json()
        const options = data?.options || []
        for (const opt of options) {
          const tips = opt.tips || []
          for (const t of tips) {
            if (t.skill_code) set.add(String(t.skill_code))
          }
        }
      }
      codes.value = Array.from(set).sort()
      loaded.value = true
    } catch (e: any) {
      error.value = String(e?.message || e)
    } finally {
      loading.value = false
    }
  }

  function filtered(q: string) {
    const s = q.trim().toLowerCase()
    if (!s) return codes.value
    return codes.value.filter(c => c.replace(/_/g, ' ').toLowerCase().includes(s))
  }

  return { codes, loaded, loading, error, load, filtered }
})
