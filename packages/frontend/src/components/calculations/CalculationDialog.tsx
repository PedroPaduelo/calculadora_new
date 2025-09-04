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
import { Separator } from '@/components/ui/separator'
import { Calculator, Users, TrendingUp, Clock, Play } from 'lucide-react'
import { useOperations } from '@/hooks/use-operations'
import { usePremisesByOperation } from '@/hooks/use-premises'
import { useCalculateDimensioning } from '@/hooks/use-premises'

const calculationSchema = z.object({
  operationId: z.string().min(1, 'Operação é obrigatória'),
  premiseId: z.string().min(1, 'Premissa é obrigatória'),
  targetSLA: z.number().min(1).max(100, 'SLA deve estar entre 1% e 100%'),
})

type CalculationFormData = z.infer<typeof calculationSchema>

interface CalculationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalculationDialog({ open, onOpenChange }: CalculationDialogProps) {
  const [results, setResults] = useState<any>(null)
  const [selectedOperationId, setSelectedOperationId] = useState<string>('')
  
  const { data: operations = [], isLoading: operationsLoading } = useOperations()
  const { data: premises = [], isLoading: premisesLoading } = usePremisesByOperation(selectedOperationId)
  const calculateMutation = useCalculateDimensioning()

  const form = useForm<CalculationFormData>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      operationId: '',
      premiseId: '',
      targetSLA: 80,
    },
  })

  const onSubmit = async (data: CalculationFormData) => {
    try {
      const selectedPremise = premises.find(p => p.id === data.premiseId)
      if (!selectedPremise) return

      const calculationData = {
        operationId: data.operationId,
        premiseId: data.premiseId,
        premise: selectedPremise,
        calculationParams: {
          targetSLA: data.targetSLA,
        },
      }

      const result = await calculateMutation.mutateAsync(calculationData)
      setResults(result)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  const handleOperationChange = (operationId: string) => {
    setSelectedOperationId(operationId)
    form.setValue('operationId', operationId)
    form.setValue('premiseId', '') // Reset premise selection
  }

  const formatTime = (interval: number) => {
    const hour = Math.floor(interval / 4)
    const minute = (interval % 4) * 15
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dimensionamento de HC
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!results ? (
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

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={calculateMutation.isPending}>
                    {calculateMutation.isPending ? (
                      <>Calculando...</>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Calcular
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      HC Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {results.metrics?.totalHC || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      SLA Atingido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(results.metrics?.avgSLA || 0)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Ocupação Média
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(results.metrics?.avgOccupancy || 0)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Resultados Detalhados por Intervalo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Horário</th>
                          <th className="text-left p-2">Volume</th>
                          <th className="text-left p-2">TMI</th>
                          <th className="text-left p-2">HC</th>
                          <th className="text-left p-2">Ocupação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.hcDistribution?.map((hc: number, index: number) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{formatTime(index)}</td>
                            <td className="p-2">-</td>
                            <td className="p-2">-</td>
                            <td className="p-2">
                              <Badge variant="outline">{hc}</Badge>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={results.occupancyData?.[index] > 85 ? "destructive" : results.occupancyData?.[index] > 70 ? "default" : "secondary"}
                              >
                                {Math.round(results.occupancyData?.[index] || 0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setResults(null)}>
                  Novo Cálculo
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
