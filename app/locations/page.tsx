"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for service locations
const serviceLocations = [
  {
    id: 1,
    name: "Koramangala Hub",
    address: "80 Feet Road, Koramangala 4th Block",
    hours: "8:00 AM - 8:00 PM",
    services: ["Prescription Pickup", "Drone Delivery", "Consultation"],
    distance: 1.2,
      coordinates: { lat: 12.9279, lng: 77.6271 },
    coverage: ['Koramangala', 'HSR Layout', 'BTM Layout', 'Ejipura'],
  },
  {
    id: 2,
    name: "Indiranagar Center",
    address: "100 Feet Road, Indiranagar",
    hours: "9:00 AM - 7:00 PM",
    services: ["Prescription Pickup", "Drone Delivery", "Vaccination"],
    distance: 3.5,
    coordinates: { lat: 12.9784, lng: 77.6408 },
    coverage: ['Indiranagar', 'Domlur', 'HAL', 'Old Airport Road'],
  },
  {
    id: 3,
    name: "Whitefield Hub",
    address: "Phoenix Marketcity, Whitefield",
    hours: "24 Hours",
    services: ["Prescription Pickup", "Drone Delivery", "Emergency Service"],
    distance: 2.8,
    coordinates: { lat: 12.9959, lng: 77.7280 },
    coverage: ['Whitefield', 'Marathahalli', 'Brookefield', 'ITPL'],
  },
  {
    id: 4,
    name: "Electronic City Hub",
    address: "Electronic City Phase 1",
    hours: "8:00 AM - 10:00 PM",
    services: ["Prescription Pickup", "Drone Delivery", "Health Screening"],
    distance: 4.1,
    coordinates: { lat: 12.8399, lng: 77.6770 },
    coverage: ['Electronic City', 'Begur', 'Bommanahalli', 'Kudlu Gate'],
  },
  {
    id: 5,
    name: "Malleshwaram Center",
    address: "Sampige Road, Malleshwaram",
    hours: "7:00 AM - 9:00 PM",
    services: ["Prescription Pickup", "Drone Delivery", "Consultation"],
    distance: 1.9,
    coordinates: { lat: 13.0035, lng: 77.5751 },
    coverage: ['Malleshwaram', 'Rajajinagar', 'Yeshwanthpur', 'Matthikere','Subramanyanagar'],
  },
]

// Service areas with coverage radius
const serviceAreas = [
  {
    city: "Subramanyanagar",
    state: "Karnataka",
    radius: "15 miles",
    deliveryTime: "30-45 minutes",
  },
  {
    city: "Malleshwaram",
    state: "Karnataka",
    radius: "12 miles",
    deliveryTime: "35-50 minutes",
  },
  {
    city: "HSR Layout",
    state: "Karnataka",
    radius: "15 miles",
    deliveryTime: "30-45 minutes",
  },
  {
    city: "BTM Layout",
    state: "Karnataka",
    radius: "10 miles",
    deliveryTime: "25-40 minutes",
  },
  {
    city: "Whitefield",
    state: "Karnataka",
    radius: "8 miles",
    deliveryTime: "30-45 minutes",
  },
  {
    city: "Rajajinagar",
    state: "Karnataka",
    radius: "12 miles",
    deliveryTime: "35-50 minutes",
  },
]

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  // Filter locations based on search term
  const filteredLocations = serviceLocations.filter((location) => {
    return (
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">Our Locations</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Find MedQuik service centers and drone delivery coverage areas near you
        </p>
      </div>

      <div className="mb-12">
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by location name or address..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <Card
              key={location.id}
              className={`cursor-pointer transition-all ${selectedLocation === location.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedLocation(location.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle>{location.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {location.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{location.hours}</span>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm">{location.distance} miles away</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {location.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredLocations.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No locations found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Service Coverage Areas</h2>
        <div className="mb-8">
          <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Coverage map will be displayed here</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceAreas.map((area, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>
                  {area.city}, {area.state}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium">Coverage Radius</p>
                      <p className="text-gray-600">{area.radius}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium">Average Delivery Time</p>
                      <p className="text-gray-600">{area.deliveryTime}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Check Availability
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Don't see your area?</CardTitle>
            <CardDescription>
              We're constantly expanding our service coverage. Let us know where you'd like to see MedQuik next!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <Input id="city" placeholder="Enter city name" />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input id="state" placeholder="Enter state" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input id="email" type="email" placeholder="Your email address" />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Request Service</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
