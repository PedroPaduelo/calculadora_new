import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Scenario } from '@/services/scenarios'
import { useCreateScenario, useUpdateScenario } from '@/hooks/use-scenarios'
import { useOperations } from '@/hooks/use-operations'

const scenarioFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  operationId: z.string().min(1, 'Operação é obrigatória'),
})

type ScenarioFormData = z.infer<typeof scenarioFormSchema>

interface ScenarioFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenario?: Scenario | null
}

export function ScenarioForm({ open, onOpenChange, scenario }: ScenarioFormProps) {
  const isEditing = !!scenario
  const createMutation = useCreateScenario()
  const updateMutation = useUpdateScenario()
  const { data: operations = [], isLoading: operationsLoading } = useOperations()

  const form = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioFormSchema),
    defaultValues: {
      name: '',
      description: '',
      operationId: '',
    },
  })

  useEffect(() => {
    if (scenario) {
      form.reset({
        name: scenario.name,
        description: scenario.description || '',
        operationId: scenario.operationId,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        operationId: '',
      })
    }
  }, [scenario, form])

  const onSubmit = async (data: ScenarioFormData) => {
    try {
      if (isEditing && scenario) {
        await updateMutation.mutateAsync({
          id: scenario.id,
          data: {
            name: data.name,
            description: data.description,
          }
        })
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          description: data.description,
          operationId: data.operationId,
          premisesSnapshot: {},
          resultsSnapshot: {},
        })
      }
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutations
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cenário' : 'Novo Cenário'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cenário</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Cenário Base Fevereiro 2025" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva os detalhes deste cenário..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="operationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operação</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={operationsLoading}
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
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
