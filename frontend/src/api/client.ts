import type {
  Character,
  CharacterGenerateRequest,
  FramePrompt,
  FramePromptGenerateRequest,
  Project,
  ProjectCreate,
  Scene,
  SceneGenerateRequest,
  Story,
  StoryCreate,
} from '@/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// ─── Projects ────────────────────────────────────────────
export const api = {
  projects: {
    create: (body: ProjectCreate) =>
      request<Project>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<Project[]>('/projects'),
    get: (id: string) => request<Project>(`/projects/${id}`),
    delete: (id: string) => request<void>(`/projects/${id}`, { method: 'DELETE' }),
    export: (id: string) => request<Record<string, unknown>>(`/projects/${id}/export`),
  },

  story: {
    get: (projectId: string) => request<Story>(`/story/${projectId}`),
  },

  characters: {
    get: (projectId: string) => request<Character[]>(`/characters/${projectId}`),
  },

  scenes: {
    get: (projectId: string) => request<Scene[]>(`/scenes/${projectId}`),
  },

  frames: {
    get: (projectId: string) => request<FramePrompt[]>(`/frames/${projectId}`),
  },
}

// ─── SSE streaming helpers ────────────────────────────────
type SSECallback<T> = {
  onStatus?: (msg: string) => void
  onData?: (data: T) => void
  onDone?: (msg: string) => void
  onError?: (msg: string) => void
}

function makeSSE<TBody, TData>(
  path: string,
  body: TBody,
  eventName: string,
  callbacks: SSECallback<TData>,
): () => void {
  let active = true
  const controller = new AbortController()

  const dispatchEvent = (name: string, rawData: string) => {
    try {
      const parsed = JSON.parse(rawData)
      if (name === 'status') callbacks.onStatus?.(parsed.message)
      else if (name === eventName || name === 'result') callbacks.onData?.(parsed as TData)
      else if (name === 'done') callbacks.onDone?.(parsed.message)
      else if (name === 'error') callbacks.onError?.(parsed.message)
    } catch {
      if (name === 'error') callbacks.onError?.(rawData)
    }
  }

  void fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        callbacks.onError?.(`HTTP ${res.status}`)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''
      let currentData: string[] = []

      const flushEvent = () => {
        if (!currentEvent || currentData.length === 0) return
        dispatchEvent(currentEvent, currentData.join('\n'))
        currentEvent = ''
        currentData = []
      }

      while (active) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        let newlineIndex = buffer.indexOf('\n')
        while (newlineIndex !== -1) {
          let line = buffer.slice(0, newlineIndex)
          buffer = buffer.slice(newlineIndex + 1)
          if (line.endsWith('\r')) line = line.slice(0, -1)

          if (line === '') {
            flushEvent()
          } else if (line.startsWith(':')) {
            // Ignore SSE comments/keepalive pings.
          } else if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            currentData.push(line.slice(5).trimStart())
          }

          newlineIndex = buffer.indexOf('\n')
        }
      }

      const tail = decoder.decode()
      if (tail) buffer += tail
      if (buffer) {
        let line = buffer
        if (line.endsWith('\r')) line = line.slice(0, -1)
        if (line.startsWith('event:')) currentEvent = line.slice(6).trim()
        else if (line.startsWith('data:')) currentData.push(line.slice(5).trimStart())
      }
      flushEvent()
    })
    .catch((err: Error) => {
      if (active && err.name !== 'AbortError') callbacks.onError?.(err.message)
    })

  return () => {
    active = false
    controller.abort()
  }
}

export const stream = {
  story: (body: StoryCreate, cb: SSECallback<Story>) =>
    makeSSE('/story/generate', body, 'result', cb),

  characters: (body: CharacterGenerateRequest, cb: SSECallback<Character>) =>
    makeSSE('/characters/generate', body, 'character', cb),

  scenes: (body: SceneGenerateRequest, cb: SSECallback<Scene>) =>
    makeSSE('/scenes/generate', body, 'scene', cb),

  frames: (body: FramePromptGenerateRequest, cb: SSECallback<FramePrompt>) =>
    makeSSE('/frames/generate', body, 'frame', cb),
}
