"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import type { Quote } from "@/types/quotes"

interface DeleteQuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  quote: Quote | null
}

export function DeleteQuoteDialog({ open, onOpenChange, onConfirm, quote }: DeleteQuoteDialogProps) {
  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Quote
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete quote {quote.reference || quote.id.substring(0, 8)}? This action cannot be
            undone and will permanently delete the quote and all its options.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Warning:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>This will permanently delete the quote</li>
              <li>All quote options will be deleted</li>
              <li>Any associated data will be lost</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
