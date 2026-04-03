import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { CopyButton } from '@/components/ui/CopyButton'
import { useProjectStore } from '@/stores/projectStore'

export function StoryCard() {
  const story = useProjectStore((s) => s.story)
  const [expanded, setExpanded] = useState(true)

  if (!story) return null

  return (
    <div className="glass-card" style={{ padding: 20, marginTop: 16 }}>
      <div
        className="card-collapse-header"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={16} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{story.title}</h3>
          <span className="badge badge-purple">{story.genre}</span>
          <span className="badge badge-yellow">{story.tone}</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {expanded && (
        <div style={{ marginTop: 16 }}>
          <div className="info-block">
            <span className="label">Synopsis</span>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              {story.synopsis}
            </p>
          </div>

          {story.key_plot_points.length > 0 && (
            <div className="info-block">
              <span className="label">Key Plot Points</span>
              <ol style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: 14 }}>
                {story.key_plot_points.map((pt, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{pt}</li>
                ))}
              </ol>
            </div>
          )}

          {story.raw_prompt && (
            <div className="info-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">Visual Style Prompt</span>
                <CopyButton text={story.raw_prompt} />
              </div>
              <div className="prompt-box">{story.raw_prompt}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
