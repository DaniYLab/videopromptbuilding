# ScriptForge Frontend

React + TypeScript frontend cho ScriptForge.

## Chạy local
```bash
npm install
npm run dev
```

## Build production
```bash
npm run build
```

## Điểm chính
- `src/api/client.ts`: HTTP client + SSE parser
- `src/stores/projectStore.ts`: Zustand store cho project workflow
- `src/pages/ProjectPage.tsx`: load project, restore step state, export JSON
- `src/components/`: story, character, scene, frame prompt sections
