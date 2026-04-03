import { create } from 'zustand'
import type {
  Character,
  FramePrompt,
  Project,
  Scene,
  StepState,
  Story,
} from '@/types'

interface ProjectStore {
  // Data
  projects: Project[]
  activeProject: Project | null
  story: Story | null
  characters: Character[]
  scenes: Scene[]
  frames: FramePrompt[]

  // Step states
  steps: {
    story: StepState
    characters: StepState
    scenes: StepState
    frames: StepState
  }

  // Status log
  statusLog: string[]

  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  removeProject: (id: string) => void
  setActiveProject: (project: Project | null) => void

  setStory: (story: Story) => void
  addCharacter: (char: Character) => void
  setCharacters: (chars: Character[]) => void
  addScene: (scene: Scene) => void
  setScenes: (scenes: Scene[]) => void
  addFrame: (frame: FramePrompt) => void
  setFrames: (frames: FramePrompt[]) => void

  setStepStatus: (step: keyof ProjectStore['steps'], state: StepState) => void
  appendStatus: (msg: string) => void
  clearStatus: () => void
  resetProjectData: () => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProject: null,
  story: null,
  characters: [],
  scenes: [],
  frames: [],
  statusLog: [],

  steps: {
    story: { status: 'pending' },
    characters: { status: 'pending' },
    scenes: { status: 'pending' },
    frames: { status: 'pending' },
  },

  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((s) => ({ projects: [project, ...s.projects] })),
  removeProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
  setActiveProject: (project) =>
    set({ activeProject: project }),

  setStory: (story) => set({ story }),
  addCharacter: (char) =>
    set((s) => ({ characters: [...s.characters, char] })),
  setCharacters: (chars) => set({ characters: chars }),
  addScene: (scene) =>
    set((s) => ({
      scenes: [...s.scenes.filter((sc) => sc.id !== scene.id), scene].sort(
        (a, b) => a.scene_index - b.scene_index,
      ),
    })),
  setScenes: (scenes) => set({ scenes }),
  addFrame: (frame) =>
    set((s) => ({
      frames: [...s.frames.filter((f) => f.scene_id !== frame.scene_id), frame].sort(
        (a, b) => a.scene_index - b.scene_index,
      ),
    })),
  setFrames: (frames) => set({ frames }),

  setStepStatus: (step, state) =>
    set((s) => ({ steps: { ...s.steps, [step]: state } })),

  appendStatus: (msg) =>
    set((s) => ({ statusLog: [...s.statusLog.slice(-49), msg] })),

  clearStatus: () => set({ statusLog: [] }),

  resetProjectData: () =>
    set({
      story: null,
      characters: [],
      scenes: [],
      frames: [],
      statusLog: [],
      steps: {
        story: { status: 'pending' },
        characters: { status: 'pending' },
        scenes: { status: 'pending' },
        frames: { status: 'pending' },
      },
    }),
}))
