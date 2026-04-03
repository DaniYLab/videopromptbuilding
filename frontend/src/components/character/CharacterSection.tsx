import { Users, Wand2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { stream } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'
import { StreamingBox } from '@/components/ui/StreamingBox'
import { CopyButton } from '@/components/ui/CopyButton'

export function CharacterSection() {
  const {
    activeProject,
    story,
    characters,
    addCharacter,
    setCharacters,
    setScenes,
    setFrames,
    setStepStatus,
    appendStatus,
  } = useProjectStore()

  const [loading, setLoading] = useState(false)
  const [statusMsgs, setStatusMsgs] = useState<string[]>([])

  function handleGenerate() {
    if (!activeProject || !story) return
    setLoading(true)
    setStatusMsgs([])
    setCharacters([])
    setScenes([])
    setFrames([])
    setStepStatus('characters', { status: 'loading', message: 'Đang tạo nhân vật...' })
    setStepStatus('scenes', { status: 'pending' })
    setStepStatus('frames', { status: 'pending' })

    const stop = stream.characters(
      { project_id: activeProject.id },
      {
        onStatus: (msg) => {
          setStatusMsgs((prev) => [...prev, msg])
          appendStatus(msg)
        },
        onData: (char) => addCharacter(char),
        onDone: (msg) => {
          setStepStatus('characters', { status: 'done', message: msg })
          setLoading(false)
        },
        onError: (msg) => {
          setStepStatus('characters', { status: 'error', message: msg })
          setStatusMsgs((prev) => [...prev, `❌ ${msg}`])
          setLoading(false)
        },
      },
    )

    return () => stop()
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <Users size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="section-title">Nhân Vật</h2>
        <button
          id="generate-characters-btn"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !story || !activeProject}
          style={{ marginLeft: 'auto' }}
        >
          {loading ? <Sparkles size={14} className="spin" /> : <Wand2 size={14} />}
          {loading ? 'Đang tạo...' : 'Tạo nhân vật'}
        </button>
      </div>

      <StreamingBox
        messages={statusMsgs}
        loading={loading}
        title={loading ? 'Character Agent đang chạy...' : 'Character Agent - nhật ký gần nhất'}
      />

      {characters.length > 0 && (
        <div className="char-grid">
          {characters.map((char) => (
            <div key={char.id} className="char-card glass-card">
              <div className="char-card-header">
                <div className="char-avatar">
                  {char.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{char.name}</div>
                  <span className="badge badge-purple" style={{ marginTop: 4 }}>
                    {char.role}
                  </span>
                </div>
              </div>

              <div className="char-info">
                {char.age && (
                  <div className="char-info-row">
                    <span className="label" style={{ margin: 0, minWidth: 80 }}>Tuổi</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{char.age}</span>
                  </div>
                )}
                <div className="char-info-row">
                  <span className="label" style={{ margin: 0, minWidth: 80 }}>Ngoại hình</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{char.appearance}</span>
                </div>
                <div className="char-info-row">
                  <span className="label" style={{ margin: 0, minWidth: 80 }}>Tính cách</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{char.personality}</span>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="label" style={{ margin: 0 }}>Visual Prompt</span>
                  <CopyButton text={char.visual_prompt} />
                </div>
                <div className="prompt-box" style={{ fontSize: 12 }}>{char.visual_prompt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
