/**
 * Generates a Google Maps URL for a location
 * @param location The location object
 * @returns A Google Maps URL
 */
export function getGoogleMapsUrl(location: {
  latitude?: number | null
  longitude?: number | null
  addressLine1?: string
  city?: string
  stateProvince?: string
  postalCode?: string
  country?: string
}): string {
  // If we have coordinates, use them
  if (location.latitude && location.longitude) {
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
  }

  // Otherwise, use the address
  const addressParts = [
    location.addressLine1,
    location.city,
    location.stateProvince,
    location.postalCode,
    location.country,
  ].filter(Boolean)

  const address = addressParts.join(", ")
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
