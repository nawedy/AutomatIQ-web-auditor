"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Send } from "lucide-react"

export function FormTest() {
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [formResults, setFormResults] = useState<Record<string, boolean>>({})

  // Contact Form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  // Signup Form
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  // Newsletter Form
  const [newsletterForm, setNewsletterForm] = useState({
    email: "",
  })

  // Cookie Preferences Form
  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  })

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", contactForm)
    setFormResults((prev) => ({ ...prev, contact: true }))
    setContactForm({ name: "", email: "", subject: "", message: "" })
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup form submitted:", signupForm)
    setFormResults((prev) => ({ ...prev, signup: true }))
    setSignupForm({ name: "", email: "", password: "", confirmPassword: "", agreeToTerms: false })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter form submitted:", newsletterForm)
    setFormResults((prev) => ({ ...prev, newsletter: true }))
    setNewsletterForm({ email: "" })
  }

  const handleCookiePrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Cookie preferences saved:", cookiePrefs)
    setFormResults((prev) => ({ ...prev, cookiePrefs: true }))
  }

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSignupForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Form Testing Tool</CardTitle>
        <CardDescription className="text-gray-300">Test all forms to ensure they submit correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeForm === "contact" ? "default" : "outline"}
            className={activeForm === "contact" ? "shimmer text-white" : "border-white/20 text-white hover:bg-white/10"}
            onClick={() => setActiveForm("contact")}
          >
            Contact Form
          </Button>
          <Button
            variant={activeForm === "signup" ? "default" : "outline"}
            className={activeForm === "signup" ? "shimmer text-white" : "border-white/20 text-white hover:bg-white/10"}
            onClick={() => setActiveForm("signup")}
          >
            Signup Form
          </Button>
          <Button
            variant={activeForm === "newsletter" ? "default" : "outline"}
            className={
              activeForm === "newsletter" ? "shimmer text-white" : "border-white/20 text-white hover:bg-white/10"
            }
            onClick={() => setActiveForm("newsletter")}
          >
            Newsletter Form
          </Button>
          <Button
            variant={activeForm === "cookiePrefs" ? "default" : "outline"}
            className={
              activeForm === "cookiePrefs" ? "shimmer text-white" : "border-white/20 text-white hover:bg-white/10"
            }
            onClick={() => setActiveForm("cookiePrefs")}
          >
            Cookie Preferences
          </Button>
        </div>

        {activeForm === "contact" && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Contact Form Test</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="neomorphism border-0 text-white placeholder-gray-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="neomorphism border-0 text-white placeholder-gray-400"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  rows={4}
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Your message..."
                />
              </div>
              <Button type="submit" className="shimmer text-white font-semibold">
                <Send className="w-4 h-4 mr-2" />
                Submit Contact Form
              </Button>
            </form>

            {formResults.contact && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-400">Contact form submitted successfully!</span>
              </div>
            )}
          </div>
        )}

        {activeForm === "signup" && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Signup Form Test</h3>
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <Input
                  id="signup-name"
                  name="name"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <Input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Confirm your password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={signupForm.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setSignupForm((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              <Button type="submit" className="shimmer text-white font-semibold" disabled={!signupForm.agreeToTerms}>
                Create Account
              </Button>
            </form>

            {formResults.signup && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-400">Signup form submitted successfully!</span>
              </div>
            )}
          </div>
        )}

        {activeForm === "newsletter" && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Newsletter Form Test</h3>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <Input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  value={newsletterForm.email}
                  onChange={(e) => setNewsletterForm({ email: e.target.value })}
                  required
                  className="neomorphism border-0 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
              <Button type="submit" className="shimmer text-white font-semibold">
                Subscribe to Newsletter
              </Button>
            </form>

            {formResults.newsletter && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-400">Newsletter subscription successful!</span>
              </div>
            )}
          </div>
        )}

        {activeForm === "cookiePrefs" && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Cookie Preferences Test</h3>
            <form onSubmit={handleCookiePrefsSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <h4 className="text-white font-medium">Necessary Cookies</h4>
                    <p className="text-sm text-gray-400">Required for the website to function properly</p>
                  </div>
                  <Checkbox checked={cookiePrefs.necessary} disabled />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <h4 className="text-white font-medium">Analytics Cookies</h4>
                    <p className="text-sm text-gray-400">Help us understand how visitors use our site</p>
                  </div>
                  <Checkbox
                    checked={cookiePrefs.analytics}
                    onCheckedChange={(checked) =>
                      setCookiePrefs((prev) => ({ ...prev, analytics: checked as boolean }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <h4 className="text-white font-medium">Marketing Cookies</h4>
                    <p className="text-sm text-gray-400">Used for personalized advertisements</p>
                  </div>
                  <Checkbox
                    checked={cookiePrefs.marketing}
                    onCheckedChange={(checked) =>
                      setCookiePrefs((prev) => ({ ...prev, marketing: checked as boolean }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-white/5">
                  <div>
                    <h4 className="text-white font-medium">Functional Cookies</h4>
                    <p className="text-sm text-gray-400">Enable enhanced functionality and personalization</p>
                  </div>
                  <Checkbox
                    checked={cookiePrefs.functional}
                    onCheckedChange={(checked) =>
                      setCookiePrefs((prev) => ({ ...prev, functional: checked as boolean }))
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="shimmer text-white font-semibold">
                Save Cookie Preferences
              </Button>
            </form>

            {formResults.cookiePrefs && (
              <div className="p-3 rounded bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-400">Cookie preferences saved successfully!</span>
              </div>
            )}
          </div>
        )}

        {!activeForm && (
          <div className="p-6 text-center">
            <p className="text-white">Select a form to test from the options above</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
