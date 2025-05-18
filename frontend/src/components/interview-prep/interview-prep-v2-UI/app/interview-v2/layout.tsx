import type React from "react"
import { Suspense } from "react"
import SidebarNavigation from "@/components/interview-prep/ui/sidebar-navigation"

export default function InterviewPrepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Interview Prep v2</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="/interview-v2/step/0" className="text-sm font-medium hover:text-blue-600">
                  Start
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium hover:text-blue-600">
                  Help
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="flex">
        <SidebarNavigation />
        <main className="flex-1 py-8 px-6">
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>{children}</Suspense>
        </main>
      </div>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Interview Prep v2 | All Rights Reserved
        </div>
      </footer>
    </div>
  )
}
