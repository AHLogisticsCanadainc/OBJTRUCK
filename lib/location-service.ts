import { supabase } from "./database"
import type { Location, LocationFormData } from "@/types/location"

// Table name
const LOCATIONS_TABLE = "locations"

// Convert database record to Location object
function dbRecordToLocation(record: any): Location {
  return {
    id: record.id,
    locationCode: record.location_code,
    name: record.name,
    locationType: record.location_type,
    addressLine1: record.address_line1,
    addressLine2: record.address_line2,
    city: record.city,
    stateProvince: record.state_province,
    postalCode: record.postal_code,
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    contactName: record.contact_name,
    contactEmail: record.contact_email,
    contactPhone: record.contact_phone,
    contactNotes: record.contact_notes,
    appointmentRequired: record.appointment_required,
    rating: record.rating,
    ratingNotes: record.rating_notes,
    dockCount: record.dock_count,
    hasForklift: record.has_forklift,
    operatingHours: record.operating_hours,
    hazmatCertified: record.hazmat_certified,
    temperatureControlled: record.temperature_controlled,
    storageCapacity: record.storage_capacity,
    maxWeightCapacity: record.max_weight_capacity,
    securityLevel: record.security_level,
    certifications: record.certifications,
    insuranceRequirements: record.insurance_requirements,
    customsFacility: record.customs_facility,
    documentsRequired: record.documents_required,
    externalId: record.external_id,
    clientId: record.client_id,
    dispatchZoneId: record.dispatch_zone_id,
    billingCode: record.billing_code,
    avgWaitTime: record.avg_wait_time,
    avgLoadTime: record.avg_load_time,
    reliabilityScore: record.reliability_score,
    auditLog: record.audit_log,
    lastInspectionDate: record.last_inspection_date ? new Date(record.last_inspection_date) : undefined,
    complianceStatus: record.compliance_status,
    vehicleRestrictions: record.vehicle_restrictions,
    specialInstructions: record.special_instructions,
    accessibilityNotes: record.accessibility_notes,
    cutoffTimes: record.cutoff_times,
    blackoutDates: record.blackout_dates,
    preferredCarriers: record.preferred_carriers,
    isActive: record.is_active,
    createdAt: record.created_at ? new Date(record.created_at) : undefined,
    updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
    createdBy: record.created_by,
    updatedBy: record.updated_by,
    wasItClientAdded: record.was_it_client_added,
    ifClientAddedThenWhichClientid: record.if_client_added_then_which_clientid,
    nameOfTheClient: record.name_of_the_client,
  }
}

