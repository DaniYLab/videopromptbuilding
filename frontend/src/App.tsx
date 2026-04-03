import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { HomePage } from '@/pages/HomePage'
import { ProjectPage } from '@/pages/ProjectPage'
import { useProjectStore } from '@/stores/projectStore'
import { api } from '@/api/client'

export default function App() {
  const setProjects = useProjectStore((s) => s.setProjects)

  useEffect(() => {
    api.projects.list().then(setProjects).catch(console.error)
  }, [setProjects])

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
