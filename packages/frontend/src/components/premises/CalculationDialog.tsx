import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calculator, TrendingUp, Users, Clock } from 'lucide-react'
import { PlanningPremise } from '@calculadora-hc/shared'
import { useCalculateDimensioning } from '@/hooks/use-premises'
import { useCreateScenario } from '@/hooks/use-scenarios'

interface CalculationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  premise: PlanningPremise | null
}

export function CalculationDialog({ open, onOpenChange, premise }: CalculationDialogProps) {
  const [targetSLA, setTargetSLA] = useState(80)
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [scenarioName, setScenarioName] = useState('')
  
  const calculateMutation = useCalculateDimensioning()
  const createScenarioMutation = useCreateScenario()

  const handleCalculate = async () => {
    if (!premise) return

    try {
      const result = await calculateMutation.mutateAsync({
        operationId: premise.operationId,
        premiseId: premise.id,
        targetSLA,
      })
      setCalculationResult(result)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleSaveScenario = async () => {
    if (!premise || !calculationResult || !scenarioName.trim()) return

    try {
      await createScenarioMutation.mutateAsync({
        name: scenarioName,
        description: `Cenário calculado para ${premise.plannedMonth} - SLA ${targetSLA}%`,
        operationId: premise.operationId,
        premisesSnapshot: {
          premise: {
            id: premise.id,
            plannedMonth: premise.plannedMonth,
            volumeCurve: premise.volumeCurve,
            tmiCurve: premise.tmiCurve,
            tmaCurve: premise.tmaCurve,
            unproductivityPercentage: premise.unproductivityPercentage,
          },
          calculationParams: {
            targetSLA,
          },
        },
        resultsSnapshot: calculationResult,
      })
      
      setScenarioName('')
      handleClose()
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleClose = () => {
    setCalculationResult(null)
    setScenarioName('')
    onOpenChange(false)
  }

  if (!premise) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo de Dimensionamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Premise Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Premissa Selecionada</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Mês:</span>
                <span className="ml-2 font-medium">{premise.plannedMonth}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Improdutividade:</span>
                <span className="ml-2 font-medium">{premise.unproductivityPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Calculation Parameters */}
          <div className="space-y-4">
            <h3 className="font-medium">Parâmetros de Cálculo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetSLA">Meta SLA (%)</Label>
                <Input
                  id="targetSLA"
                  type="number"
                  min="0"
                  max="100"
                  value={targetSLA}
                  onChange={(e) => setTargetSLA(Number(e.target.value))}
                />
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="w-full"
            >
              {calculateMutation.isPending ? 'Calculando...' : 'Calcular Dimensionamento'}
            </Button>
          </div>

          {/* Results */}
          {calculationResult && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Resultados do Dimensionamento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">HC Necessário</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {calculationResult.metrics?.totalHC || 0}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">SLA Projetado</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {calculationResult.calculationParams?.targetSLA || 0}%
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Ocupação</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(calculationResult.metrics?.avgOccupancy || 0)}%
                    </p>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Detalhamento por Período</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Período</th>
                          <th className="text-left p-2">Volume</th>
                          <th className="text-left p-2">TMI (s)</th>
                          <th className="text-left p-2">HC Necessário</th>
                          <th className="text-left p-2">SLA (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculationResult.hcDistribution?.map((hc: number, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{`${Math.floor(index / 4).toString().padStart(2, '0')}:${((index % 4) * 15).toString().padStart(2, '0')}`}</td>
                            <td className="p-2">{premise?.volumeCurve?.[index] || 0}</td>
                            <td className="p-2">{premise?.tmiCurve?.[index] || 0}</td>
                            <td className="p-2">{hc}</td>
                            <td className="p-2">{Math.round(calculationResult.occupancyData?.[index] || 0)}%</td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-muted-foreground">
                              Dados detalhados não disponíveis
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Save Scenario Section */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Salvar Cenário</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="scenarioName">Nome do Cenário</Label>
                    <Input
                      id="scenarioName"
                      placeholder="Ex: Dimensionamento Outubro 2025"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          {calculationResult && (
            <Button 
              onClick={handleSaveScenario}
              disabled={!scenarioName.trim() || createScenarioMutation.isPending}
            >
              {createScenarioMutation.isPending ? 'Salvando...' : 'Salvar Cenário'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
