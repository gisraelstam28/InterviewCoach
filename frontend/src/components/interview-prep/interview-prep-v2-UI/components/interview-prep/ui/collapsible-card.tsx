"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleCardProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export default function CollapsibleCard({ title, children, defaultOpen = false, className }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium">{title}</h3>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="p-4 border-t">{children}</div>
      </div>
    </div>
  )
}
