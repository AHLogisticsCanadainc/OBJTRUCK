import type { Province } from "./types"

export const PROVINCES: Province[] = [
  { name: "Ontario", taxRate: 0.13, taxName: "HST (13%)" },
  { name: "British Columbia", taxRate: 0.12, taxName: "GST+PST (12%)" },
  { name: "Alberta", taxRate: 0.05, taxName: "GST (5%)" },
  { name: "Quebec", taxRate: 0.14975, taxName: "GST+QST (14.975%)" },
  { name: "Manitoba", taxRate: 0.12, taxName: "GST+PST (12%)" },
  { name: "Saskatchewan", taxRate: 0.11, taxName: "GST+PST (11%)" },
  { name: "Nova Scotia", taxRate: 0.15, taxName: "HST (15%)" },
  { name: "New Brunswick", taxRate: 0.15, taxName: "HST (15%)" },
  { name: "Newfoundland and Labrador", taxRate: 0.15, taxName: "HST (15%)" },
  { name: "Prince Edward Island", taxRate: 0.15, taxName: "HST (15%)" },
  { name: "Northwest Territories", taxRate: 0.05, taxName: "GST (5%)" },
  { name: "Nunavut", taxRate: 0.05, taxName: "GST (5%)" },
  { name: "Yukon", taxRate: 0.05, taxName: "GST (5%)" },
]

export const DEFAULT_PROVINCE = PROVINCES[0]
