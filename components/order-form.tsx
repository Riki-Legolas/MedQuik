"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useOrder } from "@/contexts/order-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["credit-card", "upi", "cod"]),
  contactlessDelivery: z.boolean().default(false),
  saveInformation: z.boolean().default(false),
})

export function OrderForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { addOrder } = useOrder()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.name || "",
      phoneNumber: "",
      address: "",
      deliveryInstructions: "",
      paymentMethod: "credit-card",
      contactlessDelivery: true,
      saveInformation: true,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      try {
        // Create order
        const orderId = addOrder({
          customer: values.fullName,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status: "Pending Approval",
          items: cartItems.map((item) => `${item.name} (${item.quantity} ${item.unit})`),
          total: cartTotal,
          deliveryAddress: values.address,
          paymentMethod:
            values.paymentMethod === "credit-card"
              ? "Credit Card"
              : values.paymentMethod === "upi"
                ? "UPI"
                : "Cash on Delivery",
          paymentStatus: values.paymentMethod === "cod" ? "Pending" : "Paid",
          contactless: values.contactlessDelivery,
          deliveryInstructions: values.deliveryInstructions,
        })

        // Clear cart
        clearCart()

        // Show success toast
        toast({
          title: "Order Placed Successfully",
          description: `Your order #${orderId} has been placed and is awaiting approval.`,
        })

        // Redirect to tracking page
        router.push(`/tracking?id=${orderId}`)
      } catch (error) {
        toast({
          title: "Error",
          description: "There was an error placing your order. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }, 1500)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Delivery Information</h3>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your full address including city, state, and PIN code" {...field} />
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
                  <Textarea placeholder="Any special instructions for delivery" {...field} />
                </FormControl>
                <FormDescription>
                  E.g., gate code, landmark, or special instructions for the drone delivery
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactlessDelivery"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Contactless Delivery</FormLabel>
                  <FormDescription>
                    The drone will deliver your package without requiring direct contact
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Payment Method</h3>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Select Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="credit-card" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit/Debit Card</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="upi" />
                      </FormControl>
                      <FormLabel className="font-normal">UPI</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="cod" />
                      </FormControl>
                      <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="saveInformation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Save information for future orders</FormLabel>
                  <FormDescription>We'll securely save this information for your next purchase</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </Form>
  )
}
