import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { WebSocketProvider } from "@/components/real-time/websocket-provider"
import { PerformanceMonitor } from "@/components/debug/performance-monitor"
import { MemoryLeakDetector } from "@/components/debug/memory-leak-detector"
import { TestSuite } from "@/components/debug/test-suite"
import { CookieConsent } from "@/components/cookie-consent"
import { GlobalPopupManager } from "@/components/global-popup-manager"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutomatIQ.AI - AI-Powered Website Audit Tool",
  description:
    "Optimize your website with comprehensive SEO, performance, security, and UX audits powered by AutomatIQ.AI",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black min-h-screen`}>
        <AuthProvider>
          <SidebarProvider>
            <NotificationProvider>
              <WebSocketProvider>
                {children}
                {/* Cookie Consent Banner */}
                <CookieConsent />
                {/* Global Popup Manager */}
                <GlobalPopupManager />
                {/* Debug tools - only show in development */}
                {process.env.NODE_ENV !== "production" && (
                  <>
                    <TestSuite />
                    <PerformanceMonitor />
                    <MemoryLeakDetector />
                  </>
                )}
              </WebSocketProvider>
            </NotificationProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
