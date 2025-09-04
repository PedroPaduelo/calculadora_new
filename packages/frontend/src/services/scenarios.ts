import { api } from '@/lib/api'

export interface CreateScenarioRequest {
  name: string
  description?: string
  operationId: string
  premisesSnapshot: Record<string, any>
  resultsSnapshot: Record<string, any>
}

export interface UpdateScenarioRequest {
  name?: string
  description?: string
  premisesSnapshot?: Record<string, any>
  resultsSnapshot?: Record<string, any>
}

export interface Scenario {
  id: string
  name: string
  description?: string
  userId: string
  operationId: string
  premisesSnapshot: Record<string, any>
  resultsSnapshot: Record<string, any>
  createdAt: string
  updatedAt: string
  operation?: {
    name: string
  }
  user?: {
    name: string
    email: string
  }
}

class ScenariosService {
  async getAllScenarios(operationId?: string): Promise<Scenario[]> {
    const params = operationId ? { operationId } : {}
    const response = await api.get('/scenarios', { params })
    return response.data.data
  }

  async getScenarioById(id: string): Promise<Scenario> {
    const response = await api.get(`/scenarios/${id}`)
    return response.data.data
  }

  async createScenario(data: CreateScenarioRequest): Promise<Scenario> {
    const response = await api.post('/scenarios', data)
    return response.data.data
  }

  async updateScenario(id: string, data: UpdateScenarioRequest): Promise<Scenario> {
    const response = await api.put(`/scenarios/${id}`, data)
    return response.data.data
  }

  async deleteScenario(id: string): Promise<void> {
    await api.delete(`/scenarios/${id}`)
  }

  async compareScenarios(scenarioIds: string[]): Promise<any> {
    const response = await api.post('/scenarios/compare', { scenarioIds })
    return response.data.data
  }

  async copyScenario(data: { sourceId: string; name: string; description?: string }): Promise<Scenario> {
    const response = await api.post('/scenarios/copy', data)
    return response.data.data
  }
}

export const scenariosService = new ScenariosService()
