import { apiClient } from './client'
import { VehicleRequestDto, VehicleResponseDto } from './types'

export const vehiclesApi = {
  /**
   * Register a new vehicle linked to a customer
   * POST /api/v1/vehicle/register-vehicle
   */
  registerVehicle: async (
    dto: VehicleRequestDto
  ): Promise<VehicleResponseDto> => {
    return apiClient<VehicleResponseDto>('/vehicle/register-vehicle', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },
}
