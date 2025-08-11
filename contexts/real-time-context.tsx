"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types for real-time events
type OrderStatus = "Pending Approval" | "Processing" | "In Transit" | "Delivered" | "Cancelled"

type OrderEvent = {
  type: "order_update" | "order_created" | "order_cancelled"
  orderId: string
  status?: OrderStatus
  message: string
  timestamp: string
}

type InventoryEvent = {
  type: "inventory_update" | "low_stock_alert"
  medicineId: number
  medicineName: string
  currentStock: number
  message: string
  timestamp: string
}

type UserEvent = {
  type:
    | "user_approved"
    | "user_rejected"
    | "prescription_verified"
    | "user-registration"
    | "user-approval"
    | "user-rejection"
  userId?: string
  orderId?: string
  message: string
  timestamp: string
  data?: any
}

type DroneEvent = {
  type: "drone_dispatched" | "drone_returned" | "drone_maintenance"
  droneId: string
  orderId?: string
  message: string
  timestamp: string
}

export type RealTimeEvent = OrderEvent | InventoryEvent | UserEvent | DroneEvent

// Event listener type
type EventListener = (data: any) => void

// Context type
type RealTimeContextType = {
  events: RealTimeEvent[]
  addEvent: (event: Omit<RealTimeEvent, "timestamp">) => void
  clearEvents: () => void
  isConnected: boolean
  pendingNotifications: number
  markAllNotificationsAsRead: () => void
  subscribeToEvent: (eventType: string, listener: EventListener) => () => void
  publishEvent: (eventType: string, data: any) => void
}

// Create context
const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined)

