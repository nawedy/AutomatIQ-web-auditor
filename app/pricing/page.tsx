"use client"

import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for trying out our platform",
      popular: false,
      features: [
        { name: "5 website audits per month", included: true },
        { name: "Basic SEO analysis", included: true },
        { name: "Performance testing", included: true },
        { name: "Email support", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Custom reports", included: false },
        { name: "API access", included: false },
      ],
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for small to medium businesses",
      popular: true,
      features: [
        { name: "50 website audits per month", included: true },
        { name: "Advanced SEO analysis", included: true },
        { name: "Performance & security testing", included: true },
        { name: "Email & chat support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom reports", included: true },
        { name: "Priority support", included: false },
        { name: "API access", included: false },
      ],
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large organizations with advanced needs",
      popular: false,
      features: [
        { name: "Unlimited website audits", included: true },
        { name: "Full-featured analysis suite", included: true },
        { name: "All testing capabilities", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom reports", included: true },
        { name: "Priority support", included: true },
        { name: "API access", included: true },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 sm:pt-24 lg:pt-32">
        <div className="section-padding">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Pricing Plans</Badge>
              <h1 className="text-4xl md:text-5xl font-bold shimmer-title mb-4">
                Choose Your Plan
              </h1>
              <p className="text-lg text-white mb-8">
                Start with our free plan and upgrade as you grow. All plans include our core audit features with 14-day free trial on paid plans.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`glass-card relative overflow-hidden ${
                    plan.popular 
                      ? "border-gold ring-2 ring-gold/50 scale-105" 
                      : "border-gold/20 hover:border-gold/40"
                  } transition-all duration-300 hover-shadow h-full`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-gold text-navy font-semibold px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gold">{plan.price}</span>
                      {plan.period && <span className="text-gray-300 text-lg">{plan.period}</span>}
                    </div>
                    <p className="text-gray-300">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col h-full">
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.included ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className={`w-full mt-auto ${
                        plan.popular
                          ? "gold-shimmer text-navy font-semibold"
                          : "border border-gold/30 text-gold hover:bg-gold/10 bg-transparent"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="mt-20 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-white mb-8 shimmer-subtitle">
                Frequently Asked Questions
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-3">
                      Can I change plans anytime?
                    </h3>
                    <p className="text-gray-300">
                      Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-3">
                      Is there a free trial?
                    </h3>
                    <p className="text-gray-300">
                      All paid plans come with a 14-day free trial. No credit card required to start, and you can cancel anytime.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-3">
                      What payment methods do you accept?
                    </h3>
                    <p className="text-gray-300">
                      We accept all major credit cards, PayPal, and bank transfers for enterprise customers.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-3">
                      Do you offer volume discounts?
                    </h3>
                    <p className="text-gray-300">
                      Yes, we offer custom pricing for large organizations. Contact our sales team for a personalized quote.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <Card className="glass-card border-gold/20 bg-gradient-to-br from-gold/5 to-transparent max-w-4xl mx-auto">
                <CardContent className="p-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Join thousands of businesses optimizing their websites with AutomatIQ.AI
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="gold-shimmer text-navy font-semibold px-8 py-3">
                      Start Free Trial
                    </Button>
                    <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 px-8 py-3">
                      Contact Sales
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <DoubleFooter />
    </div>
  )
}
