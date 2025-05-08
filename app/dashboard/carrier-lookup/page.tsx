"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, AlertCircle } from "lucide-react"
import { useCarrierLookup } from "@/hooks/use-carrier-lookup"
import { CarrierSearchResults } from "@/components/carrier-lookup/carrier-search-results"
import { FmcsaApiKeyManager } from "@/components/carrier-lookup/fmcsa-api-key-manager"
import { ApiKeySourceToggle } from "@/components/carrier-lookup/api-key-source-toggle"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ProcessingIndicator } from "@/components/carrier-lookup/processing-indicator"

export default function CarrierLookupPage() {
  const {
    searchCarrier,
    loading,
    error,
    results,
    apiKey,
    refreshApiKey,
    isSaving,
    processingProgress,
    totalToProcess,
    cancelProcessing,
  } = useCarrierLookup()

  const [searchType, setSearchType] = useState<"dot" | "mc" | "name">("dot")
  const [searchValue, setSearchValue] = useState("")
  const [isLargeResultSet, setIsLargeResultSet] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  // Add a state variable for the result size
  const [resultSize, setResultSize] = useState<number>(25)

  // Update the handleSearch function to include the result size
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      return
    }

    setIsLargeResultSet(false)
    setTotalResults(0)

    const params: any = {}

    if (searchType === "dot") {
      params.dotNumber = searchValue.trim()
    } else if (searchType === "mc") {
      params.mcNumber = searchValue.trim()
    } else if (searchType === "name") {
      params.name = searchValue.trim()
      params.size = resultSize // Add the user-selected size
      // For name searches, we might get a lot of results
      setIsLargeResultSet(true)
    }

    const data = await searchCarrier(params)

    if (data?.content && Array.isArray(data.content)) {
      setTotalResults(data.content.length)
      setIsLargeResultSet(data.content.length > 20)
    }
  }

  // Only show the processing indicator when actually processing carriers
  const showProcessingIndicator = isSaving && processingProgress > 0 && totalToProcess > 0

  return (
    <div className="container mx-auto py-6 space-y-6 relative">
      <h1 className="text-3xl font-bold">Carrier Lookup</h1>

      {/* Processing indicator in top left */}
      {showProcessingIndicator && (
        <ProcessingIndicator
          currentCount={processingProgress}
          totalCount={totalToProcess}
          onCancel={cancelProcessing}
        />
      )}

      {/* Full-screen loading overlay for large result sets */}
      {loading && isLargeResultSet && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold">
              Processing {totalResults > 0 ? totalResults : "multiple"} carriers
            </h2>
            <p className="text-muted-foreground">
              Searching and saving carrier data to the database. This may take a moment for large result sets.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search for Carriers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <RadioGroup
                defaultValue="dot"
                value={searchType}
                onValueChange={(value) => setSearchType(value as "dot" | "mc" | "name")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dot" id="dot" />
                  <Label htmlFor="dot">DOT Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mc" id="mc" />
                  <Label htmlFor="mc">MC Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="name" id="name" />
                  <Label htmlFor="name">Company Name</Label>
                </div>
              </RadioGroup>
            </div>

            {searchType === "name" && (
              <div className="mt-2">
                <Label htmlFor="result-size">Results per page</Label>
                <select
                  id="result-size"
                  value={resultSize}
                  onChange={(e) => setResultSize(Number(e.target.value))}
                  className="ml-2 p-1 border rounded"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
                <span className="ml-2 text-sm text-muted-foreground">
                  Larger result sets may take longer to process
                </span>
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type={searchType === "name" ? "text" : "number"}
                  placeholder={
                    searchType === "dot"
                      ? "Enter DOT Number"
                      : searchType === "mc"
                        ? "Enter MC Number"
                        : "Enter Company Name"
                  }
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !searchValue.trim()}>
                {loading && !isLargeResultSet ? (
                  <LoadingSpinner className="mr-2" size="sm" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            {!apiKey && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  FMCSA API key is not configured. Please add your API key in the settings below.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">API Key Settings</h3>
              <div className="space-y-4">
                <ApiKeySourceToggle onToggle={refreshApiKey} />
                <FmcsaApiKeyManager onSave={refreshApiKey} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !isLargeResultSet && (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && results && <CarrierSearchResults data={results} />}
    </div>
  )
}
