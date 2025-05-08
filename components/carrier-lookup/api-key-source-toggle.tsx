"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { supabase } from "@/lib/database"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeySourceToggle() {
  const [useDbKey, setUseDbKey] = useLocalStorage<boolean>("use-db-api-key", true)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchApiKeyFromDb = async () => {
      if (useDbKey) {
        setLoading(true)
        try {
          // Fetch the API key from Supabase
          const { data, error } = await supabase.from("api_keys").select("api_key").eq("id", 6).eq("is_active", true)

          if (error) {
            throw new Error(`Failed to fetch API key: ${error.message}`)
          }

          // Check if we got any results
          if (!data || data.length === 0) {
            // No API key found, create a new one with null value
            const { error: insertError } = await supabase
              .from("api_keys")
              .upsert({ id: 6, api_key: null, is_active: true })

            if (insertError) {
              throw new Error(`Failed to create API key record: ${insertError.message}`)
            }

            console.log("No active API key found in database. A new record has been created.")
            setLoading(false)
            return
          }

          // Use the first result
          const apiKeyRecord = data[0]
          if (!apiKeyRecord.api_key) {
            console.log("API key exists in database but has no value.")
            setLoading(false)
            return
          }

          // Store the API key in localStorage as a plain string (not JSON stringified)
          localStorage.setItem("fmcsa-api-key", apiKeyRecord.api_key)

          toast({
            title: "API key loaded",
            description: "Successfully fetched API key from database and stored locally",
          })
        } catch (err) {
          console.error("Error fetching API key from database:", err)
          toast({
            variant: "destructive",
            title: "Error",
            description: err instanceof Error ? err.message : "Failed to fetch API key from database",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchApiKeyFromDb()
  }, [useDbKey, toast])

  const handleToggleChange = async (checked: boolean) => {
    setLoading(true)

    try {
      // Save the toggle state
      setUseDbKey(checked)

      if (checked) {
        // Fetch the API key from Supabase
        const { data, error } = await supabase.from("api_keys").select("api_key").eq("id", 6).eq("is_active", true)

        if (error) {
          throw new Error(`Failed to fetch API key: ${error.message}`)
        }

        // Check if we got any results
        if (!data || data.length === 0) {
          // No API key found, create a new one with null value
          const { error: insertError } = await supabase
            .from("api_keys")
            .upsert({ id: 6, api_key: null, is_active: true })

          if (insertError) {
            throw new Error(`Failed to create API key record: ${insertError.message}`)
          }

          throw new Error(
            "No active API key found in database. A new record has been created. Please add your API key.",
          )
        }

        // Use the first result
        const apiKeyRecord = data[0]
        if (!apiKeyRecord.api_key) {
          throw new Error("API key exists in database but has no value. Please add your API key.")
        }

        // Store the API key in localStorage
        localStorage.setItem("fmcsa-api-key", apiKeyRecord.api_key)

        toast({
          title: "Using database API key",
          description: "Successfully fetched API key from database",
        })
      } else {
        // We're switching back to local key, but we don't need to do anything
        // The local key should still be in localStorage if it was set before
        toast({
          title: "Using local API key",
          description: "Switched to locally stored API key",
        })
      }

      // Refresh the page to ensure all components get the updated key
      window.location.reload()
    } catch (err) {
      console.error("Error toggling API key source:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to toggle API key source",
      })

      // Revert the toggle if there was an error
      setUseDbKey(!checked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="api-key-source" className="text-base">
              API Key Source
            </Label>
            <p className="text-sm text-muted-foreground">
              {useDbKey ? "Using API key from database (ID: 6)" : "Using locally stored API key"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {loading && <LoadingSpinner size="sm" />}
            <Switch id="api-key-source" checked={useDbKey} onCheckedChange={handleToggleChange} disabled={loading} />
            <Label htmlFor="api-key-source" className="cursor-pointer">
              {useDbKey ? "Database" : "Local"}
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
