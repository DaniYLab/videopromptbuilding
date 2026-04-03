import { Film, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'

export function HomePage() {
  const { projects, addProject, setActiveProject } = useProjectStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setCreating(true)
    try {
      const p = await api.projects.create({ title: title.trim() })
      addProject(p)
      setActiveProject(p)
      navigate(`/project/${p.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-icon">
          <Film size={48} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 className="home-title gradient-text">ScriptForge</h1>
        <p className="home-subtitle">
          AI-powered kịch bản video · Cốt truyện · Nhân vật · Cảnh · Frame Prompts cho Veo3
        </p>

        <div className="home-create">
          <label className="sr-only" htmlFor="home-project-input">
            Tên project mới
          </label>
          <input
            id="home-project-input"
            className="input-field"
            placeholder="Đặt tên kịch bản của bạn..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            style={{ fontSize: 15, padding: '12px 16px' }}
          />
          <button
            id="home-create-btn"
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            style={{ padding: '12px 24px', fontSize: 15 }}
          >
            {creating ? (
              <Sparkles size={18} className="spin" />
            ) : (
              <Film size={18} />
            )}
            {creating ? 'Đang tạo...' : 'Bắt đầu'}
          </button>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="home-recent">
          <h2 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Dự án gần đây
          </h2>
          <div className="recent-grid">
            {projects.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="recent-card glass-card"
                onClick={() => { setActiveProject(p); navigate(`/project/${p.id}`) }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/project/${p.id}`)}
              >
                <Film size={20} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                  {new Date(p.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
