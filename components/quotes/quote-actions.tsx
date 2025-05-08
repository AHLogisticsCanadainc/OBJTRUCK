"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import type { Quote } from "@/types/quotes"
import { MoreHorizontal, FileText, Edit, Copy, Trash2, Clock, CheckCircle, XCircle, Calendar } from "lucide-react"

interface QuoteActionsProps {
  quote: Quote
  onView: (quote: Quote) => void
  onEdit?: (quote: Quote) => void
  onUpdateStatus?: (id: string, status: string) => void
  onDuplicate: (quote: Quote) => void
  onDelete: (id: string) => void
}

export function QuoteActions({ quote, onView, onEdit, onUpdateStatus, onDuplicate, onDelete }: QuoteActionsProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={handleClick}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Quote Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onView(quote)
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onEdit(quote)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate(quote)
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Quote
        </DropdownMenuItem>

        {onUpdateStatus && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Clock className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateStatus(quote.id, "Pending")
                }}
                disabled={quote.status === "Pending"}
              >
                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateStatus(quote.id, "Approved")
                }}
                disabled={quote.status === "Approved"}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Approved
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateStatus(quote.id, "Rejected")
                }}
                disabled={quote.status === "Rejected"}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Rejected
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdateStatus(quote.id, "Expired")
                }}
                disabled={quote.status === "Expired"}
              >
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Expired
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDelete(quote.id)
          }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Quote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
