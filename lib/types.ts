export type Tone = 'Respectful' | 'Forward' | 'Objectifying' | 'Inappropriate' | 'Aggressive'

export interface EvaluationResult {
  is_safe: boolean
  tone: Tone
  pulse_score: number
  coach_note: string
  reasoning_trace: string
}
