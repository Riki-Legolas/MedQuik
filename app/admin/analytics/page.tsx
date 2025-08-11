"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useOrder } from "@/contexts/order-context"
import { Breadcrumb } from "@/components/breadcrumb"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, TrendingDown, DollarSign, Package, Truck, Users, AlertTriangle } from "lucide-react"

// Mock data for analytics
const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 7000 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 8000 },
]

const orderStatusData = [
  { name: "Pending", value: 10 },
  { name: "Processing", value: 15 },
  { name: "In Transit", value: 20 },
  { name: "Delivered", value: 45 },
  { name: "Cancelled", value: 10 },
]

const COLORS = ["#FFBB28", "#0088FE", "#8884D8", "#00C49F", "#FF8042"]

const topSellingProducts = [
  { name: "Amoxicillin", sales: 120, revenue: 155880 },
  { name: "Vitamin D3", sales: 85, revenue: 121125 },
  { name: "Ibuprofen", sales: 75, revenue: 59925 },
  { name: "Paracetamol", sales: 70, revenue: 55930 },
  { name: "Metformin", sales: 65, revenue: 84435 },
]

const deliveryPerformance = [
  { name: "Mon", onTime: 25, delayed: 5 },
  { name: "Tue", onTime: 30, delayed: 3 },
  { name: "Wed", onTime: 28, delayed: 4 },
  { name: "Thu", onTime: 32, delayed: 2 },
  { name: "Fri", onTime: 35, delayed: 1 },
  { name: "Sat", onTime: 40, delayed: 3 },
  { name: "Sun", onTime: 20, delayed: 2 },
]

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { orders } = useOrder()

  const [timeRange, setTimeRange] = useState("week")
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && user?.role !== "admin") {
      router.push("/")
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isAuthenticated, router, user, isLoading])

  if (isLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status !== "Cancelled") {
      return sum + order.total
    }
    return sum
  }, 0)

  // Calculate total orders
  const totalOrders = orders.length

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Calculate delivery success rate
  const deliveredOrders = orders.filter((order) => order.status === "Delivered").length
  const inTransitOrders = orders.filter((order) => order.status === "In Transit").length
  const deliverySuccessRate =
    deliveredOrders + inTransitOrders > 0 ? (deliveredOrders / (deliveredOrders + inTransitOrders)) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Analytics & Reports" }]} />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500">View detailed analytics and generate reports</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+12.5%</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
                <div className="flex items-center mt-1 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8.2%</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
                <p className="text-3xl font-bold">₹{averageOrderValue.toLocaleString()}</p>
                <div className="flex items-center mt-1 text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">-2.3%</span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Success</p>
                <p className="text-3xl font-bold">{deliverySuccessRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1 text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+1.8%</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Analytics</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                      <Legend />
                      <Bar dataKey="sales" name="Revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Antibiotics", value: 35 },
                          { name: "Vitamins", value: 25 },
                          { name: "Pain Relief", value: 20 },
                          { name: "Diabetes", value: 15 },
                          { name: "Others", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current distribution of order statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trend</CardTitle>
                <CardDescription>Daily order volume for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: "Mon", orders: 45 },
                        { day: "Tue", orders: 52 },
                        { day: "Wed", orders: 48 },
                        { day: "Thu", orders: 61 },
                        { day: "Fri", orders: 58 },
                        { day: "Sat", orders: 78 },
                        { day: "Sun", orders: 65 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="orders" name="Orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with the highest sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Units Sold</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.sales}</td>
                        <td className="py-3 px-4">₹{product.revenue.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {index % 2 === 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-green-600">+{Math.floor(Math.random() * 10) + 1}%</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                <span className="text-red-600">-{Math.floor(Math.random() * 5) + 1}%</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>On-time vs delayed deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deliveryPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="onTime" name="On Time" stackId="a" fill="#00C49F" />
                      <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Drone Fleet Status</CardTitle>
                <CardDescription>Current status of delivery drones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Drone ID</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Battery</th>
                        <th className="text-left py-3 px-4">Last Maintenance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "DRN-42X", status: "In Transit", battery: "78%", maintenance: "Apr 5, 2025" },
                        { id: "DRN-56Y", status: "Available", battery: "95%", maintenance: "Apr 8, 2025" },
                        { id: "DRN-78Z", status: "Charging", battery: "42%", maintenance: "Apr 10, 2025" },
                        { id: "DRN-91A", status: "Maintenance", battery: "100%", maintenance: "In Progress" },
                        { id: "DRN-63B", status: "Available", battery: "87%", maintenance: "Apr 15, 2025" },
                      ].map((drone, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{drone.id}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                drone.status === "Available"
                                  ? "bg-green-100 text-green-800"
                                  : drone.status === "In Transit"
                                    ? "bg-blue-100 text-blue-800"
                                    : drone.status === "Charging"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {drone.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    Number.parseInt(drone.battery) > 70
                                      ? "bg-green-600"
                                      : Number.parseInt(drone.battery) > 30
                                        ? "bg-yellow-600"
                                        : "bg-red-600"
                                  }`}
                                  style={{ width: drone.battery }}
                                ></div>
                              </div>
                              <span>{drone.battery}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{drone.maintenance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Current Stock</th>
                    <th className="text-left py-3 px-4">Reorder Level</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Amoxicillin", stock: 5, reorder: 10, status: "Critical" },
                    { name: "Ibuprofen", stock: 8, reorder: 15, status: "Low" },
                    { name: "Metformin", stock: 12, reorder: 20, status: "Low" },
                  ].map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.stock} units</td>
                      <td className="py-3 px-4">{item.reorder} units</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.status === "Critical" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
