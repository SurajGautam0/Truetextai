"use client"

import type React from "react"
import AdminGuard from "@/components/admin-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    </AdminGuard>
  )
}
