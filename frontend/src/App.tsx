import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './api/client'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ActiveWorkoutPage from './pages/ActiveWorkoutPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return Boolean(getToken()) ? <>{children}</> : <Navigate to="/login" replace />
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--color-muted)]">{label} coming soon.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/workout/:sessionId" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><Placeholder label="History" /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Placeholder label="Progress" /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Placeholder label="Library" /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={Boolean(getToken()) ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