// Provider component
export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [pendingNotifications, setPendingNotifications] = useState(0)
  const [eventListeners, setEventListeners] = useState<Record<string, EventListener[]>>({})
  const { toast } = useToast()

  // Simulate WebSocket connection
  useEffect(() => {
    // Simulate connection establishment
    const timer = setTimeout(() => {
      setIsConnected(true)
      console.log("Real-time connection established")
    }, 1500)

    // Cleanup on unmount
    return () => {
      clearTimeout(timer)
      setIsConnected(false)
      console.log("Real-time connection closed")
    }
  }, [])

  // Add a new event - memoized with useCallback
  const addEvent = useCallback(
    (eventData: Omit<RealTimeEvent, "timestamp">) => {
      const newEvent = {
        ...eventData,
        timestamp: new Date().toISOString(),
      } as RealTimeEvent

      setEvents((prev) => [newEvent, ...prev])
      setPendingNotifications((prev) => prev + 1)

      // Show toast notification for important events
      if (
        eventData.type === "order_created" ||
        eventData.type === "low_stock_alert" ||
        eventData.type === "drone_dispatched"
      ) {
        toast({
          title: getEventTitle(eventData),
          description: eventData.message,
        })
      }
    },
    [toast],
  )

  // Get event title for toast - memoized with useCallback
  const getEventTitle = useCallback((event: Omit<RealTimeEvent, "timestamp">) => {
    switch (event.type) {
      case "order_created":
        return "New Order Received"
      case "order_update":
        return "Order Updated"
      case "low_stock_alert":
        return "Low Stock Alert"
      case "drone_dispatched":
        return "Drone Dispatched"
      case "user-registration":
        return "New User Registration"
      case "user-approval":
        return "User Approved"
      case "user-rejection":
        return "User Rejected"
      default:
        return "Notification"
    }
  }, [])

  // Subscribe to an event type - memoized with useCallback
  const subscribeToEvent = useCallback((eventType: string, listener: EventListener) => {
    setEventListeners((prev) => {
      const listeners = prev[eventType] || []
      return {
        ...prev,
        [eventType]: [...listeners, listener],
      }
    })

    // Return unsubscribe function
    return () => {
      setEventListeners((prev) => {
        const listeners = prev[eventType] || []
        return {
          ...prev,
          [eventType]: listeners.filter((l) => l !== listener),
        }
      })
    }
  }, [])

  // Publish an event - memoized with useCallback
  const publishEvent = useCallback(
    (eventType: string, data: any) => {
      // Create event message
      let message = ""
      switch (eventType) {
        case "user-registration":
          message = `New user ${data.name} has registered and is awaiting approval`
          break
        case "user-approval":
          message = `User account has been approved`
          break
        case "user-rejection":
          message = `User account has been rejected`
          break
        default:
          message = `Event: ${eventType}`
      }

      // Add to events list
      addEvent({
        type: eventType as any,
        userId: data.id || data.userId,
        message,
        data,
      } as any)

      // Notify listeners
      const listeners = eventListeners[eventType] || []
      listeners.forEach((listener) => listener(data))
    },
    [addEvent, eventListeners],
  )

  // Clear all events - memoized with useCallback
  const clearEvents = useCallback(() => {
    setEvents([])
    setPendingNotifications(0)
  }, [])

  // Mark all notifications as read - memoized with useCallback
  const markAllNotificationsAsRead = useCallback(() => {
    setPendingNotifications(0)
  }, [])

  // Simulate receiving random events (for demo purposes)
  useEffect(() => {
    if (!isConnected) return

    const eventTypes = ["order_update", "order_created", "inventory_update", "low_stock_alert", "drone_dispatched"]
    const statuses: OrderStatus[] = ["Pending Approval", "Processing", "In Transit", "Delivered"]

    const interval = setInterval(() => {
      // Only add random events 20% of the time to avoid too many notifications
      if (Math.random() > 0.8) {
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
        const orderId = "MQ" + Math.floor(10000000 + Math.random() * 90000000)
        const medicineId = Math.floor(1 + Math.random() * 8)
        const medicineName = ["Amoxicillin", "Ibuprofen", "Vitamin D3", "Metformin"][Math.floor(Math.random() * 4)]
        const droneId =
          "DRN-" + Math.floor(10 + Math.random() * 90) + String.fromCharCode(65 + Math.floor(Math.random() * 26))

        let eventData: Omit<RealTimeEvent, "timestamp">

        switch (randomType) {
          case "order_update":
            eventData = {
              type: "order_update",
              orderId,
              status: randomStatus,
              message: `Order ${orderId} status updated to ${randomStatus}`,
            }
            break
          case "order_created":
            eventData = {
              type: "order_created",
              orderId,
              status: "Pending Approval",
              message: `New order ${orderId} has been placed and is awaiting approval`,
            }
            break
          case "inventory_update":
            eventData = {
              type: "inventory_update",
              medicineId,
              medicineName,
              currentStock: Math.floor(10 + Math.random() * 100),
              message: `Inventory updated for ${medicineName}`,
            }
            break
          case "low_stock_alert":
            eventData = {
              type: "low_stock_alert",
              medicineId,
              medicineName,
              currentStock: Math.floor(1 + Math.random() * 9),
              message: `Low stock alert for ${medicineName} (${Math.floor(1 + Math.random() * 9)} units remaining)`,
            }
            break
          case "drone_dispatched":
            eventData = {
              type: "drone_dispatched",
              droneId,
              orderId,
              message: `Drone ${droneId} dispatched for order ${orderId}`,
            }
            break
          default:
            return
        }

        addEvent(eventData)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isConnected, addEvent])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useCallback(() => {
    return {
      events,
      addEvent,
      clearEvents,
      isConnected,
      pendingNotifications,
      markAllNotificationsAsRead,
      subscribeToEvent,
      publishEvent,
    }
  }, [
    events,
    addEvent,
    clearEvents,
    isConnected,
    pendingNotifications,
    markAllNotificationsAsRead,
    subscribeToEvent,
    publishEvent,
  ])

  return <RealTimeContext.Provider value={contextValue()}>{children}</RealTimeContext.Provider>
}

// Hook for using the context
export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}
