import { ApiErrorResponse } from './types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1'

export class ApiError extends Error {
  public status: number
  public details?: ApiErrorResponse

  constructor(status: number, message: string, details?: ApiErrorResponse) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, headers = {}, ...customConfig } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    signal: controller.signal,
  }

  try {
    const response = await fetch(url, config)
    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined
      let errorMessage = `Request failed with status ${response.status}`

      try {
        const text = await response.text()
        if (text) {
          errorData = JSON.parse(text)
          if (errorData?.message) {
            errorMessage = errorData.message
          }
        }
      } catch {
        // Response was not JSON
      }

      throw new ApiError(response.status, errorMessage, errorData)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T
    }

    return (await response.text()) as unknown as T
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out while contacting AutoZone backend.')
    }

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      0,
      error?.message || 'Unable to connect to AutoZone backend server. Check if backend is running.'
    )
  }
}

export async function apiDownload(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Blob> {
  const { timeoutMs = 20000, headers = {}, ...customConfig } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`

  const config: RequestInit = {
    ...customConfig,
    headers: {
      Accept: 'application/pdf, application/octet-stream, */*',
      ...(headers as Record<string, string>),
    },
    signal: controller.signal,
  }

  try {
    const response = await fetch(url, config)
    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `Failed to download file (HTTP ${response.status})`
      try {
        const text = await response.text()
        const errJson = JSON.parse(text)
        if (errJson?.message) errorMessage = errJson.message
      } catch {
        // Non-JSON
      }
      throw new ApiError(response.status, errorMessage)
    }

    return await response.blob()
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, error?.message || 'Failed to download file from backend.')
  }
}
