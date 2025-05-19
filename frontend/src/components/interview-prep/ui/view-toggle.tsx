"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ViewMode } from "../../../store/interview-prep-store"

interface ViewToggleProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  const handleToggle = (checked: boolean) => {
    onChange(checked ? "deep" : "quick")
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="view-mode" className="text-sm font-medium">
        Quick View
      </Label>
      <Switch id="view-mode" checked={viewMode === "deep"} onCheckedChange={handleToggle} />
      <Label htmlFor="view-mode" className="text-sm font-medium">
        Deep Dive
      </Label>
    </div>
  )
}
