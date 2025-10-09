import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')                 // shared search text
  const set = (q: string) => { query.value = q }
  const clear = () => { query.value = '' }
  return { query, set, clear }
})
