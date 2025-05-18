"use client"

import type React from "react"

import { LockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PremiumGateProps {
  children: React.ReactNode
  isPremiumRequired: boolean
}

export default function PremiumGate({ children, isPremiumRequired }: PremiumGateProps) {
  if (!isPremiumRequired) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="filter grayscale blur-[2px] pointer-events-none">{children}</div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-sm rounded-lg">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
          <LockIcon className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">Unlock this feature and many more by upgrading to our Pro plan.</p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                  Upgrade to Pro
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get unlimited access to all premium features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
