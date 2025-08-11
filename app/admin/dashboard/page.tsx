"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { Breadcrumb } from "@/components/breadcrumb"
import { useInventory } from "@/contexts/inventory-context"
import { useOrder } from "@/contexts/order-context"
import { useRealTime } from "@/contexts/real-time-context"
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import {
  Package,
  Truck,
  Users,
  AlertTriangle,
  ShoppingCart,
  Pill,
  ArrowUpRight,
  UserPlus,
  Clock,
  Download,
  FileText,
  Search,
  RefreshCw,
  ChevronDown,
  ArrowDownUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button as UIButton } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}

function AdminDashboard() {
  const { inventory } = useInventory()
  const { orders } = useOrder()
  const { events } = useRealTime()
  const { pendingUsers } = useAuth()
  const router = useRouter()

  // State for inventory management
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [reportType, setReportType] = useState("sales")
  const [reportPeriod, setReportPeriod] = useState("month")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter((order) => order.status === "Pending Approval")?.length || 0
  const inTransitOrders = orders?.filter((order) => order.status === "In Transit")?.length || 0
  const totalMedicines = inventory?.length || 0
  const lowStockMedicines = inventory?.filter((item) => item.currentStock <= item.reorderLevel)?.length || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
  const totalUsers = 24 // Mock data
  const newUsers = pendingUsers?.length || 0

  // Filter and sort inventory
  const filteredInventory =
    inventory
      ?.filter((item) => {
        // Search filter
        const matchesSearch =
          searchTerm === "" ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())

        // Category filter
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

        // Stock filter
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "low" && item.currentStock <= item.reorderLevel) ||
          (stockFilter === "out" && item.currentStock === 0) ||
          (stockFilter === "normal" && item.currentStock > item.reorderLevel)

        return matchesSearch && matchesCategory && matchesStock
      })
      .sort((a, b) => {
        // Sort by selected field
        if (sortBy === "name") {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else if (sortBy === "stock") {
          return sortOrder === "asc" ? a.currentStock - b.currentStock : b.currentStock - a.currentStock
        } else if (sortBy === "category") {
          return sortOrder === "asc" ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category)
        } else if (sortBy === "price") {
          return sortOrder === "asc" ? a.price - b.price : b.price - a.price
        }
        return 0
      }) || []

  // Get unique categories for filter
  const categories = [...new Set(inventory?.map((item) => item.category) || [])]

  // Mock data for charts
  const orderStatusData = [
    { name: "Pending", value: pendingOrders },
    { name: "Processing", value: orders?.filter((order) => order.status === "Processing")?.length || 0 },
    { name: "In Transit", value: inTransitOrders },
    { name: "Delivered", value: orders?.filter((order) => order.status === "Delivered")?.length || 0 },
    { name: "Cancelled", value: orders?.filter((order) => order.status === "Cancelled")?.length || 0 },
  ]

  const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 },
    { name: "Jul", revenue: 7000 },
  ]

  const categoryData = [
    { name: "Antibiotics", value: 35 },
    { name: "Pain Relief", value: 25 },
    { name: "Vitamins", value: 20 },
    { name: "Chronic", value: 15 },
    { name: "Other", value: 5 },
  ]

  // Enhanced analytics data
  const salesTrendData = [
    { name: "Week 1", sales: 4000, orders: 120 },
    { name: "Week 2", sales: 3000, orders: 98 },
    { name: "Week 3", sales: 5000, orders: 142 },
    { name: "Week 4", sales: 7000, orders: 189 },
    { name: "Week 5", sales: 6000, orders: 160 },
  ]

  const userAcquisitionData = [
    { name: "Jan", newUsers: 65, activeUsers: 120 },
    { name: "Feb", newUsers: 78, activeUsers: 150 },
    { name: "Mar", newUsers: 95, activeUsers: 180 },
    { name: "Apr", newUsers: 105, activeUsers: 210 },
    { name: "May", newUsers: 120, activeUsers: 250 },
    { name: "Jun", newUsers: 150, activeUsers: 300 },
  ]

  const topSellingProducts = [
    { name: "Amoxicillin", sales: 120, revenue: 155880 },
    { name: "Vitamin D3", sales: 85, revenue: 121125 },
    { name: "Ibuprofen", sales: 75, revenue: 59925 },
    { name: "Paracetamol", sales: 70, revenue: 55930 },
    { name: "Metformin", sales: 65, revenue: 84435 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGeneratingReport(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false)
      // In a real app, this would trigger a download or display a report
      alert(
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for ${reportPeriod} generated successfully!`,
      )
    }, 1500)
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {pendingOrders > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-3" />
            <div>
              <h3 className="font-medium text-amber-800">Orders Awaiting Approval</h3>
              <p className="text-sm text-amber-700">
                You have {pendingOrders} order{pendingOrders > 1 ? "s" : ""} that need{pendingOrders === 1 ? "s" : ""}{" "}
                your approval
              </p>
            </div>
          </div>
          <UIButton
            size="sm"
            className="bg-amber-500 hover:bg-amber-600"
            onClick={() => router.push("/admin/orders?tab=pending")}
          >
            Review Orders
          </UIButton>
        </div>
      )}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Admin Dashboard", href: "/admin/dashboard" },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link href="/admin/users">
            <UIButton variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
              {newUsers > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{newUsers}</span>
              )}
            </UIButton>
          </Link>
          <Link href="/admin/inventory">
            <UIButton variant="outline" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </UIButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-futuristic">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center">
              {pendingOrders > 0 ? (
                <div className="flex items-center text-amber-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <p className="text-xs">
                    <span className="font-bold">{pendingOrders}</span> pending approval
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{inTransitOrders} in transit</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicines}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockMedicines > 0 ? (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {lowStockMedicines} low stock
                </span>
              ) : (
                "All items in stock"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {newUsers > 0 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <UserPlus className="h-3 w-3" /> {newUsers} new registrations
                </span>
              ) : (
                "No new users today"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(events || []).slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        {event.type.includes("order") ? (
                          <ShoppingCart className="h-4 w-4" />
                        ) : event.type.includes("inventory") ? (
                          <Package className="h-4 w-4" />
                        ) : event.type.includes("drone") ? (
                          <Truck className="h-4 w-4" />
                        ) : event.type.includes("user") ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{getEventTitle(event.type)}</p>
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend Analysis</CardTitle>
                <CardDescription>Weekly sales and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Sales (₹)"
                    />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#ff7300" name="Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Acquisition & Retention</CardTitle>
                <CardDescription>Monthly new and active users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userAcquisitionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newUsers" name="New Users" fill="#8884d8" />
                    <Bar dataKey="activeUsers" name="Active Users" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Products with highest sales volume and revenue</CardDescription>
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
                                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-green-600">+{Math.floor(Math.random() * 10) + 1}%</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-4 w-4 text-red-600 mr-1" transform="rotate(90)" />
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

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Customer Demographics</CardTitle>
                <CardDescription>Age distribution of customers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "18-24", value: 15 },
                        { name: "25-34", value: 30 },
                        { name: "35-44", value: 25 },
                        { name: "45-54", value: 20 },
                        { name: "55+", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Frequency</CardTitle>
                <CardDescription>How often customers order</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Weekly", value: 10 },
                        { name: "Monthly", value: 35 },
                        { name: "Quarterly", value: 40 },
                        { name: "Yearly", value: 15 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Preferred payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Credit Card", value: 45 },
                        { name: "UPI", value: 30 },
                        { name: "Net Banking", value: 15 },
                        { name: "COD", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage and monitor your medicine inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search medicines..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stock Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock Levels</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                      <SelectItem value="normal">Normal Stock</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <UIButton variant="outline" className="flex items-center gap-1">
                        <ArrowDownUp className="h-4 w-4" />
                        Sort by
                        <ChevronDown className="h-4 w-4" />
                      </UIButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("name")
                          setSortOrder("asc")
                        }}
                      >
                        Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("name")
                          setSortOrder("desc")
                        }}
                      >
                        Name (Z-A)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("stock")
                          setSortOrder("asc")
                        }}
                      >
                        Stock (Low to High)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("stock")
                          setSortOrder("desc")
                        }}
                      >
                        Stock (High to Low)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("category")
                          setSortOrder("asc")
                        }}
                      >
                        Category (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("price")
                          setSortOrder("asc")
                        }}
                      >
                        Price (Low to High)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSortBy("price")
                          setSortOrder("desc")
                        }}
                      >
                        Price (High to Low)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <UIButton
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => {
                      setSearchTerm("")
                      setCategoryFilter("all")
                      setStockFilter("all")
                      setSortBy("name")
                      setSortOrder("asc")
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </UIButton>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Restocked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.reorderLevel}</TableCell>
                          <TableCell>₹{item.price.toLocaleString()}</TableCell>
                          <TableCell>
                            {item.currentStock === 0 ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : item.currentStock <= item.reorderLevel ? (
                              <Badge variant="warning" className="bg-amber-500">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.lastRestocked}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No items found matching your filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredInventory.length} of {totalMedicines} items
              </div>
              <UIButton variant="outline" onClick={() => router.push("/admin/inventory")}>
                View Full Inventory
              </UIButton>
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Overview</CardTitle>
                <CardDescription>Current stock levels by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Antibiotics", inStock: 150, lowStock: 30 },
                      { name: "Pain Relief", inStock: 180, lowStock: 20 },
                      { name: "Vitamins", inStock: 200, lowStock: 10 },
                      { name: "Chronic", inStock: 120, lowStock: 40 },
                      { name: "Other", inStock: 90, lowStock: 15 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
                <CardDescription>Items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory
                    ?.filter((item) => item.currentStock <= item.reorderLevel)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <p className="text-sm mr-2">
                              {item.currentStock} / {item.reorderLevel}
                            </p>
                            {item.currentStock === 0 ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : (
                              <Badge variant="warning" className="bg-amber-500">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <div className="w-32 mt-1">
                            <Progress
                              value={(item.currentStock / item.reorderLevel) * 100}
                              className={item.currentStock === 0 ? "bg-red-200" : "bg-amber-200"}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                  {(inventory?.filter((item) => item.currentStock <= item.reorderLevel).length || 0) > 5 && (
                    <UIButton
                      variant="link"
                      className="w-full"
                      onClick={() => router.push("/admin/inventory?filter=low")}
                    >
                      View all low stock items
                    </UIButton>
                  )}

                  {(inventory?.filter((item) => item.currentStock <= item.reorderLevel).length || 0) === 0 && (
                    <div className="text-center py-4 text-muted-foreground">No inventory alerts at this time</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create and download detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Report Type</label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales Report</SelectItem>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="orders">Order Report</SelectItem>
                        <SelectItem value="customers">Customer Report</SelectItem>
                        <SelectItem value="financial">Financial Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Time Period</label>
                    <Select value={reportPeriod} onValueChange={setReportPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportPeriod === "custom" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <Input type="date" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <UIButton
                    className="w-full flex items-center gap-2"
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </UIButton>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Available Reports</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Monthly Sales Summary", date: "Apr 20, 2025", type: "Sales Report" },
                      { name: "Quarterly Inventory Status", date: "Apr 15, 2025", type: "Inventory Report" },
                      { name: "Customer Acquisition Report", date: "Apr 10, 2025", type: "Customer Report" },
                      { name: "Annual Financial Statement", date: "Apr 5, 2025", type: "Financial Report" },
                      { name: "Weekly Order Summary", date: "Apr 1, 2025", type: "Order Report" },
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {report.type} • {report.date}
                          </p>
                        </div>
                        <UIButton variant="ghost" size="sm" className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </UIButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Daily Sales Summary", schedule: "Every day at 11:59 PM", format: "PDF" },
                    { name: "Weekly Inventory Status", schedule: "Every Monday at 8:00 AM", format: "Excel" },
                    { name: "Monthly Financial Report", schedule: "1st of every month", format: "PDF" },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.schedule}</p>
                      </div>
                      <Badge>{report.format}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <UIButton variant="outline" className="w-full">
                  Manage Scheduled Reports
                </UIButton>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>Customizable report templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Executive Summary", type: "Financial", customizable: true },
                    { name: "Inventory Status", type: "Inventory", customizable: true },
                    { name: "Sales Performance", type: "Sales", customizable: true },
                    { name: "Customer Analytics", type: "Customer", customizable: false },
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.type} Template</p>
                      </div>
                      <UIButton variant="ghost" size="sm">
                        {template.customizable ? "Edit" : "View"}
                      </UIButton>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <UIButton variant="outline" className="w-full">
                  Create New Template
                </UIButton>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Settings</CardTitle>
                <CardDescription>Configure report preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Report Format</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Reports To</label>
                    <Input type="email" placeholder="admin@medquik.com" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoSave" className="rounded border-gray-300" defaultChecked />
                    <label htmlFor="autoSave" className="text-sm font-medium">
                      Auto-save generated reports
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="includeCharts" className="rounded border-gray-300" defaultChecked />
                    <label htmlFor="includeCharts" className="text-sm font-medium">
                      Include charts and graphs
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <UIButton variant="outline" className="w-full">
                  Save Settings
                </UIButton>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get event title
function getEventTitle(type: string) {
  switch (type) {
    case "order_update":
      return "Order Updated"
    case "order_created":
      return "New Order"
    case "inventory_update":
      return "Inventory Updated"
    case "low_stock_alert":
      return "Low Stock Alert"
    case "drone_dispatched":
      return "Drone Dispatched"
    case "drone_returned":
      return "Drone Returned"
    case "user-registration":
      return "New User Registration"
    case "user-approval":
      return "User Approved"
    case "user-rejection":
      return "User Rejected"
    default:
      return "Notification"
  }
}
