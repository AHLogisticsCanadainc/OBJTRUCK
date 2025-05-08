export interface CarrierSearchParams {
  searchType: "name" | "dot" | "docket"
  searchValue: string
  start?: number
  size?: number
}

export interface CarrierApiResponse {
  content: any
  responseStatus?: {
    code: string
    message: string
  }
  retrievalDate?: string
}

export interface CarrierDetailType {
  type: "basics" | "cargo-carried" | "operation-classification" | "oos" | "docket-numbers" | "authority"
  dotNumber: string
}

export interface PaginationParams {
  start: number
  size: number
  total?: number
}

export interface ApiErrorResponse {
  error: string
  details?: string
  code?: number
}

// Carrier data structure interfaces
export interface CarrierBasicInfo {
  dotNumber: number
  legalName: string
  dbaName: string | null
  carrierOperation: {
    carrierOperationCode: string
    carrierOperationDesc: string
  }
  phyStreet: string
  phyCity: string
  phyState: string
  phyCountry: string
  phyZipcode: string
  mailingStreet: string | null
  mailingCity: string | null
  mailingState: string | null
  mailingCountry: string | null
  mailingZipcode: string | null
  telephone: string | null
  fax: string | null
  email: string | null
  usdot_status: string
  statusCode: string
}

export interface CarrierSafetyInfo {
  safetyRating: string | null
  safetyRatingDate: string | null
  reviewDate: string | null
  reviewType: string | null
  totalDrivers: number
  totalPowerUnits: number
  driverInsp: number
  driverOosInsp: number
  driverOosRate: number
  vehicleInsp: number
  vehicleOosInsp: number
  vehicleOosRate: number
  crashTotal: number
  fatalCrash: number
  injCrash: number
  towawayCrash: number
}

export interface CarrierInsuranceInfo {
  bipdInsuranceRequired: string
  bipdRequiredAmount: string
  bipdInsuranceOnFile: string
  cargoInsuranceRequired: string
  cargoInsuranceOnFile: string
  bondInsuranceRequired: string
  bondInsuranceOnFile: string
}

export interface CarrierAuthorityInfo {
  commonAuthorityStatus: string
  contractAuthorityStatus: string
  brokerAuthorityStatus: string
  freightForwarderAuthorityStatus?: string
  allowedToOperate: string
}

export interface CarrierBasicsData {
  basics: {
    name: string
    value: number
    threshold: number
    percentile: number
  }[]
}

export interface CargoCarriedData {
  cargoCarried: {
    cargoCarriedId: number
    cargoCarriedDesc: string
  }[]
}

export interface OperationClassificationData {
  operationClassification: {
    opClassId: number
    opClassDesc: string
  }[]
}

export interface DocketNumbersData {
  docketNumber: {
    docketNumber: string
    docketPrefix: string
    docketSuffix: string | null
    docketType: string
  }[]
}

export interface AuthorityData {
  authorities: {
    docketNumber: string
    authorityType: string
    applicationStatus: string
    applicationStatusDesc: string
    insuranceRequired: string
    insuranceRequiredDesc: string
    bipAndPdRequired: string
    bipAndPdRequiredDesc: string
    cargoRequired: string
    cargoRequiredDesc: string
    bondRequired: string
    bondRequiredDesc: string
    authorityStatus: string
    authorityStatusDesc: string
    effectiveDate: string | null
    applicationDate: string | null
  }[]
}

export interface OosData {
  oos: {
    oosDate: string | null
    oosReason: string | null
    oosType: string | null
  }
}
