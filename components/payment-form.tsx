"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Check, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const paymentFormSchema = z.object({
  cardholderName: z.string().min(2, {
    message: "Cardholder name must be at least 2 characters.",
  }),
  cardNumber: z
    .string()
    .min(13, {
      message: "Card number must be at least 13 digits.",
    })
    .max(19, {
      message: "Card number must be at most 19 digits.",
    })
    .refine((val) => /^\d+$/.test(val), {
      message: "Card number must contain only digits.",
    }),
  expiryMonth: z.string().min(1, {
    message: "Please select an expiry month.",
  }),
  expiryYear: z.string().min(1, {
    message: "Please select an expiry year.",
  }),
  cvv: z
    .string()
    .min(3, {
      message: "CVV must be at least 3 digits.",
    })
    .max(4, {
      message: "CVV must be at most 4 digits.",
    })
    .refine((val) => /^\d+$/.test(val), {
      message: "CVV must contain only digits.",
    }),
  isDefault: z.boolean().default(false),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

export function PaymentManager() {
  const { user, addPaymentMethod, updatePaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState(user?.paymentMethods || [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
    },
  })

  function handleEdit(payment: any) {
    setEditingPayment(payment)
    form.reset({
      cardholderName: payment.cardholderName,
      cardNumber: payment.cardNumber,
      expiryMonth: payment.expiryMonth,
      expiryYear: payment.expiryYear,
      cvv: "",
      isDefault: payment.isDefault,
    })
    setIsDialogOpen(true)
  }

  function handleAdd() {
    setEditingPayment(null)
    form.reset({
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
    })
    setIsDialogOpen(true)
  }

  async function handleDelete(paymentId: string) {
    try {
      await removePaymentMethod(paymentId)
      setPaymentMethods(paymentMethods.filter(payment => payment.id !== paymentId))
      toast.success("Payment method removed successfully")
    } catch (error) {
      toast.error("Failed to remove payment method")
      console.error(error)
    }
  }

  async function handleSetDefault(paymentId: string) {
    try {
      await setDefaultPaymentMethod(paymentId)
      setPaymentMethods(paymentMethods.map(payment => ({
        ...payment,
        isDefault: payment.id === paymentId
      })))
      toast.success("Default payment method updated")
    } catch (error) {
      toast.error("Failed to update default payment method")
      console.error(error)
    }
  }

  async function onSubmit(data: PaymentFormValues) {
    try {
      if (editingPayment) {
        // Update existing payment method
        await updatePaymentMethod(editingPayment.id, data)
        setPaymentMethods(paymentMethods.map(payment => 
          payment.id === editingPayment.id ? { ...payment, ...data } : payment
        ))
        toast.success("Payment method updated successfully")
      } else {
        // Add new payment method
        const newPayment = await addPaymentMethod(data)
        setPaymentMethods([...paymentMethods, newPayment])
        toast.success("Payment method added successfully")
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast.error("Failed to save payment method")
      console.error(error)
    }
  }

  // Generate years for expiry date selection (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i)

  // Mask card number to show only last 4 digits
  const maskCardNumber = (cardNumber: string) => {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Payment Methods</span>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your payment methods.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No payment methods added yet. Add your first payment method to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((payment) => (
              <Card key={payment.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-6 w-6 mt-1 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium flex items-center">
                          {maskCardNumber(payment.cardNumber)}
                          {payment.isDefault && (
                            <Badge variant="outline" className="ml-2">Default</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{payment.cardholderName}</p>
                        <p className="text-sm text-muted-foreground">Expires: {payment.expiryMonth}/{payment.expiryYear}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!payment.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleSetDefault(payment.id)}
                          title="Set as default"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(payment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            <DialogDescription>
              {editingPayment 
                ? "Update your payment method details." 
                : "Add a new payment method to your account."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234 5678 9012 3456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="MM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                              {month.toString().padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="YYYY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Set as default payment method
                      </FormLabel>
                    </div>\
