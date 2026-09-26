export type BackendVehicleType = 'CAR' | 'JEEP' | 'SUV' | 'SEDAN' | 'BIKE'
export type BackendItemType = 'SERVICE' | 'PART' | 'LABOUR'
export type BackendPaymentMethod = 'CASH' | 'UPI' | 'ONLINE' | 'NET_BANKING'
export type BackendPaymentStatus = 'SUCCESSFUL' | 'FAILED' | 'PENDING'

// Customer DTOs
export interface CustomerRequestDto {
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface CustomerUpdateDto {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export interface CustomerResponseDto {
  customerId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  createdAt?: string
  updatedAt?: string
  vehicles?: VehicleResponseDto[]
}

export interface ComplaintHistoryDto {
  complaintId: number
  complaintDescription: string
}

export interface VehicleVisitHistoryDto {
  visitId: number
  visitDate: string
  currentKm: number
  complaints?: ComplaintHistoryDto[]
}

export interface VehicleHistoryDto {
  vehicleId: number
  vehicleNumber: string
  vehicleName: string
  vehicleModel: string
  vehicleType: BackendVehicleType
  visits?: VehicleVisitHistoryDto[]
}

export interface CustomerHistoryDto {
  customerId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicles?: VehicleHistoryDto[]
}

// Vehicle DTOs
export interface VehicleRequestDto {
  vehicleNumber: string
  vehicleName: string
  vehicleModel: string
  vehicleType: BackendVehicleType
  customerId: number
}

export interface VehicleResponseDto {
  vehicleId: number
  vehicleNumber: string
  vehicleName: string
  vehicleModel: string
  vehicleType: BackendVehicleType
  customerId: number
}

// Vehicle Visit DTOs
export interface VehicleVisitRequestDto {
  currentKm: number
  vehicleId: number
}

export interface VehicleVisitResponseDto {
  visitId: number
  visitDate: string
  currentKm: number
  checkInTime?: string
  vehicleId: number
}

// Complaint DTOs
export interface ComplaintRequestDto {
  complaintDescription: string
  vehicleVisitId: number
}

export interface ComplaintResponseDto {
  complaintId: number
  complaintDescription: string
  vehicleVisitId: number
}

// Invoice DTOs
export interface InvoiceItemRequestDto {
  description: string
  itemType: BackendItemType
  quantity: number
  unitPrice: number
}

export interface InvoiceItemResponseDto {
  itemId?: number
  description: string
  itemType: BackendItemType
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface InvoiceRequestDto {
  vehicleVisitId: number
  items: InvoiceItemRequestDto[]
  discount: number
  taxPercentage: number
}

export interface InvoiceCalculationResponseDto {
  subtotal: number
  discount: number
  taxableAmount: number
  taxPercentage: number
  taxAmount: number
  grandTotal: number
  items: InvoiceItemResponseDto[]
}

export interface InvoiceResponseDto {
  invoiceId: number
  invoiceNumber: string
  vehicleVisitId: number
  createdAt: string
  subtotal: number
  discount: number
  taxPercentage: number
  taxAmount: number
  grandTotal: number
  paymentStatus: BackendPaymentStatus
  paymentMethod: BackendPaymentMethod | null
  items: InvoiceItemResponseDto[]
}

export interface PaymentRequestDto {
  paymentMethod: BackendPaymentMethod
}

export interface ApiErrorResponse {
  httpStatus?: string
  message: string
  timestamp?: string
  status?: number
  error?: string
  path?: string
}
