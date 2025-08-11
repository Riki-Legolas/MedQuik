"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRealTime } from "@/contexts/real-time-context"
import { format } from "date-fns"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { events, pendingNotifications, markAllNotificationsAsRead, isConnected } = useRealTime()

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest("[data-notification-center]") && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return format(date, "MMM d, h:mm a")
    } catch (error) {
      return timestamp
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_update":
      case "order_created":
      case "order_cancelled":
        return "📦"
      case "inventory_update":
      case "low_stock_alert":
        return "🔄"
      case "drone_dispatched":
      case "drone_returned":
      case "drone_maintenance":
        return "🚁"
      case "user_approved":
      case "user_rejected":
      case "prescription_verified":
        return "👤"
      default:
        return "🔔"
    }
  }

  return (
    <div className="relative" data-notification-center>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            markAllNotificationsAsRead()
          }
        }}
        aria-label="Notifications"
      >
        <Bell className={`h-5 w-5 ${pendingNotifications > 0 ? "text-purple-600 dark:text-purple-400" : ""}`} />
        {pendingNotifications > 0 && (
          <Badge
            className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-purple-600"
            aria-label={`${pendingNotifications} unread notifications`}
          >
            {pendingNotifications}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background rounded-md shadow-lg overflow-hidden z-50 border">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              <span className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={index} className="p-3 border-b hover:bg-muted">
                  <div className="flex gap-3">
                    <div className="text-xl">{getNotificationIcon(event.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm">{event.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(event.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted-foreground">No notifications</div>
            )}
          </div>
          <div className="p-2 border-t bg-muted/50">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => markAllNotificationsAsRead()}>
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
