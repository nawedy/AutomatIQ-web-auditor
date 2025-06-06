// Import polyfills first to ensure browser globals are available
import "@/lib/polyfills"

import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { WebSocketProvider } from "@/components/real-time/websocket-provider"
import { CookieConsent } from "@/components/cookie-consent"
import { GlobalPopupManager } from "@/components/global-popup-manager"
import { PerformanceLoader } from "@/components/ui/performance-loader"

// Load Inter font for body text (400, 500, 600, 700)
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '500', '600', '700']
})

// Load Montserrat font for headings (700, 800, 900)
const montserrat = Montserrat({
  subsets: ["latin"],
  display: 'swap',
  weight: ['700', '800', '900']
})

export const metadata: Metadata = {
  title: "AutomatIQ.AI - AI-Powered Website Audit Tool",
  description:
    "Optimize your website with comprehensive SEO, performance, security, and UX audits powered by AutomatIQ.AI",
  generator: "v0.dev",
  themeColor: "#0f0f1a"
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${inter.className} min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] text-white`}
        style={{
          '--font-montserrat': montserrat.style.fontFamily,
        } as React.CSSProperties}
      >
        <AuthProvider>
          <SidebarProvider>
            <NotificationProvider>
              <WebSocketProvider>
                {/* Performance optimization component */}
                <PerformanceLoader />
                {children}
                {/* Cookie Consent Banner */}
                <CookieConsent />
                {/* Global Popup Manager */}
                <GlobalPopupManager />
              </WebSocketProvider>
            </NotificationProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
