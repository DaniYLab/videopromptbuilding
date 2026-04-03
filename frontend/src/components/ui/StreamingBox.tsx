import { Loader2 } from 'lucide-react'

interface StreamingBoxProps {
  messages: string[]
  loading?: boolean
  title?: string
}

export function StreamingBox({ messages, loading, title = 'Đang xử lý...' }: StreamingBoxProps) {
  if (!loading && messages.length === 0) return null

  return (
    <div className="streaming-box">
      <div className="streaming-box-header">
        {loading && <Loader2 size={14} className="spin" style={{ color: 'var(--accent)' }} />}
        <span>{title}</span>
      </div>
      <div className="streaming-box-body">
        {messages.map((msg, i) => (
          <div key={i} className="streaming-msg">
            <span className="streaming-dot" />
            {msg}
          </div>
        ))}
        {loading && <div className="streaming-cursor" />}
      </div>
    </div>
  )
}
