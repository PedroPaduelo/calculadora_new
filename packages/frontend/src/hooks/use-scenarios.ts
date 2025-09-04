import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { 
  scenariosService, 
  CreateScenarioRequest, 
  UpdateScenarioRequest
} from '@/services/scenarios'

// Query Keys
export const scenariosKeys = {
  all: ['scenarios'] as const,
  byOperation: (operationId: string) => [...scenariosKeys.all, 'operation', operationId] as const,
  detail: (id: string) => [...scenariosKeys.all, 'detail', id] as const,
}

// Get all scenarios
export function useScenarios(operationId?: string) {
  return useQuery({
    queryKey: operationId ? scenariosKeys.byOperation(operationId) : scenariosKeys.all,
    queryFn: () => scenariosService.getAllScenarios(operationId),
  })
}

// Get scenario by ID
export function useScenario(id: string) {
  return useQuery({
    queryKey: scenariosKeys.detail(id),
    queryFn: () => scenariosService.getScenarioById(id),
    enabled: !!id,
  })
}

// Copy scenario
export function useCopyScenario() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: scenariosService.copyScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: scenariosKeys.all
      })
      
      toast({
        title: 'Sucesso',
        description: 'Cenário copiado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao copiar cenário: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Create scenario
export function useCreateScenario() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateScenarioRequest) => scenariosService.createScenario(data),
    onSuccess: () => {
      // Invalidate and refetch all scenarios queries
      queryClient.invalidateQueries({ 
        queryKey: scenariosKeys.all
      })
      
      toast({
        title: 'Sucesso',
        description: 'Cenário salvo com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao salvar cenário: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Update scenario
export function useUpdateScenario() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScenarioRequest }) => 
      scenariosService.updateScenario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: scenariosKeys.all
      })
      
      toast({
        title: 'Sucesso',
        description: 'Cenário atualizado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao atualizar cenário: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Delete scenario
export function useDeleteScenario() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => scenariosService.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: scenariosKeys.all
      })
      
      toast({
        title: 'Sucesso',
        description: 'Cenário excluído com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao excluir cenário: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Compare scenarios
export function useCompareScenarios() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (scenarioIds: string[]) => scenariosService.compareScenarios(scenarioIds),
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao comparar cenários: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}
