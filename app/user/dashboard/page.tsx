"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import {
  Package,
  Clock,
  MapPin,
  CreditCard,
  ShoppingCart,
  Bell,
  Edit,
  Trash,
  FileText,
  Plus,
  Check,
  Eye,
  EyeOff,
  Save,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Breadcrumb } from "@/components/breadcrumb"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useOrder } from "@/contexts/order-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Switch } from "@/components/ui/switch"

// Mock data for user dashboard
const initialOrders = [
  {
    id: "MQ12345678",
    date: "Apr 10, 2025",
    status: "In Transit",
    items: ["Amoxicillin (30 tablets)", "Vitamin D3 (60 capsules)"],
    total: "₹2,724",
    editable: true,
  },
  {
    id: "MQ87654321",
    date: "Apr 8, 2025",
    status: "Delivered",
    items: ["Ibuprofen (50 tablets)", "Bandage Kit (1 box)"],
    total: "₹1,848",
    editable: false,
  },
  {
    id: "MQ23456789",
    date: "Mar 25, 2025",
    status: "Delivered",
    items: ["Acetaminophen (100 tablets)"],
    total: "₹799",
    editable: false,
  },
]

const savedAddresses = [
  {
    id: 1,
    name: "Home",
    address: "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001",
    default: true,
  },
  {
    id: 2,
    name: "Work",
    address: "456 Office Blvd, Suite 200, Delhi, Delhi, 110001",
    default: false,
  },
]

const paymentMethods = [
  {
    id: 1,
    type: "Credit Card",
    last4: "4242",
    expiry: "04/26",
    default: true,
  },
  {
    id: 2,
    type: "Credit Card",
    last4: "1234",
    expiry: "12/25",
    default: false,
  },
]

const notifications = [
  {
    id: 1,
    message: "Your order MQ12345678 is out for delivery",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    message: "Your prescription for Lisinopril has been approved",
    time: "1 day ago",
    read: false,
  },
  {
    id: 3,
    message: "Special offer: 15% off on all vitamins this week",
    time: "3 days ago",
    read: true,
  },
]

// Detailed order data
const detailedOrderData = {
  MQ12345678: {
    id: "MQ12345678",
    date: "Apr 10, 2025",
    status: "In Transit",
    estimatedDelivery: "Apr 11, 2025, 2:00 PM",
    items: [
      { name: "Amoxicillin", quantity: 30, unit: "tablets", price: 1499, subtotal: 1499, id: "med-001" },
      { name: "Vitamin D3", quantity: 60, unit: "capsules", price: 1225, subtotal: 1225, id: "med-002" },
    ],
    subtotal: 2724,
    tax: 136.2,
    deliveryFee: 0,
    discount: 0,
    total: 2860.2,
    paymentMethod: "Credit Card ending in 4242",
    paymentStatus: "Paid",
    deliveryAddress: "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001",
    deliveryInstructions: "Please leave at the front door",
    trackingInfo: {
      droneId: "DRN-42X",
      currentLocation: "In transit",
      lastUpdated: "Apr 10, 2025, 4:30 PM",
    },
    prescriptionRequired: true,
    prescriptionStatus: "Verified",
    contactless: true,
  },
  MQ87654321: {
    id: "MQ87654321",
    date: "Apr 8, 2025",
    status: "Delivered",
    deliveredAt: "Apr 9, 2025, 11:23 AM",
    items: [
      { name: "Ibuprofen", quantity: 50, unit: "tablets", price: 899, subtotal: 899, id: "med-003" },
      { name: "Bandage Kit", quantity: 1, unit: "box", price: 949, subtotal: 949, id: "med-004" },
    ],
    subtotal: 1848,
    tax: 92.4,
    deliveryFee: 0,
    discount: 0,
    total: 1940.4,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    deliveryAddress: "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001",
    deliveryInstructions: "",
    trackingInfo: {
      droneId: "DRN-36Y",
      currentLocation: "Delivered",
      lastUpdated: "Apr 9, 2025, 11:23 AM",
    },
    prescriptionRequired: false,
    contactless: true,
  },
  MQ23456789: {
    id: "MQ23456789",
    date: "Mar 25, 2025",
    status: "Delivered",
    deliveredAt: "Mar 26, 2025, 10:15 AM",
    items: [{ name: "Acetaminophen", quantity: 100, unit: "tablets", price: 799, subtotal: 799, id: "med-005" }],
    subtotal: 799,
    tax: 39.95,
    deliveryFee: 0,
    discount: 0,
    total: 838.95,
    paymentMethod: "Credit Card ending in 4242",
    paymentStatus: "Paid",
    deliveryAddress: "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001",
    deliveryInstructions: "",
    trackingInfo: {
      droneId: "DRN-28Z",
      currentLocation: "Delivered",
      lastUpdated: "Mar 26, 2025, 10:15 AM",
    },
    prescriptionRequired: false,
    contactless: true,
  },
}

