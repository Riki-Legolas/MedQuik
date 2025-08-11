"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("user" | "admin")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (allowedRoles && !allowedRoles.includes(user?.role || "user")) {
      router.push(user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
    }
  }, [isAuthenticated, router, user, allowedRoles])

  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(user?.role || "user"))) {
    return null
  }

  return <>{children}</>
}
