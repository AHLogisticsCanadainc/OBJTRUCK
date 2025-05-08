"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import type { ApiConfig } from "@/hooks/use-ai-chat"

interface ApiKeyManagerProps {
  apiConfig: ApiConfig | null
  onImport: (config: ApiConfig) => void
}

export function ApiKeyManager({ apiConfig, onImport }: ApiKeyManagerProps) {
  const { toast } = useToast()
  const [importError, setImportError] = useState<string | null>(null)

  // Export API keys to a JSON file
  const handleExport = () => {
    if (!apiConfig) {
      toast({
        title: "No API configuration",
        description: "There is no API configuration to export.",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a sanitized version of the config (for security in the filename)
      const sanitizedProvider = apiConfig.provider.replace(/[^a-z0-9]/gi, "_")

      // Create a JSON blob
      const configData = JSON.stringify(apiConfig, null, 2)
      const blob = new Blob([configData], { type: "application/json" })

      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ai_config_${sanitizedProvider}_${new Date().toISOString().split("T")[0]}.json`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your API configuration has been exported.",
      })
    } catch (error) {
      console.error("Error exporting API config:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your API configuration.",
        variant: "destructive",
      })
    }
  }

  // Import API keys from a JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedConfig = JSON.parse(content) as ApiConfig

        // Validate the imported config
        if (!importedConfig.provider || !importedConfig.model) {
          throw new Error("Invalid configuration format")
        }

        // Import the config
        onImport(importedConfig)

        toast({
          title: "Import successful",
          description: `${importedConfig.provider.charAt(0).toUpperCase() + importedConfig.provider.slice(1)} API configuration has been imported.`,
        })

        // Reset the file input
        event.target.value = ""
      } catch (error) {
        console.error("Error importing API config:", error)
        setImportError("The selected file contains invalid configuration data.")

        // Reset the file input
        event.target.value = ""
      }
    }

    reader.onerror = () => {
      setImportError("Error reading the file.")
      // Reset the file input
      event.target.value = ""
    }

    reader.readAsText(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          API Key Backup
        </CardTitle>
        <CardDescription>Export and import your API keys to prevent data loss</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Your API keys are stored in your browser&apos;s local storage. If you clear your browser data or switch
            devices, you may lose access to your configured API keys. Use the options below to back up and restore your
            API configurations.
          </p>
        </div>

        {importError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={handleExport} disabled={!apiConfig} className="w-full" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Configuration
        </Button>

        <div className="relative w-full">
          <input
            type="file"
            id="import-config"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Button asChild className="w-full">
            <label htmlFor="import-config" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Import Configuration
            </label>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
