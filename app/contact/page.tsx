"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
              <h1 className="text-4xl md:text-5xl font-bold shimmer-title mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-white mb-8">
                Have questions about AutomatIQ.AI? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="glass-card border-gold/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          className="glass-card border-gold/30 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="glass-card border-gold/30 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        className="glass-card border-gold/30 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us more about your needs..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="glass-card border-gold/30 text-white placeholder-gray-400 resize-none"
                      />
                    </div>
                    <Button type="submit" className="w-full gold-shimmer text-navy font-semibold">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-gold/20">
                        <Mail className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">Email Us</h3>
                        <p className="text-gray-300 mb-2">Get in touch via email</p>
                        <a href="mailto:support@automatiq.ai" className="text-gold hover:text-gold/80 transition-colors">
                          support@automatiq.ai
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-gold/20">
                        <Phone className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">Call Us</h3>
                        <p className="text-gray-300 mb-2">Monday to Friday, 9am to 6pm PST</p>
                        <a href="tel:+1-555-123-4567" className="text-gold hover:text-gold/80 transition-colors">
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-gold/20">
                        <MapPin className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">Visit Us</h3>
                        <p className="text-gray-300 mb-2">Our headquarters</p>
                        <address className="text-gold not-italic">
                          123 Tech Street<br />
                          San Francisco, CA 94105<br />
                          United States
                        </address>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-full bg-gold/20">
                        <Clock className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">Business Hours</h3>
                        <div className="text-gray-300 space-y-1">
                          <div className="flex justify-between">
                            <span>Monday - Friday:</span>
                            <span className="text-gold">9:00 AM - 6:00 PM PST</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday:</span>
                            <span className="text-gold">10:00 AM - 4:00 PM PST</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday:</span>
                            <span className="text-gold">Closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <DoubleFooter />
    </div>
  )
}
