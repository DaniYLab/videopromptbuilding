import { Film, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types'

export function Sidebar() {
  const { projects, activeProject, setActiveProject, addProject, removeProject } =
    useProjectStore()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setCreating(true)
    try {
      const p = await api.projects.create({ title: title.trim() })
      addProject(p)
      setTitle('')
      handleSelect(p)
    } finally {
      setCreating(false)
    }
  }

  function handleSelect(p: Project) {
    setActiveProject(p)
    navigate(`/project/${p.id}`)
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!window.confirm('Xóa project này khỏi ScriptForge?')) return
    await api.projects.delete(id)
    removeProject(id)
    if (activeProject?.id === id) {
      setActiveProject(null)
      navigate('/')
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Film size={20} style={{ color: 'var(--accent)' }} />
        <span className="gradient-text" style={{ fontWeight: 700, fontSize: 16 }}>
          ScriptForge
        </span>
      </div>

      <div className="sidebar-new">
        <label className="sr-only" htmlFor="sidebar-project-input">
          Tên project mới
        </label>
        <input
          id="sidebar-project-input"
          className="input-field"
          placeholder="Tên kịch bản..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          style={{ fontSize: 13 }}
        />
        <button
          className="btn-primary"
          onClick={handleCreate}
          disabled={creating || !title.trim()}
          style={{ padding: '10px 12px' }}
          aria-label="Tạo project mới"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="sidebar-label">Dự án</div>
      <nav className="sidebar-list">
        {projects.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 12px' }}>
            Chưa có dự án nào
          </p>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className={`sidebar-item ${activeProject?.id === p.id ? 'sidebar-item-active' : ''}`}
            onClick={() => handleSelect(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(p)}
            aria-label={`Chọn project ${p.title}`}
          >
            <Film size={14} style={{ flexShrink: 0 }} />
            <span className="sidebar-item-title">{p.title}</span>
            <button
              className="sidebar-delete"
              onClick={(e) => handleDelete(e, p.id)}
              aria-label={`Xóa ${p.title}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  )
}
