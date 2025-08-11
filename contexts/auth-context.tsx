"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"
import { useRealTime } from "./real-time-context"

type User = {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  status?: "pending" | "approved" | "rejected"
  phone?: string
  registeredOn?: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Omit<User, "id" | "role" | "status"> & { password: string }) => Promise<boolean>
  logout: () => void
  pendingUsers: User[]
  approveUser: (userId: string) => void
  rejectUser: (userId: string) => void
  refreshPendingUsers: () => void
}

// Mock user database
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@medquik.com",
    name: "Admin User",
    password: "admin123",
    role: "admin" as const,
    status: "approved" as const,
  },
  {
    id: "2",
    email: "user@medquik.com",
    name: "Regular User",
    password: "user123",
    role: "user" as const,
    status: "approved" as const,
  },
]

// Mock pending users
let PENDING_USERS: (User & { password: string })[] = []

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { subscribeToEvent, publishEvent } = useRealTime()

  // Memoize the refreshPendingUsers function to prevent it from changing on every render
  const refreshPendingUsers = useCallback(() => {
    // In a real app, this would be an API call
    setPendingUsers([...PENDING_USERS])
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("auth-token")
      const storedUser = localStorage.getItem("medquik-user")

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("medquik-user")
          Cookies.remove("auth-token")
          Cookies.remove("user-role")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
    refreshPendingUsers()
  }, [refreshPendingUsers])

  // Subscribe to real-time user registration events
  useEffect(() => {
    if (!subscribeToEvent) return

    // Create stable callback functions that don't change on every render
    const handleUserRegistration = (data: any) => {
      refreshPendingUsers()

      // Notify admin if they're logged in
      if (user?.role === "admin") {
        toast({
          title: "New User Registration",
          description: `${data.name} has registered and is awaiting approval.`,
        })
      }
    }

    const handleUserApproval = (data: any) => {
      // If this is the user that was approved, notify them
      if (user?.id === data.userId) {
        toast({
          title: "Account Approved",
          description: "Your account has been approved. You can now use all features of MedQuik.",
        })
      }
      refreshPendingUsers()
    }

    const unsubscribe = subscribeToEvent("user-registration", handleUserRegistration)
    const unsubscribeApproval = subscribeToEvent("user-approval", handleUserApproval)

    return () => {
      unsubscribe()
      unsubscribeApproval()
    }
  }, [subscribeToEvent, user, toast, refreshPendingUsers])

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Find user in mock database
      const foundUser = [...MOCK_USERS, ...PENDING_USERS].find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )

      if (foundUser) {
        // Check if user is approved
        if (foundUser.status === "pending") {
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending approval by an administrator. Please try again later.",
            variant: "destructive",
          })
          setIsLoading(false)
          return false
        }

        if (foundUser.status === "rejected") {
          toast({
            title: "Account Rejected",
            description: "Your account registration has been rejected. Please contact support for assistance.",
            variant: "destructive",
          })
          setIsLoading(false)
          return false
        }

        const { password: _, ...userWithoutPassword } = foundUser

        // Set user in state and localStorage
        setUser(userWithoutPassword)
        setIsAuthenticated(true)
        localStorage.setItem("medquik-user", JSON.stringify(userWithoutPassword))

        // Set cookies for middleware authentication
        Cookies.set("auth-token", "authenticated", { expires: 7 })
        Cookies.set("user-role", userWithoutPassword.role, { expires: 7 })

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userWithoutPassword.name}!`,
        })

        setIsLoading(false)
        return true
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }
    },
    [toast],
  )

  const register = useCallback(
    async (userData: Omit<User, "id" | "role" | "status"> & { password: string }): Promise<boolean> => {
      setIsLoading(true)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      const userExists = [...MOCK_USERS, ...PENDING_USERS].some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase(),
      )

      if (userExists) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        })

        setIsLoading(false)
        return false
      }

      // Create new pending user
      const newUser: User & { password: string } = {
        id: `user-${Date.now()}`,
        ...userData,
        role: "user",
        status: "pending",
        registeredOn: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }

      // Add to pending users
      PENDING_USERS.push(newUser)
      refreshPendingUsers()

      // Notify admins via real-time
      publishEvent("user-registration", {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      })

      toast({
        title: "Registration Successful",
        description: "Your account has been created and is pending approval. You'll be notified once approved.",
      })

      setIsLoading(false)
      return true
    },
    [toast, publishEvent, refreshPendingUsers],
  )

  const approveUser = useCallback(
    (userId: string) => {
      const userIndex = PENDING_USERS.findIndex((u) => u.id === userId)

      if (userIndex !== -1) {
        // Update user status
        PENDING_USERS[userIndex].status = "approved"

        // Add to MOCK_USERS (in a real app, this would update the database)
        MOCK_USERS.push(PENDING_USERS[userIndex])

        // Remove from pending
        PENDING_USERS = PENDING_USERS.filter((u) => u.id !== userId)

        // Update state
        refreshPendingUsers()

        // Notify the user via real-time
        publishEvent("user-approval", {
          userId,
          approvedBy: user?.id,
        })

        toast({
          title: "User Approved",
          description: `User account has been approved and notification sent.`,
        })
      }
    },
    [user, toast, publishEvent, refreshPendingUsers],
  )

  const rejectUser = useCallback(
    (userId: string) => {
      const userIndex = PENDING_USERS.findIndex((u) => u.id === userId)

      if (userIndex !== -1) {
        // Update user status
        PENDING_USERS[userIndex].status = "rejected"

        // Update state
        refreshPendingUsers()

        // Notify the user via real-time
        publishEvent("user-rejection", {
          userId,
          rejectedBy: user?.id,
        })

        toast({
          title: "User Rejected",
          description: `User account has been rejected.`,
          variant: "destructive",
        })
      }
    },
    [user, toast, publishEvent, refreshPendingUsers],
  )

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("medquik-user")
    Cookies.remove("auth-token")
    Cookies.remove("user-role")

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })

    router.push("/login")
  }, [router, toast])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        pendingUsers,
        approveUser,
        rejectUser,
        refreshPendingUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
