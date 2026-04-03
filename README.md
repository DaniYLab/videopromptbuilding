# ScriptForge

ScriptForge là app xây dựng kịch bản video ngắn bằng AI, xuất ra story, characters, scenes và Veo3 frame prompts theo luồng từng bước.

## Tính năng chính
- Tạo và quản lý nhiều project
- Sinh `Story` bằng SSE streaming
- Sinh `Characters`, `Scenes`, `Frame Prompts` theo từng bước
- Lưu dữ liệu bằng SQLite, không mất project khi restart backend
- Export toàn bộ project ra JSON cho pipeline Veo3

## Stack
- Frontend: React 19 + TypeScript + Vite + Zustand
- Backend: FastAPI + Pydantic + DeepAgents + SQLite

## Cấu hình môi trường
Sao chép `backend/.env.example` thành `backend/.env` hoặc dùng `.env` ở workspace root.

Biến quan trọng:
- `OPENAI_BASEURL`
- `APIKEY`
- `DEFAULT_MODEL`
- `DATABASE_URL`
- `CORS_ORIGINS`

Ví dụ SQLite local:

```env
DATABASE_URL=sqlite:///./data/app.db
```

## Chạy app

### Backend
```bash
cd backend
uv sync --extra dev
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173).

## Quy trình sử dụng
1. Tạo project mới
2. Sinh cốt truyện từ theme/bối cảnh/tone
3. Sinh danh sách nhân vật
4. Sinh danh sách cảnh, mỗi cảnh 5 giây
5. Sinh start/end frame prompt cho toàn bộ cảnh
6. Export JSON

## Test nhanh

### Backend
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

### Frontend
```bash
cd frontend
npm run build
```

## Cấu trúc
```text
backend/
  app/
    agents/      # Story/character/scene/frame generation
    routers/     # FastAPI + SSE endpoints
    schemas/     # Request/response models
    services/    # SQLite-backed project store
  tests/         # Smoke tests cho store
frontend/
  public/        # Favicon/assets tĩnh
  src/
    api/         # HTTP + SSE client
    components/  # UI sections
    pages/       # Home/project pages
    stores/      # Zustand state
```
