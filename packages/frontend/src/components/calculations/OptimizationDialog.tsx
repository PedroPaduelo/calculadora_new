import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, Clock, Target, Zap, ArrowRight } from 'lucide-react'
import { useOperations } from '@/hooks/use-operations'
import { usePremisesByOperation } from '@/hooks/use-premises'
import { useCalculateDimensioning } from '@/hooks/use-premises'

const optimizationSchema = z.object({
  operationId: z.string().min(1, 'Operação é obrigatória'),
  premiseId: z.string().min(1, 'Premissa é obrigatória'),
  targetSLA: z.number().min(1).max(100, 'SLA deve estar entre 1% e 100%'),
  maxOccupancy: z.number().min(50).max(95, 'Ocupação máxima deve estar entre 50% e 95%'),
})

type OptimizationFormData = z.infer<typeof optimizationSchema>

interface OptimizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OptimizationDialog({ open, onOpenChange }: OptimizationDialogProps) {
  const [optimization, setOptimization] = useState<any>(null)
  const [selectedOperationId, setSelectedOperationId] = useState<string>('')
  
  const { data: operations = [], isLoading: operationsLoading } = useOperations()
  const { data: premises = [], isLoading: premisesLoading } = usePremisesByOperation(selectedOperationId)
  const calculateMutation = useCalculateDimensioning()

  const form = useForm<OptimizationFormData>({
    resolver: zodResolver(optimizationSchema),
    defaultValues: {
      operationId: '',
      premiseId: '',
      targetSLA: 80,
      maxOccupancy: 85,
    },
  })

