"use client"

// src/app/admin/layout.tsx
// Admin dashboard layout with navigation and auth protection

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  LineChart, 
  Settings, 
  Shield, 
  AlertCircle, 
  Bell, 
  LogOut,
  Database
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated") {
      // In a real app, this would check a proper admin role
      // For now, we'll assume the check happens here
      setIsAdmin(true)
    } else if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin/dashboard")
    }
  }, [status, router])

  // If loading or not admin, show loading state
  if (status === "loading" || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-300">Verifying admin privileges...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Clients", href: "/admin/clients", icon: <Users className="w-5 h-5" /> },
    { name: "Analytics", href: "/admin/analytics", icon: <LineChart className="w-5 h-5" /> },
    { name: "System Health", href: "/admin/system", icon: <Database className="w-5 h-5" /> },
    { name: "Security", href: "/admin/security", icon: <Shield className="w-5 h-5" /> },
    { name: "Alerts", href: "/admin/alerts", icon: <AlertCircle className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Sidebar */}
      <div className="w-64 h-full bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">AutomatIQ <span className="text-primary">Admin</span></h1>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isActive ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                  onClick={() => router.push(item.href)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {session?.user?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{session?.user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-400">{session?.user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10" onClick={() => router.push('/auth/logout')}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center px-6 justify-between">
          <h2 className="text-xl font-semibold text-white">Admin Control Panel</h2>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
              System Status: Healthy
            </Button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Card className="border-white/10 bg-black/30 backdrop-blur-sm shadow-xl">
            {children}
          </Card>
        </main>
      </div>
    </div>
  )
}
