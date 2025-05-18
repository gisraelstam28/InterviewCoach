"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  HomeIcon,
  BuildingIcon,
  UsersIcon,
  BriefcaseIcon,
  CheckSquareIcon,
  StarIcon,
  CodeIcon,
  MessageSquareIcon,
  InfoIcon,
  CalendarIcon,
  DollarSignIcon,
  ShareIcon,
} from "lucide-react"

const steps = [
  { id: 0, name: "Welcome & Overview", icon: HomeIcon },
  { id: 1, name: "Company & Industry", icon: BuildingIcon },
  { id: 2, name: "Department Context", icon: UsersIcon },
  { id: 3, name: "Role Success Factors", icon: BriefcaseIcon },
  { id: 4, name: "Candidate Fit Matrix", icon: CheckSquareIcon },
  { id: 5, name: "STAR Story Bank", icon: StarIcon },
  { id: 6, name: "Technical Case Prep", icon: CodeIcon },
  { id: 7, name: "Mock Interview", icon: MessageSquareIcon },
  { id: 8, name: "Insider Cheatsheet", icon: InfoIcon },
  { id: 9, name: "30-60-90 Day Plan", icon: CalendarIcon },
  { id: 10, name: "Offer Negotiation", icon: DollarSignIcon },
  { id: 11, name: "Export & Share", icon: ShareIcon, path: "/interview-v2/export" },
]

export default function SidebarNavigation() {
  const pathname = usePathname()
  const currentStepId = pathname.includes("/export") ? 11 : Number.parseInt(pathname.split("/").pop() || "0")

  return (
    <div className="w-64 bg-white border-r h-full overflow-auto py-6 px-3">
      <div className="mb-6 px-3">
        <h2 className="font-bold text-lg">Interview Prep Guide</h2>
        <p className="text-sm text-gray-500 mt-1">Follow these steps to prepare</p>
      </div>

      <nav>
        <ul className="space-y-1">
          {steps.map((step) => {
            const isActive = step.id === currentStepId
            const isPast = step.id < currentStepId
            const isFuture = step.id > currentStepId

            const stepPath = step.path || `/interview-v2/step/${step.id}`

            return (
              <li key={step.id}>
                <Link
                  href={stepPath}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive && "bg-blue-50 text-blue-700 font-medium",
                    isPast && "text-gray-700 hover:bg-gray-100",
                    isFuture && "text-gray-400 hover:bg-gray-50",
                  )}
                >
                  <step.icon
                    className={cn(
                      "h-5 w-5",
                      isActive && "text-blue-700",
                      isPast && "text-gray-700",
                      isFuture && "text-gray-400",
                    )}
                  />
                  <span>{step.name}</span>

                  {isPast && <span className="ml-auto flex h-2 w-2 rounded-full bg-green-400"></span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
