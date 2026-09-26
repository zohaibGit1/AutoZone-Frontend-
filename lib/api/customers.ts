import { apiClient } from './client'
import {
  CustomerHistoryDto,
  CustomerRequestDto,
  CustomerResponseDto,
  CustomerUpdateDto,
} from './types'

export const customersApi = {
  /**
   * Register a new customer
   * POST /api/v1/customers/register-customer
   */
  registerCustomer: async (
    dto: CustomerRequestDto
  ): Promise<CustomerResponseDto> => {
    return apiClient<CustomerResponseDto>('/customers/register-customer', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Search customer history by phone number or email
   * GET /api/v1/customers/history?search={search}
   */
  getCustomerHistory: async (
    search: string
  ): Promise<CustomerHistoryDto> => {
    const params = new URLSearchParams({ search: search.trim() })
    return apiClient<CustomerHistoryDto>(`/customers/history?${params.toString()}`, {
      method: 'GET',
    })
  },

  /**
   * Update an existing customer
   * PATCH /api/v1/customers/update-customer/{customerId}
   */
  updateCustomer: async (
    customerId: number | string,
    dto: CustomerUpdateDto
  ): Promise<CustomerResponseDto> => {
    return apiClient<CustomerResponseDto>(`/customers/update-customer/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
  },
}
