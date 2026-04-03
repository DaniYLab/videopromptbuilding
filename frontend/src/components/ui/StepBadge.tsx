import { CheckCircle, Loader2 } from 'lucide-react'
import type { StepState } from '@/types'

interface StepBadgeProps {
  label: string
  index: number
  state: StepState
}

export function StepBadge({ label, index, state }: StepBadgeProps) {
  const isActive = state.status === 'loading'
  const isDone = state.status === 'done'

  return (
    <div className="step-badge">
      <div
        className={`step-indicator ${
          isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending'
        }`}
      >
        {isDone ? (
          <CheckCircle size={14} />
        ) : isActive ? (
          <Loader2 size={14} className="spin" />
        ) : (
          index
        )}
      </div>
      <div className="step-badge-text">
        <span className="step-badge-label">{label}</span>
        {state.message && (
          <span className="step-badge-msg">{state.message}</span>
        )}
      </div>
    </div>
  )
}
