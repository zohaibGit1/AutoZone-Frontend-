import { apiClient, apiDownload, API_BASE_URL } from './client'
import {
  InvoiceCalculationResponseDto,
  InvoiceRequestDto,
  InvoiceResponseDto,
  PaymentRequestDto,
} from './types'

export const invoicesApi = {
  /**
   * Pre-calculate invoice items, taxes, discounts, and grand total
   * POST /api/v1/invoices/calculate
   */
  calculateInvoice: async (
    dto: InvoiceRequestDto
  ): Promise<InvoiceCalculationResponseDto> => {
    return apiClient<InvoiceCalculationResponseDto>('/invoices/calculate', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Create and finalize a new invoice
   * POST /api/v1/invoices
   */
  createInvoice: async (
    dto: InvoiceRequestDto
  ): Promise<InvoiceResponseDto> => {
    return apiClient<InvoiceResponseDto>('/invoices', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Get invoice details by invoice ID
   * GET /api/v1/invoices/{invoiceId}
   */
  getInvoice: async (
    invoiceId: number | string
  ): Promise<InvoiceResponseDto> => {
    return apiClient<InvoiceResponseDto>(`/invoices/${invoiceId}`, {
      method: 'GET',
    })
  },

  /**
   * Update invoice payment status and method
   * PATCH /api/v1/invoices/{invoiceId}/payment
   */
  updatePayment: async (
    invoiceId: number | string,
    dto: PaymentRequestDto
  ): Promise<InvoiceResponseDto> => {
    return apiClient<InvoiceResponseDto>(`/invoices/${invoiceId}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Get the direct download URL for invoice PDF
   */
  getInvoicePdfUrl: (invoiceId: number | string): string => {
    return `${API_BASE_URL}/invoices/${invoiceId}/pdf`
  },

  /**
   * Download the invoice PDF as a Blob
   * GET /api/v1/invoices/{invoiceId}/pdf
   */
  downloadInvoicePdf: async (
    invoiceId: number | string
  ): Promise<Blob> => {
    return apiDownload(`/invoices/${invoiceId}/pdf`, {
      method: 'GET',
    })
  },
}
