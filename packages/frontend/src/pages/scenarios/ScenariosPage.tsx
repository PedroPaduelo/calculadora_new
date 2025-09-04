import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Copy, GitCompare } from 'lucide-react'

export function ScenariosPage() {
  // Mock data
  const scenarios = [
    {
      id: '1',
      name: 'Cenário Base - Fevereiro 2024',
      operation: 'Atendimento Geral',
      createdAt: '2024-01-15',
      totalHC: 245,
      slaAchieved: 91.2,
    },
    {
      id: '2',
      name: 'Otimização Turnos',
      operation: 'Suporte Técnico',
      createdAt: '2024-01-14',
      totalHC: 89,
      slaAchieved: 87.8,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cenários</h1>
          <p className="text-muted-foreground">
            Gerencie e compare diferentes cenários de planejamento
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <GitCompare className="mr-2 h-4 w-4" />
            Comparar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cenário
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {scenario.operation} • {scenario.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Total HC</p>
                  <p className="text-2xl font-bold text-primary">{scenario.totalHC}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">SLA Atingido</p>
                  <p className="text-2xl font-bold text-green-600">{scenario.slaAchieved}%</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Visualizar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
