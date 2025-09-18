import quizCsvUrl from '@/data/quiz_all_age_groups_per_option_feedback.csv?url'

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


function parseCsv(text: string): Record<string,string>[] {
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
      row = [''];
      if (c === '\r' && text[i+1] === '\n') i++
      i++; continue
    }
    row[row.length-1] += c; i++
  }
  if (row.length > 1 || row[0] !== '') rows.push(row)
  const headers = rows.shift() as string[]
  return rows.map(r => Object.fromEntries(headers.map((h, idx) => [h.trim(), (r[idx] ?? '').trim()])))
}

function toRuntime(q: any): RuntimeQuestion {
  const options = (q.options as string).split('|').map((s: string) => s.trim())
  const optTriplet = options.map((o: string) => ({ key: o[0].toLowerCase() as 'a'|'b'|'c', text: o.replace(/^\w\)\s*/, '') }))
  const correctKey = ((q.correct_answer as string).trim()[0].toLowerCase()) as 'a'|'b'|'c'
  return {
    age_group: q.age_group as AgeGroup,
    question: q.question,
    options: optTriplet,
    correctKey,
    feedback: {
      correct: q.feedback_correct,
      a: q.feedback_a,
      b: q.feedback_b,
      c: q.feedback_c,
    }
  }
}

export async function loadQuizForAge(age: AgeGroup): Promise<RuntimeQuestion[]> {
  const res = await fetch(quizCsvUrl)
  if (!res.ok) throw new Error('Unable to fetch quiz CSV')
  const text = await res.text()
  const raw = parseCsv(text)
  const transformed = raw.map(toRuntime).filter((r) => r.age_group === age)
  // Ensure 10 questions & shuffle deterministically enough
  for (let i = transformed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [transformed[i], transformed[j]] = [transformed[j], transformed[i]]
  }
  return transformed.slice(0, 10)
}
