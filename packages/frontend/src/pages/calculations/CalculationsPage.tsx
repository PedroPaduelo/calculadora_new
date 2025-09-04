import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Play, BarChart3, TrendingUp } from 'lucide-react'

export function CalculationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dimensionamento</h1>
        <p className="text-muted-foreground">
          Calcule a necessidade de HC com base nas premissas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Novo Cálculo
            </CardTitle>
            <CardDescription>
              Dimensione HC para uma operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Iniciar Cálculo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Análise de Occupancy
            </CardTitle>
            <CardDescription>
              Verifique taxa de ocupação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Análise
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Otimização
            </CardTitle>
            <CardDescription>
              Otimize distribuição de turnos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Otimizar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultados Recentes</CardTitle>
          <CardDescription>
            Últimos cálculos de dimensionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cálculo realizado ainda</p>
            <p className="text-sm">Inicie um novo cálculo para ver os resultados aqui</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
