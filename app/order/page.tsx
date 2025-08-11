"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useOrder } from "@/contexts/order-context"
import { useCart } from "@/contexts/cart-context"
import { useRealTime } from "@/contexts/real-time-context"
import { Package, CreditCard, MapPin, Clock, AlertTriangle, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const orderFormSchema = z.object({
  deliveryAddress: z.string().min(10, {
    message: "Delivery address must be at least 10 characters.",
  }),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["card", "upi", "cod", "wallet"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  upiId: z.string().optional(),
  prescriptionUpload: z.boolean().optional(),
  contactless: z.boolean().default(true),
})

export default function OrderPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const { toast } = useToast()
  const { addOrder } = useOrder()
  const {
    getCartItemsWithDetails,
    getCartTotal,
    getCartSubtotal,
    getCartTax,
    getDeliveryFee,
    clearCart,
    isPrescriptionRequired,
  } = useCart()
  const { publishEvent } = useRealTime()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("delivery")
  const [prescriptionRequired, setPrescriptionRequired] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Get cart items
  const cartItems = getCartItemsWithDetails()

  useEffect(() => {
    // Check if any item requires prescription
    const requiresPrescription = isPrescriptionRequired()
    setPrescriptionRequired(requiresPrescription)
  }, [isPrescriptionRequired])

  const subtotal = getCartSubtotal()
  const deliveryFee = getDeliveryFee()
  const tax = getCartTax()
  const total = getCartTotal()

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      deliveryAddress: "",
      deliveryInstructions: "",
      paymentMethod: "card",
      contactless: true,
      prescriptionUpload: false,
    },
  })

  const watchPaymentMethod = form.watch("paymentMethod")

  function onSubmit(values: z.infer<typeof orderFormSchema>) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your order.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (prescriptionRequired && !values.prescriptionUpload) {
      toast({
        title: "Prescription Required",
        description: "Please upload a prescription for the prescription-only medications in your order.",
        variant: "destructive",
      })
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Generate a random order ID
    const newOrderId = "MQ" + Math.floor(10000000 + Math.random() * 90000000)
    setOrderId(newOrderId)

    // Create new order
    const newOrder = {
      customer: user?.name || user?.email?.split("@")[0] || "Guest User",
      date: new Date().toLocaleString(),
      status: "Pending Approval",
      items: cartItems.map((item) => `${item.name} (${item.quantity} ${item.quantity > 1 ? "units" : "unit"})`),
      total: total,
      deliveryAddress: values.deliveryAddress,
      paymentMethod: getPaymentMethodLabel(values.paymentMethod),
      paymentStatus: values.paymentMethod === "cod" ? "Pending" : "Paid",
      contactless: values.contactless,
      deliveryInstructions: values.deliveryInstructions || "",
    }

    // Add order to context
    setTimeout(() => {
      addOrder(newOrder)

      // Publish real-time event
      publishEvent("order_created", {
        orderId: newOrderId,
        status: "Pending Approval",
        customer: newOrder.customer,
        total: total,
        items: newOrder.items,
      })

      // Clear cart
      clearCart()

      setIsSubmitting(false)

      toast({
        title: "Order Placed Successfully",
        description: `Your order #${newOrderId} has been placed. You can track its status in your dashboard.`,
      })

      // Redirect to tracking page with the order ID
      router.push(`/tracking?id=${newOrderId}`)
    }, 1500)
  }

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "card":
        return "Credit/Debit Card"
      case "upi":
        return "UPI Payment"
      case "wallet":
        return "Mobile Wallet"
      case "cod":
        return "Cash on Delivery"
      default:
        return "Unknown"
    }
  }

  // Format price in rupees
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-8 flex items-center">
        <Link href="/medicines" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Order</h1>
          <p className="text-gray-500">Review your items and complete your purchase</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="delivery">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your full address including house/flat number, street, locality, city, state and PIN code"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Instructions (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="E.g., Gate code, landmark, or special instructions for the drone delivery"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactless"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Contactless Delivery</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                The drone will deliver your package without requiring direct contact
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />

                      {prescriptionRequired && (
                        <div>
                          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 mb-4 bg-yellow-50">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <div className="space-y-1 leading-none">
                              <p className="font-medium">Prescription Required</p>
                              <p className="text-sm text-muted-foreground">
                                One or more items in your order require a valid prescription
                              </p>
                            </div>
                          </div>
                          <FormField
                            control={form.control}
                            name="prescriptionUpload"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Upload Prescription</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    I'll upload my prescription for verification
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                          {form.watch("prescriptionUpload") && (
                            <div className="mt-4">
                              <label htmlFor="prescription-upload" className="block text-sm font-medium mb-1">
                                Upload Prescription Image
                              </label>
                              <Input id="prescription-upload" type="file" />
                              <p className="text-xs text-muted-foreground mt-1">
                                Accepted formats: JPG, PNG, PDF (Max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("payment")}>
                        Continue to Payment
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="payment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="card" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    <div className="flex items-center">
                                      <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                      Credit/Debit Card
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="upi" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    <div className="flex items-center">
                                    <Image
                                        src="/images/UPI.png?height=16&width=16"
                                        alt="UPI"
                                        width={16}
                                        height={16}
                                        className="mr-2"
                                      />
                                      UPI Payment
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="wallet" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    <div className="flex items-center">
                                    <Image
                                        src="/images/wallet.png?height=16&width=16"
                                        alt="Wallet"
                                        width={16}
                                        height={16}
                                        className="mr-2"
                                      />
                                      Mobile Wallet
                                    </div>
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="cod" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    <div className="flex items-center">Cash on Delivery</div>
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {watchPaymentMethod === "card" && (
                        <div className="mt-4 space-y-4">
                          <FormItem>
                            <FormLabel>Card Number</FormLabel>
                            <FormControl>
                              <Input placeholder="1234 5678 9012 3456" />
                            </FormControl>
                          </FormItem>
                          <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input placeholder="MM/YY" />
                              </FormControl>
                            </FormItem>
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input placeholder="123" />
                              </FormControl>
                            </FormItem>
                          </div>
                        </div>
                      )}

                      {watchPaymentMethod === "upi" && (
                        <div className="mt-4">
                          <FormItem>
                            <FormLabel>UPI ID</FormLabel>
                            <FormControl>
                              <Input placeholder="yourname@upi" />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter your UPI ID (e.g., yourname@okicici, yourname@ybl)
                            </p>
                          </FormItem>
                        </div>
                      )}

                      {watchPaymentMethod === "wallet" && (
                        <div className="mt-4">
                          <FormItem>
                            <FormLabel>Select Wallet</FormLabel>
                            <FormControl>
                              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select a wallet</option>
                                <option value="paytm">Paytm</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="amazonpay">Amazon Pay</option>
                                <option value="mobikwik">MobiKwik</option>
                                <option value="googlepay">GooglePay</option>
                              </select>
                            </FormControl>
                          </FormItem>
                        </div>
                      )}

                      {watchPaymentMethod === "cod" && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                            <div>
                              <p className="font-medium">Cash on Delivery</p>
                              <p className="text-sm text-gray-600">
                                Please keep exact change ready for the delivery. Our drone delivery system requires
                                contactless payment confirmation.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("delivery")}>
                        Back
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("review")}>
                        Review Order
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="review">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Order Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Items</h3>
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="relative h-16 w-16 overflow-hidden rounded">
                                <Image
                                  src={item.image || "/placeholder.svg?height=64&width=64"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="font-medium">
                                    {item.name}{" "}
                                    {item.prescription && (
                                      <Badge variant="outline" className="ml-2">
                                        Prescription
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {formatPrice(item.price)} x {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-2">Delivery Details</h3>
                        <p className="text-gray-700">{form.getValues("deliveryAddress")}</p>
                        {form.getValues("deliveryInstructions") && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Instructions:</p>
                            <p className="text-sm text-gray-600">{form.getValues("deliveryInstructions")}</p>
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge variant={form.getValues("contactless") ? "default" : "outline"}>
                            {form.getValues("contactless") ? "Contactless Delivery" : "Standard Delivery"}
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                        <div className="flex items-center">
                          {form.getValues("paymentMethod") === "card" && (
                            <>
                              <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                              <span>Credit/Debit Card</span>
                            </>
                          )}
                          {form.getValues("paymentMethod") === "upi" && (
                            <>
                              <Image
                                src="/images/UPI.png?height=16&width=16"
                                alt="UPI"
                                width={16}
                                height={16}
                                className="mr-2"
                              />
                              <span>UPI Payment</span>
                            </>
                          )}
                          {form.getValues("paymentMethod") === "wallet" && (
                            <>
                              <Image
                                src="/images/wallet.png?height=16&width=16"
                                alt="Wallet"
                                width={16}
                                height={16}
                                className="mr-2"
                              />
                              <span>Mobile Wallet</span>
                            </>
                          )}
                          {form.getValues("paymentMethod") === "cod" && <span>Cash on Delivery</span>}
                        </div>
                      </div>

                      {prescriptionRequired && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-medium mb-2">Prescription</h3>
                            {form.getValues("prescriptionUpload") ? (
                              <Badge className="bg-green-500">Prescription Uploaded</Badge>
                            ) : (
                              <Badge variant="destructive">Prescription Required</Badge>
                            )}
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <p className="text-sm">Subtotal</p>
                          <p className="text-sm font-medium">{formatPrice(subtotal)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">Delivery Fee</p>
                          <p className="text-sm font-medium">{formatPrice(deliveryFee)}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm">GST (18%)</p>
                          <p className="text-sm font-medium">{formatPrice(tax)}</p>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <p className="font-medium">Total</p>
                          <p className="font-bold">{formatPrice(total)}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("payment")}>
                        Back
                      </Button>
                      <Button type="submit" disabled={isSubmitting || cartItems.length === 0}>
                        {isSubmitting ? "Processing..." : "Place Order"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.image || "/placeholder.svg?height=64&width=64"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>

              {cartItems.length === 0 && (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/medicines">Browse Medicines</Link>
                  </Button>
                </div>
              )}

              {cartItems.length > 0 && (
                <>
                  <Separator />

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <p className="text-sm">Subtotal</p>
                      <p className="text-sm font-medium">{formatPrice(subtotal)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Delivery Fee</p>
                      <p className="text-sm font-medium">{formatPrice(deliveryFee)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">GST (18%)</p>
                      <p className="text-sm font-medium">{formatPrice(tax)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <p className="font-medium">Total</p>
                    <p className="font-bold">{formatPrice(total)}</p>
                  </div>

                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-600">Estimated Delivery</p>
                        <p className="text-sm text-blue-600">Today, within 45 minutes</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/medicines">Add More Items</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
