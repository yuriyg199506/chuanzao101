export type DrumType = 'don' | 'ka'

export interface LyricLine {
  startMs: number
  endMs: number
  text: string
}

export interface RhythmNote {
  id: number
  timeMs: number
  type: DrumType
  judged: boolean
  result?: 'perfect' | 'good' | 'miss'
}

export interface Stats {
  looks: number
  skill: number
  lin: number
  fans: number
}

export interface Choice {
  label: string
  outcome: string
  rewards: Partial<Stats>
  practiceDelta?: number
}

export interface WeekData {
  week: number
  title: string
  fullTitle: string
  audio: string
  srt?: string
  scene: string
  hero: string
  threshold: number
  bpm: number
  story: string
  choices: Choice[]
}
