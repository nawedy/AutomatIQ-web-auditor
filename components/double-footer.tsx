import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function DoubleFooter() {
  return (
    <div className="mt-20">
      {/* First Footer */}
      <footer className="glass-card border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <span className="text-xl font-bold text-white">AuditPro</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered website audits that help you optimize for SEO, performance, security, and user experience.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/websites" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Websites
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Stay Updated</h3>
              <p className="text-gray-400 text-sm">Get the latest tips and updates delivered to your inbox.</p>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="neomorphism border-0 text-white placeholder-gray-400"
                />
                <Button className="w-full shimmer text-white font-semibold">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Second Footer */}
      <footer className="bg-black/50 border-t border-white/5 py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>support@auditpro.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">© 2024 AuditPro. All rights reserved.</p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-end space-x-4 md:space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </Link>
              <Link href="/refund" className="text-gray-400 hover:text-white transition-colors text-sm">
                Refund Policy
              </Link>
              <Link href="/cookie-preferences" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
