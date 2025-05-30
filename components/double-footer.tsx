import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function DoubleFooter() {
  return (
    <div className="mt-20">
      {/* First Footer */}
      <footer className="glass-card border-t border-gold/20 py-12 bg-black/80">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg gold-shimmer flex items-center justify-center glow-gold">
                  <span className="text-black font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-gold group-hover:glow-gold transition-all duration-300">
                  AutomatIQ.AI
                </span>
              </div>
              <p className="text-silver text-sm">
                AI-powered website audits that help you optimize for SEO, performance, security, and user experience
                with cutting-edge automation.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-silver hover:text-gold transition-colors duration-300 hover:scale-110 transform"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-silver hover:text-gold transition-colors duration-300 hover:scale-110 transform"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-silver hover:text-gold transition-colors duration-300 hover:scale-110 transform"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link
                  href="#"
                  className="text-silver hover:text-gold transition-colors duration-300 hover:scale-110 transform"
                >
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-gold font-semibold">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-silver hover:text-gold transition-colors text-sm duration-300"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="text-silver hover:text-gold transition-colors text-sm duration-300"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-gold font-semibold">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/websites" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                    Websites
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h3 className="text-gold font-semibold">Stay Updated</h3>
              <p className="text-silver text-sm">Get the latest AI insights and updates delivered to your inbox.</p>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="neomorphism border-0 text-gold placeholder-silver/50 focus:ring-gold"
                />
                <Button className="w-full gold-shimmer text-black font-semibold glow-gold hover:scale-105 transition-all duration-300">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Second Footer */}
      <footer className="bg-black border-t border-gold/10 py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-silver text-sm">
                <Mail className="w-4 h-4 text-gold" />
                <span>support@automatiq.ai</span>
              </div>
              <div className="flex items-center gap-2 text-silver text-sm">
                <Phone className="w-4 h-4 text-gold" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-silver text-sm">
                <MapPin className="w-4 h-4 text-gold" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-silver text-sm">© 2024 AutomatIQ.AI. All rights reserved.</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-end space-x-4 md:space-x-6">
              <Link href="/privacy" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                Cookie Policy
              </Link>
              <Link href="/refund" className="text-silver hover:text-gold transition-colors text-sm duration-300">
                Refund Policy
              </Link>
              <Link
                href="/cookie-preferences"
                className="text-silver hover:text-gold transition-colors text-sm duration-300"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
