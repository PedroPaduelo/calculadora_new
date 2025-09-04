import { api } from '@/lib/api'
import { Operation, ApiResponse, PaginatedResponse } from '@calculadora-hc/shared'

export interface CreateOperationRequest {
  name: string
  description?: string
  workingHours: {
    start: string
    end: string
  }
  slaTarget: number
  slaPercentage: number
}

export interface UpdateOperationRequest extends Partial<CreateOperationRequest> {
  id: string
}

export const operationsService = {
  // Listar todas as operações
  async getAll(): Promise<Operation[]> {
    const response = await api.get<ApiResponse<Operation[]>>('/operations')
    return response.data.data || []
  },

  // Buscar operação por ID
  async getById(id: string): Promise<Operation> {
    const response = await api.get<ApiResponse<Operation>>(`/operations/${id}`)
    return response.data.data!
  },

  // Criar nova operação
  async create(data: CreateOperationRequest): Promise<Operation> {
    const response = await api.post<ApiResponse<Operation>>('/operations', data)
    return response.data.data!
  },

  // Atualizar operação
  async update(id: string, data: Partial<CreateOperationRequest>): Promise<Operation> {
    const response = await api.put<ApiResponse<Operation>>(`/operations/${id}`, data)
    return response.data.data!
  },

  // Deletar operação
  async delete(id: string): Promise<void> {
    await api.delete(`/operations/${id}`)
  },

  // Buscar operações com paginação
  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Operation>> {
    const response = await api.get<PaginatedResponse<Operation>>('/operations', {
      params: { page, limit }
    })
    return response.data
  }
}
