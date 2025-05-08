"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { LoadEntry, Client, Carrier, ITCEntry, Vendor } from "./types"
import { formatCurrency } from "./calculation-logic"
import { Download, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LoadsTableProps {
  loads: LoadEntry[]
  itcs: ITCEntry[]
  clients: Client[]
  carriers: Carrier[]
  vendors?: Vendor[] // Add vendors as optional prop
  onDeleteLoad: (id: string) => void
}

export function LoadsTable({ loads, itcs, clients, carriers, vendors = [], onDeleteLoad }: LoadsTableProps) {
  // Change default sort field from "deliveryDate" to "loadNumber"
  const [sortField, setSortField] = useState<keyof LoadEntry>("loadNumber")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "Unknown Client"
  }

  const getCarrierName = (carrierId: string) => {
    const carrier = carriers.find((c) => c.id === carrierId)
    return carrier ? carrier.name : "Unknown Carrier"
  }

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return null
    const vendor = vendors.find((v) => v.id === vendorId)
    return vendor ? vendor.name : null
  }

  const sortedLoads = [...loads].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]

    // Handle date comparison
    if (sortField === "deliveryDate") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    }

    // Handle numeric comparison for loadNumber
    if (sortField === "loadNumber") {
      // Convert to numbers for proper numeric sorting
      const aNum = Number.parseInt(String(aValue).replace(/\D/g, "")) || 0
      const bNum = Number.parseInt(String(bValue).replace(/\D/g, "")) || 0
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const handleSort = (field: keyof LoadEntry) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Format date with time
  const formatDate = (date?: Date) => {
    if (!date) return "-"

    const d = new Date(date)
    if (isNaN(d.getTime())) return "-"

    // Format as MM/DD/YYYY HH:MM
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")

    return `${month}/${day}/${year} ${hours}:${minutes}`
  }

  // Calculate totals
  const totalClientBase = loads.reduce((sum, load) => sum + load.clientBaseAmount, 0)
  const totalClientHST = loads.reduce((sum, load) => sum + load.clientHST, 0)
  const totalClientTotal = loads.reduce((sum, load) => sum + load.clientTotal, 0)
  const totalCarrierAllIn = loads.reduce((sum, load) => sum + load.carrierAllInAmount, 0)
  const totalCarrierPreTax = loads.reduce((sum, load) => sum + load.carrierPreTax, 0)
  const totalCarrierHST = loads.reduce((sum, load) => sum + load.carrierHST, 0)
  const totalITCs = itcs.reduce((sum, itc) => sum + itc.taxAmount, 0)

  // Calculate HST payable with all ITCs
  const totalHSTPayable = totalClientHST - totalCarrierHST - totalITCs

  const totalProfit = loads.reduce((sum, load) => sum + load.profit, 0)

  const exportToCSV = () => {
    if (loads.length === 0) {
      alert("No data to export")
      return
    }

    const headers = [
      "Load Number",
      "Delivery Date & Time",
      "Client",
      "Carrier",
      "Tax Province",
      "Delivery Province",
      "Client Base",
      "Client HST",
      "Client Total",
      "Carrier All-In",
      "Carrier Pre-Tax",
      "Carrier HST",
      "HST Payable",
      "Profit",
    ]

    const loadRows = sortedLoads.map((load) => [
      load.loadNumber,
      formatDate(load.deliveryDate),
      getClientName(load.clientId),
      getCarrierName(load.carrierId),
      load.province,
      load.deliveryProvince || load.province,
      load.clientBaseAmount.toFixed(2),
      load.clientHST.toFixed(2),
      load.clientTotal.toFixed(2),
      load.carrierAllInAmount.toFixed(2),
      load.carrierPreTax.toFixed(2),
      load.carrierHST.toFixed(2),
      load.hstPayable.toFixed(2),
      load.profit.toFixed(2),
    ])

    // Add a blank row as separator
    const blankRow = Array(headers.length).fill("")

    // Add ITC section header
    const itcHeaderRow = ["Additional ITCs", "", "", "", "", "", "", "", "", "", "", "", "", ""]

    // Add ITC headers
    const itcHeaders = [
      "ITC #",
      "Description",
      "Paid To",
      "Category",
      "Invoice Date",
      "HST Number",
      "Payment Date",
      "Amount Before Tax",
      "Tax Amount (ITC)",
      "",
      "",
      "",
      "",
      "",
    ]

    // Add ITC rows
    const itcRows = itcs.map((itc, index) => [
      `${index + 1}`,
      itc.description,
      itc.vendorId ? `${itc.paidTo} (Vendor)` : itc.paidTo,
      itc.category || "",
      formatDate(itc.invoiceDate),
      itc.hstNumber || "",
      formatDate(itc.date),
      itc.amountBeforeTax.toFixed(2),
      itc.taxAmount.toFixed(2),
      "",
      "",
      "",
      "",
      "",
    ])

    // Add ITC totals
    const itcTotalsRow = [
      "ITC TOTALS",
      "",
      "",
      "",
      "",
      "",
      "",
      itcs.reduce((sum, itc) => sum + itc.amountBeforeTax, 0).toFixed(2),
      totalITCs.toFixed(2),
      "",
      "",
      "",
      "",
      "",
    ]

    // Add totals row with ITCs included
    const totalsRow = [
      "TOTALS",
      "",
      "",
      "",
      "",
      "",
      totalClientBase.toFixed(2),
      totalClientHST.toFixed(2),
      totalClientTotal.toFixed(2),
      totalCarrierAllIn.toFixed(2),
      totalCarrierPreTax.toFixed(2),
      totalCarrierHST.toFixed(2),
      totalHSTPayable.toFixed(2),
      totalProfit.toFixed(2),
    ]

    const csvContent = [
      headers.join(","),
      ...loadRows.map((row) => row.join(",")),
      blankRow.join(","),
      itcHeaderRow.join(","),
      itcHeaders.join(","),
      ...itcRows.map((row) => row.join(",")),
      itcTotalsRow.join(","),
      blankRow.join(","),
      totalsRow.join(","),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `tax-calculator-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Loads ({loads.length})</h3>
        <Button onClick={exportToCSV} disabled={loads.length === 0} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {loads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No loads added yet. Add your first load above.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("loadNumber")}>
                  Load # {sortField === "loadNumber" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("deliveryDate")}>
                  Date & Time {sortField === "deliveryDate" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Tax Province</TableHead>
                <TableHead>Delivery Province</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("clientBaseAmount")}>
                  Client Base {sortField === "clientBaseAmount" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-right">Client HST</TableHead>
                <TableHead className="text-right">Client Total</TableHead>
                <TableHead className="text-right">Carrier All-In</TableHead>
                <TableHead className="text-right">Carrier HST</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("profit")}>
                  Profit {sortField === "profit" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoads.map((load) => (
                <TableRow key={load.id}>
                  <TableCell>{load.loadNumber}</TableCell>
                  <TableCell>{formatDate(load.deliveryDate)}</TableCell>
                  <TableCell>{getClientName(load.clientId)}</TableCell>
                  <TableCell>{getCarrierName(load.carrierId)}</TableCell>
                  <TableCell>{load.province}</TableCell>
                  <TableCell>{load.deliveryProvince || load.province}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.clientBaseAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.clientHST)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.clientTotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.carrierAllInAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.carrierHST)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(load.profit)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteLoad(load.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* Subtotals row before ITCs */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={6} className="text-right font-medium">
                  Subtotals:
                </TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalClientBase)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalClientHST)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalClientTotal)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalCarrierAllIn)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalCarrierHST)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(totalProfit)}</TableCell>
                <TableCell></TableCell>
              </TableRow>

              {/* ITC section */}
              {itcs.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={13} className="pt-6 pb-2">
                      <h4 className="font-semibold">Additional Input Tax Credits (ITCs)</h4>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/10 text-sm font-medium">
                    <TableCell>#</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Paid To</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Invoice Date</TableCell>
                    <TableCell>HST Number</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell className="text-right">Before Tax</TableCell>
                    <TableCell className="text-right">Tax Amount (ITC)</TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                  {itcs.map((itc, index) => (
                    <TableRow key={itc.id} className="bg-muted/10">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{itc.description}</TableCell>
                      <TableCell>
                        {itc.vendorId ? (
                          <span className="flex items-center">
                            {itc.paidTo}
                            <span className="ml-1 text-xs text-muted-foreground">(Vendor)</span>
                          </span>
                        ) : (
                          itc.paidTo
                        )}
                      </TableCell>
                      <TableCell>{itc.category || "-"}</TableCell>
                      <TableCell>{formatDate(itc.invoiceDate)}</TableCell>
                      <TableCell>{itc.hstNumber || "-"}</TableCell>
                      <TableCell>{formatDate(itc.date)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(itc.amountBeforeTax)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(itc.taxAmount)}</TableCell>
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/20">
                    <TableCell colSpan={7} className="text-right font-medium">
                      Total Additional ITCs:
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(itcs.reduce((sum, itc) => sum + itc.amountBeforeTax, 0))}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(totalITCs)}</TableCell>
                    <TableCell colSpan={4}></TableCell>
                  </TableRow>
                </>
              )}

              {/* Final totals row with ITCs included */}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={6} className="text-right">
                  FINAL TOTALS:
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totalClientBase)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalClientHST)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalClientTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCarrierAllIn)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCarrierHST)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalProfit)}</TableCell>
                <TableCell></TableCell>
              </TableRow>

              {/* HST Payable row */}
              <TableRow className="font-bold bg-muted/70">
                <TableCell colSpan={10} className="text-right">
                  HST PAYABLE (after ITCs):
                </TableCell>
                <TableCell colSpan={2} className="text-right">
                  {formatCurrency(totalHSTPayable)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
