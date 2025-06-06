"use client"

// src/components/audit/audit-pages.tsx
// Component for displaying audited pages with their scores and issues

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react"

interface Page {
  id: string
  url: string
  title: string
  score: number
  status: string
  issueCount: {
    critical: number
    major: number
    minor: number
    info: number
  }
  lastChecked: string
}

interface AuditPagesProps {
  auditId: string
  initialPages?: Page[]
}

export function AuditPages({ auditId, initialPages = [] }: AuditPagesProps) {
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sortField, setSortField] = useState<string>("score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Load pages data if not provided
  useState(() => {
    if (initialPages.length === 0) {
      fetchPages()
    }
  })
  
  // Fetch pages data from API
  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/audits/${auditId}/pages`)
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error("Failed to fetch pages:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }
  
  // Get sorted and filtered pages
  const filteredPages = pages
    .filter(page => 
      page.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case "url":
          comparison = a.url.localeCompare(b.url)
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "score":
          comparison = a.score - b.score
          break
        case "issues":
          const aTotal = a.issueCount.critical + a.issueCount.major + a.issueCount.minor + a.issueCount.info
          const bTotal = b.issueCount.critical + b.issueCount.major + b.issueCount.minor + b.issueCount.info
          comparison = aTotal - bTotal
          break
        default:
          comparison = 0
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-medium text-white">Audited Pages</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search pages..."
              className="pl-10 bg-black/20 border-white/10 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead 
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handleSort("url")}
                  >
                    <div className="flex items-center">
                      URL {getSortIcon("url")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center">
                      Title {getSortIcon("title")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handleSort("score")}
                  >
                    <div className="flex items-center">
                      Score {getSortIcon("score")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handleSort("issues")}
                  >
                    <div className="flex items-center">
                      Issues {getSortIcon("issues")}
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No pages found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPages.map((page) => (
                    <TableRow key={page.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        <div className="truncate max-w-[200px]" title={page.url}>
                          {page.url}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="truncate max-w-[200px]" title={page.title}>
                          {page.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getScoreColor(page.score)}`}>
                          {page.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {page.issueCount.critical > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <XCircle className="w-3 h-3 mr-1" />
                              {page.issueCount.critical}
                            </Badge>
                          )}
                          {page.issueCount.major > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {page.issueCount.major}
                            </Badge>
                          )}
                          {page.issueCount.minor > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {page.issueCount.minor}
                            </Badge>
                          )}
                          {page.issueCount.info > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              <Info className="w-3 h-3 mr-1" />
                              {page.issueCount.info}
                            </Badge>
                          )}
                          {page.issueCount.critical === 0 && 
                           page.issueCount.major === 0 && 
                           page.issueCount.minor === 0 && 
                           page.issueCount.info === 0 && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              0
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-300 hover:text-white"
                          asChild
                        >
                          <a href={page.url} target="_blank" rel="noopener noreferrer">
                            <span className="sr-only">Open page</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
