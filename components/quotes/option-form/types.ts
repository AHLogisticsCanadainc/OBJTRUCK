import type { QuoteOption, NewQuoteOption } from "@/types/quotes"

export interface CreateOptionFormProps {
  quoteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (option: NewQuoteOption, isEditing: boolean, optionId?: string) => void
  editOption?: QuoteOption | null
  onClearEdit?: () => void
}

export interface LoadType {
  type: string
  weightRange: string
  emissionRate: {
    kg: number
    lbs: number
  }
}

// Define distribution percentages for additional costs
export const COST_DISTRIBUTION = {
  equipment_maintenance: 0.35, // 35% of remainder (increased from 25%)
  insurance_cost: 0.2, // 20% of remainder (decreased from 30%)
  overhead_cost: 0.4, // 40% of remainder (increased from 35%)
  overheads_servicecost: 0.05, // 5% of remainder (decreased from 10%)
}

// Add this constant for load types and their emission rates
export const LOAD_TYPES: LoadType[] = [
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

// Form state interface
export interface OptionFormState extends NewQuoteOption {
  // Add any additional state properties here
}
