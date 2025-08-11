"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, UserCheck } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <UserApprovalDashboard />
    </ProtectedRoute>
  )
}

function UserApprovalDashboard() {
  const { pendingUsers, approveUser, rejectUser, refreshPendingUsers } = useAuth()
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({})

  const handleApprove = async (userId: string) => {
    setProcessingUsers((prev) => ({ ...prev, [userId]: true }))
    approveUser(userId)
    setTimeout(() => {
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }))
    }, 1000)
  }

  const handleReject = async (userId: string) => {
    setProcessingUsers((prev) => ({ ...prev, [userId]: true }))
    rejectUser(userId)
    setTimeout(() => {
      setProcessingUsers((prev) => ({ ...prev, [userId]: false }))
    }, 1000)
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin/dashboard" },
          { label: "User Management", href: "/admin/users" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={refreshPendingUsers} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Review and approve new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending user approvals</div>
            ) : (
              <div className="grid gap-4">
                {pendingUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                        </div>
                        <Badge variant={user.status === "pending" ? "outline" : "default"}>
                          {user.status || "Pending"}
                        </Badge>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Registered on: {user.registeredOn}</p>
                      </div>
                    </div>
                    <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(user.id)}
                        disabled={processingUsers[user.id]}
                      >
                        {processingUsers[user.id] ? <LoadingSpinner /> : <X className="mr-2 h-4 w-4" />}
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        disabled={processingUsers[user.id]}
                      >
                        {processingUsers[user.id] ? <LoadingSpinner /> : <Check className="mr-2 h-4 w-4" />}
                        Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
