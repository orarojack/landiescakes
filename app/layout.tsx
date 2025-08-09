import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { CartProvider } from "@/components/modern/cart-provider"
import { Header } from "@/components/modern/header"
import { Footer } from "@/components/modern/footer"
import FloatingHelpIcon from "@/components/modern/floating-help-icon"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AuthRedirector } from "@/components/modern/AuthRedirector"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LandyCakes - Premium Artisan Cakes",
  description: "Discover and order premium artisan cakes from local bakers",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/landy-logo.jpg" type="image/jpeg" />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <AuthRedirector />
          <ToastProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <FloatingHelpIcon />
              </div>
            </CartProvider>
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
