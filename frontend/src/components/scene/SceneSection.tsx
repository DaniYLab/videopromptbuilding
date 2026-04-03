import { Clapperboard, Sparkles, Wand2, Clock, Camera, Sun } from 'lucide-react'
import { useState } from 'react'
import { stream } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'
import { StreamingBox } from '@/components/ui/StreamingBox'
import { CopyButton } from '@/components/ui/CopyButton'

export function SceneSection() {
  const {
    activeProject,
    characters,
    story,
    scenes,
    frames,
    addScene,
    addFrame,
    setScenes,
    setFrames,
    setStepStatus,
    appendStatus,
  } = useProjectStore()

  const [loadingScenes, setLoadingScenes] = useState(false)
  const [loadingFrames, setLoadingFrames] = useState(false)
  const [statusMsgs, setStatusMsgs] = useState<string[]>([])

  function handleGenerateScenes() {
    if (!activeProject || !story) return
    setLoadingScenes(true)
    setStatusMsgs([])
    setScenes([])
    setFrames([])
    setStepStatus('scenes', { status: 'loading', message: 'Đang tạo cảnh...' })
    setStepStatus('frames', { status: 'pending' })

    const stop = stream.scenes(
      { project_id: activeProject.id },
      {
        onStatus: (msg) => {
          setStatusMsgs((prev) => [...prev, msg])
          appendStatus(msg)
        },
        onData: (scene) => addScene(scene),
        onDone: (msg) => {
          setStepStatus('scenes', { status: 'done', message: msg })
          setLoadingScenes(false)
        },
        onError: (msg) => {
          setStepStatus('scenes', { status: 'error', message: msg })
          setStatusMsgs((prev) => [...prev, `❌ ${msg}`])
          setLoadingScenes(false)
        },
      },
    )

    return () => stop()
  }

  function handleGenerateFrames() {
    if (!activeProject || scenes.length === 0) return
    setLoadingFrames(true)
    setStatusMsgs([])
    setFrames([])
    setStepStatus('frames', { status: 'loading', message: 'Đang tạo frame prompts...' })

    const stop = stream.frames(
      { project_id: activeProject.id },
      {
        onStatus: (msg) => {
          setStatusMsgs((prev) => [...prev, msg])
          appendStatus(msg)
        },
        onData: (frame) => addFrame(frame),
        onDone: (msg) => {
          setStepStatus('frames', { status: 'done', message: msg })
          setLoadingFrames(false)
        },
        onError: (msg) => {
          setStepStatus('frames', { status: 'error', message: msg })
          setStatusMsgs((prev) => [...prev, `❌ ${msg}`])
          setLoadingFrames(false)
        },
      },
    )

    return () => stop()
  }

  const frameMap = Object.fromEntries(frames.map((f) => [f.scene_id, f]))

  return (
    <div className="section-card">
      <div className="section-header">
        <Clapperboard size={18} style={{ color: 'var(--accent)' }} />
        <h2 className="section-title">Cảnh & Frame Prompts</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            id="generate-scenes-btn"
            className="btn-primary"
            onClick={handleGenerateScenes}
            disabled={loadingScenes || !story || !activeProject || characters.length === 0}
          >
            {loadingScenes ? <Sparkles size={14} className="spin" /> : <Wand2 size={14} />}
            {loadingScenes ? 'Đang tạo...' : 'Tạo cảnh'}
          </button>
          <button
            id="generate-frames-btn"
            className="btn-ghost"
            onClick={handleGenerateFrames}
            disabled={loadingFrames || scenes.length === 0}
          >
            {loadingFrames ? <Sparkles size={14} className="spin" /> : <Camera size={14} />}
            {loadingFrames ? 'Đang tạo...' : 'Tạo Frame Prompts'}
          </button>
        </div>
      </div>

      <StreamingBox
        messages={statusMsgs}
        loading={loadingScenes || loadingFrames}
        title={
          loadingScenes
            ? 'Scene Agent đang chạy...'
            : loadingFrames
              ? 'Frame Agent đang chạy...'
              : 'Nhật ký xử lý gần nhất'
        }
      />

      {scenes.length > 0 && (
        <div className="scene-list">
          {scenes.map((scene) => {
            const frame = frameMap[scene.id]
            return (
              <div key={scene.id} className="scene-item">
                {/* Scene header */}
                <div className="scene-number">
                  <div className="scene-num-badge">{scene.scene_index + 1}</div>
                  <div className="scene-timeline-line" />
                </div>

                <div className="scene-content glass-card">
                  <div className="scene-content-header">
                    <h3 style={{ fontWeight: 700, fontSize: 14 }}>{scene.title}</h3>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="badge badge-purple">
                        <Clock size={10} style={{ marginRight: 4 }} />
                        5s
                      </span>
                      <span className="badge badge-yellow">{scene.mood}</span>
                    </div>
                  </div>

                  <div className="scene-meta">
                    <div className="scene-meta-item">
                      <Camera size={12} />
                      <span>{scene.camera_angle}</span>
                    </div>
                    <div className="scene-meta-item">
                      <Sun size={12} />
                      <span>{scene.lighting}</span>
                    </div>
                  </div>

                  <p className="scene-desc">{scene.description}</p>

                  {scene.dialogue && (
                    <div className="scene-dialogue">
                      <span className="label" style={{ margin: 0 }}>Dialogue</span>
                      <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 13 }}>
                        "{scene.dialogue}"
                      </p>
                    </div>
                  )}

                  <div className="prompt-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="label" style={{ margin: 0 }}>Scene Visual Prompt</span>
                      <CopyButton text={scene.visual_prompt} />
                    </div>
                    <div className="prompt-box" style={{ fontSize: 12 }}>{scene.visual_prompt}</div>
                  </div>

                  {frame && (
                    <div className="frame-prompts">
                      <div className="frame-prompt-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className="label" style={{ margin: 0, color: 'var(--success)' }}>▶ Start Frame Prompt</span>
                          <CopyButton text={frame.start_frame_prompt} />
                        </div>
                        <div className="prompt-box prompt-box-green" style={{ fontSize: 12 }}>
                          {frame.start_frame_prompt}
                        </div>
                      </div>
                      <div className="frame-prompt-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className="label" style={{ margin: 0, color: '#ff6b9d' }}>■ End Frame Prompt</span>
                          <CopyButton text={frame.end_frame_prompt} />
                        </div>
                        <div className="prompt-box prompt-box-pink" style={{ fontSize: 12 }}>
                          {frame.end_frame_prompt}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
