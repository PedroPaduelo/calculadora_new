import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { 
  premisesService, 
  CreatePremiseRequest, 
  UpdatePremiseRequest,
  ImportCurvesRequest,
  CalculationRequest,
  ExportRequest
} from '@/services/premises'

// Query Keys
export const premisesKeys = {
  all: ['premises'] as const,
  byOperation: (operationId: string) => [...premisesKeys.all, 'operation', operationId] as const,
  detail: (id: string) => [...premisesKeys.all, 'detail', id] as const,
}

// Get all premises
export function usePremises() {
  return useQuery({
    queryKey: premisesKeys.all,
    queryFn: () => premisesService.getAllPremises(),
  })
}

// Get premises by operation
export function usePremisesByOperation(operationId: string) {
  return useQuery({
    queryKey: premisesKeys.byOperation(operationId),
    queryFn: () => premisesService.getPremisesByOperation(operationId),
    enabled: !!operationId,
  })
}

// Get premise by ID
export function usePremise(id: string) {
  return useQuery({
    queryKey: premisesKeys.detail(id),
    queryFn: () => premisesService.getPremiseById(id),
    enabled: !!id,
  })
}

// Create premise
export function useCreatePremise() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePremiseRequest) => premisesService.createPremise(data),
    onSuccess: (newPremise) => {
      // Invalidate and refetch all premises queries
      queryClient.invalidateQueries({ 
        queryKey: premisesKeys.all
      })
      
      toast({
        title: 'Sucesso',
        description: 'Premissa criada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao criar premissa: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Update premise
export function useUpdatePremise() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePremiseRequest }) =>
      premisesService.updatePremise(id, data),
    onSuccess: (updatedPremise) => {
      // Update the premise in cache
      queryClient.setQueryData(
        premisesKeys.detail(updatedPremise.id),
        updatedPremise
      )
      
      // Invalidate operation premises list
      queryClient.invalidateQueries({ 
        queryKey: premisesKeys.byOperation(updatedPremise.operationId) 
      })
      
      toast({
        title: 'Sucesso',
        description: 'Premissa atualizada com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao atualizar premissa: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Delete premise
export function useDeletePremise() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => premisesService.deletePremise(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: premisesKeys.detail(deletedId) })
      
      // Invalidate all premises queries
      queryClient.invalidateQueries({ queryKey: premisesKeys.all })
      
      toast({
        title: 'Sucesso',
        description: 'Premissa excluída com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao excluir premissa: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Import curves
export function useImportCurves() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ImportCurvesRequest }) =>
      premisesService.importCurves(id, data),
    onSuccess: (updatedPremise) => {
      // Update the premise in cache
      queryClient.setQueryData(
        premisesKeys.detail(updatedPremise.id),
        updatedPremise
      )
      
      // Invalidate operation premises list
      queryClient.invalidateQueries({ 
        queryKey: premisesKeys.byOperation(updatedPremise.operationId) 
      })
      
      toast({
        title: 'Sucesso',
        description: 'Curvas importadas com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao importar curvas: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Bulk import
export function useBulkImport() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (file: File) => premisesService.bulkImport(file),
    onSuccess: (result) => {
      // Invalidate all premises queries
      queryClient.invalidateQueries({ queryKey: premisesKeys.all })
      
      if (result.errors.length > 0) {
        toast({
          title: 'Importação Concluída',
          description: `${result.imported} premissas importadas com ${result.errors.length} erros.`,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Sucesso',
          description: `${result.imported} premissas importadas com sucesso!`,
        })
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro na importação: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Calculate dimensioning
export function useCalculateDimensioning() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CalculationRequest) => premisesService.calculateDimensioning(data),
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Dimensionamento calculado com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro no cálculo: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}

// Export premises
export function useExportPremises() {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: ExportRequest) => premisesService.exportPremises(data),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `premissas_${new Date().toISOString().split('T')[0]}.${variables.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Sucesso',
        description: 'Exportação concluída com sucesso!',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro na exportação: ${error.message}`,
        variant: 'destructive',
      })
    },
  })
}
