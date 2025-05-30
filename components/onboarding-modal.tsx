"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Globe, Zap, Shield, Users, X } from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null)

  // Auto-close after 30 seconds of inactivity
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 30000)
      setAutoCloseTimer(timer)

      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [isOpen, onClose])

  // Reset timer on user interaction
  const resetAutoCloseTimer = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      const timer = setTimeout(() => {
        onClose()
      }, 30000)
      setAutoCloseTimer(timer)
    }
  }

  const steps = [
    {
      title: "Welcome to AutomatIQ.AI!",
      description: "Let's get your website optimized with AI-powered insights.",
      content: (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-lg text-center neomorphism floating">
              <Zap className="w-8 h-8 mx-auto mb-2 text-gold glow-gold" />
              <h3 className="font-semibold text-gold">AI-Powered</h3>
              <p className="text-sm text-silver">Smart insights</p>
            </div>
            <div
              className="glass-card p-4 rounded-lg text-center neomorphism floating"
              style={{ animationDelay: "0.2s" }}
            >
              <Shield className="w-8 h-8 mx-auto mb-2 text-gold glow-gold" />
              <h3 className="font-semibold text-gold">Secure</h3>
              <p className="text-sm text-silver">Protected audits</p>
            </div>
          </div>
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gold glow-gold pulse-gold" />
            <p className="text-silver">Ready to optimize your website performance with AutomatIQ.AI?</p>
          </div>
        </div>
      ),
    },
    {
      title: "Add Your First Website",
      description: "Enter your website URL to start your first AI audit.",
      content: (
        <div className="space-y-4 fade-in">
          <div>
            <Label htmlFor="website-url" className="text-gold">
              Website URL
            </Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value)
                resetAutoCloseTimer()
              }}
              className="neomorphism border-0 text-gold placeholder-silver/50 mt-2 focus:ring-gold focus:border-gold"
            />
          </div>
          <div className="glass-card p-4 rounded-lg neomorphism">
            <Globe className="w-6 h-6 mb-2 text-gold glow-gold" />
            <p className="text-sm text-silver">
              AutomatIQ.AI will analyze your website for SEO, performance, security, and UX issues using advanced AI
              algorithms.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Your AI audit is starting. You'll receive results in a few minutes.",
      content: (
        <div className="text-center space-y-6 fade-in">
          <div className="w-16 h-16 mx-auto rounded-full gold-shimmer flex items-center justify-center glow-gold pulse-gold">
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gold">AI Audit Started!</h3>
            <p className="text-silver">AutomatIQ.AI is analyzing {websiteUrl} and will notify you when complete.</p>
          </div>
          <div className="glass-card p-4 rounded-lg neomorphism">
            <Users className="w-6 h-6 mb-2 text-gold mx-auto glow-gold" />
            <p className="text-sm text-silver">Join 10,000+ users who've improved their websites with AutomatIQ.AI</p>
          </div>
        </div>
      ),
    },
  ]

  const currentStep = steps[step - 1]

  const handleNext = () => {
    resetAutoCloseTimer()
    if (step < steps.length) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    resetAutoCloseTimer()
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleClose = () => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-gold/20 max-w-md neomorphism">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-gold text-xl glow-gold">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-silver">{currentStep.description}</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-silver hover:text-gold transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6">{currentStep.content}</div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index + 1 <= step ? "bg-gold glow-gold" : "bg-silver/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-gold/30 text-silver hover:bg-gold/10 hover:text-gold transition-all duration-300"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="gold-shimmer text-black font-semibold glow-gold hover:scale-105 transition-all duration-300"
              disabled={step === 2 && !websiteUrl}
            >
              {step === steps.length ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>

        {/* Auto-close indicator */}
        <div className="absolute top-2 right-12 text-xs text-silver/50">Auto-closes in 30s</div>
      </DialogContent>
    </Dialog>
  )
}
