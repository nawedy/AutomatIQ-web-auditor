"use client"

// src/components/audit/audit-recommendations.tsx
// Component for displaying prioritized recommendations based on audit results

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  CheckCircle2,
  ArrowRight,
  Clock,
  Zap,
  ThumbsUp,
  Filter
} from "lucide-react"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  category: string
  impact: string
  effort: "low" | "medium" | "high"
  pageCount: number
}

interface AuditRecommendationsProps {
  auditId: string
  initialRecommendations?: Recommendation[]
}

export function AuditRecommendations({ auditId, initialRecommendations = [] }: AuditRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  
  // Load recommendations data if not provided
  useState(() => {
    if (initialRecommendations.length === 0) {
      fetchRecommendations()
    }
  })
  
  // Fetch recommendations data from API
  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/audits/${auditId}/recommendations`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filter recommendations by priority
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab === "all") return true
    return rec.priority === activeTab
  })
  
  // Get priority badge style
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: <XCircle className="w-3 h-3 mr-1" />
        }
      case "high":
        return {
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        }
      case "medium":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          icon: <AlertTriangle className="w-3 h-3 mr-1" />
        }
      case "low":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          icon: <Info className="w-3 h-3 mr-1" />
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: <Info className="w-3 h-3 mr-1" />
        }
    }
  }
  
  // Get effort badge style
  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "low":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "Quick Win"
        }
      case "medium":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          text: "Medium Effort"
        }
      case "high":
        return {
          color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
          text: "Major Project"
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          text: "Unknown Effort"
        }
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-medium text-white">Recommendations</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-black/20">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary">
                All
              </TabsTrigger>
              <TabsTrigger value="critical" className="data-[state=active]:bg-red-500/30">
                Critical
              </TabsTrigger>
              <TabsTrigger value="high" className="data-[state=active]:bg-orange-500/30">
                High
              </TabsTrigger>
              <TabsTrigger value="medium" className="data-[state=active]:bg-yellow-500/30">
                Medium
              </TabsTrigger>
              <TabsTrigger value="low" className="data-[state=active]:bg-blue-500/30">
                Low
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg">No recommendations in this category</p>
                <p className="text-sm">Great job! Your website is performing well in this area.</p>
              </div>
            ) : (
              filteredRecommendations.map((recommendation) => {
                const priorityBadge = getPriorityBadge(recommendation.priority)
                const effortBadge = getEffortBadge(recommendation.effort)
                
                return (
                  <div 
                    key={recommendation.id} 
                    className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="font-medium text-white">{recommendation.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={priorityBadge.color}>
                          {priorityBadge.icon}
                          {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
                        </Badge>
                        <Badge className={effortBadge.color}>
                          <Clock className="w-3 h-3 mr-1" />
                          {effortBadge.text}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Filter className="w-3 h-3 mr-1" />
                          {recommendation.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{recommendation.description}</p>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                          <span>Impact: </span>
                          <span className="ml-1 text-white">{recommendation.impact}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <ThumbsUp className="w-4 h-4 mr-1 text-blue-500" />
                          <span>Affects: </span>
                          <span className="ml-1 text-white">{recommendation.pageCount} pages</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
