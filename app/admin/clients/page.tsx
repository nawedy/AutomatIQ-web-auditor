"use client"

// src/app/admin/clients/page.tsx
// Admin clients management page

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react"

// Client data type definition
interface Client {
  id: string
  name: string
  email: string
  websites: number
  plan: string
  status: string
  lastActive: string
  issueCount: number
  createdAt?: string
  updatedAt?: string
}
  {
    id: "1",
    name: "Acme Corporation",
    email: "admin@acmecorp.com",
    websites: 5,
    plan: "Enterprise",
    status: "active",
    lastActive: "2023-07-15T14:32:00Z",
    issueCount: 3,
  },
  {
    id: "2",
    name: "TechStart Inc",
    email: "admin@techstart.io",
    websites: 2,
    plan: "Business",
    status: "active",
    lastActive: "2023-07-15T13:45:00Z",
    issueCount: 8,
  },
  {
    id: "3",
    name: "Global Media",
    email: "admin@globalmedia.com",
    websites: 7,
    plan: "Enterprise",
    status: "active",
    lastActive: "2023-07-15T12:18:00Z",
    issueCount: 1,
  },
  {
    id: "4",
    name: "Retail Plus",
    email: "admin@retailplus.store",
    websites: 3,
    plan: "Business",
    status: "active",
    lastActive: "2023-07-15T11:52:00Z",
    issueCount: 0,
  },
  {
    id: "5",
    name: "Dev Solutions",
    email: "admin@devsolutions.co",
    websites: 4,
    plan: "Business",
    status: "active",
    lastActive: "2023-07-15T10:30:00Z",
    issueCount: 5,
  },
  {
    id: "6",
    name: "Health Direct",
    email: "admin@healthdirect.org",
    websites: 1,
    plan: "Startup",
    status: "inactive",
    lastActive: "2023-07-10T09:15:00Z",
    issueCount: 12,
  },
  {
    id: "7",
    name: "Secure Banking",
    email: "admin@securebanking.com",
    websites: 2,
    plan: "Enterprise",
    status: "active",
    lastActive: "2023-07-15T08:45:00Z",
    issueCount: 0,
  },
  {
    id: "8",
    name: "Travel Experts",
    email: "admin@travelexperts.com",
    websites: 3,
    plan: "Business",
    status: "active",
    lastActive: "2023-07-15T07:00:00Z",
    issueCount: 2,
  },
  {
    id: "9",
    name: "Online Store",
    email: "admin@greatstore.shop",
    websites: 1,
    plan: "Startup",
    status: "active",
    lastActive: "2023-07-15T06:22:00Z",
    issueCount: 7,
  },
  {
    id: "10",
    name: "New Business",
    email: "admin@newbusiness.co",
    websites: 1,
    plan: "Free Trial",
    status: "active",
    lastActive: "2023-07-15T05:10:00Z",
    issueCount: 4,
  },
]

export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [planFilter, setPlanFilter] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch clients data from API
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (statusFilter) params.append("status", statusFilter)
        if (planFilter) params.append("plan", planFilter)
        if (searchQuery) params.append("search", searchQuery)
        
        const response = await fetch(`/api/admin/clients?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setClients(data)
      } catch (err) {
        console.error("Failed to fetch clients:", err)
        setError("Failed to load client data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchClients()
  }, [searchQuery, statusFilter, planFilter])
  
  // Filter clients based on search query and filters (client-side filtering as backup)
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter ? client.status === statusFilter : true
    const matchesPlan = planFilter ? client.plan === planFilter : true
    
    return matchesSearch && matchesStatus && matchesPlan
  })
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Helper function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "suspended":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }
  
  // Helper function to get plan badge style
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "Enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Business":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Startup":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Free Trial":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Client Management</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Client
        </Button>
      </div>
      
      {/* Filters and Search */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clients..."
                className="pl-10 bg-black/20 border-white/10 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                    Status: {statusFilter || "All"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-white/10">
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("suspended")}>Suspended</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                    Plan: {planFilter || "All"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-white/10">
                  <DropdownMenuItem onClick={() => setPlanFilter(null)}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Enterprise")}>Enterprise</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Business")}>Business</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Startup")}>Startup</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlanFilter("Free Trial")}>Free Trial</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Clients Table */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Clients
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage all client accounts and their websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-2 text-gray-300">Loading client data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              {error}
              <Button 
                variant="outline" 
                className="mt-4 border-white/10 hover:bg-white/10"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Plan</TableHead>
                  <TableHead className="text-gray-300">Websites</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Issues</TableHead>
                  <TableHead className="text-gray-300">Last Active</TableHead>
                  <TableHead className="text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                <TableRow key={client.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{client.name}</TableCell>
                  <TableCell className="text-gray-300">{client.email}</TableCell>
                  <TableCell>
                    <Badge className={getPlanBadge(client.plan)}>
                      {client.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{client.websites}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(client.status)}>
                      {client.status === "active" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : client.status === "inactive" ? (
                        <Clock className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.issueCount > 0 ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        {client.issueCount}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        0
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {formatDate(client.lastActive)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:text-white">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                        <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-white/10">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-white/10">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-white/10">
                          <Mail className="mr-2 h-4 w-4" />
                          Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredClients.length === 0 && !isLoading && !error && (
              <div className="text-center py-8 text-gray-400">
                No clients found matching your filters
              </div>
            )}
          )}
        </CardContent>
      </Card>
      
      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">{clients.length}</div>
                <p className="text-xs text-green-400">
                  {clients.filter(c => {
                    const createdAt = new Date(c.createdAt || Date.now());
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return createdAt > oneMonthAgo;
                  }).length} new this month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {clients.filter(c => c.status === "active").length}
                </div>
                <p className="text-xs text-gray-400">
                  {clients.length > 0 ? 
                    ((clients.filter(c => c.status === "active").length / clients.length) * 100).toFixed(0) : 0}% of total
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Enterprise Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {clients.filter(c => c.plan === "Enterprise").length}
                </div>
                <p className="text-xs text-blue-400">
                  {clients.filter(c => {
                    const createdAt = new Date(c.createdAt || Date.now());
                    const oneQuarterAgo = new Date();
                    oneQuarterAgo.setMonth(oneQuarterAgo.getMonth() - 3);
                    return createdAt > oneQuarterAgo && c.plan === "Enterprise";
                  }).length} new this quarter
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg. Websites per Client</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  {clients.length > 0 ? 
                    (clients.reduce((sum, client) => sum + client.websites, 0) / clients.length).toFixed(1) : "0.0"}
                </div>
                <p className="text-xs text-green-400">Growing steadily</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
