"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Tools navigation items
  const tools = [
    { name: "Website Audit", href: "/audit", description: "Comprehensive AI-powered website analysis and recommendations" },
    { name: "SEO Audit", href: "/tools/seo-audit", description: "Comprehensive SEO analysis and recommendations" },
    { name: "Performance Test", href: "/tools/performance", description: "Website speed and Core Web Vitals analysis" },
    { name: "Security Scan", href: "/tools/security", description: "Vulnerability detection and security assessment" },
    { name: "UX Analysis", href: "/tools/ux-analysis", description: "User experience and accessibility evaluation" },
    { name: "Content Audit", href: "/tools/content-audit", description: "Content quality and optimization analysis" },
  ]

  // Resources navigation items
  const resources = [
    { name: "Blogs", href: "/blog", description: "Latest insights and best practices" },
    { name: "Case Studies", href: "/case-studies", description: "Real-world success stories and results" },
  ]

  useEffect(() => {
    // Debounced scroll handler to improve performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.scrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }, 10); // Small timeout for smoother transitions
    };

    // Use passive event listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-black/80 backdrop-blur-lg border-b border-gold/20 py-3" : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg gold-shimmer flex items-center justify-center">
              <span className="text-navy font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-shimmer-continuous text-lg">AutomatIQ.AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Tools Dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="text-white hover:text-gold group flex items-center"
                onClick={() => {}}
              >
                Tools
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>

              <div className="absolute left-0 mt-1 w-80 origin-top-left rounded-md bg-black border border-gold/20 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 backdrop-blur-xl">
                <div className="p-4 grid gap-4">
                  {tools.map((tool) => (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="flex flex-col p-3 rounded-md hover:bg-gold/10 transition-colors"
                    >
                      <span className="text-gold font-medium">{tool.name}</span>
                      <span className="text-white/80 text-sm">{tool.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/analytics" passHref>
              <Button
                variant="ghost"
                className={cn("text-white hover:text-gold", pathname === "/analytics" && "text-gold bg-gold/10")}
              >
                Analytics
              </Button>
            </Link>

            <Link href="/reports" passHref>
              <Button
                variant="ghost"
                className={cn("text-white hover:text-gold", pathname === "/reports" && "text-gold bg-gold/10")}
              >
                Reports
              </Button>
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="text-white hover:text-gold group flex items-center"
                onClick={() => {}}
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>

              <div className="absolute left-0 mt-1 w-64 origin-top-left rounded-md bg-black border border-gold/20 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 backdrop-blur-xl">
                <div className="p-4 grid gap-4">
                  {resources.map((resource) => (
                    <Link
                      key={resource.name}
                      href={resource.href}
                      className="flex flex-col p-3 rounded-md hover:bg-gold/10 transition-colors"
                    >
                      <span className="text-gold font-medium">{resource.name}</span>
                      <span className="text-white/80 text-sm">{resource.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Auth Buttons & Dashboard */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard" passHref>
                  <Button
                    variant="ghost"
                    className={cn("text-white hover:text-gold", pathname === "/dashboard" && "text-gold bg-gold/10")}
                  >
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" passHref>
                  <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button className="gold-shimmer text-navy font-semibold">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-black/95 backdrop-blur-xl border-b border-gold/20"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-gold font-medium px-3">Tools</h3>
              <div className="space-y-1 pl-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="block py-2 px-3 text-white hover:text-gold rounded-md hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/analytics" passHref>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:text-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Button>
            </Link>

            <Link href="/reports" passHref>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:text-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reports
              </Button>
            </Link>

            <div className="space-y-2">
              <h3 className="text-gold font-medium px-3">Resources</h3>
              <div className="space-y-1 pl-3">
                {resources.map((resource) => (
                  <Link
                    key={resource.name}
                    href={resource.href}
                    className="block py-2 px-3 text-white hover:text-gold rounded-md hover:bg-gold/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {resource.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gold/20 flex flex-col space-y-3">
              {user ? (
                <Link href="/dashboard" passHref>
                  <Button className="w-full gold-shimmer text-navy font-semibold">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" passHref>
                    <Button variant="outline" className="w-full border-gold/30 text-gold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" passHref>
                    <Button className="w-full gold-shimmer text-navy font-semibold">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
