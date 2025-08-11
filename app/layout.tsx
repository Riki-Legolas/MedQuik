import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { RealTimeProvider } from "@/contexts/real-time-context"
import { InventoryProvider } from "@/contexts/inventory-context"
import { OrderProvider } from "@/contexts/order-context"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedQuik - Drone Delivery for Medicines",
  description: "Fast and reliable drone delivery service for medicines",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RealTimeProvider>
            <AuthProvider>
              <InventoryProvider>
                <OrderProvider>
                  <CartProvider>
                    <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <Toaster />
                  </CartProvider>
                </OrderProvider>
              </InventoryProvider>
            </AuthProvider>
          </RealTimeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
