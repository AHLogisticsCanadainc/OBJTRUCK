"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useCarrierLookup } from "@/hooks/use-carrier-lookup"
import { JsonViewer } from "./json-viewer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Check, Database, Code, FileText, RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CarrierDetailsViewProps {
  data: any
}

export function CarrierDetailsView({ data }: CarrierDetailsViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [detailsData, setDetailsData] = useState<Record<string, any>>({})
  const [viewMode, setViewMode] = useState<Record<string, "formatted" | "raw">>({
    cargo: "formatted",
    operations: "formatted",
    authority: "formatted",
    dockets: "formatted",
    oos: "formatted",
  })
  const { getCarrierDetails, loading, isSaving, isSaved, existingCarriers } = useCarrierLookup()

  // Extract carrier data
  const carrierData = data?.content?.[0]?.carrier
  const dotNumber = carrierData?.dotNumber?.toString()
  const isInDatabase = existingCarriers[dotNumber] === true

  // Toggle view mode between formatted and raw
  const toggleViewMode = (tab: string) => {
    setViewMode((prev) => ({
      ...prev,
      [tab]: prev[tab] === "formatted" ? "raw" : "formatted",
    }))
  }

  // Refresh data for the current tab
  const refreshTabData = async () => {
    if (!carrierData || !dotNumber) return

    // Map tab names to API endpoint types
    const tabToEndpoint: Record<string, string | null> = {
      overview: null,
      cargo: "cargo-carried",
      operations: "operation-classification",
      authority: "authority",
      dockets: "docket-numbers",
      oos: "oos",
      raw: null,
    }

    const endpoint = tabToEndpoint[activeTab]
    if (!endpoint) return

    try {
      const result = await getCarrierDetails({
        dotNumber,
        type: endpoint,
      })

      if (result) {
        setDetailsData((prev) => ({
          ...prev,
          [activeTab]: result,
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error)
    }
  }

  // Fetch additional details when tab changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!carrierData || !dotNumber) return

      // Skip if we already have the data for this tab
      if (detailsData[activeTab]) return

      // Map tab names to API endpoint types
      const tabToEndpoint: Record<string, string | null> = {
        overview: null, // No need to fetch for overview
        cargo: "cargo-carried",
        operations: "operation-classification",
        authority: "authority",
        dockets: "docket-numbers",
        oos: "oos",
        raw: null, // No need to fetch for raw data
      }

      const endpoint = tabToEndpoint[activeTab]
      if (!endpoint) return

      try {
        const result = await getCarrierDetails({
          dotNumber,
          type: endpoint,
        })

        if (result) {
          setDetailsData((prev) => ({
            ...prev,
            [activeTab]: result,
          }))
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error)
      }
    }

    fetchDetails()
  }, [activeTab, carrierData, dotNumber, getCarrierDetails, detailsData])

  if (!carrierData) {
    return (
      <div className="p-4 bg-muted rounded-md">
        <p className="text-center text-muted-foreground">No carrier details available</p>
      </div>
    )
  }

  // Helper function to extract cargo data in a clean format
  const getCleanCargoData = () => {
    if (!detailsData.cargo) return []

    if (detailsData.cargo.content?.length > 0) {
      return detailsData.cargo.content.map((cargo: any) => ({
        description: cargo.cargoClassDesc || cargo.cargoCarriedDesc,
        id: cargo.id?.cargoClassId || cargo.id?.cargoCarriedId || "N/A",
      }))
    } else if (detailsData.cargo.content?.cargoCarried?.length > 0) {
      return detailsData.cargo.content.cargoCarried.map((cargo: any) => ({
        description: cargo.cargoCarriedDesc,
        id: cargo.cargoCarriedId || "N/A",
      }))
    }

    return []
  }

  // Helper function to extract operations data in a clean format
  const getCleanOperationsData = () => {
    if (!detailsData.operations) return []

    if (detailsData.operations.content?.length > 0) {
      return detailsData.operations.content.map((op: any) => ({
        description: op.opClassDesc || op.operationClassDesc,
        id: op.id?.opClassId || op.id?.operationClassId || "N/A",
      }))
    } else if (detailsData.operations.content?.operationClassification?.length > 0) {
      return detailsData.operations.content.operationClassification.map((op: any) => ({
        description: op.opClassDesc,
        id: op.opClassId || "N/A",
      }))
    }

    return []
  }

  // Helper function to extract authority data in a clean format
  const getCleanAuthorityData = () => {
    if (!detailsData.authority) return []

    if (detailsData.authority.content?.length > 0) {
      return detailsData.authority.content.map((auth: any) => ({
        type: auth.authorityType || "N/A",
        docketNumber: auth.docketNumber || "N/A",
        status: auth.authorityStatusDesc || auth.status || "N/A",
        applicationStatus: auth.applicationStatusDesc || "N/A",
        effectiveDate: auth.effectiveDate || "N/A",
        applicationDate: auth.applicationDate || "N/A",
        insuranceRequired: auth.insuranceRequiredDesc || "N/A",
        bipdRequired: auth.bipAndPdRequiredDesc || "N/A",
        cargoRequired: auth.cargoRequiredDesc || "N/A",
        bondRequired: auth.bondRequiredDesc || "N/A",
      }))
    } else if (detailsData.authority.content?.authorities?.length > 0) {
      return detailsData.authority.content.authorities.map((auth: any) => ({
        type: auth.authorityType || "N/A",
        docketNumber: auth.docketNumber || "N/A",
        status: auth.authorityStatusDesc || "N/A",
        applicationStatus: auth.applicationStatusDesc || "N/A",
        effectiveDate: auth.effectiveDate || "N/A",
        applicationDate: auth.applicationDate || "N/A",
        insuranceRequired: auth.insuranceRequiredDesc || "N/A",
        bipdRequired: auth.bipAndPdRequiredDesc || "N/A",
        cargoRequired: auth.cargoRequiredDesc || "N/A",
        bondRequired: auth.bondRequiredDesc || "N/A",
      }))
    }

    return []
  }

  // Helper function to extract docket data in a clean format
  const getCleanDocketData = () => {
    if (!detailsData.dockets) return []

    if (detailsData.dockets.content?.length > 0) {
      return detailsData.dockets.content.map((docket: any) => ({
        docketNumber: docket.docketNumber || "N/A",
        prefix: docket.docketPrefix || "N/A",
        type: docket.docketType || "N/A",
      }))
    } else if (detailsData.dockets.content?.docketNumber?.length > 0) {
      return detailsData.dockets.content.docketNumber.map((docket: any) => ({
        docketNumber: docket.docketNumber || "N/A",
        prefix: docket.docketPrefix || "N/A",
        type: docket.docketType || "N/A",
      }))
    }

    return []
  }

  // Helper function to extract OOS data in a clean format
  const getCleanOOSData = () => {
    if (!detailsData.oos) return null

    if (detailsData.oos.content?.oosDate || detailsData.oos.content?.oosReason || detailsData.oos.content?.oosType) {
      return {
        date: detailsData.oos.content.oosDate || "None",
        reason: detailsData.oos.content.oosReason || "None",
        type: detailsData.oos.content.oosType || "None",
      }
    } else if (detailsData.oos.content?.oos) {
      return {
        date: detailsData.oos.content.oos.oosDate || "None",
        reason: detailsData.oos.content.oos.oosReason || "None",
        type: detailsData.oos.content.oos.oosType || "None",
      }
    }

    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {carrierData.legalName}
              <Badge variant={carrierData.statusCode === "A" ? "success" : "destructive"}>
                {carrierData.statusCode === "A" ? "Active" : "Inactive"}
              </Badge>

              {/* Database status indicator */}
              {isInDatabase ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                  <Database className="h-3 w-3" />
                  <span>Saved in Database</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>New</span>
                </Badge>
              )}

              {isSaving && (
                <div className="flex items-center gap-1 ml-2 text-sm font-normal">
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </div>
              )}
              {isSaved && !isSaving && (
                <div className="flex items-center gap-1 ml-2 text-sm font-normal text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Saved</span>
                </div>
              )}
            </CardTitle>
            {carrierData.dbaName && <p className="text-muted-foreground">DBA: {carrierData.dbaName}</p>}
          </div>
          <div className="flex flex-col md:items-end">
            <div className="text-sm">
              <span className="font-medium">DOT#:</span> {carrierData.dotNumber}
            </div>
            {carrierData.mcNumber && (
              <div className="text-sm">
                <span className="font-medium">MC#:</span> {carrierData.mcNumber}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cargo">Cargo</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="authority">Authority</TabsTrigger>
            <TabsTrigger value="dockets">Dockets</TabsTrigger>
            <TabsTrigger value="oos">OOS</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Company Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Legal Name:</span> {carrierData.legalName}
                  </div>
                  {carrierData.dbaName && (
                    <div>
                      <span className="font-medium">DBA Name:</span> {carrierData.dbaName}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {carrierData.statusCode === "A" ? "Active" : "Inactive"}
                  </div>
                  <div>
                    <span className="font-medium">Entity Type:</span>{" "}
                    {carrierData.carrierOperation?.entityType || "Not specified"}
                  </div>
                  <div>
                    <span className="font-medium">Operation:</span>{" "}
                    {carrierData.carrierOperation?.carrierOperationDesc || "Not specified"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Physical Address:</span>
                    <div className="pl-4">
                      {carrierData.phyStreet}
                      <br />
                      {carrierData.phyCity}, {carrierData.phyState} {carrierData.phyZipcode}
                      <br />
                      {carrierData.phyCountry}
                    </div>
                  </div>
                  {carrierData.mailingStreet && (
                    <div>
                      <span className="font-medium">Mailing Address:</span>
                      <div className="pl-4">
                        {carrierData.mailingStreet}
                        <br />
                        {carrierData.mailingCity}, {carrierData.mailingState} {carrierData.mailingZipcode}
                        <br />
                        {carrierData.mailingCountry}
                      </div>
                    </div>
                  )}
                  {carrierData.telephone && (
                    <div>
                      <span className="font-medium">Phone:</span> {carrierData.telephone}
                    </div>
                  )}
                  {carrierData.email && (
                    <div>
                      <span className="font-medium">Email:</span> {carrierData.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Fleet Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Total Drivers:</span> {carrierData.totalDrivers || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Total Power Units:</span> {carrierData.totalPowerUnits || "0"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Safety Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Safety Rating:</span> {carrierData.safetyRating || "Not rated"}
                  </div>
                  {carrierData.safetyRatingDate && (
                    <div>
                      <span className="font-medium">Safety Rating Date:</span> {carrierData.safetyRatingDate}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Total Crashes:</span> {carrierData.crashTotal || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Fatal Crashes:</span> {carrierData.fatalCrash || "0"}
                  </div>
                  <div>
                    <span className="font-medium">Injury Crashes:</span> {carrierData.injCrash || "0"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Insurance Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">BIPD Insurance Required:</span>{" "}
                  {carrierData.bipdInsuranceRequired === "Y" ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">BIPD Insurance On File:</span>{" "}
                  {carrierData.bipdInsuranceOnFile === "Y" ? "Yes" : "No"}
                </div>
                {carrierData.bipdRequiredAmount && (
                  <div>
                    <span className="font-medium">BIPD Required Amount:</span> ${carrierData.bipdRequiredAmount}K
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="font-medium">Cargo Insurance Required:</span>{" "}
                  {carrierData.cargoInsuranceRequired === "Y" ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Cargo Insurance On File:</span>{" "}
                  {carrierData.cargoInsuranceOnFile === "Y" ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cargo">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : detailsData.cargo ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Cargo Carried</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleViewMode("cargo")}
                      className="flex items-center gap-1"
                    >
                      {viewMode.cargo === "formatted" ? (
                        <>
                          <Code className="h-4 w-4" />
                          <span>View Raw JSON</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>View Formatted</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshTabData} className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {viewMode.cargo === "formatted" ? (
                  // Formatted view
                  <>
                    {getCleanCargoData().length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cargo Description</TableHead>
                            <TableHead>ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCleanCargoData().map((cargo, index) => (
                            <TableRow key={index}>
                              <TableCell>{cargo.description}</TableCell>
                              <TableCell>{cargo.id}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No cargo information available</p>
                    )}
                  </>
                ) : (
                  // Raw JSON view
                  <JsonViewer data={detailsData.cargo} />
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <Button onClick={() => setActiveTab("cargo")}>Load Cargo Information</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="operations">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : detailsData.operations ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Operation Classification</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleViewMode("operations")}
                      className="flex items-center gap-1"
                    >
                      {viewMode.operations === "formatted" ? (
                        <>
                          <Code className="h-4 w-4" />
                          <span>View Raw JSON</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>View Formatted</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshTabData} className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {viewMode.operations === "formatted" ? (
                  // Formatted view
                  <>
                    {getCleanOperationsData().length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation Description</TableHead>
                            <TableHead>ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCleanOperationsData().map((op, index) => (
                            <TableRow key={index}>
                              <TableCell>{op.description}</TableCell>
                              <TableCell>{op.id}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No operation classification information available</p>
                    )}
                  </>
                ) : (
                  // Raw JSON view
                  <JsonViewer data={detailsData.operations} />
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <Button onClick={() => setActiveTab("operations")}>Load Operation Information</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="authority">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : detailsData.authority ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Authority Information</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleViewMode("authority")}
                      className="flex items-center gap-1"
                    >
                      {viewMode.authority === "formatted" ? (
                        <>
                          <Code className="h-4 w-4" />
                          <span>View Raw JSON</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>View Formatted</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshTabData} className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {viewMode.authority === "formatted" ? (
                  // Formatted view
                  <>
                    {getCleanAuthorityData().length > 0 ? (
                      <div className="space-y-4">
                        {getCleanAuthorityData().map((auth, index) => (
                          <div key={index} className="border rounded p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Authority Type:</span> {auth.type}
                              </div>
                              <div>
                                <span className="font-medium">Docket Number:</span> {auth.docketNumber}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> {auth.status}
                              </div>
                              <div>
                                <span className="font-medium">Application Status:</span> {auth.applicationStatus}
                              </div>
                              {auth.effectiveDate !== "N/A" && (
                                <div>
                                  <span className="font-medium">Effective Date:</span> {auth.effectiveDate}
                                </div>
                              )}
                              {auth.applicationDate !== "N/A" && (
                                <div>
                                  <span className="font-medium">Application Date:</span> {auth.applicationDate}
                                </div>
                              )}
                            </div>
                            <Separator className="my-2" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Insurance Required:</span> {auth.insuranceRequired}
                              </div>
                              <div>
                                <span className="font-medium">BIPD Required:</span> {auth.bipdRequired}
                              </div>
                              <div>
                                <span className="font-medium">Cargo Required:</span> {auth.cargoRequired}
                              </div>
                              <div>
                                <span className="font-medium">Bond Required:</span> {auth.bondRequired}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No authority information available</p>
                    )}
                  </>
                ) : (
                  // Raw JSON view
                  <JsonViewer data={detailsData.authority} />
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <Button onClick={() => setActiveTab("authority")}>Load Authority Information</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dockets">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : detailsData.dockets ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Docket Numbers</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleViewMode("dockets")}
                      className="flex items-center gap-1"
                    >
                      {viewMode.dockets === "formatted" ? (
                        <>
                          <Code className="h-4 w-4" />
                          <span>View Raw JSON</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>View Formatted</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshTabData} className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {viewMode.dockets === "formatted" ? (
                  // Formatted view
                  <>
                    {getCleanDocketData().length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Docket Number</TableHead>
                            <TableHead>Prefix</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCleanDocketData().map((docket, index) => (
                            <TableRow key={index}>
                              <TableCell>{docket.docketNumber}</TableCell>
                              <TableCell>{docket.prefix}</TableCell>
                              <TableCell>{docket.type}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No docket information available</p>
                    )}
                  </>
                ) : (
                  // Raw JSON view
                  <JsonViewer data={detailsData.dockets} />
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <Button onClick={() => setActiveTab("dockets")}>Load Docket Information</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="oos">
            {loading ? (
              <div className="flex justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : detailsData.oos ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Out of Service Information</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleViewMode("oos")}
                      className="flex items-center gap-1"
                    >
                      {viewMode.oos === "formatted" ? (
                        <>
                          <Code className="h-4 w-4" />
                          <span>View Raw JSON</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>View Formatted</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshTabData} className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>

                {viewMode.oos === "formatted" ? (
                  // Formatted view
                  <>
                    {getCleanOOSData() ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>OOS Date</TableHead>
                            <TableHead>OOS Reason</TableHead>
                            <TableHead>OOS Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{getCleanOOSData()?.date}</TableCell>
                            <TableCell>{getCleanOOSData()?.reason}</TableCell>
                            <TableCell>{getCleanOOSData()?.type}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground">No out of service information available</p>
                    )}
                  </>
                ) : (
                  // Raw JSON view
                  <JsonViewer data={detailsData.oos} />
                )}
              </div>
            ) : (
              <div className="text-center p-4">
                <Button onClick={() => setActiveTab("oos")}>Load Out of Service Information</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-2">API Links</h4>
              {data._links ? (
                <div className="space-y-2 text-sm">
                  {Object.entries(data._links).map(([key, value]: [string, any]) => (
                    <div key={key} className="p-2 border rounded">
                      <div>
                        <span className="font-medium">{key}:</span> {value.href}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No links available</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Raw API Response</h3>
              <JsonViewer data={data} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
