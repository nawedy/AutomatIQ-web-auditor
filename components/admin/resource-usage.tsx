"use client"

// src/components/admin/resource-usage.tsx
// Component for displaying resource usage metrics across the platform

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { HardDrive, Cpu, MemoryStick, Network } from "lucide-react"

interface ResourceUsageProps {
  storageUsed: number
  totalStorage: number
}

export function AdminResourceUsage({ storageUsed, totalStorage }: ResourceUsageProps) {
  // Calculate percentages
  const storagePercentage = (storageUsed / totalStorage) * 100
  
  // Sample data - would be fetched from API in production
  const resources = [
    {
      name: "Storage",
      used: storageUsed,
      total: totalStorage,
      unit: "GB",
      percentage: storagePercentage,
      icon: <HardDrive className="w-5 h-5 text-blue-400" />,
    },
    {
      name: "CPU",
      used: 28,
      total: 100,
      unit: "%",
      percentage: 28,
      icon: <Cpu className="w-5 h-5 text-green-400" />,
    },
    {
      name: "Memory",
      used: 4.2,
      total: 8,
      unit: "GB",
      percentage: 52.5,
      icon: <MemoryStick className="w-5 h-5 text-purple-400" />,
    },
    {
      name: "Network",
      used: 1.8,
      total: 10,
      unit: "Gbps",
      percentage: 18,
      icon: <Network className="w-5 h-5 text-yellow-400" />,
    },
  ]
  
  // Helper function to get status color based on usage percentage
  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return "text-green-400"
    if (percentage < 80) return "text-yellow-400"
    return "text-red-400"
  }
  
  // Helper function to get progress bar color based on usage percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500"
    if (percentage < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          Resource Usage
        </CardTitle>
        <CardDescription className="text-gray-300">
          System resource allocation and utilization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resource Usage Metrics */}
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <div key={index} className="neomorphism p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {resource.icon}
                  <span className="text-sm font-medium text-white">{resource.name}</span>
                </div>
                <Badge className={`bg-${getStatusColor(resource.percentage).replace('text-', '')}/20 ${getStatusColor(resource.percentage)} border-${getStatusColor(resource.percentage).replace('text-', '')}/30`}>
                  {resource.percentage.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {resource.used} {resource.unit} / {resource.total} {resource.unit}
                </span>
                <span className={`text-xs ${getStatusColor(resource.percentage)}`}>
                  {resource.percentage < 50 ? "Healthy" : resource.percentage < 80 ? "Moderate" : "High Usage"}
                </span>
              </div>
              <Progress 
                value={resource.percentage} 
                className={`h-2 ${getProgressColor(resource.percentage)}`}
              />
            </div>
          ))}
        </div>
        
        {/* Resource Allocation */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Resource Allocation by Service</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Audit Processing</span>
              <span className="text-sm text-gray-300">45%</span>
            </div>
            <Progress value={45} className="h-1.5 bg-blue-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Database Operations</span>
              <span className="text-sm text-gray-300">25%</span>
            </div>
            <Progress value={25} className="h-1.5 bg-purple-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Report Generation</span>
              <span className="text-sm text-gray-300">15%</span>
            </div>
            <Progress value={15} className="h-1.5 bg-green-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Real-time Monitoring</span>
              <span className="text-sm text-gray-300">10%</span>
            </div>
            <Progress value={10} className="h-1.5 bg-yellow-500" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Other Services</span>
              <span className="text-sm text-gray-300">5%</span>
            </div>
            <Progress value={5} className="h-1.5 bg-gray-500" />
          </div>
        </div>
        
        {/* Resource Recommendations */}
        <div className="p-3 neomorphism rounded-lg border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-white mb-1">Resource Optimization Recommendations</h3>
          <ul className="text-xs text-gray-300 space-y-1 ml-4 list-disc">
            <li>Consider scaling database resources during peak audit hours (10AM-2PM)</li>
            <li>Enable caching for frequently accessed audit reports to reduce storage I/O</li>
            <li>Current resource allocation is sufficient for the next 30 days based on growth projections</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
