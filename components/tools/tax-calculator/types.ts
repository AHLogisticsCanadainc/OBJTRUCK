export interface TaxCalculationInput {
  clientBaseAmount: number
  carrierAllInAmount: number
  taxRate: number
  additionalITCs?: number
}

export interface TaxCalculationResult {
  // Client side
  clientBaseAmount: number
  clientTaxCollected: number
  clientTotalCollected: number

  // Carrier side
  carrierAllInAmount: number
  carrierPreTaxAmount: number
  carrierTaxPaid: number // ITC

  // Tax calculations
  taxPayable: number
  finalTaxPayable: number

  // Profit
  profit: number
}

export interface ProvinceOption {
  code: string
  name: string
  rate: number
}
