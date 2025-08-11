"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Menu, User, LogOut, Package, MapPin, Home, Info, Phone, Pill, HelpCircle, ChevronUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { getTotalItemsInCart } = useCart()

  // Handle scroll events for sticky header and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      if (window.scrollY > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const routes = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5 mr-2" aria-hidden="true" /> },
    { name: "About", path: "/about", icon: <Info className="h-5 w-5 mr-2" aria-hidden="true" /> },
    { name: "Medicines", path: "/medicines", icon: <Pill className="h-5 w-5 mr-2" aria-hidden="true" /> },
    { name: "Tracking", path: "/tracking", icon: <MapPin className="h-5 w-5 mr-2" aria-hidden="true" /> },
    { name: "Contact", path: "/contact", icon: <Phone className="h-5 w-5 mr-2" aria-hidden="true" /> },
  ]

  const isActive = (path: string) => {
    return pathname === path
  }

  const totalItemsInCart = getTotalItemsInCart()

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="mr-2" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 py-4">
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setIsOpen(false)}>
                    <Package className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    MedQuik
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {routes.map((route) => (
                      <Link
                        key={route.path}
                        href={route.path}
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive(route.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {route.icon}
                        {route.name}
                      </Link>
                    ))}
                    {isAuthenticated && (
                      <Link
                        href="/cart"
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive("/cart") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Package className="h-5 w-5 mr-2" aria-hidden="true" />
                        My Cart
                        {totalItemsInCart > 0 && (
                          <Badge className="ml-2" variant="secondary">
                            {totalItemsInCart}
                          </Badge>
                        )}
                      </Link>
                    )}
                    {isAuthenticated && (
                      <Link
                        href={user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive(user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5 mr-2" aria-hidden="true" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/help"
                      className={`flex items-center px-3 py-2 rounded-md ${
                        isActive("/help") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <HelpCircle className="h-5 w-5 mr-2" aria-hidden="true" />
                      Help & Support
                    </Link>
                  </nav>
                </div>
                {isAuthenticated ? (
                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-5 w-5 mr-2" aria-hidden="true" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="border-t pt-4 flex flex-col gap-2">
                    <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                      <Link href="/login?tab=register">Register</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Package className="h-6 w-6 text-purple-600" aria-hidden="true" />
              <span className="hidden sm:inline-block">MedQuik</span>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(route.path) ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && <NotificationCenter />}

            {isAuthenticated && (
              <Button asChild variant="outline" size="sm" className="relative hover:bg-purple-50">
                <Link href="/cart">
                  <Package className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline-block">My Cart</span>
                  {totalItemsInCart > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-purple-600"
                      aria-label={`${totalItemsInCart} items in cart`}
                    >
                      {totalItemsInCart}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}>
                    <User className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline-block">Dashboard</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline-block">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/login">
                    <User className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline-block">Account</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-opacity"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </>
  )
}
