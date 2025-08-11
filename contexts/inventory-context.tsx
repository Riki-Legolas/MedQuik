"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useRealTime } from "@/contexts/real-time-context"
import { useToast } from "@/components/ui/use-toast"

// Types
export type InventoryItem = {
  id: number
  name: string
  currentStock: number
  reorderLevel: number
  category: string
  supplier: string
  lastRestocked: string
  price: number
  expiryDate?: string
  location?: string
  prescription: boolean
}

type InventoryContextType = {
  inventory: InventoryItem[]
  updateStock: (itemId: number, newStock: number) => void
  getLowStockItems: () => InventoryItem[]
  getItemById: (itemId: number) => InventoryItem | undefined
  getItemsByCategory: (category: string) => InventoryItem[]
  restockItem: (itemId: number, quantity: number) => void
  adjustInventoryForOrder: (items: { id: number; quantity: number }[]) => boolean
}

// Create context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined)

// Mock inventory data
const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Amoxicillin",
    currentStock: 150,
    reorderLevel: 30,
    category: "Antibiotics",
    supplier: "MedSupply Inc.",
    lastRestocked: "Apr 5, 2025",
    price: 1299,
    expiryDate: "Dec 31, 2026",
    location: "Shelf A1",
    prescription: true,
  },
  {
    id: 2,
    name: "Vitamin D3",
    currentStock: 200,
    reorderLevel: 50,
    category: "Vitamins",
    supplier: "HealthNutrition Co.",
    lastRestocked: "Apr 8, 2025",
    price: 1425,
    expiryDate: "Jun 15, 2027",
    location: "Shelf B3",
    prescription: false,
  },
  {
    id: 3,
    name: "Ibuprofen",
    currentStock: 180,
    reorderLevel: 40,
    category: "Pain Relief",
    supplier: "PharmaWholesale Ltd.",
    lastRestocked: "Apr 10, 2025",
    price: 799,
    expiryDate: "Sep 20, 2026",
    location: "Shelf C2",
    prescription: false,
  },
  {
    id: 4,
    name: "Metformin",
    currentStock: 120,
    reorderLevel: 30,
    category: "Diabetes",
    supplier: "MedSupply Inc.",
    lastRestocked: "Apr 12, 2025",
    price: 1299,
    expiryDate: "Nov 15, 2026",
    location: "Shelf D4",
    prescription: true,
  },
  {
    id: 5,
    name: "Cetirizine",
    currentStock: 160,
    reorderLevel: 35,
    category: "Allergy",
    supplier: "PharmaWholesale Ltd.",
    lastRestocked: "Apr 15, 2025",
    price: 599,
    expiryDate: "Oct 10, 2026",
    location: "Shelf E1",
    prescription: false,
  },
]

// Provider component
export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const { publishEvent } = useRealTime()
  const { toast } = useToast()

  // Update stock
  const updateStock = (itemId: number, newStock: number) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, currentStock: newStock }

          // Check if stock is low
          if (newStock <= item.reorderLevel) {
            // Publish low stock event
            publishEvent("low_stock_alert", {
              medicineId: item.id,
              medicineName: item.name,
              currentStock: newStock,
              message: `Low stock alert for ${item.name} (${newStock} units remaining)`,
            })

            // Show toast for critical stock
            if (newStock <= item.reorderLevel / 2) {
              toast({
                title: "Critical Stock Alert",
                description: `${item.name} is critically low with only ${newStock} units remaining!`,
                variant: "destructive",
              })
            }
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  // Get low stock items
  const getLowStockItems = () => {
    return inventory.filter((item) => item.currentStock <= item.reorderLevel)
  }

  // Get item by ID
  const getItemById = (itemId: number) => {
    return inventory.find((item) => item.id === itemId)
  }

  // Get items by category
  const getItemsByCategory = (category: string) => {
    return inventory.filter((item) => item.category === category)
  }

  // Restock item
  const restockItem = (itemId: number, quantity: number) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) => {
        if (item.id === itemId) {
          const newStock = item.currentStock + quantity
          const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

          // Publish inventory update event
          publishEvent("inventory_update", {
            medicineId: item.id,
            medicineName: item.name,
            currentStock: newStock,
            message: `Inventory updated for ${item.name} (+${quantity} units)`,
          })

          toast({
            title: "Inventory Restocked",
            description: `${item.name} has been restocked with ${quantity} units.`,
          })

          return {
            ...item,
            currentStock: newStock,
            lastRestocked: today,
          }
        }
        return item
      }),
    )
  }

  // Adjust inventory for order
  const adjustInventoryForOrder = (items: { id: number; quantity: number }[]) => {
    let canFulfill = true

    // First check if we have enough stock for all items
    for (const orderItem of items) {
      const inventoryItem = getItemById(orderItem.id)
      if (!inventoryItem || inventoryItem.currentStock < orderItem.quantity) {
        canFulfill = false
        break
      }
    }

    // If we can fulfill the order, update the inventory
    if (canFulfill) {
      setInventory((prevInventory) =>
        prevInventory.map((item) => {
          const orderItem = items.find((oi) => oi.id === item.id)
          if (orderItem) {
            const newStock = item.currentStock - orderItem.quantity

            // Publish inventory update event
            publishEvent("inventory_update", {
              medicineId: item.id,
              medicineName: item.name,
              currentStock: newStock,
              message: `Inventory updated for ${item.name} (-${orderItem.quantity} units)`,
            })

            // Check if stock is now low
            if (newStock <= item.reorderLevel) {
              publishEvent("low_stock_alert", {
                medicineId: item.id,
                medicineName: item.name,
                currentStock: newStock,
                message: `Low stock alert for ${item.name} (${newStock} units remaining)`,
              })

              // Show toast for critical stock
              if (newStock <= item.reorderLevel / 2) {
                toast({
                  title: "Critical Stock Alert",
                  description: `${item.name} is critically low with only ${newStock} units remaining!`,
                  variant: "destructive",
                })
              }
            }

            return { ...item, currentStock: newStock }
          }
          return item
        }),
      )
    } else {
      toast({
        title: "Insufficient Stock",
        description: "Some items in the order have insufficient stock.",
        variant: "destructive",
      })
    }

    return canFulfill
  }

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        updateStock,
        getLowStockItems,
        getItemById,
        getItemsByCategory,
        restockItem,
        adjustInventoryForOrder,
      }}
    >
      {children}
    </InventoryContext.Provider>
  )
}

// Hook for using the context
export function useInventory() {
  const context = useContext(InventoryContext)
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
