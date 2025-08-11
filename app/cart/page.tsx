"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, FileText, AlertTriangle } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CartPage() {
  const {
    cartItems,
    getCartItemsWithDetails,
    getCartTotal,
    getCartSubtotal,
    getCartTax,
    getDeliveryFee,
    updateQuantity,
    removeFromCart,
    clearCart,
    isPrescriptionRequired,
  } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false)
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false)

  const cartItemsWithDetails = getCartItemsWithDetails()
  const subtotal = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const tax = getCartTax()
  const total = getCartTotal()
  const requiresPrescription = isPrescriptionRequired()

  // Format price in rupees
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to login before proceeding to checkout",
        variant: "destructive",
      })
      router.push("/login?redirect=cart")
      return
    }

    // If prescription is required but not uploaded, show dialog
    if (requiresPrescription && !prescriptionUploaded) {
      setIsPrescriptionDialogOpen(true)
      return
    }

    // If everything is good, show checkout confirmation
    setIsCheckoutConfirmOpen(true)
  }

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate prescription upload
      setPrescriptionUploaded(true)
      setIsPrescriptionDialogOpen(false)
      toast({
        title: "Prescription Uploaded",
        description: "Your prescription has been uploaded successfully",
      })
    }
  }

  const proceedToOrder = () => {
    setIsCheckoutConfirmOpen(false)
    router.push("/order")
  }

  if (cartItemsWithDetails.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6">
        <Breadcrumb items={[{ label: "Cart" }]} />
        <div className="max-w-lg mx-auto text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Button asChild>
            <Link href="/medicines">Browse Medicines</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Cart" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        <p className="text-gray-500">Review your items and proceed to checkout</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItemsWithDetails.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="relative h-20 w-20 overflow-hidden rounded">
                    <Image
                      src={item.image || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-medium">
                        {item.name}{" "}
                        {item.prescription && (
                          <Badge variant="outline" className="ml-2">
                            Prescription
                          </Badge>
                        )}
                      </h3>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 -mr-2"
                        onClick={() => {
                          removeFromCart(item.id)
                          if (item.quantity > 1) {
                            for (let i = 0; i < item.quantity - 1; i++) {
                              removeFromCart(item.id)
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/medicines">Continue Shopping</Link>
              </Button>
              <Button variant="ghost" className="text-red-500" onClick={clearCart}>
                Clear Cart
              </Button>
            </CardFooter>
          </Card>

          {requiresPrescription && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Prescription Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      One or more items in your cart require a valid prescription. You will need to upload a
                      prescription during checkout.
                    </p>
                    {prescriptionUploaded && <Badge className="mt-2 bg-green-500">Prescription Uploaded</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-20 card-futuristic">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <p className="text-gray-500">Subtotal</p>
                  <p className="font-medium">{formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500">Delivery Fee</p>
                  <p className="font-medium">{formatPrice(deliveryFee)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-500">GST (18%)</p>
                  <p className="font-medium">{formatPrice(tax)}</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <p className="font-medium">Total</p>
                <p className="text-xl font-bold">{formatPrice(total)}</p>
              </div>

              <Button
                className="w-full py-6 text-lg mt-4 bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-center text-sm text-gray-500 pt-2">Secure checkout powered by MedQuik</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prescription Dialog */}
      <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prescription Required</DialogTitle>
            <DialogDescription>
              One or more items in your cart require a valid prescription. Please upload a prescription before
              proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start mb-4">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium">Upload Prescription</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please upload a clear image or PDF of your prescription. Accepted formats: JPG, PNG, PDF.
                </p>
              </div>
            </div>
            <Input type="file" onChange={handlePrescriptionUpload} accept=".jpg,.jpeg,.png,.pdf" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!prescriptionUploaded} onClick={() => setIsPrescriptionDialogOpen(false)}>
              Continue to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={isCheckoutConfirmOpen} onOpenChange={setIsCheckoutConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Checkout</DialogTitle>
            <DialogDescription>Please review your order before proceeding to payment.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Order Summary</h3>
                <div className="mt-2 space-y-1 text-sm">
                  {cartItemsWithDetails.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={proceedToOrder}>
              Proceed to Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
