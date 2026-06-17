import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getToken } from './api/client'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ActiveWorkoutPage from './pages/ActiveWorkoutPage'
import HistoryPage from './pages/HistoryPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import ProgressPage from './pages/ProgressPage'
import LibraryPage from './pages/LibraryPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return Boolean(getToken()) ? <>{children}</> : <Navigate to="/login" replace />
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/workout/:sessionId" element={<ProtectedRoute><ActiveWorkoutPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/history/:sessionId" element={<ProtectedRoute><WorkoutDetailPage /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={Boolean(getToken()) ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
