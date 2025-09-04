import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PlanningPremise } from '@calculadora-hc/shared'
import { useCreatePremise, useUpdatePremise } from '@/hooks/use-premises'
import { useOperations } from '@/hooks/use-operations'

const premiseFormSchema = z.object({
  operationId: z.string().min(1, 'Operação é obrigatória'),
  plannedMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Formato deve ser YYYY-MM'),
  volumeCurve: z.string().min(1, 'Curva de volume é obrigatória'),
  tmiCurve: z.string().min(1, 'Curva TMI é obrigatória'),
  tmaCurve: z.string().min(1, 'Curva TMA é obrigatória'),
  unproductivityPercentage: z.number().min(0).max(100, 'Deve estar entre 0 e 100'),
})

type PremiseFormData = z.infer<typeof premiseFormSchema>

interface PremiseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  premise?: PlanningPremise | null
  operationId?: string
}

export function PremiseForm({ open, onOpenChange, premise, operationId }: PremiseFormProps) {
  const isEditing = !!premise
  const createMutation = useCreatePremise()
  const updateMutation = useUpdatePremise()
  const { data: operations = [], isLoading: operationsLoading } = useOperations()

  const form = useForm<PremiseFormData>({
    resolver: zodResolver(premiseFormSchema),
    defaultValues: {
      operationId: operationId || '',
      plannedMonth: '',
      volumeCurve: '',
      tmiCurve: '',
      tmaCurve: '',
      unproductivityPercentage: 18,
    },
  })

  useEffect(() => {
    if (premise) {
      form.reset({
        operationId: premise.operationId,
        plannedMonth: premise.plannedMonth,
        volumeCurve: Array.isArray(premise.volumeCurve) 
          ? premise.volumeCurve.join(',') 
          : premise.volumeCurve,
        tmiCurve: Array.isArray(premise.tmiCurve) 
          ? premise.tmiCurve.join(',') 
          : premise.tmiCurve,
        tmaCurve: Array.isArray(premise.tmaCurve) 
          ? premise.tmaCurve.join(',') 
          : premise.tmaCurve,
        unproductivityPercentage: premise.unproductivityPercentage,
      })
    } else if (operationId) {
      form.reset({
        operationId,
        plannedMonth: '',
        volumeCurve: '',
        tmiCurve: '',
        tmaCurve: '',
        unproductivityPercentage: 18,
      })
    }
  }, [premise, operationId, form])

  const parseNumberArray = (str: string): number[] => {
    return str.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
  }

  const onSubmit = async (data: PremiseFormData) => {
    try {
      const premiseData = {
        operationId: data.operationId,
        plannedMonth: data.plannedMonth,
        volumeCurve: parseNumberArray(data.volumeCurve),
        tmiCurve: parseNumberArray(data.tmiCurve),
        tmaCurve: parseNumberArray(data.tmaCurve),
        unproductivityPercentage: data.unproductivityPercentage,
      }

      if (isEditing && premise) {
        await updateMutation.mutateAsync({
          id: premise.id,
          data: premiseData,
        })
      } else {
        await createMutation.mutateAsync(premiseData)
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutations
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Premissa' : 'Nova Premissa'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="operationId"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Operação</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isEditing || operationsLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">
                        {operationsLoading ? 'Carregando operações...' : 'Selecione uma operação'}
                      </option>
                      {operations.map((operation) => (
                        <option key={operation.id} value={operation.id}>
                          {operation.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Selecione a operação para criar as premissas
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plannedMonth"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Mês Planejado</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="2024-02"
                      type="month"
                      min="2020-01"
                      max="2030-12"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Selecione o mês e ano para o planejamento
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volumeCurve"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Curva de Volume</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="100,120,150,180,200,220,250,280,300,320,350,380"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Valores separados por vírgula (ex: 100,120,150...)
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tmiCurve"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Curva TMI (Tempo Médio de Atendimento)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="180,185,190,195,200,205,210,215,220,225,230,235"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Valores em segundos, separados por vírgula
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tmaCurve"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Curva TMA (Tempo Médio de Abandono)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="30,35,40,45,50,55,60,65,70,75,80,85"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Valores em segundos, separados por vírgula
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unproductivityPercentage"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Percentual de Improdutividade (%)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
