import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, Calendar, User, Building, TrendingUp, Users, Clock } from 'lucide-react'
import { Scenario } from '@/services/scenarios'

interface ScenarioDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenario: Scenario | null
}

export function ScenarioDetailsDialog({ open, onOpenChange, scenario }: ScenarioDetailsDialogProps) {
  if (!scenario) return null

  // Parse snapshots
  const premisesSnapshot = typeof scenario.premisesSnapshot === 'string' 
    ? JSON.parse(scenario.premisesSnapshot) 
    : scenario.premisesSnapshot

  const resultsSnapshot = typeof scenario.resultsSnapshot === 'string'
    ? JSON.parse(scenario.resultsSnapshot)
    : scenario.resultsSnapshot

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {scenario.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Operação: {scenario.operation?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Criado por: {scenario.user?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data: {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div>
              {scenario.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Descrição</p>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Premises Info */}
          {premisesSnapshot?.premise && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Premissas Utilizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Mês Planejado</p>
                    <Badge variant="outline">{premisesSnapshot.premise.plannedMonth}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">% Improdutividade</p>
                    <Badge variant="outline">{premisesSnapshot.premise.unproductivityPercentage}%</Badge>
                  </div>
                </div>

                {premisesSnapshot.calculationParams && (
                  <div>
                    <p className="text-sm font-medium">Meta SLA</p>
                    <Badge variant="outline">{premisesSnapshot.calculationParams.targetSLA}%</Badge>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Curva de Volume</p>
                    <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                      {premisesSnapshot.premise.volumeCurve?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Curva TMI</p>
                    <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                      {premisesSnapshot.premise.tmiCurve?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Curva TMA</p>
                    <div className="text-xs bg-muted p-2 rounded max-h-20 overflow-y-auto">
                      {premisesSnapshot.premise.tmaCurve?.join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {resultsSnapshot?.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados do Dimensionamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">HC Total</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {resultsSnapshot.metrics.totalHC}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">SLA Target</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {resultsSnapshot.calculationParams?.targetSLA || 0}%
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Ocupação Média</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(resultsSnapshot.metrics.avgOccupancy || 0)}%
                    </p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">HC Médio</p>
                    <p className="text-lg font-semibold">{resultsSnapshot.metrics.avgHC}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ocupação Máxima</p>
                    <p className="text-lg font-semibold">{Math.round(resultsSnapshot.metrics.maxOccupancy || 0)}%</p>
                  </div>
                </div>

                {resultsSnapshot.metrics.peakHours && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Horários de Pico</p>
                    <div className="flex flex-wrap gap-2">
                      {resultsSnapshot.metrics.peakHours.map((hour: number, index: number) => (
                        <Badge key={index} variant="secondary">
                          {`${Math.floor(hour / 4).toString().padStart(2, '0')}:${((hour % 4) * 15).toString().padStart(2, '0')}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
