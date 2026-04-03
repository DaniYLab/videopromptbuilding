import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Download, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/projectStore'
import { StoryForm } from '@/components/story/StoryForm'
import { StoryCard } from '@/components/story/StoryCard'
import { CharacterSection } from '@/components/character/CharacterSection'
import { SceneSection } from '@/components/scene/SceneSection'

const STEPS = [
  { key: 'story', label: 'Cốt truyện' },
  { key: 'characters', label: 'Nhân vật' },
  { key: 'scenes', label: 'Cảnh' },
  { key: 'frames', label: 'Frame Prompts' },
] as const

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const {
    story,
    characters,
    scenes,
    frames,
    setActiveProject,
    setStory,
    setCharacters,
    setScenes,
    setFrames,
    setStepStatus,
    steps,
    resetProjectData,
  } = useProjectStore()
  const loadedRef = useRef<string | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || loadedRef.current === projectId) return
    loadedRef.current = projectId
    resetProjectData()
    setLoadingProject(true)
    setLoadError(null)

    async function load() {
      if (!projectId) return
      const [project, storyResult, charactersResult, scenesResult, framesResult] =
        await Promise.allSettled([
        api.projects.get(projectId),
        api.story.get(projectId),
        api.characters.get(projectId),
        api.scenes.get(projectId),
        api.frames.get(projectId),
        ])

      if (project.status !== 'fulfilled') {
        setActiveProject(null)
        setLoadError('Không tìm thấy project hoặc backend chưa sẵn sàng.')
        setLoadingProject(false)
        return
      }

      setActiveProject(project.value)
      if (storyResult.status === 'fulfilled') setStory(storyResult.value)
      if (charactersResult.status === 'fulfilled') setCharacters(charactersResult.value)
      if (scenesResult.status === 'fulfilled') setScenes(scenesResult.value)
      if (framesResult.status === 'fulfilled') setFrames(framesResult.value)

      setStepStatus(
        'story',
        storyResult.status === 'fulfilled'
          ? { status: 'done', message: 'Đã tải cốt truyện' }
          : { status: 'pending' },
      )
      setStepStatus(
        'characters',
        charactersResult.status === 'fulfilled' && charactersResult.value.length > 0
          ? { status: 'done', message: `Đã tải ${charactersResult.value.length} nhân vật` }
          : { status: 'pending' },
      )
      setStepStatus(
        'scenes',
        scenesResult.status === 'fulfilled' && scenesResult.value.length > 0
          ? { status: 'done', message: `Đã tải ${scenesResult.value.length} cảnh` }
          : { status: 'pending' },
      )
      setStepStatus(
        'frames',
        framesResult.status === 'fulfilled' && framesResult.value.length > 0
          ? { status: 'done', message: `Đã tải ${framesResult.value.length} frame prompts` }
          : { status: 'pending' },
      )
      setLoadingProject(false)
    }

    void load()
  }, [
    projectId,
    setActiveProject,
    setStory,
    setCharacters,
    setScenes,
    setFrames,
    setStepStatus,
    resetProjectData,
  ])

  const hasExportData =
    !!story || characters.length > 0 || scenes.length > 0 || frames.length > 0

  async function handleExport() {
    if (!projectId || !hasExportData) return
    const data = await api.projects.export(projectId)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scriptforge-${projectId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loadingProject) {
    return (
      <div className="empty-state-card">
        <Loader2 size={18} className="spin" />
        <span>Đang tải project...</span>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="empty-state-card">
        <AlertTriangle size={18} />
        <span>{loadError}</span>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Quay về trang chủ
        </button>
      </div>
    )
  }

  return (
    <div key={projectId} className="project-page">
      {/* Progress bar */}
      <div className="progress-bar">
        {STEPS.map(({ key, label }) => {
          const step = steps[key]
          const isDone = step.status === 'done'
          const isActive = step.status === 'loading'
          return (
            <div key={key} className="progress-step">
              <div className={`progress-icon ${isDone ? 'p-done' : isActive ? 'p-active' : ''}`}>
                {isDone ? (
                  <CheckCircle size={14} />
                ) : isActive ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <span className={`progress-label ${isDone ? 'p-done-text' : ''}`}>{label}</span>
            </div>
          )
        })}

        <button
          id="export-btn"
          className="btn-ghost"
          onClick={handleExport}
          disabled={!hasExportData}
          style={{ marginLeft: 'auto', fontSize: 13 }}
        >
          <Download size={14} />
          Export JSON
        </button>
      </div>

      {/* Sections */}
      <StoryForm />
      <StoryCard />
      <CharacterSection />
      <SceneSection />
    </div>
  )
}
