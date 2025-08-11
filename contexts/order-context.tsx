"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRealTime } from "@/contexts/real-time-context"

// Types
export type OrderStatus = "Pending Approval" | "Processing" | "In Transit" | "Delivered" | "Cancelled"

export type Order = {
  id: string
  customer: string
  date: string
  status: OrderStatus
  items: string[]
  total: number
  deliveryAddress: string
  paymentMethod: string
  paymentStatus: string
  droneId?: string
  rejectionReason?: string
  contactless?: boolean
  deliveryInstructions?: string
}

type OrderContextType = {
  orders: Order[]
  addOrder: (order: Omit<Order, "id">) => string
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  deleteOrder: (orderId: string) => void
  getOrderById: (orderId: string) => Order | undefined
  getPendingOrders: () => Order[]
  getProcessingOrders: () => Order[]
  getInTransitOrders: () => Order[]
  getDeliveredOrders: () => Order[]
  getCancelledOrders: () => Order[]
  assignDroneToOrder: (orderId: string, droneId: string) => void
  approveOrder: (orderId: string) => void
  rejectOrder: (orderId: string, reason: string) => void
  dispatchOrder: (orderId: string) => void
}

// Create context
const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Mock order data
const initialOrders: Order[] = [
  {
    id: "MQ12345678",
    customer: "John Doe",
    date: "Apr 10, 2025",
    status: "In Transit",
    items: ["Amoxicillin (30 tablets)", "Vitamin D3 (60 capsules)"],
    total: 2724,
    deliveryAddress: "123 Main St, Bangalore",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    droneId: "DRN-42X",
  },
  {
    id: "MQ87654321",
    customer: "Jane Smith",
    date: "Apr 8, 2025",
    status: "Delivered",
    items: ["Ibuprofen (50 tablets)", "Bandage Kit (1 box)"],
    total: 1848,
    deliveryAddress: "456 Elm St, Bangalore",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
  },
  {
    id: "MQ23456789",
    customer: "David Lee",
    date: "Mar 25, 2025",
    status: "Pending Approval",
    items: ["Acetaminophen (100 tablets)"],
    total: 799,
    deliveryAddress: "789 Oak St, Bangalore",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
  },
]

// Provider component
export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const { publishEvent, subscribeToEvent } = useRealTime()

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsubscribe = subscribeToEvent("order_update", (data) => {
      if (data.orderId) {
        updateOrder(data.orderId, {
          status: data.status as OrderStatus,
          droneId: data.droneId,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  // Add order
  const addOrder = (order: Omit<Order, "id">) => {
    const newId = "MQ" + Math.floor(10000000 + Math.random() * 90000000)
    const newOrder = { id: newId, ...order }
    setOrders((prevOrders) => [...prevOrders, newOrder])
    return newId
  }

  // Update order
  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, ...updates } : order)))
  }

  // Delete order
  const deleteOrder = (orderId: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
  }

  // Get order by ID
  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find((order) => order.id === orderId)
  }

  // Get pending orders
  const getPendingOrders = (): Order[] => {
    return orders.filter((order) => order.status === "Pending Approval")
  }

  // Get processing orders
  const getProcessingOrders = (): Order[] => {
    return orders.filter((order) => order.status === "Processing")
  }

  // Get in-transit orders
  const getInTransitOrders = (): Order[] => {
    return orders.filter((order) => order.status === "In Transit")
  }

  // Get delivered orders
  const getDeliveredOrders = (): Order[] => {
    return orders.filter((order) => order.status === "Delivered")
  }

  // Get cancelled orders
  const getCancelledOrders = (): Order[] => {
    return orders.filter((order) => order.status === "Cancelled")
  }

  // Assign drone to order
  const assignDroneToOrder = (orderId: string, droneId: string) => {
    updateOrder(orderId, { droneId })

    // Publish event
    publishEvent("order_update", {
      orderId,
      droneId,
      status: "Processing",
      message: `Drone ${droneId} assigned to order ${orderId}`,
    })
  }

  // Approve order
  const approveOrder = (orderId: string) => {
    updateOrder(orderId, { status: "Processing" })

    // Publish event
    publishEvent("order_update", {
      orderId,
      status: "Processing",
      message: `Order ${orderId} has been approved and is being processed`,
    })
  }

  // Reject order
  const rejectOrder = (orderId: string, reason: string) => {
    updateOrder(orderId, {
      status: "Cancelled",
      rejectionReason: reason,
    })

    // Publish event
    publishEvent("order_update", {
      orderId,
      status: "Cancelled",
      message: `Order ${orderId} has been rejected: ${reason}`,
    })
  }

  // Dispatch order
  const dispatchOrder = (orderId: string) => {
    const order = getOrderById(orderId)
    if (!order || !order.droneId) return

    updateOrder(orderId, { status: "In Transit" })

    // Publish event
    publishEvent("order_update", {
      orderId,
      status: "In Transit",
      droneId: order.droneId,
      message: `Order ${orderId} has been dispatched with drone ${order.droneId}`,
    })
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
        getPendingOrders,
        getProcessingOrders,
        getInTransitOrders,
        getDeliveredOrders,
        getCancelledOrders,
        assignDroneToOrder,
        approveOrder,
        rejectOrder,
        dispatchOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

// Hook for using the context
export function useOrder() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider")
  }
  return context
}
