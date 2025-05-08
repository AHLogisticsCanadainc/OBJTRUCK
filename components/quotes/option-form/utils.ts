// Add a function to determine load type based on weight
export function determineLoadType(weight?: number): LoadType {
  if (!weight) return LOAD_TYPES[0] // Default to Light if no weight

  if (weight > 0 && weight <= 25000) {
    return LOAD_TYPES[0] // Light
  } else if (weight > 25000 && weight <= 50000) {
    return LOAD_TYPES[1] // Medium
  } else if (weight > 50000 && weight <= 70000) {
    return LOAD_TYPES[2] // Heavy
  } else if (weight > 70000 && weight <= 85000) {
    return LOAD_TYPES[3] // Very Heavy
  } else if (weight > 85000 && weight <= 100000) {
    return LOAD_TYPES[4] // Extra Heavy
  } else {
    return LOAD_TYPES[5] // Super Heavy
  }
}

// Add this function to calculate transit time
export function calculateTransitTime(pickupDate?: string, deliveryDate?: string): string {
  if (!pickupDate || !deliveryDate) return ""

  const pickup = new Date(pickupDate)
  const delivery = new Date(deliveryDate)

  // Reset time part to compare dates only
  pickup.setHours(0, 0, 0, 0)
  delivery.setHours(0, 0, 0, 0)

  // Calculate difference in days
  const diffTime = delivery.getTime() - pickup.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return "Invalid dates" // Delivery date is before pickup date
  } else if (diffDays === 0) {
    return "Same day delivery" // Same day delivery
  } else if (diffDays === 1) {
    return "1 day" // Single day
  } else {
    return `${diffDays} days` // Multiple days
  }
}

// Helper function to ensure a value is a number
export function ensureNumber(value: any): number | undefined {
  if (value === undefined || value === null) return undefined

  const num = typeof value === "string" ? Number.parseFloat(value) : value
  return isNaN(num) ? undefined : num
}

// Update the calculateAdjustedMpg function to ensure we're working with numbers
export function calculateAdjustedMpg(
  baseMpg?: number | string,
  weight?: number,
  mpgAdjustmentEnabled = true,
): number | undefined {
  // Convert baseMpg to number if it's a string
  const numBaseMpg = ensureNumber(baseMpg)
  const numWeight = ensureNumber(weight)

  if (numBaseMpg === undefined || numWeight === undefined || !mpgAdjustmentEnabled) {
    return numBaseMpg
  }

  // Apply MPG reductions based on weight ranges
  if (numWeight <= 25000) {
    // No reduction for light loads
    return numBaseMpg
  } else if (numWeight > 25000 && numWeight <= 50000) {
    // 15% reduction for medium loads
    return Number((numBaseMpg * 0.85).toFixed(1))
  } else if (numWeight > 50000 && numWeight <= 70000) {
    // 25% reduction for heavy loads
    return Number((numBaseMpg * 0.75).toFixed(1))
  } else if (numWeight > 70000 && numWeight <= 85000) {
    // 35% reduction for very heavy loads
    return Number((numBaseMpg * 0.65).toFixed(1))
  } else if (numWeight > 85000 && numWeight <= 100000) {
    // 45% reduction for extra heavy loads
    return Number((numBaseMpg * 0.55).toFixed(1))
  } else {
    // 55% reduction for super heavy loads
    return Number((numBaseMpg * 0.45).toFixed(1))
  }
}

// Add a helper function to safely format numbers
export function safelyFormatNumber(value: any, decimals = 2): string {
  const num = ensureNumber(value)
  if (num === undefined) return "N/A"
  return num.toFixed(decimals)
}

// Add the LOAD_TYPES and LoadType here
export const LOAD_TYPES = [
  {
    type: "Light",
    weightRange: "0-25,000 lbs",
    emissionRate: {
      kg: 1.0,
      lbs: 2.2,
    },
  },
  {
    type: "Medium",
    weightRange: "25,000-50,000 lbs",
    emissionRate: {
      kg: 1.275,
      lbs: 2.8,
    },
  },
  {
    type: "Heavy",
    weightRange: "50,000-70,000 lbs",
    emissionRate: {
      kg: 1.457,
      lbs: 3.2,
    },
  },
  {
    type: "Very Heavy",
    weightRange: "70,000-85,000 lbs",
    emissionRate: {
      kg: 1.7,
      lbs: 3.75,
    },
  },
  {
    type: "Extra Heavy",
    weightRange: "85,000-100,000 lbs",
    emissionRate: {
      kg: 2.0,
      lbs: 4.4,
    },
  },
  {
    type: "Super Heavy",
    weightRange: "Above 100,000 lbs",
    emissionRate: {
      kg: 2.3,
      lbs: 5.0,
    },
  },
]

export type LoadType = (typeof LOAD_TYPES)[0]

// Define distribution percentages for additional costs
export const COST_DISTRIBUTION = {
  equipment_maintenance: 0.35, // 35% of remainder (increased from 25%)
  insurance_cost: 0.2, // 20% of remainder (decreased from 30%)
  overhead_cost: 0.4, // 40% of remainder (increased from 35%)
  overheads_servicecost: 0.05, // 5% of remainder (decreased from 10%)
}