// Form schemas
const profileFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).optional(),
    currentPassword: z.string().min(1, { message: "Please enter your current password." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }).optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const addressFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  addressLine1: z.string().min(5, { message: "Address must be at least 5 characters." }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postalCode: z.string().min(5, { message: "Postal code must be at least 5 characters." }),
  isDefault: z.boolean().default(false),
})

const paymentFormSchema = z.object({
  cardholderName: z.string().min(2, { message: "Cardholder name must be at least 2 characters." }),
  cardNumber: z.string().min(16, { message: "Card number must be at least 16 digits." }).max(19),
  expiryMonth: z.string().min(1, { message: "Please select expiry month." }),
  expiryYear: z.string().min(1, { message: "Please select expiry year." }),
  cvv: z.string().min(3, { message: "CVV must be at least 3 digits." }).max(4),
  isDefault: z.boolean().default(false),
  saveForFuture: z.boolean().default(true),
})

export default function UserDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const { getOrderById } = useOrder()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState(initialOrders)
  const [editingOrder, setEditingOrder] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isAddressEditOpen, setIsAddressEditOpen] = useState(false)
  const [isAddressAddOpen, setIsAddressAddOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [isPaymentEditOpen, setIsPaymentEditOpen] = useState(false)
  const [isPaymentAddOpen, setIsPaymentAddOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [addresses, setAddresses] = useState(savedAddresses)
  const [payments, setPayments] = useState(paymentMethods)
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null)

  // Form setup
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const addressForm = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
    },
  })

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
      saveForFuture: true,
    },
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user?.role === "admin") {
      router.push("/admin/dashboard")
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router, user, isLoading])

  // Reset forms when editing
  useEffect(() => {
    if (editingAddress) {
      addressForm.reset({
        name: editingAddress.name,
        addressLine1: editingAddress.address.split(",")[0].trim(),
        addressLine2: editingAddress.address.split(",").slice(1, -3).join(",").trim(),
        city: editingAddress.address.split(",").slice(-3)[0].trim(),
        state: editingAddress.address.split(",").slice(-2)[0].trim(),
        postalCode: editingAddress.address.split(",").slice(-1)[0].trim().split(" ")[1],
        isDefault: editingAddress.default,
      })
    }
  }, [editingAddress, addressForm])

  useEffect(() => {
    if (editingPayment) {
      paymentForm.reset({
        cardholderName: user?.name || "",
        cardNumber: `**** **** **** ${editingPayment.last4}`,
        expiryMonth: editingPayment.expiry.split("/")[0],
        expiryYear: `20${editingPayment.expiry.split("/")[1]}`,
        cvv: "",
        isDefault: editingPayment.default,
        saveForFuture: true,
      })
    }
  }, [editingPayment, paymentForm, user])

  // Reset success message after 3 seconds
  useEffect(() => {
    if (reorderSuccess) {
      const timer = setTimeout(() => {
        setReorderSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [reorderSuccess])

  if (isLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "user") {
    return null
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleSaveOrderChanges = () => {
    setOrders(orders.map((order) => (order.id === editingOrder.id ? editingOrder : order)))
    setIsEditDialogOpen(false)
    toast({
      title: "Order Updated",
      description: `Order ${editingOrder.id} has been updated successfully.`,
    })
  }

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId)
    setIsCancelDialogOpen(true)
  }

  const confirmCancelOrder = () => {
    setOrders(orders.map((order) => (order.id === orderToCancel ? { ...order, status: "Cancelled" } : order)))
    setIsCancelDialogOpen(false)
    toast({
      title: "Order Cancelled",
      description: `Order ${orderToCancel} has been cancelled.`,
      variant: "destructive",
    })
  }

  const markAllNotificationsAsRead = () => {
    // In a real app, this would call an API
    toast({
      title: "Notifications Marked as Read",
      description: "All notifications have been marked as read.",
    })
  }

  const reorderItems = (orderId: string) => {
    // Get the detailed order data
    const orderDetails = detailedOrderData[orderId as keyof typeof detailedOrderData]

    if (orderDetails && orderDetails.items) {
      // Add each item to the cart
      orderDetails.items.forEach((item) => {
        if (addToCart) {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: `/placeholder.svg?height=100&width=100&text=${encodeURIComponent(item.name)}`,
            requiresPrescription: orderDetails.prescriptionRequired,
          })
        }
      })

      setReorderSuccess(orderId)

      toast({
        title: "Items Added to Cart",
        description: `${orderDetails.items.length} items from order #${orderId} have been added to your cart.`,
      })
    }
  }

  const openOrderDetails = (orderId: string) => {
    setSelectedOrder(orderId)
    setIsOrderDetailsOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address)
    setIsAddressEditOpen(true)
  }

  const handleAddAddress = () => {
    addressForm.reset({
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      isDefault: false,
    })
    setIsAddressAddOpen(true)
  }

  const handleSaveAddress = (data: z.infer<typeof addressFormSchema>) => {
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          // If this is set as default, unset default on all others
          if (data.isDefault && !addr.default) {
            addresses.forEach((a) => {
              if (a.default) a.default = false
            })
          }

          return {
            ...addr,
            name: data.name,
            address: `${data.addressLine1}, ${data.addressLine2 ? data.addressLine2 + ", " : ""}${data.city}, ${data.state}, ${data.postalCode}`,
            default: data.isDefault,
          }
        }
        // If this address is being set as default, unset default on all others
        if (data.isDefault && addr.default) {
          return { ...addr, default: false }
        }
        return addr
      })

      setAddresses(updatedAddresses)
      setIsAddressEditOpen(false)
      toast({
        title: "Address Updated",
        description: "Your address has been updated successfully.",
      })
    } else {
      // Add new address
      const newAddress = {
        id: Date.now(),
        name: data.name,
        address: `${data.addressLine1}, ${data.addressLine2 ? data.addressLine2 + ", " : ""}${data.city}, ${data.state}, ${data.postalCode}`,
        default: data.isDefault,
      }

      // If this is set as default, unset default on all others
      if (data.isDefault) {
        setAddresses(addresses.map((addr) => ({ ...addr, default: false })).concat(newAddress))
      } else {
        setAddresses([...addresses, newAddress])
      }

      setIsAddressAddOpen(false)
      toast({
        title: "Address Added",
        description: "Your new address has been added successfully.",
      })
    }
  }

  const handleDeleteAddress = (addressId: number) => {
    const addressToDelete = addresses.find((addr) => addr.id === addressId)

    // If deleting the default address, set another as default
    if (addressToDelete?.default && addresses.length > 1) {
      const otherAddresses = addresses.filter((addr) => addr.id !== addressId)
      otherAddresses[0].default = true
    }

    setAddresses(addresses.filter((addr) => addr.id !== addressId))
    toast({
      title: "Address Deleted",
      description: "Your address has been deleted successfully.",
    })
  }

  const handleSetDefaultAddress = (addressId: number) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        default: addr.id === addressId,
      })),
    )

    toast({
      title: "Default Address Updated",
      description: "Your default address has been updated successfully.",
    })
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setIsPaymentEditOpen(true)
  }

  const handleAddPayment = () => {
    paymentForm.reset({
      cardholderName: user?.name || "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      isDefault: false,
      saveForFuture: true,
    })
    setIsPaymentAddOpen(true)
  }

  const handleSavePayment = (data: z.infer<typeof paymentFormSchema>) => {
    if (editingPayment) {
      // Update existing payment method
      const updatedPayments = payments.map((payment) => {
        if (payment.id === editingPayment.id) {
          // If this is set as default, unset default on all others
          if (data.isDefault && !payment.default) {
            payments.forEach((p) => {
              if (p.default) p.default = false
            })
          }

          return {
            ...payment,
            expiry: `${data.expiryMonth}/${data.expiryYear.slice(-2)}`,
            default: data.isDefault,
          }
        }
        // If this payment is being set as default, unset default on all others
        if (data.isDefault && payment.default) {
          return { ...payment, default: false }
        }
        return payment
      })

      setPayments(updatedPayments)
      setIsPaymentEditOpen(false)
      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully.",
      })
    } else {
      // Add new payment method
      const last4 = data.cardNumber.slice(-4)
      const newPayment = {
        id: Date.now(),
        type: "Credit Card",
        last4,
        expiry: `${data.expiryMonth}/${data.expiryYear.slice(-2)}`,
        default: data.isDefault,
      }

      // If this is set as default, unset default on all others
      if (data.isDefault) {
        setPayments(payments.map((payment) => ({ ...payment, default: false })).concat(newPayment))
      } else {
        setPayments([...payments, newPayment])
      }

      setIsPaymentAddOpen(false)
      toast({
        title: "Payment Method Added",
        description: "Your new payment method has been added successfully.",
      })
    }
  }

  const handleDeletePayment = (paymentId: number) => {
    const paymentToDelete = payments.find((payment) => payment.id === paymentId)

    // If deleting the default payment, set another as default
    if (paymentToDelete?.default && payments.length > 1) {
      const otherPayments = payments.filter((payment) => payment.id !== paymentId)
      otherPayments[0].default = true
    }

    setPayments(payments.filter((payment) => payment.id !== paymentId))
    toast({
      title: "Payment Method Deleted",
      description: "Your payment method has been deleted successfully.",
    })
  }

  const handleSetDefaultPayment = (paymentId: number) => {
    setPayments(
      payments.map((payment) => ({
        ...payment,
        default: payment.id === paymentId,
      })),
    )

    toast({
      title: "Default Payment Method Updated",
      description: "Your default payment method has been updated successfully.",
    })
  }

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    // In a real app, this would call an API to update the user profile
    if (updateUserProfile) {
      updateUserProfile({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
      })
    }

    setIsProfileEditOpen(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "User Dashboard" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="card-futuristic">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mb-3">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Active Orders</h3>
            <p className="text-3xl font-bold">{orders.filter((o) => o.status === "In Transit").length}</p>
          </CardContent>
        </Card>
        <Card className="card-futuristic">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Past Orders</h3>
            <p className="text-3xl font-bold">{orders.filter((o) => o.status === "Delivered").length}</p>
          </CardContent>
        </Card>
        <Card className="card-futuristic">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full mb-3">
              <CreditCard className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Payment Methods</h3>
            <p className="text-3xl font-bold">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className="card-futuristic">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mb-3">
              <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Saved Addresses</h3>
            <p className="text-3xl font-bold">{addresses.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            <Badge className="ml-2" variant="destructive">
              {notifications.filter((n) => !n.read).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Button asChild>
                <Link href="/medicines">
                  <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
                  New Order
                </Link>
              </Button>
            </div>

            {orders.map((order) => (
              <Card key={order.id} className="card-futuristic">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id}</CardTitle>
                      <CardDescription>Placed on {order.date}</CardDescription>
                    </div>
                    <Badge
                      className={
                        order.status === "Delivered"
                          ? "bg-green-500"
                          : order.status === "In Transit"
                            ? "bg-blue-500"
                            : order.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-gray-500"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">Items:</p>
                    <ul className="list-disc pl-5">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="font-medium mt-2">Total: {order.total}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/tracking?id=${order.id}`}>Track Order</Link>
                    </Button>
                    <Button variant="outline" onClick={() => openOrderDetails(order.id)}>
                      <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                      Order Details
                    </Button>
                    {reorderSuccess === order.id ? (
                      <Badge variant="secondary">
                        <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                        Reordered!
                      </Badge>
                    ) : (
                      <Button variant="outline" onClick={() => reorderItems(order.id)} aria-label="Reorder these items">
                        <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
                        Reorder
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.editable && (
                      <>
                        <Button variant="outline" onClick={() => handleEditOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" aria-hidden="true" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <Button onClick={handleAddAddress}>Add New Address</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {addresses.map((address) => (
                <Card key={address.id} className="card-futuristic">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{address.name}</CardTitle>
                      {address.default && <Badge>Default</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{address.address}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleEditAddress(address)}>
                      Edit
                    </Button>
                    {!address.default ? (
                      <Button variant="outline" onClick={() => handleSetDefaultAddress(address.id)}>
                        Set as Default
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Methods</h2>
              <Button onClick={handleAddPayment}>Add Payment Method</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {payments.map((payment) => (
                <Card key={payment.id} className="card-futuristic">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        {payment.type} ending in {payment.last4}
                      </CardTitle>
                      {payment.default && <Badge>Default</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">Expires: {payment.expiry}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleEditPayment(payment)}>
                      Edit
                    </Button>
                    {!payment.default ? (
                      <Button variant="outline" onClick={() => handleSetDefaultPayment(payment.id)}>
                        Set as Default
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Profile Information</h2>
              <Button onClick={() => setIsProfileEditOpen(true)}>Edit Profile</Button>
            </div>

            <Card className="card-futuristic">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>View and manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-gray-600 dark:text-gray-400">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-gray-600 dark:text-gray-400">{user?.phone || "Not provided"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Button variant="outline" onClick={markAllNotificationsAsRead}>
                Mark All as Read
              </Button>
            </div>

            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`card-futuristic ${notification.read ? "opacity-70" : ""}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${notification.read ? "bg-gray-100 dark:bg-gray-800" : "bg-purple-100 dark:bg-purple-900/50"}`}
                    >
                      <Bell
                        className={`h-5 w-5 ${notification.read ? "text-gray-500" : "text-purple-600 dark:text-purple-400"}`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`${notification.read ? "font-normal" : "font-medium"}`}>{notification.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <Button variant="ghost" size="sm">
                        Mark as Read
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Order #{editingOrder?.id}</DialogTitle>
            <DialogDescription>
              Make changes to your order. Only certain fields can be modified for orders that haven't been dispatched
              yet.
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Delivery Address</Label>
                <Textarea
                  id="delivery-address"
                  value={editingOrder.deliveryAddress || "123 Main St, Apt 4B, Mumbai, Maharashtra, 400001"}
                  onChange={(e) => setEditingOrder({ ...editingOrder, deliveryAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-instructions">Delivery Instructions</Label>
                <Textarea
                  id="delivery-instructions"
                  value={editingOrder.deliveryInstructions || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, deliveryInstructions: e.target.value })}
                  placeholder="E.g., Gate code, landmark, or special instructions for the drone delivery"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select
                  value={editingOrder.paymentMethod || "card1"}
                  onValueChange={(value) => setEditingOrder({ ...editingOrder, paymentMethod: value })}
                >
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card1">Visa ending in 4242 (Default)</SelectItem>
                    <SelectItem value="card2">Mastercard ending in 1234</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrderChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information about your order</DialogDescription>
          </DialogHeader>
          {selectedOrder && detailedOrderData[selectedOrder as keyof typeof detailedOrderData] && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{selectedOrder}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].date}
                  </p>
                </div>
                <Badge
                  className={
                    detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status === "Delivered"
                      ? "bg-green-500"
                      : detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status === "In Transit"
                        ? "bg-blue-500"
                        : detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status === "Cancelled"
                          ? "bg-red-500"
                          : "bg-gray-500"
                  }
                >
                  {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status}
                </Badge>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.name} ({item.unit})
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        {formatCurrency(detailedOrderData[selectedOrder as keyof typeof detailedOrderData].subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>
                        {formatCurrency(detailedOrderData[selectedOrder as keyof typeof detailedOrderData].tax)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {formatCurrency(detailedOrderData[selectedOrder as keyof typeof detailedOrderData].deliveryFee)}
                      </span>
                    </div>
                    {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>
                          -{formatCurrency(detailedOrderData[selectedOrder as keyof typeof detailedOrderData].discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>
                        {formatCurrency(detailedOrderData[selectedOrder as keyof typeof detailedOrderData].total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="delivery">
                  <AccordionTrigger>Delivery Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Delivery Address:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].deliveryAddress}
                        </p>
                      </div>
                      {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].deliveryInstructions && (
                        <div>
                          <span className="font-medium">Delivery Instructions:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].deliveryInstructions}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Contactless Delivery:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].contactless
                            ? "Yes"
                            : "No"}
                        </p>
                      </div>
                      {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status === "In Transit" && (
                        <div>
                          <span className="font-medium">Estimated Delivery:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].estimatedDelivery}
                          </p>
                        </div>
                      )}
                      {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].status === "Delivered" && (
                        <div>
                          <span className="font-medium">Delivered At:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].deliveredAt}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Payment Information */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payment">
                  <AccordionTrigger>Payment Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Payment Method:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].paymentMethod}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Payment Status:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].paymentStatus}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Tracking Information */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tracking">
                  <AccordionTrigger>Tracking Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Drone ID:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].trackingInfo.droneId}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Current Location:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {
                            detailedOrderData[selectedOrder as keyof typeof detailedOrderData].trackingInfo
                              .currentLocation
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <p className="text-gray-600 dark:text-gray-400">
                          {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].trackingInfo.lastUpdated}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Prescription Information */}
              {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].prescriptionRequired && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="prescription">
                    <AccordionTrigger>Prescription Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Prescription Required:</span>
                          <p className="text-gray-600 dark:text-gray-400">Yes</p>
                        </div>
                        <div>
                          <span className="font-medium">Prescription Status:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {detailedOrderData[selectedOrder as keyof typeof detailedOrderData].prescriptionStatus}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" asChild>
              <Link href={`/tracking?id=${selectedOrder}`}>Track Order</Link>
            </Button>
            <Button variant="outline" onClick={() => reorderItems(selectedOrder || "")}>
              <ShoppingCart className="h-4 w-4 mr-2" aria-hidden="true" />
              Reorder Items
            </Button>
            <Button onClick={() => setIsOrderDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Make changes to your profile information.</DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="mail@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-fit p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">Show password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-fit p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">Show password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-fit p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">Show password</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProfileEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={isAddressEditOpen} onOpenChange={setIsAddressEditOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>Make changes to your saved address.</DialogDescription>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(handleSaveAddress)} className="space-y-8">
              <FormField
                control={addressForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Work, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address, P.O. box, company name, c/o" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, building, floor, unit, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addressForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default Address</FormLabel>
                      <FormDescription>This address will be used as your default shipping address.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddressEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={isAddressAddOpen} onOpenChange={setIsAddressAddOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>Add a new address to your saved addresses.</DialogDescription>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(handleSaveAddress)} className="space-y-8">
              <FormField
                control={addressForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Work, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address, P.O. box, company name, c/o" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, building, floor, unit, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addressForm.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default Address</FormLabel>
                      <FormDescription>This address will be used as your default shipping address.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddressAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Address
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={isPaymentEditOpen} onOpenChange={setIsPaymentEditOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Make changes to your saved payment method.</DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleSavePayment)} className="space-y-8">
              <FormField
                control={paymentForm.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardholder Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="**** **** **** 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
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
                  control={paymentForm.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="CVV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={paymentForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default Payment Method</FormLabel>
                      <FormDescription>
                        This payment method will be used as your default payment method.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentAddOpen} onOpenChange={setIsPaymentAddOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>Add a new payment method to your saved payment methods.</DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleSavePayment)} className="space-y-8">
              <FormField
                control={paymentForm.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Cardholder Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="**** **** **** 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                              {month.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
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
                  control={paymentForm.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="CVV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={paymentForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Set as Default Payment Method</FormLabel>
                      <FormDescription>
                        This payment method will be used as your default payment method.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
