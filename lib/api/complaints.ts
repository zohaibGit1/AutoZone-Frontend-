import { apiClient } from './client'
import { ComplaintRequestDto, ComplaintResponseDto } from './types'

export const complaintsApi = {
  /**
   * Register a customer complaint associated with a vehicle visit
   * POST /api/v1/complaint/register/complaint
   */
  registerComplaint: async (
    dto: ComplaintRequestDto
  ): Promise<ComplaintResponseDto> => {
    return apiClient<ComplaintResponseDto>('/complaint/register/complaint', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },
}
