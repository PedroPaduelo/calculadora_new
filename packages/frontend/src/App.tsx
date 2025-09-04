import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/auth'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { OperationsPage } from '@/pages/operations/OperationsPage'
import { PremisesPage } from '@/pages/premises/PremisesPage'
import { CalculationsPage } from '@/pages/calculations/CalculationsPage'
import { ScenariosPage } from '@/pages/scenarios/ScenariosPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="operations" element={<OperationsPage />} />
            <Route path="premises" element={<PremisesPage />} />
            <Route path="calculations" element={<CalculationsPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <Toaster />
    </div>
  )
}

export default App
