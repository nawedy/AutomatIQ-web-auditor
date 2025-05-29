"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DoubleFooter } from "@/components/double-footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, Shield, AlertTriangle } from "lucide-react"

interface LegalTemplateProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
  type?: "policy" | "terms" | "compliance"
}

export function LegalTemplate({ title, lastUpdated, children, type = "policy" }: LegalTemplateProps) {
  const getIcon = () => {
    switch (type) {
      case "terms":
        return <FileText className="w-5 h-5 text-blue-400" />
      case "compliance":
        return <Shield className="w-5 h-5 text-green-400" />
      default:
        return <FileText className="w-5 h-5 text-purple-400" />
    }
  }

  const getBadgeColor = () => {
    switch (type) {
      case "terms":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "compliance":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center gap-3">
            {getIcon()}
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
          <Badge className={getBadgeColor()}>Legal Document</Badge>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Document Header */}
            <Card className="glass-card border-white/10 mb-8">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Last updated: {lastUpdated}</span>
                    </div>
                  </div>
                  <Badge className={getBadgeColor()}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-yellow-400 font-medium mb-1">Important Notice</h3>
                      <p className="text-gray-300 text-sm">
                        This document contains important legal information about your rights and obligations. Please
                        read it carefully and contact us if you have any questions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Content */}
            <div className="prose prose-invert max-w-none">{children}</div>

            {/* Contact Information */}
            <Card className="glass-card border-white/10 mt-8">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Questions about this document?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Legal Department</h4>
                    <p className="text-gray-400">Email: legal@auditpro.com</p>
                    <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h4 className="text-gray-300 font-medium mb-2">Mailing Address</h4>
                    <p className="text-gray-400">
                      AuditPro, Inc.
                      <br />
                      123 Audit Street
                      <br />
                      San Francisco, CA 94103
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
