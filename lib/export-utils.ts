/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (if not provided, will use object keys)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: { key: keyof T; label: string }[],
): string {
  if (!data || !data.length) return ""

  // If headers are not provided, use the keys from the first object
  const keys = headers ? headers.map((h) => h.key) : (Object.keys(data[0]) as (keyof T)[])
  const headerLabels = headers ? headers.map((h) => h.label) : (keys as string[])

  // Create CSV header row
  let csv = headerLabels.map((label) => `"${label}"`).join(",") + "\n"

  // Add data rows
  data.forEach((item) => {
    const row = keys.map((key) => {
      const value = item[key]
      // Handle different data types
      if (value === null || value === undefined) return '""'
      if (typeof value === "object") {
        if (value instanceof Date) {
          return `"${value.toISOString()}"`
        }
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csv += row.join(",") + "\n"
  })

  return csv
}

/**
 * Triggers a download of a CSV file
 * @param csvContent CSV content as string
 * @param filename Name of the file to download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Formats a date as YYYY-MM-DD
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}
