
import csvRaw from '@/data/quiz_all_age_groups_per_option_feedback.csv?raw'

export type AgeGroup = '0-1' | '1-2' | '3-5'
export type RuntimeQuestion = {
  age_group: AgeGroup
  question: string
  options: { key: 'a'|'b'|'c'; text: string }[]
  correctKey: 'a'|'b'|'c'
  feedback: { correct: string; a: string; b: string; c: string }
}

export function labelForAgeGroup(age: AgeGroup) {
  return age === '0-1' ? 'Infant (0–1)' : age === '1-2' ? 'Toddler (1–2)' : 'Preschooler (3–5)'
}

export const QUIZ_AGE_IMAGES: Record<AgeGroup, string> = {
  '0-1': '/Learning/Infant.jpg',
  '1-2': '/Learning/Toddler.jpg',
  '3-5': '/Learning/Preschooler.jpg',
}

function getCsvText(): string {
  const txt = (csvRaw ?? '').trim()
  if (!txt) console.warn('[quizCsvService] CSV is empty or missing.')
  return txt
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = ['']
  let i = 0, inQuotes = false
  while (i < text.length) {
    const c = text[i]
    if (c === '"') {
      if (inQuotes && text[i+1] === '"') { row[row.length-1] += '"'; i += 2; continue }
      inQuotes = !inQuotes; i++; continue
    }
    if (c === ',' && !inQuotes) { row.push(''); i++; continue }
    if ((c === '\n' || c === '\r') && !inQuotes) {
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = ['']; if (c === '\r' && text[i+1] === '\n') i++
      i++; continue
    }
    row[row.length-1] += c; i++
  }
  if (row.length > 1 || row[0] !== '') rows.push(row)
  const headers = rows.shift() as string[]
  return rows.map(r => Object.fromEntries(headers.map((h, idx) => [h.trim(), (r[idx] ?? '').trim()])))
}

function toRuntimeSafe(q: Record<string, any>): RuntimeQuestion {

  const rawOptions = (q.options ?? '').toString().trim()
  let parts = rawOptions
    ? rawOptions.split('|').map((s: string) => s.trim())
    : [
        (q.option_a ?? q.a ?? '').toString().trim(),
        (q.option_b ?? q.b ?? '').toString().trim(),
        (q.option_c ?? q.c ?? '').toString().trim(),
      ].filter(Boolean)


  const keys = ['a', 'b', 'c'] as const
  const optTriplet = keys.map((k, i) => {
    const text = (parts[i] ?? '').replace(/^\w\)\s*/, '').trim()
    return { key: k, text }
  })


  const corrRaw = (q.correct_answer ?? q.correct ?? '').toString().trim()
  const correctKey = (corrRaw[0]?.toLowerCase() ?? 'a') as 'a' | 'b' | 'c'

  return {
    age_group: (q.age_group as AgeGroup) ?? '0-1',
    question: (q.question ?? '').toString(),
    options: optTriplet,
    correctKey,
    feedback: {
      correct: (q.feedback_correct ?? '').toString(),
      a: (q.feedback_a ?? '').toString(),
      b: (q.feedback_b ?? '').toString(),
      c: (q.feedback_c ?? '').toString(),
    },
  }
}

export async function loadQuizForAge(age: AgeGroup): Promise<RuntimeQuestion[]> {
  const csvText = getCsvText()
  if (!csvText) return []
  const raw = parseCsv(csvText)

  // transform + filter
  const transformed = raw.map(toRuntimeSafe).filter(r => r.age_group === age && r.question && r.options.some(o => o.text))

  // shuffle and trim to 10
  for (let i = transformed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[transformed[i], transformed[j]] = [transformed[j], transformed[i]]
  }
  return transformed.slice(0, 10)
}
