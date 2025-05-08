export function calculateClientHST(baseAmount: number, taxRate: number): number {
  return baseAmount * taxRate
}

export function calculateClientTotal(baseAmount: number, hst: number): number {
  return baseAmount + hst
}

export function calculateCarrierPreTax(allInAmount: number, taxRate: number): number {
  return allInAmount / (1 + taxRate)
}

export function calculateCarrierHST(allInAmount: number, preTaxAmount: number): number {
  return allInAmount - preTaxAmount
}

export function calculateHSTPayable(clientHST: number, carrierHST: number, additionalITCs = 0): number {
  return clientHST - carrierHST - additionalITCs
}

export function calculateProfit(clientBaseAmount: number, carrierPreTaxAmount: number): number {
  return clientBaseAmount - carrierPreTaxAmount
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(rate: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate)
}
