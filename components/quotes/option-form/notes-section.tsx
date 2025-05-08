"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { OptionFormState } from "./types"

interface NotesSectionProps {
  option: OptionFormState
  setOption: (option: OptionFormState) => void
}

export function NotesSection({ option, setOption }: NotesSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Notes & Description</h3>
      <Separator className={cn("mb-4", "bg-gray-200 dark:bg-gray-900/50")} />

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe this option"
          value={option.description || ""}
          onChange={(e) => setOption({ ...option, description: e.target.value })}
          className="min-h-[80px] dark:bg-background/80"
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or details"
          value={option.notes || ""}
          onChange={(e) => setOption({ ...option, notes: e.target.value })}
          className="min-h-[80px] dark:bg-background/80"
        />
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="features">Features</Label>
        <Textarea
          id="features"
          placeholder="List of features or amenities"
          value={option.features || ""}
          onChange={(e) => setOption({ ...option, features: e.target.value })}
          className="min-h-[80px] dark:bg-background/80"
        />
      </div>
    </div>
  )
}
