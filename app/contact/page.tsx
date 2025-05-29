"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DoubleFooter } from "@/components/double-footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form submitted:", formData)
    // Handle form submission
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">Contact Us</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">Get in Touch</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Have questions about AuditPro? We'd love to hear from you. Send us a message and we'll respond as soon
                as possible.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
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
                          value={formData.email}
                          onChange={handleChange}
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
                        value={formData.subject}
                        onChange={handleChange}
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
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="neomorphism border-0 text-white placeholder-gray-400"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <Button type="submit" className="w-full shimmer text-white font-semibold">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Contact Information</CardTitle>
                    <CardDescription className="text-gray-300">
                      Reach out to us through any of these channels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-blue-500/10">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Email</h3>
                        <p className="text-gray-300">support@auditpro.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-green-500/10">
                        <Phone className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Phone</h3>
                        <p className="text-gray-300">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-500/10">
                        <MapPin className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Address</h3>
                        <p className="text-gray-300">
                          123 Audit Street
                          <br />
                          San Francisco, CA 94103
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM PST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 4:00 PM PST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <DoubleFooter />
        </div>
      </SidebarInset>
    </div>
  )
}
