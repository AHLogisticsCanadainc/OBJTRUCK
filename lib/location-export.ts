import type { Location } from "@/types/location"
import { convertToCSV, downloadCSV, formatDate } from "./export-utils"

/**
 * Exports location data to CSV
 * @param locations Array of location objects
 * @param filename Name of the file to download (default: locations.csv)
 */
export function exportLocationsToCSV(locations: Location[], filename = "locations.csv"): void {
  // Define headers and mapping for CSV export
  const headers = [
    { key: "locationCode" as keyof Location, label: "Location Code" },
    { key: "name" as keyof Location, label: "Name" },
    { key: "locationType" as keyof Location, label: "Location Type" },
    { key: "addressLine1" as keyof Location, label: "Address Line 1" },
    { key: "addressLine2" as keyof Location, label: "Address Line 2" },
    { key: "city" as keyof Location, label: "City" },
    { key: "stateProvince" as keyof Location, label: "State/Province" },
    { key: "postalCode" as keyof Location, label: "Postal Code" },
    { key: "country" as keyof Location, label: "Country" },
    { key: "latitude" as keyof Location, label: "Latitude" },
    { key: "longitude" as keyof Location, label: "Longitude" },
    { key: "contactName" as keyof Location, label: "Contact Name" },
    { key: "contactEmail" as keyof Location, label: "Contact Email" },
    { key: "contactPhone" as keyof Location, label: "Contact Phone" },
    { key: "contactNotes" as keyof Location, label: "Contact Notes" },
    { key: "appointmentRequired" as keyof Location, label: "Appointment Required" },
    { key: "rating" as keyof Location, label: "Rating" },
    { key: "ratingNotes" as keyof Location, label: "Rating Notes" },
    { key: "dockCount" as keyof Location, label: "Dock Count" },
    { key: "hasForklift" as keyof Location, label: "Has Forklift" },
    { key: "hazmatCertified" as keyof Location, label: "Hazmat Certified" },
    { key: "temperatureControlled" as keyof Location, label: "Temperature Controlled" },
    { key: "storageCapacity" as keyof Location, label: "Storage Capacity" },
    { key: "maxWeightCapacity" as keyof Location, label: "Max Weight Capacity" },
    { key: "securityLevel" as keyof Location, label: "Security Level" },
    { key: "insuranceRequirements" as keyof Location, label: "Insurance Requirements" },
    { key: "customsFacility" as keyof Location, label: "Customs Facility" },
    { key: "billingCode" as keyof Location, label: "Billing Code" },
    { key: "avgWaitTime" as keyof Location, label: "Average Wait Time" },
    { key: "avgLoadTime" as keyof Location, label: "Average Load Time" },
    { key: "reliabilityScore" as keyof Location, label: "Reliability Score" },
    { key: "lastInspectionDate" as keyof Location, label: "Last Inspection Date" },
    { key: "complianceStatus" as keyof Location, label: "Compliance Status" },
    { key: "specialInstructions" as keyof Location, label: "Special Instructions" },
    { key: "accessibilityNotes" as keyof Location, label: "Accessibility Notes" },
    { key: "isActive" as keyof Location, label: "Is Active" },
    { key: "createdAt" as keyof Location, label: "Created At" },
    { key: "updatedAt" as keyof Location, label: "Updated At" },
    { key: "wasItClientAdded" as keyof Location, label: "Client Added" },
    { key: "nameOfTheClient" as keyof Location, label: "Client Name" },
  ]

  // Process locations to handle complex data types
  const processedLocations = locations.map((location) => {
    const processed = { ...location }

    // Format dates
    if (processed.lastInspectionDate) {
      processed.lastInspectionDate = formatDate(processed.lastInspectionDate) as any
    }
    if (processed.createdAt) {
      processed.createdAt = formatDate(processed.createdAt) as any
    }
    if (processed.updatedAt) {
      processed.updatedAt = formatDate(processed.updatedAt) as any
    }

    // Convert complex objects to strings
    if (processed.operatingHours) {
      processed.operatingHours = JSON.stringify(processed.operatingHours) as any
    }
    if (processed.certifications) {
      processed.certifications = JSON.stringify(processed.certifications) as any
    }
    if (processed.documentsRequired) {
      processed.documentsRequired = JSON.stringify(processed.documentsRequired) as any
    }
    if (processed.vehicleRestrictions) {
      processed.vehicleRestrictions = JSON.stringify(processed.vehicleRestrictions) as any
    }
    if (processed.cutoffTimes) {
      processed.cutoffTimes = JSON.stringify(processed.cutoffTimes) as any
    }
    if (processed.blackoutDates) {
      processed.blackoutDates = JSON.stringify(processed.blackoutDates) as any
    }
    if (processed.preferredCarriers) {
      processed.preferredCarriers = JSON.stringify(processed.preferredCarriers) as any
    }
    if (processed.auditLog) {
      processed.auditLog = JSON.stringify(processed.auditLog) as any
    }

    return processed
  })

  // Convert to CSV and download
  const csv = convertToCSV(processedLocations, headers)
  downloadCSV(csv, filename)
}
