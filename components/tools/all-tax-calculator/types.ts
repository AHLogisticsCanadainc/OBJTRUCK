export interface LoadEntry {
  id: string
  loadNumber: string
  deliveryDate: Date
  clientBaseAmount: number
  carrierAllInAmount: number
  province: string
  taxRate: number
  clientId: string
  carrierId: string
  deliveryProvince: string

  // Calculated fields
  clientHST: number
  clientTotal: number
  carrierPreTax: number
  carrierHST: number
  hstPayable: number
  profit: number
}

export interface ITCEntry {
  id: string
  description: string
  paidTo: string
  invoiceDate?: Date
  hstNumber?: string
  amountBeforeTax: number
  taxAmount: number
  date: Date
  category?: string
  province?: string
  vendorId?: string // Added vendorId reference
}

export interface Province {
  name: string
  taxRate: number
  taxName: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  hstNumber?: string
  province?: string
}

export interface Carrier {
  id: string
  name: string
  mcNumber?: string
  email?: string
  phone?: string
  hstNumber?: string
  province?: string
}

export interface Vendor {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  hstNumber?: string
  province?: string
  category?: string
}
