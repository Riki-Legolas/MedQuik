"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useOrder, type Order } from "@/contexts/order-context"
import { useRealTime } from "@/contexts/real-time-context"
import { Breadcrumb } from "@/components/breadcrumb"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  DrillIcon as Drone,
  MapPin,
  User,
  CreditCard,
} from "lucide-react"

// Mock drone data
const availableDrones = [
  { id: "DRN-42X", status: "Available", battery: "98%", lastMaintenance: "Apr 5, 2025" },
  { id: "DRN-56Y", status: "Available", battery: "85%", lastMaintenance: "Apr 8, 2025" },
  { id: "DRN-78Z", status: "Available", battery: "92%", lastMaintenance: "Apr 10, 2025" },
  { id: "DRN-91A", status: "Available", battery: "76%", lastMaintenance: "Apr 12, 2025" },
]

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()
  const {
    orders,
    getPendingOrders,
    getProcessingOrders,
    getInTransitOrders,
    getDeliveredOrders,
    getCancelledOrders,
    approveOrder,
    rejectOrder,
    assignDroneToOrder,
    dispatchOrder,
  } = useOrder()
  const { publishEvent, subscribeToEvent } = useRealTime()

  // All state hooks must be called unconditionally at the top level
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDroneDialogOpen, setIsDroneDialogOpen] = useState(false)
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedDrone, setSelectedDrone] = useState("")
  const [pageLoading, setPageLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

  // Use a single useEffect for authentication and loading
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user?.role !== "admin") {
        router.push("/")
      } else {
        setIsAdmin(true)
      }

      // Simulate loading data
      timer = setTimeout(() => {
        setPageLoading(false)
      }, 1000)
    }

    return () => clearTimeout(timer)
  }, [isAuthenticated, router, user, isLoading])

  // Separate useEffect for order filtering
  useEffect(() => {
    // Get orders based on active tab
    let orderList: Order[] = []

    if (orders) {
      switch (activeTab) {
        case "pending":
          orderList = getPendingOrders ? getPendingOrders() : []
          break
        case "processing":
          orderList = getProcessingOrders ? getProcessingOrders() : []
          break
        case "in-transit":
          orderList = getInTransitOrders ? getInTransitOrders() : []
          break
        case "delivered":
          orderList = getDeliveredOrders ? getDeliveredOrders() : []
          break
        case "cancelled":
          orderList = getCancelledOrders ? getCancelledOrders() : []
          break
        case "all":
          orderList = orders
          break
        default:
          orderList = []
      }

      // Filter orders based on search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        orderList = orderList.filter(
          (order) =>
            order.id.toLowerCase().includes(query) ||
            order.customer.toLowerCase().includes(query) ||
            order.items.some((item) => item.toLowerCase().includes(query)),
        )
      }
    }

    setFilteredOrders(orderList)
  }, [
    activeTab,
    searchQuery,
    orders,
    getPendingOrders,
    getProcessingOrders,
    getInTransitOrders,
    getDeliveredOrders,
    getCancelledOrders,
  ])

  // Subscribe to new order events - separate useEffect
  useEffect(() => {
    if (!subscribeToEvent) return

    const unsubscribe = subscribeToEvent("order_created", (data) => {
      // Refresh orders or add the new order to the list
      toast({
        title: "New Order Received",
        description: `Order #${data.orderId} has been placed and is awaiting your approval`,
        variant: "default",
      })

      // Play notification sound
      const audio = new Audio("/notification.mp3")
      audio.play().catch((e) => console.log("Audio playback prevented:", e))
    })

    return () => {
      unsubscribe()
    }
  }, [subscribeToEvent, toast])

  if (isLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const handleApproveOrder = () => {
    if (!selectedOrder || !approveOrder) return

    approveOrder(selectedOrder.id)

    toast({
      title: "Order Approved",
      description: `Order ${selectedOrder.id} has been approved and is now being processed.`,
    })

    setIsApproveDialogOpen(false)
    setSelectedOrder(null)
  }

  const handleRejectOrder = () => {
    if (!selectedOrder || !rejectionReason || !rejectOrder) return

    rejectOrder(selectedOrder.id, rejectionReason)

    toast({
      title: "Order Rejected",
      description: `Order ${selectedOrder.id} has been rejected.`,
      variant: "destructive",
    })

    setIsRejectDialogOpen(false)
    setRejectionReason("")
    setSelectedOrder(null)
  }

  const handleAssignDrone = () => {
    if (!selectedOrder || !selectedDrone || !assignDroneToOrder) return

    assignDroneToOrder(selectedOrder.id, selectedDrone)

    toast({
      title: "Drone Assigned",
      description: `Drone ${selectedDrone} has been assigned to order ${selectedOrder.id}.`,
    })

    setIsDroneDialogOpen(false)
    setSelectedDrone("")
    setSelectedOrder(null)
  }

  const handleDispatchOrder = () => {
    if (!selectedOrder || !selectedOrder.droneId || !dispatchOrder) return

    dispatchOrder(selectedOrder.id)

    toast({
      title: "Order Dispatched",
      description: `Order ${selectedOrder.id} has been dispatched with drone ${selectedOrder.droneId}.`,
    })

    setIsDispatchDialogOpen(false)
    setSelectedOrder(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return <Badge className="bg-yellow-500">Pending Approval</Badge>
      case "Processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "In Transit":
        return <Badge className="bg-purple-500">In Transit</Badge>
      case "Delivered":
        return <Badge className="bg-green-500">Delivered</Badge>
      case "Cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingOrdersCount = getPendingOrders ? getPendingOrders().length : 0
  const processingOrdersCount = getProcessingOrders ? getProcessingOrders().length : 0
  const inTransitOrdersCount = getInTransitOrders ? getInTransitOrders().length : 0
  const deliveredOrdersCount = getDeliveredOrders ? getDeliveredOrders().length : 0
  const cancelledOrdersCount = getCancelledOrders ? getCancelledOrders().length : 0

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Order Management" }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-gray-500">Manage and track all customer orders</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders by ID, customer, or items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5 mb-8">
        <Card className="bg-yellow-50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-yellow-100 p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Pending</h3>
            <p className="text-3xl font-bold">{pendingOrdersCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Package className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Processing</h3>
            <p className="text-3xl font-bold">{processingOrdersCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <Truck className="h-6 w-6 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="font-medium">In Transit</h3>
            <p className="text-3xl font-bold">{inTransitOrdersCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Delivered</h3>
            <p className="text-3xl font-bold">{deliveredOrdersCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-3">
              <XCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="font-medium">Cancelled</h3>
            <p className="text-3xl font-bold">{cancelledOrdersCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "No orders match your search criteria"
                    : `There are no ${activeTab.replace("-", " ")} orders at the moment`}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Order #{order.id}
                          {order.droneId && (
                            <Badge variant="outline" className="ml-2">
                              Drone: {order.droneId}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>Placed on {order.date}</CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <User className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Customer</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Delivery Address</p>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Payment</p>
                          <p className="text-sm text-gray-600">
                            {order.paymentMethod} ({order.paymentStatus})
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium">Items:</p>
                      <ul className="list-disc pl-5">
                        {order.items.map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="font-medium mt-2">Total: ₹{order.total.toLocaleString()}</p>
                    </div>

                    {order.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md">
                        <p className="font-medium text-red-600">Rejection Reason:</p>
                        <p className="text-sm text-red-600">{order.rejectionReason}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap justify-between gap-2 bg-gray-50 border-t">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => router.push(`/tracking?id=${order.id}`)}>
                        Track Order
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "Pending Approval" && (
                        <>
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsApproveDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsRejectDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {order.status === "Processing" && !order.droneId && (
                        <Button
                          variant="default"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDroneDialogOpen(true)
                          }}
                        >
                          <Drone className="h-4 w-4 mr-2" />
                          Assign Drone
                        </Button>
                      )}

                      {order.status === "Processing" && order.droneId && (
                        <Button
                          variant="default"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDispatchDialogOpen(true)
                          }}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Approve Order Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this order? This will move it to the processing stage.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-medium text-lg">Order #{selectedOrder?.id}</p>
              <p className="text-sm text-gray-500">Customer: {selectedOrder?.customer}</p>
              <p className="text-sm text-gray-500">Total: ₹{selectedOrder?.total?.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Date: {selectedOrder?.date}</p>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Items:</p>
              <ul className="list-disc pl-5">
                {selectedOrder?.items.map((item, index) => (
                  <li key={index} className="text-gray-600">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Approving this order will allow it to proceed to processing, after which it can be assigned to a drone
                for delivery.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveOrder} className="bg-green-600 hover:bg-green-700">
              Approve Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order. This information will be shared with the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">Order #{selectedOrder?.id}</p>
            <p className="text-sm text-gray-500 mb-4">Customer: {selectedOrder?.customer}</p>
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRejectOrder} variant="destructive" disabled={!rejectionReason.trim()}>
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Drone Dialog */}
      <Dialog open={isDroneDialogOpen} onOpenChange={setIsDroneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Drone</DialogTitle>
            <DialogDescription>Select a drone to assign to this order for delivery.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">Order #{selectedOrder?.id}</p>
            <p className="text-sm text-gray-500 mb-4">Delivery to: {selectedOrder?.deliveryAddress}</p>
            <Label htmlFor="drone-select">Select Drone</Label>
            <Select value={selectedDrone} onValueChange={setSelectedDrone}>
              <SelectTrigger id="drone-select" className="mt-2">
                <SelectValue placeholder="Select a drone" />
              </SelectTrigger>
              <SelectContent>
                {availableDrones.map((drone) => (
                  <SelectItem key={drone.id} value={drone.id}>
                    {drone.id} - Battery: {drone.battery}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDrone && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium">Drone Information</p>
                <p className="text-sm">Battery: {availableDrones.find((d) => d.id === selectedDrone)?.battery}</p>
                <p className="text-sm">
                  Last Maintenance: {availableDrones.find((d) => d.id === selectedDrone)?.lastMaintenance}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDroneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDrone} disabled={!selectedDrone}>
              Assign Drone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispatch Order Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dispatch Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to dispatch this order? This will send the drone for delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">Order #{selectedOrder?.id}</p>
            <p className="text-sm text-gray-500">Customer: {selectedOrder?.customer}</p>
            <p className="text-sm text-gray-500">Drone: {selectedOrder?.droneId}</p>
            <p className="text-sm text-gray-500">Delivery to: {selectedOrder?.deliveryAddress}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDispatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDispatchOrder} className="bg-purple-600 hover:bg-purple-700">
              Dispatch Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
