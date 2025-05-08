"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react"

interface JsonViewerProps {
  data: any
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    root: true,
  })

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleSection = (path: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const renderValue = (value: any, path = "root", depth = 0): JSX.Element => {
    if (value === null) return <span className="text-gray-500">null</span>
    if (value === undefined) return <span className="text-gray-500">undefined</span>

    if (typeof value === "boolean") {
      return <span className="text-yellow-600">{value.toString()}</span>
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-500">[]</span>

      const isExpanded = expandedSections[path] !== false // Default to expanded if not set

      return (
        <div>
          <div
            className="flex items-center cursor-pointer hover:bg-muted/50 rounded px-1"
            onClick={() => toggleSection(path)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <span className="text-purple-600">Array({value.length})</span>
          </div>
          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 dark:border-gray-700">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500">{index}: </span>
                  {renderValue(item, `${path}.${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object") {
      const keys = Object.keys(value)
      if (keys.length === 0) return <span className="text-gray-500">{"{}"}</span>

      const isExpanded = expandedSections[path] !== false // Default to expanded if not set

      return (
        <div>
          <div
            className="flex items-center cursor-pointer hover:bg-muted/50 rounded px-1"
            onClick={() => toggleSection(path)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <span className="text-purple-600">Object({keys.length})</span>
          </div>
          {isExpanded && (
            <div className="pl-4 border-l border-gray-300 dark:border-gray-700">
              {keys.map((key) => (
                <div key={key} className="my-1">
                  <span className="text-red-500">"{key}"</span>: {renderValue(value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">JSON Response</CardTitle>
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 p-4 rounded-md overflow-auto max-h-[600px] font-mono text-sm">
          {renderValue(data)}
        </div>
      </CardContent>
    </Card>
  )
}
