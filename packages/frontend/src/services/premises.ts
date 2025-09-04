import { PlanningPremise, ApiResponse } from '@calculadora-hc/shared'
import { api } from '@/lib/api'

export interface CreatePremiseRequest {
  operationId: string
  plannedMonth: string
  volumeCurve: number[]
  tmiCurve: number[]
  tmaCurve: number[]
  unproductivityPercentage: number
}

export interface UpdatePremiseRequest {
  plannedMonth?: string
  volumeCurve?: number[]
  tmiCurve?: number[]
  tmaCurve?: number[]
  unproductivityPercentage?: number
}

export interface ImportCurvesRequest {
  type: 'volume' | 'tmi' | 'tma'
  data: number[]
}

export interface CalculationRequest {
  operationId: string
  premiseId: string
  targetSLA?: number
  additionalConstraints?: Record<string, any>
}

export interface ExportRequest {
  premiseIds: string[]
  format: 'csv' | 'excel'
  includeCalculations?: boolean
}

class PremisesService {
  async getAllPremises(): Promise<PlanningPremise[]> {
    const response = await api.get('/premises')
    return response.data.data
  }

  async getPremisesByOperation(operationId: string): Promise<PlanningPremise[]> {
    const response = await api.get(`/premises/operation/${operationId}`)
    return response.data.data || []
  }

  async getPremiseById(id: string): Promise<PlanningPremise> {
    const response = await api.get<ApiResponse<PlanningPremise>>(`/premises/${id}`)
    if (!response.data.data) {
      throw new Error('Premise not found')
    }
    return response.data.data
  }

  async createPremise(data: CreatePremiseRequest): Promise<PlanningPremise> {
    const response = await api.post<ApiResponse<PlanningPremise>>('/premises', data)
    if (!response.data.data) {
      throw new Error('Failed to create premise')
    }
    return response.data.data
  }

  async updatePremise(id: string, data: UpdatePremiseRequest): Promise<PlanningPremise> {
    const response = await api.put<ApiResponse<PlanningPremise>>(`/premises/${id}`, data)
    if (!response.data.data) {
      throw new Error('Failed to update premise')
    }
    return response.data.data
  }

  async deletePremise(id: string): Promise<void> {
    await api.delete(`/premises/${id}`)
  }

  async importCurves(id: string, data: ImportCurvesRequest): Promise<PlanningPremise> {
    const response = await api.post<ApiResponse<PlanningPremise>>(`/premises/${id}/import-curves`, data)
    if (!response.data.data) {
      throw new Error('Failed to import curves')
    }
    return response.data.data
  }

  async bulkImport(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/premises/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data || { imported: 0, errors: [] }
  }

  async calculateDimensioning(data: CalculationRequest): Promise<any> {
    const response = await api.post('/calculate/dimensioning', data)
    return response.data.data
  }

  async exportPremises(data: ExportRequest): Promise<Blob> {
    const response = await api.post('/premises/export', data, {
      responseType: 'blob',
    })
    return response.data
  }
}

export const premisesService = new PremisesService()
