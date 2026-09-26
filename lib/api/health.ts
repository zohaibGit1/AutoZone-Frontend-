import { API_BASE_URL } from './client'

export interface BackendHealthResponse {
  status: 'UP' | 'DOWN' | 'UNKNOWN'
  details?: Record<string, any>
}

export const healthApi = {
  /**
   * Check if the backend Spring Boot actuator is UP
   */
  checkHealth: async (): Promise<BackendHealthResponse> => {
    try {
      // Actuator URL usually at host root or port
      const healthUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/actuator/health'
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        return (await response.json()) as BackendHealthResponse
      }
      return { status: 'DOWN' }
    } catch {
      return { status: 'DOWN' }
    }
  },
}
