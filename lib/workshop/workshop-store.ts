'use client'

import { useEffect, useState } from 'react'
import {
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_JOBS,
  INITIAL_VEHICLES,
  INVENTORY_ITEMS,
  SERVICE_CATALOG,
} from './mock-data'
import {
  ApprovalStatus,
  Customer,
  DeliveryRecord,
  Employee,
  EmployeeRole,
  InspectionFinding,
  InventoryItem,
  Job,
  JobPriority,
  JobServiceItem,
  JobStatus,
  PaymentMethod,
  PaymentRecord,
  PhotoRecord,
  Vehicle,
  WorkshopServiceCatalogItem,
} from './types'
import {
  customersApi,
  vehiclesApi,
  visitsApi,
  complaintsApi,
  invoicesApi,
  BackendVehicleType,
  BackendPaymentMethod,
  BackendItemType,
  CustomerHistoryDto,
} from '@/lib/api'

const STORAGE_KEY = 'autozone_workshop_state_v1'

interface WorkshopState {
  jobs: Job[]
  customers: Customer[]
  vehicles: Vehicle[]
  employees: Employee[]
  services: WorkshopServiceCatalogItem[]
  inventory: InventoryItem[]
  currentRole: EmployeeRole
  currentEmployeeId: string
}

let memoryState: WorkshopState = {
  jobs: INITIAL_JOBS,
  customers: INITIAL_CUSTOMERS,
  vehicles: INITIAL_VEHICLES,
  employees: INITIAL_EMPLOYEES,
  services: SERVICE_CATALOG,
  inventory: INVENTORY_ITEMS,
  currentRole: 'MANAGER',
  currentEmployeeId: 'emp-2', // Arman Khan (Lead Service Advisor)
}

const listeners = new Set<() => void>()

function emit() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
    } catch {
      // Ignore storage quota errors
    }
  }
  listeners.forEach((l) => l())
}

function initFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WorkshopState>
      if (parsed.jobs && parsed.customers && parsed.vehicles) {
        memoryState = {
          ...memoryState,
          ...parsed,
        }
      }
    }
  } catch {
    // fallback to defaults
  }
}

// Initialize on client
if (typeof window !== 'undefined') {
  initFromStorage()
}

function mapBodyTypeToBackend(bodyType?: string): BackendVehicleType {
  const bt = (bodyType || '').toUpperCase()
  if (bt === 'SEDAN') return 'SEDAN'
  if (bt === 'SUV') return 'SUV'
  if (bt === 'BIKE' || bt === 'MOTORCYCLE') return 'BIKE'
  if (bt === 'JEEP') return 'JEEP'
  return 'CAR'
}

function mapPaymentMethodToBackend(method: string): BackendPaymentMethod {
  const m = method.toUpperCase()
  if (m === 'CASH') return 'CASH'
  if (m === 'UPI') return 'UPI'
  if (m === 'BANK_TRANSFER' || m === 'NET_BANKING') return 'NET_BANKING'
  return 'ONLINE'
}

