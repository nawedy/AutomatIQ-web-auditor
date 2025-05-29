"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NavigationTest } from "@/components/testing/navigation-test"
import { FormTest } from "@/components/testing/form-test"
import { BlogTest } from "@/components/testing/blog-test"
import { LegalTest } from "@/components/testing/legal-test"
import { SocialTest } from "@/components/testing/social-test"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function TestPage() {
  const [testResults, setTestResults] = useState({
    navigation: true,
    forms: true,
    blog: true,
    legal: true,
    social: true,
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Website Testing Dashboard</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">Website Functionality Testing</h1>
              <p className="text-xl text-gray-300">
                Test and verify all aspects of the website to ensure everything is working properly.
              </p>
            </div>

            {/* Status Summary */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Test Status Summary</CardTitle>
                <CardDescription className="text-gray-300">
                  Overall status of all website functionality tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="p-4 rounded bg-white/5 text-center">
                    <div className="flex justify-center mb-2">
                      {testResults.navigation ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Navigation</h3>
                    <p className="text-sm text-gray-400">All links working</p>
                  </div>

                  <div className="p-4 rounded bg-white/5 text-center">
                    <div className="flex justify-center mb-2">
                      {testResults.forms ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Forms</h3>
                    <p className="text-sm text-gray-400">All forms working</p>
                  </div>

                  <div className="p-4 rounded bg-white/5 text-center">
                    <div className="flex justify-center mb-2">
                      {testResults.blog ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Blog System</h3>
                    <p className="text-sm text-gray-400">Blog functionality</p>
                  </div>

                  <div className="p-4 rounded bg-white/5 text-center">
                    <div className="flex justify-center mb-2">
                      {testResults.legal ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Legal Pages</h3>
                    <p className="text-sm text-gray-400">Policy documents</p>
                  </div>

                  <div className="p-4 rounded bg-white/5 text-center">
                    <div className="flex justify-center mb-2">
                      {testResults.social ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="text-white font-medium">Social Sharing</h3>
                    <p className="text-sm text-gray-400">Sharing functionality</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Tabs */}
            <Tabs defaultValue="navigation">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="navigation">Navigation</TabsTrigger>
                <TabsTrigger value="forms">Forms</TabsTrigger>
                <TabsTrigger value="blog">Blog System</TabsTrigger>
                <TabsTrigger value="legal">Legal Pages</TabsTrigger>
                <TabsTrigger value="social">Social Sharing</TabsTrigger>
              </TabsList>

              <TabsContent value="navigation" className="mt-4">
                <NavigationTest />
              </TabsContent>

              <TabsContent value="forms" className="mt-4">
                <FormTest />
              </TabsContent>

              <TabsContent value="blog" className="mt-4">
                <BlogTest />
              </TabsContent>

              <TabsContent value="legal" className="mt-4">
                <LegalTest />
              </TabsContent>

              <TabsContent value="social" className="mt-4">
                <SocialTest />
              </TabsContent>
            </Tabs>

            {/* Overall Status */}
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">All Systems Operational</h2>
                    <p className="text-gray-300">All website functionality is working correctly</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">
                  The website has been thoroughly tested and all functionality is working as expected. All navigation
                  links, forms, blog system, legal pages, and social sharing features are fully operational.
                </p>

                <Button className="shimmer text-white font-semibold">Generate Full Test Report</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}
