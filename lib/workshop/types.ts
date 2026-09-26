export type JobStatus =
  | 'NEW'
  | 'CHECKED_IN'
  | 'INSPECTION'
  | 'ESTIMATE_PENDING'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type ApprovalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED'

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUNDED'

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'UPI'
  | 'BANK_TRANSFER'

export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'TECHNICIAN'

export type PhotoStage = 'BEFORE' | 'DURING' | 'AFTER' | 'INSPECTION' | 'DELIVERY'

export type DamageSeverity = 'MINOR' | 'MODERATE' | 'SEVERE'

export type DamageType =
  | 'SCRATCH'
  | 'DENT'
  | 'PAINT_CHIP'
  | 'SWIRL_MARKS'
  | 'OXIDATION'
  | 'INTERIOR_STAIN'
  | 'WHEEL_CURB'
  | 'GLASS_CRACK'
  | 'OTHER'

export type PanelLocation =
  | 'FRONT_BUMPER'
  | 'HOOD'
  | 'ROOF'
  | 'TRUNK'
  | 'REAR_BUMPER'
  | 'LEFT_FENDER'
  | 'RIGHT_FENDER'
  | 'LEFT_FRONT_DOOR'
  | 'LEFT_REAR_DOOR'
  | 'RIGHT_FRONT_DOOR'
  | 'RIGHT_REAR_DOOR'
  | 'WHEELS'
  | 'INTERIOR'
  | 'WINDSHIELD'
  | 'HEADLIGHTS'

export interface Customer {
  id: string
  backendCustomerId?: number
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  notes?: string
  totalVisits: number
  totalSpent: number
  outstandingBalance: number
  createdAt: string
  updatedAt: string
}

export interface Vehicle {
  id: string
  backendVehicleId?: number
  customerId: string
  registrationNumber: string // License plate (e.g. MH 02 CD 4589)
  make: string               // e.g. Porsche, BMW, Mercedes-Benz
  model: string              // e.g. 911 GT3, M4 Competition
  variant?: string           // e.g. Coupe, V8 Twin-Turbo
  year: number
  color: string
  fuelType: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID'
  transmission: 'AUTOMATIC' | 'MANUAL' | 'DUAL_CLUTCH'
  vin: string                // Chassis number
  currentOdometer: number
  bodyType: 'SEDAN' | 'COUPE' | 'SUV' | 'SUPERCAR' | 'HATCHBACK'
  notes?: string
  createdAt: string
}

export interface DamageRecord {
  id: string
  panel: PanelLocation
  damageType: DamageType
  severity: DamageSeverity
  description: string
  photoUrl?: string
}

export interface VehicleCheckIn {
  checkInDate: string
  receivedByEmployeeId: string
  odometerReading: number
  fuelLevel: 'EMPTY' | 'QUARTER' | 'HALF' | 'THREE_QUARTERS' | 'FULL'
  interiorCondition: 'CLEAN' | 'MODERATE' | 'HEAVILY_SOILED'
  glassCondition: 'GOOD' | 'CHIPPED' | 'CRACKED'
  tyreCondition: 'GOOD' | 'WORN' | 'NEEDS_REPLACEMENT'
  wheelCondition: 'CLEAN' | 'CURBED' | 'SCRATCHED'
  personalBelongingsRemoved: boolean
  preExistingDamages: DamageRecord[]
  checkInNotes?: string
}

export interface InspectionFinding {
  id: string
  area: string
  observation: string
  recommendedServiceId?: string
  recommendedServiceName?: string
  priority: 'RECOMMENDED' | 'OPTIONAL' | 'URGENT'
  estimatedPrice: number
  notes?: string
}

export interface JobServiceItem {
  id: string
  serviceId: string
  title: string
  category: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  totalPrice: number
  estimatedDurationHours: number
  assignedTechnicianId?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  approvedByCustomer: boolean
  notes?: string
}

export interface MaterialItem {
  id: string
  productId: string
  productName: string
  category: 'COATING' | 'PPF' | 'POLISH' | 'CLEANER' | 'ACCESSORY' | 'CONSUMABLE'
  quantity: number
  unit: string
  unitCost: number       // Internal cost (Admin/Manager only)
  totalCost: number
  supplier?: string
  notes?: string
}

export interface PhotoRecord {
  id: string
  url: string
  stage: PhotoStage
  caption: string
  panel?: PanelLocation
  uploadedByEmployeeId: string
  uploadedAt: string
}

export interface PaymentRecord {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED'
  transactionRef: string
  receivedByEmployeeId: string
  paymentDate: string
  notes?: string
}

export interface JobTimelineEvent {
  id: string
  timestamp: string
  action: string
  description: string
  employeeId: string
  employeeName: string
  category:
    | 'CHECK_IN'
    | 'INSPECTION'
    | 'ESTIMATE'
    | 'APPROVAL'
    | 'PROGRESS'
    | 'QUALITY'
    | 'PAYMENT'
    | 'DELIVERY'
    | 'NOTE'
}

export interface DeliveryRecord {
  deliveredAt: string
  deliveredByEmployeeId: string
  receivedByCustomerName: string
  customerSignatureAck: boolean
  finalOdometer: number
  qualityCheckPassed: boolean
  allBelongingsReturned: boolean
  customerFeedbackScore?: number // 1-5
  customerRemarks?: string
}

export interface Employee {
  id: string
  fullName: string
  email: string
  phone: string
  role: EmployeeRole
  designation: string
  avatar?: string
  specialization: string[]
  activeJobCount: number
  isActive: boolean
}

export interface WorkshopServiceCatalogItem {
  id: string
  title: string
  category: 'DETAILING' | 'PPF' | 'CERAMIC' | 'INTERIOR' | 'PAINT_CORRECTION' | 'WHEELS' | 'ACCESSORIES'
  description: string
  basePrice: number
  defaultDurationHours: number
  recommendedMaterials: string[]
}

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: 'COATING' | 'PPF' | 'POLISH' | 'CLEANER' | 'ACCESSORY' | 'CONSUMABLE'
  unit: string
  unitCost: number
  stockQuantity: number
  minimumThreshold: number
  supplier: string
}

export interface Job {
  id: string                  // e.g. "AZ-2026-101"
  jobCode: string             // "AZ-101"
  backendVisitId?: number
  backendInvoiceId?: number
  backendInvoiceNumber?: string
  customerId: string
  vehicleId: string
  status: JobStatus
  priority: JobPriority
  assignedEmployeeId: string  // Lead Advisor / Manager
  assignedTechnicianIds: string[]
  bayNumber?: string          // e.g. "Bay 1 (Ceramic & PPF)"

  // Workflow Stages
  checkIn: VehicleCheckIn
  customerComplaints: string[]
  customerComplaintNotes?: string
  inspectionFindings: InspectionFinding[]
  services: JobServiceItem[]
  materials: MaterialItem[]
  photos: PhotoRecord[]

  // Financials
  estimatedCost: number
  approvedCost: number
  actualFinalCost: number
  internalMaterialCost: number
  totalDiscount: number
  taxAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: PaymentStatus
  payments: PaymentRecord[]

  // Approval
  approvalStatus: ApprovalStatus
  approvalDate?: string
  approvalNotes?: string

  // Delivery
  delivery?: DeliveryRecord

  // Audit
  timeline: JobTimelineEvent[]
  createdAt: string
  updatedAt: string
  expectedDeliveryDate: string
}
