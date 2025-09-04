import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Calculator, 
  Layers,
  BarChart3,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Operações', href: '/operations', icon: Building2 },
  { name: 'Premissas', href: '/premises', icon: FileText },
  { name: 'Dimensionamento', href: '/calculations', icon: Calculator },
  { name: 'Cenários', href: '/scenarios', icon: Layers },
  { name: 'Escala x Necessidade', href: '/schedule', icon: Clock },
  { name: 'Occupancy', href: '/occupancy', icon: BarChart3 },
  { name: 'Hora Extra', href: '/overtime', icon: TrendingUp },
  { name: 'Treinamento', href: '/training', icon: Users },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Calculadora HC</h1>
        <p className="text-sm text-muted-foreground mt-1">Contact Center</p>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
