import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building2, Edit, Trash2 } from 'lucide-react'

export function OperationsPage() {
  // Mock data - in real app, this would come from API
  const operations = [
    {
      id: '1',
      name: 'Atendimento Geral',
      description: 'Atendimento ao cliente geral',
      workingHours: { start: '06:00', end: '22:00' },
      slaTarget: 90,
      slaPercentage: 89.2,
    },
    {
      id: '2',
      name: 'Suporte Técnico',
      description: 'Suporte técnico especializado',
      workingHours: { start: '08:00', end: '18:00' },
      slaTarget: 85,
      slaPercentage: 87.8,
    },
    {
      id: '3',
      name: 'Vendas',
      description: 'Equipe de vendas ativas',
      workingHours: { start: '09:00', end: '19:00' },
      slaTarget: 95,
      slaPercentage: 93.1,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Operações</h1>
          <p className="text-muted-foreground">
            Gerencie as operações do contact center
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Operação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((operation) => (
          <Card key={operation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{operation.name}</CardTitle>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{operation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Horário de Funcionamento</p>
                  <p className="text-sm text-muted-foreground">
                    {operation.workingHours.start} às {operation.workingHours.end}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Meta SLA</p>
                  <p className="text-sm text-muted-foreground">
                    {operation.slaTarget}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">SLA Atual</p>
                  <p className={`text-sm font-medium ${
                    operation.slaPercentage >= operation.slaTarget 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {operation.slaPercentage}%
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
