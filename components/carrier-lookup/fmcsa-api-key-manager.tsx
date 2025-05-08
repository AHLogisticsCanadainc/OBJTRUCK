"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Key, Save, Trash2, AlertTriangle, CheckCircle, ExternalLink, Lock } from "lucide-react"
import { supabase } from "@/lib/database"

export function FmcsaApiKeyManager() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [inputKey, setInputKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [useDbKey, setUseDbKey] = useLocalStorage<boolean>("use-db-api-key", true)
  const [isLoading, setIsLoading] = useState(false)

  // Effect to fetch the API key from Supabase when the component mounts
  // and useDbKey is true
  useEffect(() => {
    const fetchApiKey = async () => {
      // First check localStorage directly
      const storedKey = localStorage.getItem("fmcsa-api-key")
      if (storedKey) {
        console.log("Using API key from localStorage")
        setApiKey(storedKey)
        return
      }

      if (useDbKey) {
        setIsLoading(true)
        try {
          // Fetch from database
          const { data, error } = await supabase.from("api_keys").select("api_key").eq("id", 6).eq("is_active", true)

          if (error) {
            console.error("Error fetching API key:", error)
            return
          }

          // Check if we got any results
          if (!data || data.length === 0) {
            console.log("No active API key found in database with ID 6")
            setApiKey(null)
            return
          }

          // Use the first result
          const apiKeyRecord = data[0]
          if (apiKeyRecord.api_key) {
            console.log("Successfully retrieved API key from database")
            // Store as plain string, not JSON stringified
            localStorage.setItem("fmcsa-api-key", apiKeyRecord.api_key)
            setApiKey(apiKeyRecord.api_key)
          } else {
            console.log("API key record exists but has no value")
            setApiKey(null)
          }
        } catch (err) {
          console.error("Error in fetchApiKey:", err)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchApiKey()
  }, [useDbKey])

  const handleSaveKey = async () => {
    if (!inputKey.trim()) return

    setIsLoading(true)

    try {
      // Clean the input key (remove any whitespace)
      const cleanedKey = inputKey.trim()

      // Save to localStorage as a plain string
      localStorage.setItem("fmcsa-api-key", cleanedKey)
      setApiKey(cleanedKey)

      // If using DB key, also save to Supabase
      if (useDbKey) {
        const { error } = await supabase.from("api_keys").upsert({
          id: 6,
          api_key: cleanedKey,
          is_active: true,
        })

        if (error) {
          throw new Error(`Failed to update API key in database: ${error.message}`)
        }
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Clear the input field after successful save
      setInputKey("")
    } catch (err) {
      console.error("Error saving API key:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveKey = async () => {
    setIsLoading(true)

    try {
      // Remove from localStorage
      localStorage.removeItem("fmcsa-api-key")
      setApiKey(null)
      setInputKey("")
      setShowKey(false)

      // If using DB key, also update Supabase
      if (useDbKey) {
        const { error } = await supabase.from("api_keys").upsert({
          id: 6,
          api_key: null,
          is_active: false,
        })

        if (error) {
          throw new Error(`Failed to remove API key from database: ${error.message}`)
        }
      }
    } catch (err) {
      console.error("Error removing API key:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">FMCSA API Key Configuration</CardTitle>
        </div>
        <CardDescription>
          {useDbKey
            ? "Using API key from database (ID: 6)"
            : "Enter your FMCSA API key to access carrier data. The key will be stored in your browser."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : apiKey ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-600 dark:text-green-400">API Key Configured</AlertTitle>
              <AlertDescription className="text-green-600/90 dark:text-green-400/90">
                Your FMCSA API key is saved and will be used for carrier lookups.
                {useDbKey && " This key is stored in the database."}
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-3">
              <Input type={showKey ? "text" : "password"} value={apiKey} readOnly className="font-mono" />
              <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
                {showKey ? "Hide" : "Show"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleRemoveKey}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No API Key Configured</AlertTitle>
              <AlertDescription>
                You need an FMCSA API key to access carrier data.
                {useDbKey ? " No active API key found in the database." : " Enter your key below."}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3">
              <Input
                type="password"
                placeholder={useDbKey ? "Enter API key to save to database" : "Enter your FMCSA API key"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="font-mono"
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleSaveKey} disabled={!inputKey.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Key
                </Button>
                <a
                  href="https://portal.fmcsa.dot.gov/Developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  Get an API key
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        )}
        {saveSuccess && (
          <div className="mt-3 text-sm text-green-600 dark:text-green-400">
            API key saved successfully!
            {useDbKey && " Key has been stored in the database."}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        {useDbKey ? (
          <div className="flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            API key is stored in the database with ID: 6
          </div>
        ) : (
          "Your API key is stored locally in your browser and is not sent to our servers."
        )}
      </CardFooter>
    </Card>
  )
}