export const workshopRepository = {
  getState: (): WorkshopState => memoryState,

  setRole: (role: EmployeeRole) => {
    memoryState.currentRole = role
    const matchingEmp = memoryState.employees.find((e) => e.role === role)
    if (matchingEmp) {
      memoryState.currentEmployeeId = matchingEmp.id
    }
    emit()
  },

  setEmployeeId: (empId: string) => {
    memoryState.currentEmployeeId = empId
    const emp = memoryState.employees.find((e) => e.id === empId)
    if (emp) {
      memoryState.currentRole = emp.role
    }
    emit()
  },

  resetDefaults: () => {
    memoryState = {
      jobs: INITIAL_JOBS,
      customers: INITIAL_CUSTOMERS,
      vehicles: INITIAL_VEHICLES,
      employees: INITIAL_EMPLOYEES,
      services: SERVICE_CATALOG,
      inventory: INVENTORY_ITEMS,
      currentRole: 'MANAGER',
      currentEmployeeId: 'emp-2',
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    emit()
  },

  // Customers
  getCustomers: (): Customer[] => memoryState.customers,
  getCustomerById: (id: string): Customer | undefined =>
    memoryState.customers.find((c) => c.id === id || String(c.backendCustomerId) === id),

  createCustomer: (data: {
    fullName: string
    phone: string
    email: string
    address: string
    city: string
    notes?: string
  }): Customer => {
    const newCust: Customer = {
      id: `cust-${Date.now().toString(36)}`,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city || 'Mumbai',
      notes: data.notes,
      totalVisits: 0,
      totalSpent: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    memoryState.customers = [newCust, ...memoryState.customers]
    emit()
    return newCust
  },

  /**
   * Real Backend Integration: Register Customer
   * Calls POST /api/v1/customers/register-customer
   */
  registerCustomerBackend: async (data: {
    fullName: string
    phone: string
    email: string
    address: string
    city: string
    notes?: string
  }): Promise<Customer> => {
    try {
      const backendRes = await customersApi.registerCustomer({
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
      })

      const newCust: Customer = {
        id: String(backendRes.customerId),
        backendCustomerId: backendRes.customerId,
        fullName: backendRes.customerName,
        phone: backendRes.customerPhone,
        email: backendRes.customerEmail,
        address: data.address || '',
        city: data.city || 'Mumbai',
        notes: data.notes,
        totalVisits: 0,
        totalSpent: 0,
        outstandingBalance: 0,
        createdAt: backendRes.createdAt || new Date().toISOString(),
        updatedAt: backendRes.updatedAt || new Date().toISOString(),
      }

      // Check if already in list
      const existingIdx = memoryState.customers.findIndex(
        (c) => c.id === newCust.id || c.phone === newCust.phone
      )
      if (existingIdx >= 0) {
        memoryState.customers[existingIdx] = {
          ...memoryState.customers[existingIdx],
          ...newCust,
        }
      } else {
        memoryState.customers = [newCust, ...memoryState.customers]
      }
      emit()
      return newCust
    } catch (err) {
      console.warn('Backend customer registration fallback to local:', err)
      return workshopRepository.createCustomer(data)
    }
  },

  /**
   * Real Backend Integration: Search and sync customer history
   * Calls GET /api/v1/customers/history?search={phoneOrEmail}
   */
  searchCustomerHistoryBackend: async (
    search: string
  ): Promise<CustomerHistoryDto | null> => {
    try {
      const history = await customersApi.getCustomerHistory(search)
      if (history && history.customerId) {
        // Sync or update local customer
        const custId = String(history.customerId)
        let cust = memoryState.customers.find(
          (c) => c.id === custId || c.backendCustomerId === history.customerId
        )

        if (!cust) {
          cust = {
            id: custId,
            backendCustomerId: history.customerId,
            fullName: history.customerName,
            phone: history.customerPhone,
            email: history.customerEmail,
            address: 'Verified Address',
            city: 'Mumbai',
            totalVisits: (history.vehicles || []).reduce(
              (sum, v) => sum + (v.visits?.length || 0),
              0
            ),
            totalSpent: 0,
            outstandingBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          memoryState.customers = [cust, ...memoryState.customers]
        } else {
          cust.fullName = history.customerName
          cust.phone = history.customerPhone
          cust.email = history.customerEmail
          cust.backendCustomerId = history.customerId
        }

        // Sync returned vehicles
        if (history.vehicles && history.vehicles.length > 0) {
          for (const v of history.vehicles) {
            const vId = String(v.vehicleId)
            const existingV = memoryState.vehicles.find(
              (veh) => veh.id === vId || veh.registrationNumber === v.vehicleNumber
            )
            if (!existingV) {
              const newVeh: Vehicle = {
                id: vId,
                backendVehicleId: v.vehicleId,
                customerId: custId,
                registrationNumber: v.vehicleNumber,
                make: v.vehicleName,
                model: v.vehicleModel,
                variant: 'Standard',
                year: 2024,
                color: 'Black Metallic',
                fuelType: 'PETROL',
                transmission: 'AUTOMATIC',
                vin: `VIN-${v.vehicleNumber}`,
                currentOdometer: v.visits?.[0]?.currentKm || 10000,
                bodyType: 'SEDAN',
                createdAt: new Date().toISOString(),
              }
              memoryState.vehicles = [newVeh, ...memoryState.vehicles]
            }
          }
        }

        emit()
        return history
      }
      return null
    } catch {
      return null
    }
  },

  /**
   * Real Backend Integration: Update Customer
   * Calls PATCH /api/v1/customers/update-customer/{customerId}
   */
  updateCustomerBackend: async (
    customerId: string,
    data: {
      fullName?: string
      phone?: string
      email?: string
      address?: string
      city?: string
      notes?: string
    }
  ): Promise<Customer | undefined> => {
    const cust = memoryState.customers.find((c) => c.id === customerId)
    if (!cust) return undefined

    const backendId = cust.backendCustomerId || (Number(customerId) > 0 ? Number(customerId) : undefined)

    if (backendId) {
      try {
        const res = await customersApi.updateCustomer(backendId, {
          customerName: data.fullName,
          customerEmail: data.email,
          customerPhone: data.phone,
        })
        cust.fullName = res.customerName || cust.fullName
        cust.phone = res.customerPhone || cust.phone
        cust.email = res.customerEmail || cust.email
      } catch (err) {
        console.warn('Backend update customer failed, updating locally:', err)
      }
    }

    if (data.fullName) cust.fullName = data.fullName
    if (data.phone) cust.phone = data.phone
    if (data.email) cust.email = data.email
    if (data.address !== undefined) cust.address = data.address
    if (data.city !== undefined) cust.city = data.city
    if (data.notes !== undefined) cust.notes = data.notes
    cust.updatedAt = new Date().toISOString()

    emit()
    return cust
  },

  // Vehicles
  getVehicles: (): Vehicle[] => memoryState.vehicles,
  getVehicleById: (id: string): Vehicle | undefined =>
    memoryState.vehicles.find((v) => v.id === id || String(v.backendVehicleId) === id),
  getVehiclesByCustomerId: (customerId: string): Vehicle[] =>
    memoryState.vehicles.filter((v) => v.customerId === customerId),

  createVehicle: (data: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newVeh: Vehicle = {
      ...data,
      id: `veh-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }
    memoryState.vehicles = [newVeh, ...memoryState.vehicles]
    emit()
    return newVeh
  },

  /**
   * Real Backend Integration: Register Vehicle
   * Calls POST /api/v1/vehicle/register-vehicle
   */
  registerVehicleBackend: async (
    data: Omit<Vehicle, 'id' | 'createdAt'>
  ): Promise<Vehicle> => {
    // Find customer backend ID
    const cust = memoryState.customers.find((c) => c.id === data.customerId)
    const backendCustId = cust?.backendCustomerId || Number(data.customerId)

    if (backendCustId && !isNaN(backendCustId)) {
      try {
        const res = await vehiclesApi.registerVehicle({
          vehicleNumber: data.registrationNumber.toUpperCase(),
          vehicleName: data.make,
          vehicleModel: data.model,
          vehicleType: mapBodyTypeToBackend(data.bodyType),
          customerId: backendCustId,
        })

        const newVeh: Vehicle = {
          ...data,
          id: String(res.vehicleId),
          backendVehicleId: res.vehicleId,
          createdAt: new Date().toISOString(),
        }

        memoryState.vehicles = [newVeh, ...memoryState.vehicles]
        emit()
        return newVeh
      } catch (err) {
        console.warn('Backend vehicle registration fallback to local:', err)
      }
    }

    return workshopRepository.createVehicle(data)
  },

  // Jobs
  getJobs: (): Job[] => memoryState.jobs,
  getJobById: (id: string): Job | undefined =>
    memoryState.jobs.find(
      (j) =>
        j.id === id ||
        j.jobCode.toLowerCase() === id.toLowerCase() ||
        String(j.backendInvoiceId) === id
    ),

  createJob: (payload: {
    customerId: string
    vehicleId: string
    priority: JobPriority
    assignedEmployeeId: string
    assignedTechnicianIds: string[]
    bayNumber?: string
    checkIn: Job['checkIn']
    customerComplaints: string[]
    customerComplaintNotes?: string
    inspectionFindings: InspectionFinding[]
    services: JobServiceItem[]
    materials?: Job['materials']
    estimatedCost: number
    expectedDeliveryDate: string
  }): Job => {
    const count = memoryState.jobs.length + 101
    const jobCode = `AZ-${count}`
    const jobId = `job-${count}`

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    const empName = currentEmp ? currentEmp.fullName : 'Service Advisor'

    // Compute initial financial totals
    const servicesSubtotal = payload.services.reduce(
      (sum, s) => sum + s.quantity * s.unitPrice,
      0
    )
    const totalDiscount = payload.services.reduce(
      (sum, s) => sum + (s.discount || 0),
      0
    )
    const taxableAmount = Math.max(0, servicesSubtotal - totalDiscount)
    const taxAmount = Math.round(taxableAmount * 0.18)
    const totalWithTax = taxableAmount + taxAmount

    const newJob: Job = {
      id: jobId,
      jobCode,
      customerId: payload.customerId,
      vehicleId: payload.vehicleId,
      status: 'CHECKED_IN',
      priority: payload.priority,
      assignedEmployeeId: payload.assignedEmployeeId,
      assignedTechnicianIds: payload.assignedTechnicianIds,
      bayNumber: payload.bayNumber || 'Bay 1 (Receiving & Intake)',
      checkIn: payload.checkIn,
      customerComplaints: payload.customerComplaints,
      customerComplaintNotes: payload.customerComplaintNotes,
      inspectionFindings: payload.inspectionFindings,
      services: payload.services,
      materials: payload.materials || [],
      photos: [],
      estimatedCost: totalWithTax,
      approvedCost: 0,
      actualFinalCost: totalWithTax,
      internalMaterialCost: 0,
      totalDiscount,
      taxAmount,
      amountPaid: 0,
      balanceDue: totalWithTax,
      paymentStatus: 'UNPAID',
      payments: [],
      approvalStatus: 'DRAFT',
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          action: 'Service Order Created',
          description: `Job ${jobCode} created by ${empName}. Vehicle checked in and preliminary estimate generated.`,
          employeeId: memoryState.currentEmployeeId,
          employeeName: empName,
          category: 'CHECK_IN',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expectedDeliveryDate: payload.expectedDeliveryDate,
    }

    // Update customer visit stats
    const cust = memoryState.customers.find((c) => c.id === payload.customerId)
    if (cust) {
      cust.totalVisits += 1
      cust.updatedAt = new Date().toISOString()
    }

    memoryState.jobs = [newJob, ...memoryState.jobs]
    emit()
    return newJob
  },

  /**
   * Real Backend Integration:
   * Execute full intake flow on Backend:
   * 1. Register vehicle visit -> POST /api/v1/vehicle-visit
   * 2. Register complaints -> POST /api/v1/complaint/register/complaint
   * 3. Calculate/Create Invoice -> POST /api/v1/invoices
   */
  createJobBackend: async (payload: {
    customerId: string
    vehicleId: string
    priority: JobPriority
    assignedEmployeeId: string
    assignedTechnicianIds: string[]
    bayNumber?: string
    checkIn: Job['checkIn']
    customerComplaints: string[]
    customerComplaintNotes?: string
    inspectionFindings: InspectionFinding[]
    services: JobServiceItem[]
    materials?: Job['materials']
    estimatedCost: number
    expectedDeliveryDate: string
  }): Promise<Job> => {
    let backendVisitId: number | undefined
    let backendInvoiceId: number | undefined
    let backendInvoiceNumber: string | undefined

    const veh = memoryState.vehicles.find((v) => v.id === payload.vehicleId)
    const backendVehicleId = veh?.backendVehicleId || Number(payload.vehicleId)

    if (backendVehicleId && !isNaN(backendVehicleId)) {
      try {
        // Step 1: Register vehicle visit
        const visitRes = await visitsApi.registerVehicleVisit({
          currentKm: payload.checkIn.odometerReading || 1000,
          vehicleId: backendVehicleId,
        })
        backendVisitId = visitRes.visitId

        // Step 2: Register complaints on backend
        if (payload.customerComplaints && payload.customerComplaints.length > 0) {
          for (const complaint of payload.customerComplaints) {
            try {
              await complaintsApi.registerComplaint({
                complaintDescription: complaint,
                vehicleVisitId: backendVisitId,
              })
            } catch (cErr) {
              console.warn('Backend complaint creation warning:', cErr)
            }
          }
        }

        // Step 3: Create real invoice on backend
        const invoiceItems = payload.services.map((s) => ({
          description: s.title,
          itemType: 'SERVICE' as BackendItemType,
          quantity: s.quantity || 1,
          unitPrice: s.unitPrice || 0,
        }))

        const totalDiscount = payload.services.reduce(
          (sum, s) => sum + (s.discount || 0),
          0
        )

        const invoiceRes = await invoicesApi.createInvoice({
          vehicleVisitId: backendVisitId,
          items: invoiceItems.length > 0 ? invoiceItems : [
            { description: 'Comprehensive Workshop Inspection', itemType: 'SERVICE', quantity: 1, unitPrice: 1500 }
          ],
          discount: totalDiscount,
          taxPercentage: 18,
        })

        backendInvoiceId = invoiceRes.invoiceId
        backendInvoiceNumber = invoiceRes.invoiceNumber
      } catch (err) {
        console.warn('Backend job intake flow error, proceeding with local backup:', err)
      }
    }

    // Save full Job object in store
    const localJob = workshopRepository.createJob(payload)
    if (backendVisitId) localJob.backendVisitId = backendVisitId
    if (backendInvoiceId) localJob.backendInvoiceId = backendInvoiceId
    if (backendInvoiceNumber) localJob.backendInvoiceNumber = backendInvoiceNumber

    emit()
    return localJob
  },

  updateJobStatus: (
    jobId: string,
    status: JobStatus,
    customNote?: string
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const oldStatus = job.status
    job.status = status
    job.updatedAt = new Date().toISOString()

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    const empName = currentEmp ? currentEmp.fullName : 'Staff'

    let eventCategory: Job['timeline'][0]['category'] = 'PROGRESS'
    if (status === 'INSPECTION') eventCategory = 'INSPECTION'
    else if (status === 'APPROVED') eventCategory = 'APPROVAL'
    else if (status === 'QUALITY_CHECK') eventCategory = 'QUALITY'
    else if (status === 'DELIVERED' || status === 'COMPLETED')
      eventCategory = 'DELIVERY'

    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Status Updated to ${status.replace(/_/g, ' ')}`,
      description:
        customNote ||
        `Status transitioned from ${oldStatus.replace(/_/g, ' ')} to ${status.replace(/_/g, ' ')} by ${empName}.`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: empName,
      category: eventCategory,
    })

    emit()
    return job
  },

  updateApproval: (
    jobId: string,
    approvalStatus: ApprovalStatus,
    notes?: string
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    job.approvalStatus = approvalStatus
    job.approvalDate = new Date().toISOString()
    job.approvalNotes = notes
    job.updatedAt = new Date().toISOString()

    if (approvalStatus === 'APPROVED') {
      job.approvedCost = job.actualFinalCost || job.estimatedCost
      if (job.status === 'AWAITING_APPROVAL' || job.status === 'ESTIMATE_PENDING') {
        job.status = 'APPROVED'
      }
    }

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Customer Approval: ${approvalStatus}`,
      description:
        notes ||
        `Estimate marked as ${approvalStatus} by ${currentEmp?.fullName || 'Advisor'}.`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Advisor',
      category: 'APPROVAL',
    })

    emit()
    return job
  },

  addJobService: (
    jobId: string,
    service: {
      serviceId: string
      title: string
      category: string
      quantity: number
      unitPrice: number
      discount: number
      taxRate: number
      estimatedDurationHours: number
      assignedTechnicianId?: string
      notes?: string
    }
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const taxable = Math.max(
      0,
      service.quantity * service.unitPrice - (service.discount || 0)
    )
    const tax = Math.round((taxable * (service.taxRate || 18)) / 100)
    const total = taxable + tax

    const newServiceItem: JobServiceItem = {
      id: `jsrv-${Date.now().toString(36)}`,
      ...service,
      totalPrice: total,
      status: 'PENDING',
      approvedByCustomer: true,
    }

    job.services.push(newServiceItem)
    recalculateJobFinancials(job)

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Service Added',
      description: `Added "${service.title}" (₹${total.toLocaleString('en-IN')}) to service scope.`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Advisor',
      category: 'ESTIMATE',
    })

    emit()
    return job
  },

  addInspectionFinding: (
    jobId: string,
    finding: Omit<InspectionFinding, 'id'>
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const newFinding: InspectionFinding = {
      id: `fnd-${Date.now().toString(36)}`,
      ...finding,
    }
    job.inspectionFindings.push(newFinding)
    job.updatedAt = new Date().toISOString()

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Inspection Finding Recorded',
      description: `${finding.area}: ${finding.observation}`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Inspector',
      category: 'INSPECTION',
    })

    emit()
    return job
  },

  addPhoto: (
    jobId: string,
    photo: Omit<PhotoRecord, 'id' | 'uploadedAt' | 'uploadedByEmployeeId'>
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    const newPhoto: PhotoRecord = {
      id: `pht-${Date.now().toString(36)}`,
      ...photo,
      uploadedByEmployeeId: memoryState.currentEmployeeId,
      uploadedAt: new Date().toISOString(),
    }
    job.photos.push(newPhoto)
    job.updatedAt = new Date().toISOString()

    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Photo Documented',
      description: `${photo.stage} stage photo added: "${photo.caption}".`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Technician',
      category: 'PROGRESS',
    })

    emit()
    return job
  },

  addPayment: (
    jobId: string,
    payment: {
      amount: number
      paymentMethod: PaymentMethod
      transactionRef: string
      notes?: string
    }
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )
    const newPayment: PaymentRecord = {
      id: `pmt-${Date.now().toString(36)}`,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: 'COMPLETED',
      transactionRef: payment.transactionRef || `TXN-${Date.now()}`,
      receivedByEmployeeId: memoryState.currentEmployeeId,
      paymentDate: new Date().toISOString(),
      notes: payment.notes,
    }

    job.payments.push(newPayment)
    job.amountPaid += payment.amount
    job.balanceDue = Math.max(0, job.actualFinalCost - job.amountPaid)

    if (job.balanceDue === 0 && job.amountPaid > 0) {
      job.paymentStatus = 'PAID'
    } else if (job.amountPaid > 0) {
      job.paymentStatus = 'PARTIALLY_PAID'
    }

    // Update customer lifetime metrics
    const cust = memoryState.customers.find((c) => c.id === job.customerId)
    if (cust) {
      cust.totalSpent += payment.amount
      cust.outstandingBalance = Math.max(0, cust.outstandingBalance - payment.amount)
    }

    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Payment Received',
      description: `₹${payment.amount.toLocaleString('en-IN')} received via ${payment.paymentMethod} (Ref: ${newPayment.transactionRef}).`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Billing',
      category: 'PAYMENT',
    })

    emit()
    return job
  },

  /**
   * Real Backend Integration: Update Payment on backend
   * Calls PATCH /api/v1/invoices/{invoiceId}/payment
   */
  addPaymentBackend: async (
    jobId: string,
    payment: {
      amount: number
      paymentMethod: PaymentMethod
      transactionRef?: string
      notes?: string
    }
  ): Promise<Job | undefined> => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    if (job.backendInvoiceId) {
      try {
        await invoicesApi.updatePayment(job.backendInvoiceId, {
          paymentMethod: mapPaymentMethodToBackend(payment.paymentMethod),
        })
      } catch (err) {
        console.warn('Backend payment update error:', err)
      }
    }

    return workshopRepository.addPayment(jobId, {
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionRef: payment.transactionRef || `TXN-${Date.now()}`,
      notes: payment.notes,
    })
  },

  completeDelivery: (
    jobId: string,
    deliveryData: Omit<DeliveryRecord, 'deliveredAt' | 'deliveredByEmployeeId'>
  ): Job | undefined => {
    const job = memoryState.jobs.find((j) => j.id === jobId)
    if (!job) return undefined

    const currentEmp = memoryState.employees.find(
      (e) => e.id === memoryState.currentEmployeeId
    )

    job.delivery = {
      ...deliveryData,
      deliveredAt: new Date().toISOString(),
      deliveredByEmployeeId: memoryState.currentEmployeeId,
    }
    job.status = 'DELIVERED'
    job.updatedAt = new Date().toISOString()

    job.timeline.unshift({
      id: `tl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Vehicle Delivered to Customer',
      description: `Handover signed by ${deliveryData.receivedByCustomerName}. Final quality check passed.`,
      employeeId: memoryState.currentEmployeeId,
      employeeName: currentEmp?.fullName || 'Advisor',
      category: 'DELIVERY',
    })

    emit()
    return job
  },

  // Search Engine
  searchAll: (query: string) => {
    const q = query.toLowerCase().trim()
    if (!q) return { jobs: [], customers: [], vehicles: [] }

    const matchingCustomers = memoryState.customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    )

    const matchingVehicles = memoryState.vehicles.filter(
      (v) =>
        v.registrationNumber.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q)
    )

    const matchingJobs = memoryState.jobs.filter((j) => {
      const cust = memoryState.customers.find((c) => c.id === j.customerId)
      const veh = memoryState.vehicles.find((v) => v.id === j.vehicleId)
      return (
        j.jobCode.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.status.toLowerCase().includes(q) ||
        (cust && cust.fullName.toLowerCase().includes(q)) ||
        (veh &&
          (veh.registrationNumber.toLowerCase().includes(q) ||
            veh.make.toLowerCase().includes(q) ||
            veh.model.toLowerCase().includes(q)))
      )
    })

    return {
      jobs: matchingJobs,
      customers: matchingCustomers,
      vehicles: matchingVehicles,
    }
  },
}

function recalculateJobFinancials(job: Job) {
  const subtotal = job.services.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0)
  const discount = job.services.reduce((sum, s) => sum + (s.discount || 0), 0)
  const taxable = Math.max(0, subtotal - discount)
  const tax = Math.round(taxable * 0.18)
  const total = taxable + tax

  job.estimatedCost = total
  job.actualFinalCost = total
  job.totalDiscount = discount
  job.taxAmount = tax
  job.balanceDue = Math.max(0, total - job.amountPaid)
  job.updatedAt = new Date().toISOString()
}

export function useWorkshopStore() {
  const [state, setState] = useState<WorkshopState>(workshopRepository.getState)

  useEffect(() => {
    const handleUpdate = () => {
      setState({ ...workshopRepository.getState() })
    }
    listeners.add(handleUpdate)
    return () => {
      listeners.delete(handleUpdate)
    }
  }, [])

  return {
    ...state,
    repository: workshopRepository,
    currentEmployee: state.employees.find((e) => e.id === state.currentEmployeeId),
  }
}
