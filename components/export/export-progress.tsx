"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, Database, Mail, CheckCircle } from "lucide-react"

interface ExportProgressProps {
  progress: number
  type: "pdf" | "data" | "email"
  onComplete?: () => void
}

export function ExportProgress({ progress, type, onComplete }: ExportProgressProps) {
  const [currentStep, setCurrentStep] = useState("")

  const steps = {
    pdf: [
      { step: "Initializing PDF generator...", progress: 5 },
      { step: "Generating cover page...", progress: 15 },
      { step: "Creating executive summary...", progress: 30 },
      { step: "Rendering charts and graphs...", progress: 50 },
      { step: "Compiling detailed analysis...", progress: 70 },
      { step: "Adding recommendations...", progress: 85 },
      { step: "Finalizing PDF document...", progress: 95 },
      { step: "Export complete!", progress: 100 },
    ],
    data: [
      { step: "Connecting to database...", progress: 10 },
      { step: "Extracting audit data...", progress: 25 },
      { step: "Processing performance metrics...", progress: 45 },
      { step: "Formatting data structure...", progress: 65 },
      { step: "Generating export file...", progress: 85 },
      { step: "Export complete!", progress: 100 },
    ],
    email: [
      { step: "Preparing email content...", progress: 20 },
      { step: "Generating PDF attachment...", progress: 40 },
      { step: "Validating recipients...", progress: 60 },
      { step: "Sending email...", progress: 80 },
      { step: "Email sent successfully!", progress: 100 },
    ],
  }

  useEffect(() => {
    const currentSteps = steps[type]
    const currentStepData = currentSteps.find((s) => s.progress >= progress) || currentSteps[currentSteps.length - 1]
    setCurrentStep(currentStepData.step)

    if (progress === 100 && onComplete) {
      setTimeout(onComplete, 1000)
    }
  }, [progress, type, onComplete])

  const getIcon = () => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6 text-blue-400" />
      case "data":
        return <Database className="w-6 h-6 text-green-400" />
      case "email":
        return <Mail className="w-6 h-6 text-purple-400" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case "pdf":
        return "Generating PDF Report"
      case "data":
        return "Exporting Data"
      case "email":
        return "Sending Email"
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            {progress === 100 ? <CheckCircle className="w-8 h-8 text-green-400" /> : getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{getTitle()}</h3>
            <p className="text-gray-300 text-sm">{currentStep}</p>
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="text-sm text-gray-400">{progress}% complete</div>
          </div>
          {progress === 100 && (
            <div className="text-green-400 text-sm font-medium">
              {type === "email" ? "Email sent successfully!" : "Export completed successfully!"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
