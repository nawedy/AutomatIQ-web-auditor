"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react"

interface Issue {
  category: string
  title: string
  description: string
  impact: string
  effort: string
  pages: string[]
  recommendation: string
}

interface RecommendationCardProps {
  issue: Issue
  priority?: boolean
}

export function RecommendationCard({ issue, priority = false }: RecommendationCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "performance":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "seo":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "security":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "ux":
        return <Info className="w-4 h-4 text-purple-400" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "performance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "seo":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "security":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "ux":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className={`neomorphism border-white/10 ${priority ? "ring-2 ring-blue-500/50" : ""}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {priority && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Priority</Badge>}
                  <Badge className={getCategoryColor(issue.category)}>
                    {getCategoryIcon(issue.category)}
                    <span className="ml-1">{issue.category}</span>
                  </Badge>
                  <Badge className={getImpactColor(issue.impact)}>Impact: {issue.impact}</Badge>
                  <Badge className={getEffortColor(issue.effort)}>Effort: {issue.effort}</Badge>
                </div>
                <CardTitle className="text-white text-lg">{issue.title}</CardTitle>
                <CardDescription className="text-gray-300 mt-2">{issue.description}</CardDescription>
              </div>
              <div className="ml-4">
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Affected Pages */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Affected Pages ({issue.pages.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {issue.pages.map((page, index) => (
                    <Badge key={index} variant="outline" className="border-white/20 text-gray-300">
                      {page}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Recommendation
                </h4>
                <p className="text-gray-300 bg-black/20 p-3 rounded-lg">{issue.recommendation}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="shimmer text-white font-semibold">
                  Mark as Fixed
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Ignore Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
