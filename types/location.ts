export interface OperatingHours {
  monday?: { open: string; close: string }
  tuesday?: { open: string; close: string }
  wednesday?: { open: string; close: string }
  thursday?: { open: string; close: string }
  friday?: { open: string; close: string }
  saturday?: { open: string; close: string }
  sunday?: { open: string; close: string }
}

export interface Certifications {
  name: string
  issuedDate?: string
  expiryDate?: string
  certificationBody?: string
}

export interface VehicleRestrictions {
  maxHeight?: number
  maxWidth?: number
  maxLength?: number
  maxWeight?: number
  trailerTypes?: string[]
  otherRestrictions?: string[]
}

export interface CutoffTimes {
  [dayOfWeek: string]: string
}

export interface BlackoutDates {
  startDate: string
  endDate: string
  reason?: string
}

export interface PreferredCarrier {
  carrierId: string
  carrierName: string
  priority?: number
}

export interface Location {
  id: string
  locationCode: string
  name: string
  locationType: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contactNotes?: string
  appointmentRequired?: boolean
  rating?: number
  ratingNotes?: string
  dockCount?: number
  hasForklift?: boolean
  operatingHours?: OperatingHours
  hazmatCertified?: boolean
  temperatureControlled?: boolean
  storageCapacity?: number
  maxWeightCapacity?: number
  securityLevel?: number
  certifications?: Certifications[]
  insuranceRequirements?: string
  customsFacility?: boolean
  documentsRequired?: string[]
  externalId?: string
  clientId?: string
  dispatchZoneId?: string
  billingCode?: string
  avgWaitTime?: string
  avgLoadTime?: string
  reliabilityScore?: number
  auditLog?: any
  lastInspectionDate?: Date
  complianceStatus?: string
  vehicleRestrictions?: VehicleRestrictions
  specialInstructions?: string
  accessibilityNotes?: string
  cutoffTimes?: CutoffTimes
  blackoutDates?: BlackoutDates[]
  preferredCarriers?: PreferredCarrier[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
  updatedBy?: string
  wasItClientAdded?: string
  ifClientAddedThenWhichClientid?: string
  nameOfTheClient?: string
  // No geofence-related fields in our interface
}

export type LocationFormData = Omit<Location, "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">
