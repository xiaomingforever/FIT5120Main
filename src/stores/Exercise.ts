export type AgeGroup = '0-1y' | '1-3y' | '3-5y'

export interface Exercise {
  id: string
  title: string
  // tags?: string[]
  image: string
  description: string
  ageGroup: AgeGroup
  practiceCount: number
  tips: Tip[]
  currentAgeGroup?: AgeGroup | 'all'
}

export interface Tip {
  tip_id: string
  tip: string
  age_code?: AgeGroup
}
