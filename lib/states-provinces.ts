export interface StateProvince {
  code: string
  name: string
  country: string
}

export const STATES_PROVINCES: StateProvince[] = [
  // US States
  { code: "AL", name: "Alabama", country: "US" },
  { code: "AK", name: "Alaska", country: "US" },
  { code: "AZ", name: "Arizona", country: "US" },
  { code: "AR", name: "Arkansas", country: "US" },
  { code: "CA", name: "California", country: "US" },
  { code: "CO", name: "Colorado", country: "US" },
  { code: "CT", name: "Connecticut", country: "US" },
  { code: "DE", name: "Delaware", country: "US" },
  { code: "DC", name: "District of Columbia", country: "US" },
  { code: "FL", name: "Florida", country: "US" },
  { code: "GA", name: "Georgia", country: "US" },
  { code: "HI", name: "Hawaii", country: "US" },
  { code: "ID", name: "Idaho", country: "US" },
  { code: "IL", name: "Illinois", country: "US" },
  { code: "IN", name: "Indiana", country: "US" },
  { code: "IA", name: "Iowa", country: "US" },
  { code: "KS", name: "Kansas", country: "US" },
  { code: "KY", name: "Kentucky", country: "US" },
  { code: "LA", name: "Louisiana", country: "US" },
  { code: "ME", name: "Maine", country: "US" },
  { code: "MD", name: "Maryland", country: "US" },
  { code: "MA", name: "Massachusetts", country: "US" },
  { code: "MI", name: "Michigan", country: "US" },
  { code: "MN", name: "Minnesota", country: "US" },
  { code: "MS", name: "Mississippi", country: "US" },
  { code: "MO", name: "Missouri", country: "US" },
  { code: "MT", name: "Montana", country: "US" },
  { code: "NE", name: "Nebraska", country: "US" },
  { code: "NV", name: "Nevada", country: "US" },
  { code: "NH", name: "New Hampshire", country: "US" },
  { code: "NJ", name: "New Jersey", country: "US" },
  { code: "NM", name: "New Mexico", country: "US" },
  { code: "NY", name: "New York", country: "US" },
  { code: "NC", name: "North Carolina", country: "US" },
  { code: "ND", name: "North Dakota", country: "US" },
  { code: "OH", name: "Ohio", country: "US" },
  { code: "OK", name: "Oklahoma", country: "US" },
  { code: "OR", name: "Oregon", country: "US" },
  { code: "PA", name: "Pennsylvania", country: "US" },
  { code: "RI", name: "Rhode Island", country: "US" },
  { code: "SC", name: "South Carolina", country: "US" },
  { code: "SD", name: "South Dakota", country: "US" },
  { code: "TN", name: "Tennessee", country: "US" },
  { code: "TX", name: "Texas", country: "US" },
  { code: "UT", name: "Utah", country: "US" },
  { code: "VT", name: "Vermont", country: "US" },
  { code: "VA", name: "Virginia", country: "US" },
  { code: "WA", name: "Washington", country: "US" },
  { code: "WV", name: "West Virginia", country: "US" },
  { code: "WI", name: "Wisconsin", country: "US" },
  { code: "WY", name: "Wyoming", country: "US" },

  // Canadian Provinces
  { code: "AB", name: "Alberta", country: "CA" },
  { code: "BC", name: "British Columbia", country: "CA" },
  { code: "MB", name: "Manitoba", country: "CA" },
  { code: "NB", name: "New Brunswick", country: "CA" },
  { code: "NL", name: "Newfoundland and Labrador", country: "CA" },
  { code: "NS", name: "Nova Scotia", country: "CA" },
  { code: "NT", name: "Northwest Territories", country: "CA" },
  { code: "NU", name: "Nunavut", country: "CA" },
  { code: "ON", name: "Ontario", country: "CA" },
  { code: "PE", name: "Prince Edward Island", country: "CA" },
  { code: "QC", name: "Quebec", country: "CA" },
  { code: "SK", name: "Saskatchewan", country: "CA" },
  { code: "YT", name: "Yukon", country: "CA" },

  // Mexican States (commonly used in FMCSA data)
  { code: "AG", name: "Aguascalientes", country: "MX" },
  { code: "BC", name: "Baja California", country: "MX" },
  { code: "BS", name: "Baja California Sur", country: "MX" },
  { code: "CM", name: "Campeche", country: "MX" },
  { code: "CS", name: "Chiapas", country: "MX" },
  { code: "CH", name: "Chihuahua", country: "MX" },
  { code: "CO", name: "Coahuila", country: "MX" },
  { code: "CL", name: "Colima", country: "MX" },
  { code: "DF", name: "Ciudad de México", country: "MX" },
  { code: "DG", name: "Durango", country: "MX" },
  { code: "GT", name: "Guanajuato", country: "MX" },
  { code: "GR", name: "Guerrero", country: "MX" },
  { code: "HG", name: "Hidalgo", country: "MX" },
  { code: "JA", name: "Jalisco", country: "MX" },
  { code: "EM", name: "Estado de México", country: "MX" },
  { code: "MI", name: "Michoacán", country: "MX" },
  { code: "MO", name: "Morelos", country: "MX" },
  { code: "NA", name: "Nayarit", country: "MX" },
  { code: "NL", name: "Nuevo León", country: "MX" },
  { code: "OA", name: "Oaxaca", country: "MX" },
  { code: "PU", name: "Puebla", country: "MX" },
  { code: "QT", name: "Querétaro", country: "MX" },
  { code: "QR", name: "Quintana Roo", country: "MX" },
  { code: "SL", name: "San Luis Potosí", country: "MX" },
  { code: "SI", name: "Sinaloa", country: "MX" },
  { code: "SO", name: "Sonora", country: "MX" },
  { code: "TB", name: "Tabasco", country: "MX" },
  { code: "TM", name: "Tamaulipas", country: "MX" },
  { code: "TL", name: "Tlaxcala", country: "MX" },
  { code: "VE", name: "Veracruz", country: "MX" },
  { code: "YU", name: "Yucatán", country: "MX" },
  { code: "ZA", name: "Zacatecas", country: "MX" },
]

// Group states/provinces by country
export const getStatesByCountry = () => {
  const grouped: Record<string, StateProvince[]> = {}

  STATES_PROVINCES.forEach((state) => {
    if (!grouped[state.country]) {
      grouped[state.country] = []
    }
    grouped[state.country].push(state)
  })

  return grouped
}
