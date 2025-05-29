"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DoubleFooter } from "@/components/double-footer"
import { CheckCircle, Zap, Crown, Building } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out AuditPro",
      icon: Zap,
      features: [
        "1 website audit per month",
        "Basic SEO analysis",
        "Performance overview",
        "Email support",
        "Basic reporting",
      ],
      limitations: ["Limited to 1 page per audit", "No security scanning", "No UX analysis"],
      cta: "Get Started Free",
      popular: false,
      color: "from-gray-500 to-gray-600",
    },
    {
      name: "Basic",
      price: "$19",
      period: "per month",
      description: "Great for small businesses and freelancers",
      icon: CheckCircle,
      features: [
        "Up to 100 pages per audit",
        "Full SEO analysis",
        "Performance monitoring",
        "UX evaluation",
        "Monthly reports",
        "Priority email support",
        "Basic integrations",
      ],
      limitations: ["No security scanning", "No white-label reports"],
      cta: "Start Basic Plan",
      popular: true,
      color: "from-blue-500 to-purple-600",
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "Perfect for agencies and growing businesses",
      icon: Crown,
      features: [
        "Unlimited pages",
        "Complete audit suite (SEO, Performance, Security, UX)",
        "White-label reports",
        "API access",
        "Team collaboration",
        "Priority support",
        "Advanced integrations",
        "Custom branding",
      ],
      limitations: [],
      cta: "Start Pro Plan",
      popular: false,
      color: "from-purple-500 to-pink-600",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large organizations with specific needs",
      icon: Building,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment",
        "Advanced security",
        "Custom reporting",
        "24/7 phone support",
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      color: "from-orange-500 to-red-600",
    },
  ]

  const oneTimeAudit = {
    name: "One-Time Audit",
    price: "$99",
    description: "Comprehensive audit with detailed report",
    features: [
      "Complete website analysis",
      "All audit categories included",
      "Detailed PDF report",
      "Actionable recommendations",
      "30-day email support",
    ],
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Pricing</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-12 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Choose Your Plan</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Start with our free plan and upgrade as you grow. All plans include our core audit features.
              </p>
            </div>

            {/* Subscription Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`glass-card border-white/10 relative ${plan.popular ? "ring-2 ring-blue-500/50" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-white">
                        {plan.price}
                        {plan.price !== "Custom" && (
                          <span className="text-lg font-normal text-gray-400">/{plan.period}</span>
                        )}
                      </div>
                      <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Not included:</p>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border border-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-400 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "shimmer text-white font-semibold"
                          : "border-white/20 text-white hover:bg-white/10"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* One-Time Audit */}
            <div className="max-w-2xl mx-auto">
              <Card className="glass-card border-white/10">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{oneTimeAudit.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-white">{oneTimeAudit.price}</div>
                    <CardDescription className="text-gray-300">{oneTimeAudit.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {oneTimeAudit.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full shimmer text-white font-semibold">Order One-Time Audit</Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    question: "Can I change plans anytime?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
                  },
                  {
                    question: "Is there a free trial?",
                    answer: "Yes! Our free plan lets you try AuditPro with basic features. No credit card required.",
                  },
                  {
                    question: "Do you offer refunds?",
                    answer: "We offer a 30-day money-back guarantee for all paid plans if you're not satisfied.",
                  },
                  {
                    question: "How often can I run audits?",
                    answer: "Free plan: 1 per month. Paid plans: unlimited audits based on your page limits.",
                  },
                  {
                    question: "What's included in support?",
                    answer:
                      "All plans include email support. Pro and Enterprise plans get priority support and phone access.",
                  },
                ].map((faq, index) => (
                  <Card key={index} className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 py-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
              <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of businesses optimizing their websites with AuditPro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="shimmer text-white font-semibold px-8 py-4">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