// Generate a unique location code
function generateLocationCode(name: string, city: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase()
  const cityPrefix = city.substring(0, 3).toUpperCase()
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${namePrefix}${cityPrefix}${randomNum}`
}

// Get all locations
export async function getLocations() {
  const { data, error } = await supabase.from(LOCATIONS_TABLE).select("*").order("name")

  if (error) {
    console.error("Error fetching locations:", error)
    return { data: [], error }
  }

  // Convert database records to Location objects
  const locations: Location[] = data.map(dbRecordToLocation)

  return { data: locations, error: null }
}

// Get a single location by ID
export async function getLocationById(id: string) {
  const { data, error } = await supabase.from(LOCATIONS_TABLE).select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching location:", error)
    return { data: null, error }
  }

  // Convert database record to Location object
  const location: Location = dbRecordToLocation(data)

  return { data: location, error: null }
}

// Add a new location
export async function addLocation(locationData: LocationFormData, userId?: string) {
  // Generate a location code if not provided
  if (!locationData.locationCode) {
    locationData.locationCode = generateLocationCode(locationData.name, locationData.city)
  }

  // Create a record with only the fields that exist in the database
  const dbLocation = {
    location_code: locationData.locationCode,
    name: locationData.name,
    location_type: locationData.locationType,
    address_line1: locationData.addressLine1,
    address_line2: locationData.addressLine2,
    city: locationData.city,
    state_province: locationData.stateProvince,
    postal_code: locationData.postalCode,
    country: locationData.country,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    contact_name: locationData.contactName,
    contact_email: locationData.contactEmail,
    contact_phone: locationData.contactPhone,
    contact_notes: locationData.contactNotes,
    appointment_required: locationData.appointmentRequired,
    rating: locationData.rating,
    rating_notes: locationData.ratingNotes,
    dock_count: locationData.dockCount,
    has_forklift: locationData.hasForklift,
    operating_hours: locationData.operatingHours,
    hazmat_certified: locationData.hazmatCertified,
    temperature_controlled: locationData.temperatureControlled,
    storage_capacity: locationData.storageCapacity,
    max_weight_capacity: locationData.maxWeightCapacity,
    security_level: locationData.securityLevel,
    certifications: locationData.certifications,
    insurance_requirements: locationData.insuranceRequirements,
    customs_facility: locationData.customsFacility,
    documents_required: locationData.documentsRequired,
    external_id: locationData.externalId,
    client_id: locationData.clientId,
    dispatch_zone_id: locationData.dispatchZoneId,
    billing_code: locationData.billingCode,
    avg_wait_time: locationData.avgWaitTime,
    avg_load_time: locationData.avgLoadTime,
    reliability_score: locationData.reliabilityScore,
    audit_log: locationData.auditLog,
    last_inspection_date: locationData.lastInspectionDate,
    compliance_status: locationData.complianceStatus,
    vehicle_restrictions: locationData.vehicleRestrictions,
    special_instructions: locationData.specialInstructions,
    accessibility_notes: locationData.accessibilityNotes,
    cutoff_times: locationData.cutoffTimes,
    blackout_dates: locationData.blackoutDates,
    preferred_carriers: locationData.preferredCarriers,
    is_active: locationData.isActive !== undefined ? locationData.isActive : true,
    created_by: userId,
    was_it_client_added: locationData.wasItClientAdded,
    if_client_added_then_which_clientid: locationData.ifClientAddedThenWhichClientid,
    name_of_the_client: locationData.nameOfTheClient,
  }

  const { data, error } = await supabase.from(LOCATIONS_TABLE).insert(dbLocation).select("*").single()

  if (error) {
    console.error("Error adding location:", error)
    return { data: null, error }
  }

  // Convert database record to Location object
  const location: Location = dbRecordToLocation(data)

  return { data: location, error: null }
}

// Update a location - completely rewritten to avoid geofence issues
export async function updateLocation(id: string, locationData: LocationFormData, userId?: string) {
  try {
    // Create an update object with only the specific fields we want to update
    // This avoids any issues with fields that might trigger geofence-related functionality
    const updateFields: Record<string, any> = {}

    // Only include fields that are explicitly provided in locationData
    if (locationData.name !== undefined) updateFields.name = locationData.name
    if (locationData.locationType !== undefined) updateFields.location_type = locationData.locationType
    if (locationData.addressLine1 !== undefined) updateFields.address_line1 = locationData.addressLine1
    if (locationData.addressLine2 !== undefined) updateFields.address_line2 = locationData.addressLine2
    if (locationData.city !== undefined) updateFields.city = locationData.city
    if (locationData.stateProvince !== undefined) updateFields.state_province = locationData.stateProvince
    if (locationData.postalCode !== undefined) updateFields.postal_code = locationData.postalCode
    if (locationData.country !== undefined) updateFields.country = locationData.country
    if (locationData.contactName !== undefined) updateFields.contact_name = locationData.contactName
    if (locationData.contactEmail !== undefined) updateFields.contact_email = locationData.contactEmail
    if (locationData.contactPhone !== undefined) updateFields.contact_phone = locationData.contactPhone
    if (locationData.contactNotes !== undefined) updateFields.contact_notes = locationData.contactNotes
    if (locationData.appointmentRequired !== undefined)
      updateFields.appointment_required = locationData.appointmentRequired
    if (locationData.dockCount !== undefined) updateFields.dock_count = locationData.dockCount
    if (locationData.hasForklift !== undefined) updateFields.has_forklift = locationData.hasForklift
    if (locationData.hazmatCertified !== undefined) updateFields.hazmat_certified = locationData.hazmatCertified
    if (locationData.temperatureControlled !== undefined)
      updateFields.temperature_controlled = locationData.temperatureControlled
    if (locationData.storageCapacity !== undefined) updateFields.storage_capacity = locationData.storageCapacity
    if (locationData.maxWeightCapacity !== undefined) updateFields.max_weight_capacity = locationData.maxWeightCapacity
    if (locationData.customsFacility !== undefined) updateFields.customs_facility = locationData.customsFacility
    if (locationData.specialInstructions !== undefined)
      updateFields.special_instructions = locationData.specialInstructions
    if (locationData.accessibilityNotes !== undefined)
      updateFields.accessibility_notes = locationData.accessibilityNotes
    if (locationData.billingCode !== undefined) updateFields.billing_code = locationData.billingCode
    if (locationData.isActive !== undefined) updateFields.is_active = locationData.isActive

    // Add updated_by if userId is provided
    if (userId) updateFields.updated_by = userId

    // IMPORTANT: Do not include latitude or longitude in the update
    // This avoids triggering the update_location_point_trigger which might be causing the geofence issue

    console.log("Updating location with fields:", Object.keys(updateFields))

    // Only perform the update if there are fields to update
    if (Object.keys(updateFields).length === 0) {
      console.log("No fields to update")
      return { data: null, error: new Error("No fields to update") }
    }

    // Perform the update with only the specific fields
    const { data, error } = await supabase.from(LOCATIONS_TABLE).update(updateFields).eq("id", id).select("*").single()

    if (error) {
      console.error("Error updating location:", error)
      return { data: null, error }
    }

    // Convert database record to Location object
    const location: Location = dbRecordToLocation(data)

    return { data: location, error: null }
  } catch (error) {
    console.error("Unexpected error updating location:", error)
    return { data: null, error }
  }
}

// Delete a location
export async function deleteLocation(id: string) {
  const { error } = await supabase.from(LOCATIONS_TABLE).delete().eq("id", id)

  if (error) {
    console.error("Error deleting location:", error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// Search locations
export async function searchLocations(query: string) {
  const { data, error } = await supabase
    .from(LOCATIONS_TABLE)
    .select("*")
    .textSearch("search_vector", query, {
      config: "english",
    })
    .order("name")

  if (error) {
    console.error("Error searching locations:", error)
    return { data: [], error }
  }

  // Convert database records to Location objects
  const locations: Location[] = data.map(dbRecordToLocation)

  return { data: locations, error: null }
}

// Get locations by client ID
export async function getLocationsByClient(clientId: string) {
  const { data, error } = await supabase.from(LOCATIONS_TABLE).select("*").eq("client_id", clientId).order("name")

  if (error) {
    console.error("Error fetching client locations:", error)
    return { data: [], error }
  }

  // Convert database records to Location objects
  const locations: Location[] = data.map(dbRecordToLocation)

  return { data: locations, error: null }
}

// Get locations by type
export async function getLocationsByType(locationType: string) {
  const { data, error } = await supabase
    .from(LOCATIONS_TABLE)
    .select("*")
    .eq("location_type", locationType)
    .order("name")

  if (error) {
    console.error("Error fetching locations by type:", error)
    return { data: [], error }
  }

  // Convert database records to Location objects
  const locations: Location[] = data.map(dbRecordToLocation)

  return { data: locations, error: null }
}
