import type { TaxCalculationInput, TaxCalculationResult } from "./types"

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { clientBaseAmount, carrierAllInAmount, taxRate, additionalITCs = 0 } = input

  // Step 1: Client Invoice Calculations
  const clientTaxCollected = clientBaseAmount * taxRate
  const clientTotalCollected = clientBaseAmount + clientTaxCollected

  // Step 2: Carrier Payment Calculations
  // Pre-tax Amount = All-in Amount ÷ (1 + HST Rate)
  const carrierPreTaxAmount = carrierAllInAmount / (1 + taxRate)
  // HST Paid = All-in Amount - Pre-tax Amount
  const carrierTaxPaid = carrierAllInAmount - carrierPreTaxAmount

  // Step 3: HST Payable Calculations
  // HST Payable = HST Collected - ITC
  const taxPayable = clientTaxCollected - carrierTaxPaid
  const finalTaxPayable = taxPayable - additionalITCs

  // Step 4: Profit Calculation
  // Profit = Client Base Amount - Carrier Pre-tax Amount
  const profit = clientBaseAmount - carrierPreTaxAmount

  return {
    clientBaseAmount,
    clientTaxCollected,
    clientTotalCollected,

    carrierAllInAmount,
    carrierPreTaxAmount,
    carrierTaxPaid,

    taxPayable,
    finalTaxPayable,

    profit,
  }
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Utility function to format percentage
export function formatPercentage(rate: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(rate)
}
