import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GitCompare, Users, TrendingUp, Clock, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Scenario } from '@/services/scenarios'
import { useScenarios } from '@/hooks/use-scenarios'

interface CompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedScenarios: string[]
  onScenariosChange: (scenarios: string[]) => void
}

export function CompareDialog({ open, onOpenChange, selectedScenarios, onScenariosChange }: CompareDialogProps) {
  const { data: scenarios = [] } = useScenarios()
  const [compareScenarios, setCompareScenarios] = useState<Scenario[]>([])

  const handleScenarioSelect = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      onScenariosChange(selectedScenarios.filter(id => id !== scenarioId))
    } else if (selectedScenarios.length < 3) {
      onScenariosChange([...selectedScenarios, scenarioId])
    }
  }

  const handleCompare = () => {
    const selected = scenarios.filter(s => selectedScenarios.includes(s.id))
    setCompareScenarios(selected)
  }

  const getMetrics = (scenario: Scenario) => {
    try {
      const results = typeof scenario.resultsSnapshot === 'string' 
        ? JSON.parse(scenario.resultsSnapshot)
        : scenario.resultsSnapshot
      
      return {
        totalHC: results?.metrics?.totalHC || 0,
        avgHC: results?.metrics?.avgHC || 0,
        avgOccupancy: results?.metrics?.avgOccupancy || 0,
        maxOccupancy: results?.metrics?.maxOccupancy || 0,
        targetSLA: results?.calculationParams?.targetSLA || 0,
      }
    } catch {
      return {
        totalHC: 0,
        avgHC: 0,
        avgOccupancy: 0,
        maxOccupancy: 0,
        targetSLA: 0,
      }
    }
  }

  const getComparisonIcon = (current: number, baseline: number) => {
    if (current > baseline) return <ArrowUp className="h-3 w-3 text-red-500" />
    if (current < baseline) return <ArrowDown className="h-3 w-3 text-green-500" />
    return <Minus className="h-3 w-3 text-gray-500" />
  }

  const getComparisonColor = (current: number, baseline: number, isGoodWhenLower = false) => {
    if (current === baseline) return 'text-gray-600'
    if (isGoodWhenLower) {
      return current < baseline ? 'text-green-600' : 'text-red-600'
    }
    return current > baseline ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparar Cenários
          </DialogTitle>
        </DialogHeader>

        {compareScenarios.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione até 3 cenários para comparar (selecionados: {selectedScenarios.length}/3)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-colors ${
                    selectedScenarios.includes(scenario.id) 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleScenarioSelect(scenario.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{scenario.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {scenario.operation?.name} • {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-xs">
                        <span className="font-medium">HC Total: </span>
                        <span>{getMetrics(scenario).totalHC}</span>
                      </div>
                      {selectedScenarios.includes(scenario.id) && (
                        <Badge variant="default" className="text-xs">Selecionado</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCompare}
                disabled={selectedScenarios.length < 2}
              >
                Comparar ({selectedScenarios.length})
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Métrica</th>
                    {compareScenarios.map((scenario, index) => (
                      <th key={scenario.id} className="text-left p-2 font-medium">
                        <div className="flex items-center gap-2">
                          {scenario.name}
                          {index === 0 && <Badge variant="outline" className="text-xs">Base</Badge>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'totalHC', label: 'HC Total', icon: Users, isGoodWhenLower: true },
                    { key: 'avgHC', label: 'HC Médio', icon: Users, isGoodWhenLower: true },
                    { key: 'avgOccupancy', label: 'Ocupação Média (%)', icon: Clock, isGoodWhenLower: false },
                    { key: 'maxOccupancy', label: 'Ocupação Máxima (%)', icon: TrendingUp, isGoodWhenLower: false },
                    { key: 'targetSLA', label: 'Meta SLA (%)', icon: TrendingUp, isGoodWhenLower: false },
                  ].map((metric) => {
                    const baselineValue = getMetrics(compareScenarios[0])[metric.key as keyof ReturnType<typeof getMetrics>]
                    
                    return (
                      <tr key={metric.key} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <metric.icon className="h-4 w-4 text-muted-foreground" />
                            {metric.label}
                          </div>
                        </td>
                        {compareScenarios.map((scenario, index) => {
                          const value = getMetrics(scenario)[metric.key as keyof ReturnType<typeof getMetrics>]
                          const formattedValue = metric.key.includes('Occupancy') || metric.key === 'targetSLA' 
                            ? `${Math.round(value)}%` 
                            : value.toString()
                          
                          return (
                            <td key={scenario.id} className="p-2">
                              <div className="flex items-center gap-2">
                                <span className={index === 0 ? 'font-semibold' : getComparisonColor(value, baselineValue, metric.isGoodWhenLower)}>
                                  {formattedValue}
                                </span>
                                {index > 0 && getComparisonIcon(value, baselineValue)}
                                {index > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    ({value > baselineValue ? '+' : ''}{Math.round(((value - baselineValue) / baselineValue) * 100)}%)
                                  </span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Separator />

            {/* Scenario Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareScenarios.map((scenario) => (
                <Card key={scenario.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{scenario.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {scenario.operation?.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs font-medium">Criado em</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {scenario.description && (
                      <div>
                        <p className="text-xs font-medium">Descrição</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {scenario.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCompareScenarios([])}>
                Nova Comparação
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
