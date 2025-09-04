import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Operation } from '@calculadora-hc/shared'
import { CreateOperationRequest } from '@/services/operations'

const operationFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  workingHours: z.object({
    start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
    end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  }),
  slaTarget: z.number().min(0, 'Deve ser maior que 0').max(100, 'Deve ser menor que 100'),
  slaPercentage: z.number().min(0, 'Deve ser maior que 0').max(100, 'Deve ser menor que 100'),
})

type OperationFormData = z.infer<typeof operationFormSchema>

interface OperationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation?: Operation | null
  onSubmit: (data: CreateOperationRequest) => void
  isLoading?: boolean
}

export function OperationForm({
  open,
  onOpenChange,
  operation,
  onSubmit,
  isLoading = false,
}: OperationFormProps) {
  const isEditing = !!operation

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      workingHours: {
        start: '08:00',
        end: '18:00',
      },
      slaTarget: 90,
      slaPercentage: 0,
    },
  })

  // Reset form when operation changes
  useEffect(() => {
    if (operation) {
      const workingHours = typeof operation.workingHours === 'string' 
        ? JSON.parse(operation.workingHours)
        : operation.workingHours

      form.reset({
        name: operation.name,
        description: operation.description || '',
        workingHours: {
          start: workingHours.start,
          end: workingHours.end,
        },
        slaTarget: operation.slaTarget,
        slaPercentage: operation.slaPercentage,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        workingHours: {
          start: '08:00',
          end: '18:00',
        },
        slaTarget: 90,
        slaPercentage: 0,
      })
    }
  }, [operation, form])

  const handleSubmit = (data: OperationFormData) => {
    onSubmit(data)
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Operação' : 'Nova Operação'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações da operação.' 
              : 'Preencha os dados para criar uma nova operação.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Operação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Atendimento Geral" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição da operação (opcional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workingHours.start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHours.end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slaTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta SLA (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slaPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SLA Atual (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
