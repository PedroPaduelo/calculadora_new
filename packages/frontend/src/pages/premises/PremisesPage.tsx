import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Upload, Download } from 'lucide-react'

export function PremisesPage() {
  // Mock data
  const premises = [
    {
      id: '1',
      operation: 'Atendimento Geral',
      plannedMonth: '2024-02',
      unproductivityPercentage: 18,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      operation: 'Suporte Técnico',
      plannedMonth: '2024-02',
      unproductivityPercentage: 15,
      createdAt: '2024-01-14',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Premissas de Planejamento</h1>
          <p className="text-muted-foreground">
            Configure curvas de volume, TMI/TMA e improdutividade
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Premissa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {premises.map((premise) => (
          <Card key={premise.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>{premise.operation}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Mês planejado: {premise.plannedMonth}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Improdutividade</p>
                  <p className="text-sm text-muted-foreground">
                    {premise.unproductivityPercentage}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Criado em</p>
                  <p className="text-sm text-muted-foreground">
                    {premise.createdAt}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Calcular
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
