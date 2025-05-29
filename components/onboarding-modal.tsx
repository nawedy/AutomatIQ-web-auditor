"use client"

import { useState } from "react"
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

  const steps = [
    {
      title: "Welcome to AuditPro!",
      description: "Let's get your website optimized in just a few steps.",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-lg text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold text-white">AI-Powered</h3>
              <p className="text-sm text-gray-400">Smart insights</p>
            </div>
            <div className="glass-card p-4 rounded-lg text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold text-white">Secure</h3>
              <p className="text-sm text-gray-400">Protected audits</p>
            </div>
          </div>
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="text-gray-300">Ready to optimize your website performance?</p>
          </div>
        </div>
      ),
    },
    {
      title: "Add Your First Website",
      description: "Enter your website URL to start your first audit.",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="website-url" className="text-white">
              Website URL
            </Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="neomorphism border-0 text-white placeholder-gray-400 mt-2"
            />
          </div>
          <div className="glass-card p-4 rounded-lg">
            <Globe className="w-6 h-6 mb-2 text-blue-400" />
            <p className="text-sm text-gray-300">
              We'll analyze your website for SEO, performance, security, and UX issues.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Your audit is starting. You'll receive results in a few minutes.",
      content: (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Audit Started!</h3>
            <p className="text-gray-300">We're analyzing {websiteUrl} and will notify you when complete.</p>
          </div>
          <div className="glass-card p-4 rounded-lg">
            <Users className="w-6 h-6 mb-2 text-purple-400 mx-auto" />
            <p className="text-sm text-gray-300">Join 10,000+ users who've improved their websites with AuditPro</p>
          </div>
        </div>
      ),
    },
  ]

  const currentStep = steps[step - 1]

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-white text-xl">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-gray-300">{currentStep.description}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
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
                className={`w-2 h-2 rounded-full ${index + 1 <= step ? "bg-blue-500" : "bg-gray-600"}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="shimmer text-white font-semibold"
              disabled={step === 2 && !websiteUrl}
            >
              {step === steps.length ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
