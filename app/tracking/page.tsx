"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Package, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { useOrder } from "@/contexts/order-context"
import { useRealTime } from "@/contexts/real-time-context"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Breadcrumb } from "@/components/breadcrumb"

// Bangalore locations
const LOCATIONS = {
  // Pharmacy locations in Bangalore
  pharmacies: [
    { name: "MedQuik Pharmacy - Indiranagar", lat: 12.9784, lng: 77.6408 },
    { name: "MedQuik Pharmacy - Koramangala", lat: 12.9352, lng: 77.6245 },
    { name: "MedQuik Pharmacy - Whitefield", lat: 12.9698, lng: 77.7499 },
    { name: "MedQuik Pharmacy - Jayanagar", lat: 12.9299, lng: 77.5933 },
  ],
  // Delivery locations in Bangalore
  deliveryLocations: [
    { name: "Residential Area - HSR Layout", lat: 12.9116, lng: 77.6741 },
    { name: "Residential Area - JP Nagar", lat: 12.9077, lng: 77.5906 },
    { name: "Residential Area - Marathahalli", lat: 12.9591, lng: 77.6974 },
    { name: "Residential Area - Bannerghatta Road", lat: 12.8698, lng: 77.5978 },
  ],
}

// Declare google variable
declare global {
  interface Window {
    google?: any
  }
}

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id") || searchParams.get("orderId")
  const { orders, getOrderById } = useOrder()
  const { subscribeToEvent } = useRealTime()
  const { toast } = useToast()

  const [trackingNumber, setTrackingNumber] = useState(orderId || "")
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("status")

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const pathRef = useRef<google.maps.Polyline | null>(null)
  const originMarkerRef = useRef<google.maps.Marker | null>(null)
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null)

  // Check for order ID in URL params
  useEffect(() => {
    if (orderId) {
      setTrackingNumber(orderId)
      handleTracking(orderId)
    }
  }, [orderId])

  // Subscribe to order updates
  useEffect(() => {
    if (!trackingResult) return

    const unsubscribe = subscribeToEvent("order_update", (data) => {
      if (data.orderId === trackingResult.orderId) {
        // Update tracking result with new status
        setTrackingResult((prev: any) => ({
          ...prev,
          status: data.status,
          events: [
            {
              time: new Date().toLocaleString(),
              description: `Status updated to ${data.status}`,
              location: data.location || "MedQuik System",
            },
            ...prev.events,
          ],
        }))

        // Show toast for status updates
        toast({
          title: `Order ${data.status}`,
          description: `Order ${data.orderId} status updated to ${data.status}`,
        })

        // Update map if status changed to In Transit
        if (data.status === "In Transit" && mapLoaded && googleMapRef.current) {
          updateDronePosition()
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [trackingResult, subscribeToEvent, toast, mapLoaded])

  // Load Google Maps script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google?.maps && trackingResult) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
      return () => {
        document.head.removeChild(script)
      }
    } else if (window.google?.maps) {
      setMapLoaded(true)
    }
  }, [trackingResult])

  // Initialize map when tracking result and map script are loaded
  useEffect(() => {
    if (mapLoaded && trackingResult && mapRef.current) {
      initializeMap()
    }
  }, [mapLoaded, trackingResult])

  // Simulate drone movement for demo purposes
  useEffect(() => {
    if (!trackingResult || trackingResult.status !== "In Transit" || !mapLoaded || !markerRef.current) return

    const interval = setInterval(() => {
      updateDronePosition()
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [trackingResult, mapLoaded])

  const updateDronePosition = () => {
    if (!googleMapRef.current || !markerRef.current || !trackingResult) return

    // Get current position
    const currentPosition = markerRef.current.getPosition()
    if (!currentPosition) return

    // Get destination
    const destination = destinationMarkerRef.current?.getPosition()
    if (!destination) return

    // Calculate new position with slight randomization for realistic movement
    const lat = currentPosition.lat() + (destination.lat() - currentPosition.lat()) * 0.1 * (0.8 + Math.random() * 0.4)
    const lng = currentPosition.lng() + (destination.lng() - currentPosition.lng()) * 0.1 * (0.8 + Math.random() * 0.4)

    // Update marker position
    markerRef.current.setPosition({ lat, lng })

    // Update info window content
    if (window.google?.maps) {
      const droneInfo = new window.google.maps.InfoWindow({
        content: `<div><strong>Drone ID:</strong> ${trackingResult.droneId || "DRN-42X"}<br><strong>Status:</strong> ${trackingResult.status}<br><strong>Updated:</strong> ${new Date().toLocaleTimeString()}</div>`,
      })

      // Open the info window if it was previously open
      if (markerRef.current.map.getStreetView().getVisible()) {
        droneInfo.open(googleMapRef.current, markerRef.current)
      }
    }

    // Check if drone has reached destination (within 0.0005 degrees)
    if (Math.abs(lat - destination.lat()) < 0.0005 && Math.abs(lng - destination.lng()) < 0.0005) {
      // Drone has reached destination, update status to Delivered
      setTrackingResult((prev: any) => ({
        ...prev,
        status: "Delivered",
        events: [
          {
            time: new Date().toLocaleString(),
            description: "Order delivered",
            location: prev.deliveryAddress,
          },
          ...prev.events,
        ],
      }))

      toast({
        title: "Order Delivered",
        description: `Order ${trackingResult.orderId} has been delivered successfully!`,
        variant: "success",
      })
    }
  }

  const initializeMap = () => {
    if (!mapRef.current || !trackingResult) return

    // Clear previous markers and paths
    if (markerRef.current) markerRef.current.setMap(null)
    if (pathRef.current) pathRef.current.setMap(null)
    if (originMarkerRef.current) originMarkerRef.current.setMap(null)
    if (destinationMarkerRef.current) destinationMarkerRef.current.setMap(null)

    // Get random origin and destination from our predefined locations
    const originIndex = Math.floor(Math.random() * LOCATIONS.pharmacies.length)
    const destinationIndex = Math.floor(Math.random() * LOCATIONS.deliveryLocations.length)

    const origin = LOCATIONS.pharmacies[originIndex]
    const destination = LOCATIONS.deliveryLocations[destinationIndex]

    // Create map centered between origin and destination
    const center = {
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2,
    }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      mapId: "DEMO_MAP_ID",
    })

    googleMapRef.current = map

    // Add markers for origin and destination
    const originMarker = new window.google.maps.Marker({
      position: origin,
      map,
      title: origin.name,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      },
    })
    originMarkerRef.current = originMarker

    const destinationMarker = new window.google.maps.Marker({
      position: destination,
      map,
      title: destination.name,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    })
    destinationMarkerRef.current = destinationMarker

    // Create a path between origin and destination
    const path = [
      { lat: origin.lat, lng: origin.lng },
      {
        lat: origin.lat + (destination.lat - origin.lat) * 0.25,
        lng: origin.lng + (destination.lng - origin.lng) * 0.3,
      },
      {
        lat: origin.lat + (destination.lat - origin.lat) * 0.5,
        lng: origin.lng + (destination.lng - origin.lng) * 0.6,
      },
      {
        lat: origin.lat + (destination.lat - origin.lat) * 0.75,
        lng: origin.lng + (destination.lng - origin.lng) * 0.7,
      },
      { lat: destination.lat, lng: destination.lng },
    ]

    // Draw the path
    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    })
    polyline.setMap(map)
    pathRef.current = polyline

    // Calculate drone position based on order status
    let dronePosition
    switch (trackingResult.status) {
      case "Pending Approval":
      case "Processing":
        dronePosition = origin // At origin
        break
      case "In Transit":
        // Position the drone 25% along the path
        dronePosition = {
          lat: origin.lat + (destination.lat - origin.lat) * 0.25,
          lng: origin.lng + (destination.lng - origin.lng) * 0.25,
        }
        break
      case "Delivered":
        dronePosition = destination // At destination
        break
      default:
        dronePosition = origin
    }

    // Add drone marker
    const droneMarker = new window.google.maps.Marker({
      position: dronePosition,
      map,
      title: `Drone ${trackingResult.droneId || "DRN-42X"}`,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
      animation: trackingResult.status === "In Transit" ? window.google.maps.Animation.BOUNCE : null,
    })
    markerRef.current = droneMarker

    // Add info windows
    const originInfo = new window.google.maps.InfoWindow({
      content: `<div><strong>${origin.name}</strong><br>Pickup Location</div>`,
    })

    const destinationInfo = new window.google.maps.InfoWindow({
      content: `<div><strong>${destination.name}</strong><br>Delivery Location</div>`,
    })

    const droneInfo = new window.google.maps.InfoWindow({
      content: `<div><strong>Drone ID:</strong> ${trackingResult.droneId || "DRN-42X"}<br><strong>Status:</strong> ${trackingResult.status}</div>`,
    })

    // Add click listeners to markers
    window.google.maps.event.addListener(originMarker, "click", () => {
      originInfo.open(map, originMarker)
    })

    window.google.maps.event.addListener(destinationMarker, "click", () => {
      destinationInfo.open(map, destinationMarker)
    })

    window.google.maps.event.addListener(droneMarker, "click", () => {
      droneInfo.open(map, droneMarker)
    })

    // Show origin and destination info on map load
    setTimeout(() => {
      if (trackingResult.status === "In Transit") {
        droneInfo.open(map, droneMarker)
      }
    }, 1000)
  }

  const handleTracking = (id?: string) => {
    const trackingId = id || trackingNumber

    if (!trackingId.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setIsLoading(true)
    setError("")

    // First check if the order exists in our order context
    const orderFromContext = getOrderById(trackingId)

    // Simulate API call
    setTimeout(() => {
      if (orderFromContext) {
        // Create tracking data based on order context
        const trackingData = {
          orderId: orderFromContext.id,
          status: orderFromContext.status,
          estimatedDelivery: getEstimatedDelivery(orderFromContext.status),
          currentLocation: getCurrentLocation(orderFromContext.status),
          items: orderFromContext.items,
          events: generateEvents(orderFromContext),
          droneId: orderFromContext.droneId || generateDroneId(),
          droneSpeed: getDroneSpeed(orderFromContext.status),
          droneAltitude: getDroneAltitude(orderFromContext.status),
          recipientName: orderFromContext.customer,
          deliveryAddress: orderFromContext.address || orderFromContext.deliveryAddress || "123 Main St, Bangalore",
          total: orderFromContext.total,
          paymentMethod: orderFromContext.paymentMethod || "Credit Card",
          paymentStatus: orderFromContext.paymentStatus || "Paid",
        }

        setTrackingResult(trackingData)
        setError("")
      } else {
        // If not in context, create mock data
        const mockData = createMockTrackingData(trackingId)

        if (mockData) {
          setTrackingResult(mockData)
          setError("")
        } else {
          setTrackingResult(null)
          setError("No tracking information found for this number")
          toast({
            title: "Order Not Found",
            description: "We couldn't find any tracking information for this order ID.",
            variant: "destructive",
          })
        }
      }

      setIsLoading(false)
    }, 1000)
  }

  // Helper functions
  const getEstimatedDelivery = (status: string) => {
    const now = new Date()
    switch (status) {
      case "Delivered":
        return "Delivered"
      case "Cancelled":
        return "Cancelled"
      case "In Transit":
        now.setMinutes(now.getMinutes() + 30)
        return now.toLocaleString()
      case "Processing":
        now.setHours(now.getHours() + 1)
        return now.toLocaleString()
      case "Pending Approval":
        now.setHours(now.getHours() + 2)
        return now.toLocaleString()
      default:
        return "Unknown"
    }
  }

  const getCurrentLocation = (status: string) => {
    switch (status) {
      case "Delivered":
        return "Delivered to destination"
      case "Cancelled":
        return "Order cancelled"
      case "In Transit":
        return "En route to destination"
      case "Processing":
        return "MedQuik Pharmacy"
      case "Pending Approval":
        return "Awaiting approval"
      default:
        return "Unknown"
    }
  }

  const generateEvents = (order: any) => {
    const events = [
      {
        time: order.date,
        description: "Order placed",
        location: "Online",
      },
    ]

    if (
      order.status === "Pending Approval" ||
      order.status === "Processing" ||
      order.status === "In Transit" ||
      order.status === "Delivered"
    ) {
      events.push({
        time: getTimeOffset(order.date, 30),
        description: "Order confirmed",
        location: "MedQuik HQ",
      })
    }

    if (order.status === "Processing" || order.status === "In Transit" || order.status === "Delivered") {
      events.push({
        time: getTimeOffset(order.date, 60),
        description: "Order processed",
        location: "MedQuik Pharmacy",
      })
    }

    if (order.status === "In Transit" || order.status === "Delivered") {
      events.push({
        time: getTimeOffset(order.date, 90),
        description: "Drone dispatched",
        location: "MedQuik Drone Hub",
      })
    }

    if (order.status === "Delivered") {
      events.push({
        time: getTimeOffset(order.date, 120),
        description: "Order delivered",
        location: order.address || order.deliveryAddress || "Delivery Address",
      })
    }

    if (order.status === "Cancelled") {
      events.push({
        time: getTimeOffset(order.date, 45),
        description: "Order cancelled",
        location: "MedQuik System",
        reason: order.rejectionReason || "Customer request",
      })
    }

    return events.reverse() // Most recent first
  }

  const getTimeOffset = (baseTime: string, minutesOffset: number) => {
    const date = new Date(baseTime)
    date.setMinutes(date.getMinutes() + minutesOffset)
    return date.toLocaleString()
  }

  const generateDroneId = () => {
    return "DRN-" + Math.floor(10 + Math.random() * 90) + String.fromCharCode(65 + Math.floor(Math.random() * 26))
  }

  const getDroneSpeed = (status: string) => {
    switch (status) {
      case "In Transit":
        return Math.floor(40 + Math.random() * 20) + " km/h"
      case "Delivered":
      case "Cancelled":
      case "Processing":
      case "Pending Approval":
      default:
        return "0 km/h"
    }
  }

  const getDroneAltitude = (status: string) => {
    switch (status) {
      case "In Transit":
        return Math.floor(100 + Math.random() * 50) + " meters"
      case "Delivered":
      case "Cancelled":
      case "Processing":
      case "Pending Approval":
      default:
        return "0 meters"
    }
  }

  const createMockTrackingData = (trackingId: string) => {
    // Create random status
    const statuses = ["Pending Approval", "Processing", "In Transit", "Delivered"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    return {
      orderId: trackingId,
      status: randomStatus,
      estimatedDelivery: getEstimatedDelivery(randomStatus),
      currentLocation: getCurrentLocation(randomStatus),
      items: ["Medicine 1", "Medicine 2"],
      events: [
        {
          time: new Date().toLocaleString(),
          description: "Order placed",
          location: "Online",
        },
      ],
      droneId: generateDroneId(),
      droneSpeed: getDroneSpeed(randomStatus),
      droneAltitude: getDroneAltitude(randomStatus),
      recipientName: "Customer",
      deliveryAddress: "123 Main St, Bangalore",
      total: "₹2,500",
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100"
      case "In Transit":
        return "text-blue-600 bg-blue-100"
      case "Processing":
        return "text-yellow-600 bg-yellow-100"
      case "Pending Approval":
        return "text-purple-600 bg-purple-100"
      case "Cancelled":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">Track Your Order</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Enter your tracking number to get real-time updates on your delivery
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter tracking number (e.g., MQ12345678)"
              className="pl-10"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTracking()}
            />
          </div>
          <Button onClick={() => handleTracking()} disabled={isLoading}>
            {isLoading ? "Tracking..." : "Track Order"}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <p className="text-sm text-gray-500 mt-2">Enter your order ID to track your delivery in real-time</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      )}

      {trackingResult && !isLoading && (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Order #{trackingResult.orderId}</h2>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status)}`}
                  >
                    {trackingResult.status}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-medium">{trackingResult.estimatedDelivery}</p>
                </div>
              </div>

              <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="details">Order Details</TabsTrigger>
                  <TabsTrigger value="drone">Drone Info</TabsTrigger>
                </TabsList>

                <TabsContent value="status" className="pt-6">
                  <div className="space-y-8">
                    {trackingResult.events.map((event: any, index: number) => (
                      <div key={index} className="relative pl-8">
                        {index < trackingResult.events.length - 1 && (
                          <div className="absolute left-3.5 top-3 h-full w-px bg-gray-200"></div>
                        )}
                        <div className="absolute left-0 top-1 rounded-full bg-blue-100 p-1.5">
                          <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                        </div>
                        <div>
                          <p className="font-medium">{event.description}</p>
                          <p className="text-sm text-gray-500">{event.time}</p>
                          <p className="text-sm text-gray-500">{event.location}</p>
                          {event.reason && <p className="text-sm text-red-500">Reason: {event.reason}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="details" className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Items</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray(trackingResult.items) &&
                          trackingResult.items.map((item: any, index: number) => (
                            <li key={index}>
                              {typeof item === "string"
                                ? item
                                : `${item.name} (${item.quantity} ${item.quantity > 1 ? "units" : "unit"})`}
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Order Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium">{trackingResult.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span>{trackingResult.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Status:</span>
                          <Badge variant={trackingResult.paymentStatus === "Paid" ? "success" : "outline"}>
                            {trackingResult.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-2">Delivery Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Delivery Address</p>
                            <p className="text-gray-600">{trackingResult.deliveryAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Package className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Recipient</p>
                            <p className="text-gray-600">{trackingResult.recipientName}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Estimated Delivery</p>
                            <p className="text-gray-600">{trackingResult.estimatedDelivery}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="drone" className="pt-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 border">
                        <h4 className="font-medium mb-1">Drone ID</h4>
                        <p>{trackingResult.droneId}</p>
                      </Card>
                      <Card className="p-4 border">
                        <h4 className="font-medium mb-1">Current Speed</h4>
                        <p>{trackingResult.droneSpeed}</p>
                      </Card>
                      <Card className="p-4 border">
                        <h4 className="font-medium mb-1">Current Altitude</h4>
                        <p>{trackingResult.droneAltitude}</p>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Live Location</h3>
                      <div
                        ref={mapRef}
                        className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center"
                        aria-label="Map showing drone location"
                      >
                        {!mapLoaded && (
                          <div className="flex flex-col items-center">
                            <LoadingSpinner size="medium" />
                            <p className="text-gray-500 mt-2">Loading map...</p>
                          </div>
                        )}
                      </div>
                      {trackingResult && trackingResult.status === "In Transit" && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center animate-pulse">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          Live Tracking
                        </div>
                      )}
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-500">
                          {trackingResult.status === "Delivered"
                            ? "Delivery completed"
                            : "Drone is currently at " + trackingResult.currentLocation}
                        </p>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                          <span className="text-xs text-gray-500 mr-4">Pickup</span>

                          <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                          <span className="text-xs text-gray-500 mr-4">Destination</span>

                          {trackingResult.status === "In Transit" && (
                            <>
                              <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                              <span className="text-xs text-gray-500">Current Position</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {trackingResult.status === "In Transit" && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Your delivery is on its way! Our drone is carefully navigating to your location.
              </p>
              <div className="animate-pulse flex justify-center">
                <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Live Tracking Active
                </div>
              </div>
            </div>
          )}

          {trackingResult.status === "Delivered" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-gray-600">
                Your order has been successfully delivered. Thank you for choosing MedQuik!
              </p>
            </div>
          )}

          {trackingResult.status === "Processing" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Package className="h-12 w-12 text-yellow-600" />
              </div>
              <p className="text-gray-600">
                Your order is being processed and prepared for delivery. We'll update you when it's on the way!
              </p>
            </div>
          )}

          {trackingResult.status === "Pending Approval" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-purple-600" />
              </div>
              <p className="text-gray-600">
                Your order is awaiting approval. This usually takes 15-30 minutes. We'll update you once it's approved.
              </p>
            </div>
          )}

          {trackingResult.status === "Cancelled" && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <p className="text-gray-600">
                This order has been cancelled. Please contact customer support if you have any questions.
              </p>
            </div>
          )}
        </div>
      )}

      {!trackingResult && !isLoading && !error && (
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6">
            <Package className="h-16 w-16 mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Track Your Delivery</h2>
          <p className="text-gray-500 mb-6">
            Enter your tracking number above to see real-time updates on your medication delivery.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Enter Tracking Number</h3>
              <p className="text-sm text-gray-500 text-center">Input your order's tracking number</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Real-time Updates</h3>
              <p className="text-sm text-gray-500 text-center">See your drone's location in real-time</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1">Delivery Timeline</h3>
              <p className="text-sm text-gray-500 text-center">View detailed delivery status updates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
