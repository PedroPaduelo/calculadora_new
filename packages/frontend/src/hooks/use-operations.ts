import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { operationsService, CreateOperationRequest } from '@/services/operations'
import { useToast } from '@/hooks/use-toast'

const OPERATIONS_QUERY_KEY = 'operations'

export function useOperations() {
  return useQuery({
    queryKey: [OPERATIONS_QUERY_KEY],
    queryFn: operationsService.getAll,
  })
}

export function useOperation(id: string) {
  return useQuery({
    queryKey: [OPERATIONS_QUERY_KEY, id],
    queryFn: () => operationsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateOperation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: operationsService.create,
    onSuccess: (newOperation) => {
      queryClient.invalidateQueries({ queryKey: [OPERATIONS_QUERY_KEY] })
      toast({
        title: 'Operação criada',
        description: `A operação "${newOperation.name}" foi criada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar operação',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateOperation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOperationRequest> }) =>
      operationsService.update(id, data),
    onSuccess: (updatedOperation) => {
      queryClient.invalidateQueries({ queryKey: [OPERATIONS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [OPERATIONS_QUERY_KEY, updatedOperation.id] })
      toast({
        title: 'Operação atualizada',
        description: `A operação "${updatedOperation.name}" foi atualizada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar operação',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteOperation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: operationsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPERATIONS_QUERY_KEY] })
      toast({
        title: 'Operação excluída',
        description: 'A operação foi excluída com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir operação',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}
