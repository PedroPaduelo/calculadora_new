import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3, AlertTriangle, CheckCircle, Users } from 'lucide-react'
import { useOperations } from '@/hooks/use-operations'
import { usePremisesByOperation } from '@/hooks/use-premises'
import { useCalculateDimensioning } from '@/hooks/use-premises'

const analysisSchema = z.object({
  operationId: z.string().min(1, 'Operação é obrigatória'),
  premiseId: z.string().min(1, 'Premissa é obrigatória'),
})

type AnalysisFormData = z.infer<typeof analysisSchema>

interface AnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalysisDialog({ open, onOpenChange }: AnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [selectedOperationId, setSelectedOperationId] = useState<string>('')
  
  const { data: operations = [], isLoading: operationsLoading } = useOperations()
  const { data: premises = [], isLoading: premisesLoading } = usePremisesByOperation(selectedOperationId)
  const calculateMutation = useCalculateDimensioning()

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      operationId: '',
      premiseId: '',
    },
  })

  const onSubmit = async (data: AnalysisFormData) => {
    try {
      const selectedPremise = premises.find(p => p.id === data.premiseId)
      if (!selectedPremise) return

      const calculationData = {
        operationId: data.operationId,
        premiseId: data.premiseId,
        premise: selectedPremise,
        calculationParams: {
          targetSLA: 80, // Default for analysis
        },
      }

      const result = await calculateMutation.mutateAsync(calculationData)
      
      // Generate analysis from results
      const analysisData = generateAnalysis(result)
      setAnalysis(analysisData)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const generateAnalysis = (results: any) => {
    const occupancyData = results.occupancyData || []
    const avgOccupancy = occupancyData.reduce((sum: number, occ: number) => sum + occ, 0) / occupancyData.length
    const maxOccupancy = Math.max(...occupancyData)
    const minOccupancy = Math.min(...occupancyData)
    
    // Use occupancyData directly since detailedResults doesn't exist
    const overloadedPeriods = occupancyData.filter((occ: number) => occ > 85)
    const underutilizedPeriods = occupancyData.filter((occ: number) => occ < 50)
    const optimalPeriods = occupancyData.filter((occ: number) => occ >= 50 && occ <= 85)

    return {
      summary: {
        avgOccupancy: isNaN(avgOccupancy) ? 0 : Math.round(avgOccupancy),
        maxOccupancy: !isFinite(maxOccupancy) ? 0 : Math.round(maxOccupancy),
        minOccupancy: !isFinite(minOccupancy) ? 0 : Math.round(minOccupancy),
        totalHC: results.metrics?.totalHC || 0,
      },
      periods: {
        overloaded: overloadedPeriods.length,
        underutilized: underutilizedPeriods.length,
        optimal: optimalPeriods.length,
      },
      recommendations: generateRecommendations(avgOccupancy, maxOccupancy, overloadedPeriods.length),
      detailedResults: results.hcDistribution?.map((hc: number, index: number) => ({
        hc,
        occupancy: occupancyData[index] || 0,
        interval: index
      })) || [],
    }
  }

  const generateRecommendations = (avg: number, max: number, overloadedCount: number) => {
    const recommendations = []
    
    if (avg > 85) {
      recommendations.push({
        type: 'warning',
        title: 'Ocupação Média Alta',
        description: 'A ocupação média está acima de 85%. Considere aumentar o HC.',
      })
    }
    
    if (max > 95) {
      recommendations.push({
        type: 'error',
        title: 'Picos Críticos',
        description: 'Há períodos com ocupação acima de 95%. Risco de degradação do serviço.',
      })
    }
    
    if (overloadedCount > 10) {
      recommendations.push({
        type: 'warning',
        title: 'Muitos Períodos Sobrecarregados',
        description: 'Mais de 10 intervalos com ocupação alta. Redistribua os turnos.',
      })
    }
    
    if (avg < 60) {
      recommendations.push({
        type: 'info',
        title: 'Oportunidade de Otimização',
        description: 'Ocupação baixa. Há espaço para reduzir HC ou redistribuir recursos.',
      })
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Dimensionamento Adequado',
        description: 'A ocupação está dentro dos parâmetros ideais (50-85%).',
      })
    }

    return recommendations
  }

  const handleOperationChange = (operationId: string) => {
    setSelectedOperationId(operationId)
    form.setValue('operationId', operationId)
    form.setValue('premiseId', '')
  }

  const formatTime = (interval: number) => {
    const hour = Math.floor(interval / 4)
    const minute = (interval % 4) * 15
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy > 85) return 'text-red-600'
    if (occupancy > 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise de Ocupação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!analysis ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="operationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operação</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={handleOperationChange}
                            disabled={operationsLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma operação" />
                            </SelectTrigger>
                            <SelectContent>
                              {operations.map((operation) => (
                                <SelectItem key={operation.id} value={operation.id}>
                                  {operation.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="premiseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Premissa</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!selectedOperationId || premisesLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma premissa" />
                            </SelectTrigger>
                            <SelectContent>
                              {premises.map((premise) => (
                                <SelectItem key={premise.id} value={premise.id}>
                                  {premise.plannedMonth} - {premise.unproductivityPercentage}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={calculateMutation.isPending}>
                    {calculateMutation.isPending ? 'Analisando...' : 'Analisar'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ocupação Média</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getOccupancyColor(analysis.summary.avgOccupancy)}`}>
                      {analysis.summary.avgOccupancy}%
                    </div>
                    <Progress value={analysis.summary.avgOccupancy} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pico Máximo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getOccupancyColor(analysis.summary.maxOccupancy)}`}>
                      {analysis.summary.maxOccupancy}%
                    </div>
                    <Progress value={analysis.summary.maxOccupancy} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">HC Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary flex items-center gap-1">
                      <Users className="h-5 w-5" />
                      {analysis.summary.totalHC}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Períodos Ótimos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.periods.optimal}
                    </div>
                    <p className="text-xs text-muted-foreground">de {analysis.detailedResults.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      {getRecommendationIcon(rec.type)}
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Period Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-600">Períodos Sobrecarregados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{analysis.periods.overloaded}</div>
                    <p className="text-xs text-muted-foreground">Ocupação &gt; 85%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-600">Períodos Ótimos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{analysis.periods.optimal}</div>
                    <p className="text-xs text-muted-foreground">Ocupação 50-85%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-600">Períodos Subutilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">{analysis.periods.underutilized}</div>
                    <p className="text-xs text-muted-foreground">Ocupação &lt; 50%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAnalysis(null)}>
                  Nova Análise
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