  const onSubmit = async (data: OptimizationFormData) => {
    try {
      const selectedPremise = premises.find(p => p.id === data.premiseId)
      if (!selectedPremise) return

      // Calculate current scenario
      const currentCalculation = {
        operationId: data.operationId,
        premiseId: data.premiseId,
        premise: selectedPremise,
        calculationParams: {
          targetSLA: data.targetSLA,
        },
      }

      const currentResult = await calculateMutation.mutateAsync(currentCalculation)
      
      // Generate optimization suggestions
      const optimizationData = generateOptimization(currentResult, data)
      setOptimization(optimizationData)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const generateOptimization = (currentResult: any, params: OptimizationFormData) => {
    const currentHC = currentResult.metrics?.totalHC || 0
    const currentOccupancy = currentResult.metrics?.avgOccupancy || 0
    const hcDistribution = currentResult.hcDistribution || []
    const occupancyData = currentResult.occupancyData || []

    // Create detailed results from available data
    const detailedResults = hcDistribution.map((hc: number, index: number) => ({
      hc,
      occupancy: occupancyData[index] || 0,
      interval: index,
      volume: 0, // Not available in current API response
      tmi: 0     // Not available in current API response
    }))

    // Identify optimization opportunities
    const overloadedPeriods = detailedResults.filter((r: any) => r.occupancy > params.maxOccupancy)
    const underutilizedPeriods = detailedResults.filter((r: any) => r.occupancy < 50)
    
    // Calculate optimal HC distribution
    const optimizedResults = detailedResults.map((result: any, index: number) => {
      let optimizedHC = result.hc
      
      // Reduce HC in underutilized periods
      if (result.occupancy < 50 && result.hc > 1) {
        optimizedHC = Math.max(1, Math.ceil(result.hc * 0.8))
      }
      
      // Increase HC in overloaded periods
      if (result.occupancy > params.maxOccupancy) {
        optimizedHC = Math.ceil(result.hc * 1.2)
      }
      
      // Simple occupancy calculation based on HC ratio
      const hcRatio = optimizedHC / result.hc
      const newOccupancy = result.occupancy / hcRatio
      
      return {
        ...result,
        originalHC: result.hc,
        optimizedHC,
        originalOccupancy: result.occupancy,
        optimizedOccupancy: Math.min(95, Math.max(0, newOccupancy)),
        improvement: result.occupancy - newOccupancy,
      }
    })

    const optimizedTotalHC = optimizedResults.reduce((sum: number, r: any) => Math.max(sum, r.optimizedHC), 0)
    const optimizedAvgOccupancy = optimizedResults.reduce((sum: number, r: any) => sum + r.optimizedOccupancy, 0) / optimizedResults.length

    // Calculate savings and improvements
    const hcSavings = currentHC - optimizedTotalHC
    const occupancyImprovement = Math.abs(optimizedAvgOccupancy - 75) < Math.abs(currentOccupancy - 75)

    return {
      current: {
        totalHC: currentHC,
        avgOccupancy: Math.round(currentOccupancy),
        overloadedPeriods: overloadedPeriods.length,
        underutilizedPeriods: underutilizedPeriods.length,
      },
      optimized: {
        totalHC: optimizedTotalHC,
        avgOccupancy: Math.round(optimizedAvgOccupancy),
        overloadedPeriods: optimizedResults.filter((r: any) => r.optimizedOccupancy > params.maxOccupancy).length,
        underutilizedPeriods: optimizedResults.filter((r: any) => r.optimizedOccupancy < 50).length,
      },
      improvements: {
        hcSavings,
        occupancyBalance: occupancyImprovement,
        costSavings: hcSavings * 5000, // Assuming R$ 5000 per HC per month
      },
      recommendations: generateOptimizationRecommendations(optimizedResults, hcSavings),
      detailedResults: optimizedResults,
    }
  }

  const generateOptimizationRecommendations = (results: any[], hcSavings: number) => {
    const recommendations = []

    if (hcSavings > 0) {
      recommendations.push({
        type: 'success',
        title: 'Redução de HC Possível',
        description: `Potencial de reduzir ${hcSavings} HC mantendo a qualidade do serviço.`,
      })
    }

    const peakPeriods = results.filter(r => r.optimizedOccupancy > 80).length
    if (peakPeriods > 0) {
      recommendations.push({
        type: 'info',
        title: 'Redistribuição de Turnos',
        description: `Considere redistribuir ${peakPeriods} turnos para equilibrar a ocupação.`,
      })
    }

    const flexiblePeriods = results.filter(r => r.optimizedOccupancy < 60).length
    if (flexiblePeriods > 5) {
      recommendations.push({
        type: 'warning',
        title: 'Oportunidade de Flexibilização',
        description: `${flexiblePeriods} períodos com baixa ocupação podem ser otimizados.`,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Otimização de Turnos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!optimization ? (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetSLA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta SLA (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxOccupancy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ocupação Máxima (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="50"
                            max="95"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
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
                    {calculateMutation.isPending ? (
                      'Otimizando...'
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Otimizar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* Comparison Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cenário Atual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HC Total</span>
                      <Badge variant="outline">{optimization.current.totalHC}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ocupação</span>
                      <Badge variant="outline">{optimization.current.avgOccupancy}%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">Cenário Otimizado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">HC Total</span>
                      <Badge className="bg-green-100 text-green-700">{optimization.optimized.totalHC}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ocupação</span>
                      <Badge className="bg-green-100 text-green-700">{optimization.optimized.avgOccupancy}%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-700">Benefícios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Economia HC</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        {optimization.improvements.hcSavings > 0 ? `-${optimization.improvements.hcSavings}` : '0'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Economia R$</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        R$ {optimization.improvements.costSavings.toLocaleString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recomendações de Otimização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {optimization.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Before/After Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparação Detalhada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Horário</th>
                          <th className="text-left p-2">HC Atual</th>
                          <th className="text-left p-2">HC Otimizado</th>
                          <th className="text-left p-2">Ocupação Atual</th>
                          <th className="text-left p-2">Ocupação Otimizada</th>
                          <th className="text-left p-2">Melhoria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimization.detailedResults.slice(0, 20).map((result: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{formatTime(index)}</td>
                            <td className="p-2">
                              <Badge variant="outline">{result.originalHC}</Badge>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={result.optimizedHC !== result.originalHC ? "default" : "outline"}
                              >
                                {result.optimizedHC}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={result.originalOccupancy > 85 ? "destructive" : "outline"}
                              >
                                {Math.round(result.originalOccupancy)}%
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={result.optimizedOccupancy > 85 ? "destructive" : result.optimizedOccupancy < result.originalOccupancy ? "default" : "outline"}
                              >
                                {Math.round(result.optimizedOccupancy)}%
                              </Badge>
                            </td>
                            <td className="p-2">
                              {result.improvement > 0 ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-xs">-{Math.round(result.improvement)}%</span>
                                </div>
                              ) : result.improvement < 0 ? (
                                <div className="flex items-center gap-1 text-red-600">
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-xs">+{Math.round(Math.abs(result.improvement))}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOptimization(null)}>
                  Nova Otimização
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
