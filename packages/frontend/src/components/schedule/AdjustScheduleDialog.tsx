import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Users, Clock, Save, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const adjustSchema = z.object({
  adjustments: z.array(z.object({
    time: z.string(),
    currentScheduled: z.number(),
    newScheduled: z.number().min(0, 'HC não pode ser negativo'),
    needed: z.number(),
  }))
})

type AdjustFormData = z.infer<typeof adjustSchema>

interface AdjustScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periods: Array<{
    time: string
    scheduled: number
    needed: number
    coverage: number
    status: string
  }>
  onSave: (adjustments: any[]) => void
}

export function AdjustScheduleDialog({ 
  open, 
  onOpenChange, 
  periods, 
  onSave 
}: AdjustScheduleDialogProps) {
  const { toast } = useToast()
  const [adjustments, setAdjustments] = useState(
    periods.map(period => ({
      time: period.time,
      currentScheduled: period.scheduled,
      newScheduled: period.scheduled,
      needed: period.needed,
    }))
  )

  const form = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      adjustments
    }
  })

  const updateAdjustment = (index: number, newScheduled: number) => {
    const updated = [...adjustments]
    updated[index] = { ...updated[index], newScheduled }
    setAdjustments(updated)
    form.setValue(`adjustments.${index}.newScheduled`, newScheduled)
  }

  const autoOptimize = () => {
    const optimized = adjustments.map(adj => {
      // Simple optimization: try to match needed HC
      const optimal = Math.max(1, adj.needed)
      return { ...adj, newScheduled: optimal }
    })
    setAdjustments(optimized)
    optimized.forEach((adj, index) => {
      form.setValue(`adjustments.${index}.newScheduled`, adj.newScheduled)
    })
    toast({
      title: "Otimização Aplicada",
      description: "Escalas ajustadas automaticamente baseadas na necessidade.",
    })
  }

  const resetChanges = () => {
    const reset = adjustments.map(adj => ({
      ...adj,
      newScheduled: adj.currentScheduled
    }))
    setAdjustments(reset)
    reset.forEach((adj, index) => {
      form.setValue(`adjustments.${index}.newScheduled`, adj.newScheduled)
    })
  }

  const onSubmit = (data: AdjustFormData) => {
    onSave(data.adjustments)
    toast({
      title: "Escalas Ajustadas",
      description: "As alterações foram salvas com sucesso.",
    })
    onOpenChange(false)
  }

  const calculateCoverage = (scheduled: number, needed: number) => {
    return needed > 0 ? Math.round((scheduled / needed) * 100) : 0
  }

  const getCoverageColor = (coverage: number) => {
    if (coverage < 90) return 'text-red-600'
    if (coverage > 120) return 'text-yellow-600'
    return 'text-green-600'
  }

  const totalCurrentScheduled = adjustments.reduce((sum, adj) => sum + adj.currentScheduled, 0)
  const totalNewScheduled = adjustments.reduce((sum, adj) => sum + adj.newScheduled, 0)
  const totalNeeded = adjustments.reduce((sum, adj) => sum + adj.needed, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ajustar Escalas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HC Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCurrentScheduled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HC Ajustado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalNewScheduled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HC Necessário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalNeeded}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={autoOptimize}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Auto Otimizar
            </Button>
            <Button type="button" variant="outline" onClick={resetChanges}>
              Resetar
            </Button>
          </div>

          <Separator />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {adjustments.map((adjustment, index) => {
                  const newCoverage = calculateCoverage(adjustment.newScheduled, adjustment.needed)
                  const currentCoverage = calculateCoverage(adjustment.currentScheduled, adjustment.needed)
                  
                  return (
                    <Card key={adjustment.time}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{adjustment.time}</span>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Atual</div>
                            <div className="font-medium">{adjustment.currentScheduled}</div>
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Necessário</div>
                            <div className="font-medium">{adjustment.needed}</div>
                          </div>

                          <FormField
                            control={form.control}
                            name={`adjustments.${index}.newScheduled`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Novo HC</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    value={adjustment.newScheduled}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0
                                      updateAdjustment(index, value)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Cobertura</div>
                            <div className={`font-bold ${getCoverageColor(newCoverage)}`}>
                              {newCoverage}%
                            </div>
                            {newCoverage !== currentCoverage && (
                              <Badge variant={newCoverage > currentCoverage ? "default" : "secondary"} className="text-xs">
                                {newCoverage > currentCoverage ? '+' : ''}{newCoverage - currentCoverage}%
                              </Badge>
                            )}
                          </div>

                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Diferença</div>
                            <div className={`font-medium ${
                              adjustment.newScheduled - adjustment.needed > 0 ? 'text-yellow-600' : 
                              adjustment.newScheduled - adjustment.needed < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {adjustment.newScheduled - adjustment.needed > 0 ? '+' : ''}
                              {adjustment.newScheduled - adjustment.needed}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Ajustes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
