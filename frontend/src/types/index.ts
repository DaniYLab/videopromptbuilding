// ─── Project ──────────────────────────────────────────────
export interface Project {
  id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
  thread_id: string
}

export interface ProjectCreate {
  title: string
  description?: string
}

// ─── Story ────────────────────────────────────────────────
export interface Story {
  project_id: string
  title: string
  genre: string
  theme: string
  setting?: string
  tone?: string
  synopsis: string
  key_plot_points: string[]
  num_scenes: number
  raw_prompt?: string
}

export interface StoryCreate {
  project_id: string
  genre: string
  theme: string
  setting?: string
  tone?: string
  num_scenes: number
  additional_notes?: string
}

// ─── Character ────────────────────────────────────────────
export interface Character {
  id: string
  project_id: string
  name: string
  role: string
  age?: string
  appearance: string
  personality: string
  backstory?: string
  visual_prompt: string
}

export interface CharacterGenerateRequest {
  project_id: string
}

// ─── Scene ────────────────────────────────────────────────
export interface Scene {
  id: string
  project_id: string
  scene_index: number
  title: string
  duration_seconds: number
  description: string
  action: string
  dialogue?: string
  camera_angle: string
  lighting: string
  mood: string
  visual_prompt: string
}

export interface SceneGenerateRequest {
  project_id: string
}

// ─── Frame ────────────────────────────────────────────────
export interface FramePrompt {
  id: string
  project_id: string
  scene_id: string
  scene_index: number
  start_frame_prompt: string
  end_frame_prompt: string
  style_notes: string
}

export interface FramePromptGenerateRequest {
  project_id: string
}

// ─── SSE ──────────────────────────────────────────────────
export type SSEEventType = 'status' | 'result' | 'character' | 'scene' | 'frame' | 'done' | 'error'

export interface SSEStatusData {
  message: string
}

export interface SSEErrorData {
  message: string
}

// ─── UI State ─────────────────────────────────────────────
export type GenerationStep = 'story' | 'characters' | 'scenes' | 'frames'
export type StepStatus = 'pending' | 'loading' | 'done' | 'error'

export interface StepState {
  status: StepStatus
  message?: string
}
