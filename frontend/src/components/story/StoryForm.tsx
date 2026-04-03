import { BookOpen, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { stream } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'
import { StreamingBox } from '@/components/ui/StreamingBox'
import type { StoryCreate } from '@/types'

const GENRES = ['Action', 'Romance', 'Horror', 'Comedy', 'Drama', 'Thriller', 'Fantasy', 'Sci-Fi']
const TONES = ['Cinematic', 'Dark', 'Uplifting', 'Mysterious', 'Intense', 'Melancholic', 'Epic']

export function StoryForm() {
  const {
    activeProject,
    setStory,
    setCharacters,
    setScenes,
    setFrames,
    setStepStatus,
    appendStatus,
    clearStatus,
  } =
    useProjectStore()

  const [genre, setGenre] = useState('Drama')
  const [theme, setTheme] = useState('')
  const [setting, setSetting] = useState('')
  const [tone, setTone] = useState('Cinematic')
  const [numScenes, setNumScenes] = useState(5)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMsgs, setStatusMsgs] = useState<string[]>([])

  function handleGenerate() {
    if (!activeProject || !theme.trim()) return
    setLoading(true)
    clearStatus()
    setStatusMsgs([])
    setCharacters([])
    setScenes([])
    setFrames([])
    setStepStatus('story', { status: 'loading', message: 'Đang tạo cốt truyện...' })
    setStepStatus('characters', { status: 'pending' })
    setStepStatus('scenes', { status: 'pending' })
    setStepStatus('frames', { status: 'pending' })

    const body: StoryCreate = {
      project_id: activeProject.id,
      genre,
      theme,
      setting: setting || undefined,
      tone,
      num_scenes: numScenes,
      additional_notes: notes || undefined,
    }

    const stop = stream.story(body, {
      onStatus: (msg) => {
        setStatusMsgs((prev) => [...prev, msg])
        appendStatus(msg)
      },
      onData: (story) => {
        setStory(story)
        setStepStatus('story', { status: 'done', message: 'Cốt truyện hoàn thành!' })
        setLoading(false)
      },
      onDone: () => {
        setLoading(false)
      },
      onError: (msg) => {
        setStepStatus('story', { status: 'error', message: msg })
        setStatusMsgs((prev) => [...prev, `❌ ${msg}`])
        setLoading(false)
      },
    })

    return () => stop()
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <BookOpen size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="section-title">Cốt Truyện</h2>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="label">Thể loại</label>
          <div className="chip-group">
            {GENRES.map((g) => (
              <button
                key={g}
                className={`chip ${genre === g ? 'chip-active' : ''}`}
                onClick={() => setGenre(g)}
                aria-pressed={genre === g}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="theme-input">
            Chủ đề / Thông điệp *
          </label>
          <input
            id="theme-input"
            className="input-field"
            placeholder="VD: Tình yêu vượt qua nghịch cảnh..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label" htmlFor="setting-input">Bối cảnh</label>
            <input
              id="setting-input"
              className="input-field"
              placeholder="VD: Việt Nam thập niên 80..."
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="tone-select">Tone</label>
            <select
              id="tone-select"
              className="select-field"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label" htmlFor="scenes-input">Số cảnh (mỗi cảnh 5s)</label>
            <input
              id="scenes-input"
              type="number"
              className="input-field"
              min={1}
              max={20}
              value={numScenes}
              onChange={(e) => setNumScenes(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notes-input">Ghi chú thêm</label>
            <input
              id="notes-input"
              className="input-field"
              placeholder="Yêu cầu đặc biệt..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          id="generate-story-btn"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading || !theme.trim() || !activeProject}
        >
          {loading ? (
            <Sparkles size={16} className="spin" />
          ) : (
            <Wand2 size={16} />
          )}
          {loading ? 'Đang tạo...' : 'Tạo cốt truyện'}
        </button>
      </div>

      <StreamingBox
        messages={statusMsgs}
        loading={loading}
        title={loading ? 'Story Agent đang chạy...' : 'Story Agent - nhật ký gần nhất'}
      />
    </div>
  )
}
