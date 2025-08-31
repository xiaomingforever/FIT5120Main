export type AgeGroup = '0-1' | '1-3' | '3-5'

export interface Exercise {
  id: string
  title: string
  // tags?: string[]
  image: string

  description: string
  ageGroup: AgeGroup
  practiceCount: number
}
