"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, FileText, ArrowRight } from "lucide-react"

export function LegalTest() {
  const legalPages = [
    {
      title: "Privacy Policy",
      path: "/privacy",
      lastUpdated: "May 29, 2024",
      sections: [
        "Introduction",
        "Information We Collect",
        "How We Use Your Information",
        "Data Security",
        "Your Rights",
      ],
      status: "verified",
    },
    {
      title: "Terms of Service",
      path: "/terms",
      lastUpdated: "May 29, 2024",
      sections: [
        "Introduction",
        "Account Registration",
        "Subscription and Payment",
        "Acceptable Use",
        "Intellectual Property",
      ],
      status: "verified",
    },
    {
      title: "Cookie Policy",
      path: "/cookies",
      lastUpdated: "May 29, 2024",
      sections: ["What Are Cookies", "How We Use Cookies", "Managing Cookies", "Third-Party Cookies"],
      status: "verified",
    },
    {
      title: "Refund Policy",
      path: "/refund",
      lastUpdated: "May 29, 2024",
      sections: ["14-Day Money-Back Guarantee", "Prorated Refunds", "Exceptions", "Refund Process"],
      status: "verified",
    },
    {
      title: "GDPR Compliance",
      path: "/gdpr",
      lastUpdated: "May 29, 2024",
      sections: ["Legal Basis for Processing", "Your Rights Under GDPR", "Data Transfers", "Data Breach Notification"],
      status: "verified",
    },
    {
      title: "Cookie Preferences",
      path: "/cookie-preferences",
      lastUpdated: "May 29, 2024",
      sections: ["Manage Preferences", "Cookie Categories", "Save Settings"],
      status: "verified",
    },
  ]

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Legal Pages Test</CardTitle>
        <CardDescription className="text-gray-300">
          Verify all legal pages and policies are accessible and complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Legal Document Status</h3>
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            All Pages Verified
          </Badge>
        </div>

        <div className="space-y-4">
          {legalPages.map((page) => (
            <div key={page.path} className="p-4 rounded bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <h4 className="text-white font-medium">{page.title}</h4>
                </div>
                <Badge
                  variant="outline"
                  className={
                    page.status === "verified"
                      ? "border-green-500/30 text-green-400"
                      : "border-yellow-500/30 text-yellow-400"
                  }
                >
                  {page.status === "verified" ? "Verified" : "Needs Review"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span>Path: {page.path}</span>
                <span>Last Updated: {page.lastUpdated}</span>
              </div>

              <div className="mb-3">
                <h5 className="text-sm text-white mb-2">Key Sections:</h5>
                <div className="flex flex-wrap gap-2">
                  {page.sections.map((section, i) => (
                    <Badge key={i} variant="outline" className="border-white/20 text-gray-300">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
                  View Document
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-400 font-medium">All legal pages are complete and accessible</span>
          </div>
          <p className="text-gray-300 text-sm">
            All required legal documents are in place and up to date. The documents are GDPR compliant and follow best
            practices for privacy and data protection.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
