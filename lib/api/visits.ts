import { apiClient } from './client'
import { VehicleVisitRequestDto, VehicleVisitResponseDto } from './types'

export const visitsApi = {
  /**
   * Register a new vehicle visit (workshop check-in intake)
   * POST /api/v1/vehicle-visit
   */
  registerVehicleVisit: async (
    dto: VehicleVisitRequestDto
  ): Promise<VehicleVisitResponseDto> => {
    return apiClient<VehicleVisitResponseDto>('/vehicle-visit', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },
}
