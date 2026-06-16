import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './api/client'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return Boolean(getToken()) ? <>{children}</> : <Navigate to="/login" replace />
}

function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--color-muted)]">Dashboard coming soon.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to={Boolean(getToken()) ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
