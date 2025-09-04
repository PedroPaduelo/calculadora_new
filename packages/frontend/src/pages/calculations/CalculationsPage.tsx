import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Play, BarChart3, TrendingUp } from 'lucide-react'
import { CalculationDialog } from '@/components/calculations/CalculationDialog'
import { AnalysisDialog } from '@/components/calculations/AnalysisDialog'
import { OptimizationDialog } from '@/components/calculations/OptimizationDialog'
import { useScenarios } from '@/hooks/use-scenarios'

export function CalculationsPage() {
  const [showCalculation, setShowCalculation] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showOptimization, setShowOptimization] = useState(false)
  
  const { data: scenarios = [], isLoading } = useScenarios()
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
            <Button className="w-full" onClick={() => setShowCalculation(true)}>
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
            <Button variant="outline" className="w-full" onClick={() => setShowAnalysis(true)}>
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
            <Button variant="outline" className="w-full" onClick={() => setShowOptimization(true)}>
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cálculo realizado ainda</p>
              <p className="text-sm">Inicie um novo cálculo para ver os resultados aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scenarios.slice(0, 5).map((scenario) => {
                const getMetrics = (scenario: any) => {
                  try {
                    const results = typeof scenario.resultsSnapshot === 'string' 
                      ? JSON.parse(scenario.resultsSnapshot)
                      : scenario.resultsSnapshot
                    
                    return {
                      totalHC: results?.metrics?.totalHC || 0,
                      avgOccupancy: results?.metrics?.avgOccupancy || 0,
                    }
                  } catch {
                    return {
                      totalHC: 0,
                      avgOccupancy: 0,
                    }
                  }
                }
                
                const metrics = getMetrics(scenario)
                
                return (
                  <div key={scenario.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div>
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {scenario.operation?.name} • {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{metrics.totalHC}</p>
                        <p className="text-muted-foreground">HC</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(metrics.avgOccupancy)}%</p>
                        <p className="text-muted-foreground">Ocupação</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              {scenarios.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    Ver todos os {scenarios.length} resultados
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CalculationDialog
        open={showCalculation}
        onOpenChange={setShowCalculation}
      />

      <AnalysisDialog
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
      />

      <OptimizationDialog
        open={showOptimization}
        onOpenChange={setShowOptimization}
      />
    </div>
  )
}
