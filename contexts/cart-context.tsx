"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { medicines } from "@/app/medicines/page"

// Types
type CartItem = {
  id: number
  quantity: number
}

type CartContextType = {
  cartItems: CartItem[]
  addToCart: (medicineId: number) => void
  removeFromCart: (medicineId: number) => void
  updateQuantity: (medicineId: number, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartSubtotal: () => number
  getCartTax: () => number
  getDeliveryFee: () => number
  getCartItemsWithDetails: () => any[]
  getTotalItemsInCart: () => number
  getQuantityInCart: (medicineId: number) => number
  isPrescriptionRequired: () => boolean
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Function to save cart to localStorage
const saveCartToLocalStorage = (cart: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("medquik-cart", JSON.stringify(cart))
  }
}

// Function to load cart from localStorage
const loadCartFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("medquik-cart")
    return savedCart ? JSON.parse(savedCart) : []
  }
  return []
}

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = loadCartFromLocalStorage()
    setCartItems(savedCart)
  }, [])

  // Add to cart function
  const addToCart = (medicineId: number) => {
    const medicine = medicines.find((med) => med.id === medicineId)
    if (!medicine) return

    // Don't add prescription medicines directly
    if (medicine.prescription) {
      toast({
        title: "Prescription Required",
        description: "This medication requires a valid prescription.",
        variant: "destructive",
      })
      return
    }

    const existingItem = cartItems.find((item) => item.id === medicineId)

    let updatedCart
    if (existingItem) {
      updatedCart = cartItems.map((item) => (item.id === medicineId ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      updatedCart = [...cartItems, { id: medicineId, quantity: 1 }]
    }

    setCartItems(updatedCart)
    saveCartToLocalStorage(updatedCart)

    toast({
      title: "Added to Cart",
      description: `${medicine.name} has been added to your cart.`,
    })
  }

  // Remove from cart function
  const removeFromCart = (medicineId: number) => {
    const existingItem = cartItems.find((item) => item.id === medicineId)

    let updatedCart
    if (existingItem && existingItem.quantity > 1) {
      updatedCart = cartItems.map((item) => (item.id === medicineId ? { ...item, quantity: item.quantity - 1 } : item))
    } else {
      updatedCart = cartItems.filter((item) => item.id !== medicineId)
    }

    setCartItems(updatedCart)
    saveCartToLocalStorage(updatedCart)
  }

  // Update quantity function
  const updateQuantity = (medicineId: number, quantity: number) => {
    if (quantity < 1) return

    const updatedCart = cartItems.map((item) => {
      if (item.id === medicineId) {
        return { ...item, quantity }
      }
      return item
    })

    setCartItems(updatedCart)
    saveCartToLocalStorage(updatedCart)
  }

  // Clear cart function
  const clearCart = () => {
    setCartItems([])
    saveCartToLocalStorage([])
  }

  // Get cart total
  const getCartTotal = () => {
    const subtotal = getCartSubtotal()
    const tax = getCartTax()
    const deliveryFee = getDeliveryFee()
    return subtotal + tax + deliveryFee
  }

  // Get cart subtotal
  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const medicine = medicines.find((med) => med.id === item.id)
      return total + (medicine?.price || 0) * item.quantity
    }, 0)
  }

  // Get cart tax
  const getCartTax = () => {
    return Math.round(getCartSubtotal() * 0.18) // 18% GST
  }

  // Get delivery fee
  const getDeliveryFee = () => {
    return 99 // Fixed delivery fee
  }

  // Get cart items with details
  const getCartItemsWithDetails = () => {
    return cartItems.map((item) => {
      const medicineDetails = medicines.find((med) => med.id === item.id)
      return {
        ...item,
        ...medicineDetails,
      }
    })
  }

  // Get total items in cart
  const getTotalItemsInCart = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Get quantity in cart
  const getQuantityInCart = (medicineId: number) => {
    const item = cartItems.find((item) => item.id === medicineId)
    return item ? item.quantity : 0
  }

  // Check if prescription is required
  const isPrescriptionRequired = () => {
    return getCartItemsWithDetails().some((item) => item.prescription)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartSubtotal,
        getCartTax,
        getDeliveryFee,
        getCartItemsWithDetails,
        getTotalItemsInCart,
        getQuantityInCart,
        isPrescriptionRequired,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook for using the context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
