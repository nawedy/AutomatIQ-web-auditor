// src/components/dashboard/admin-overview.tsx
// Admin dashboard overview component showing scheduled audits status and recent activity

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Loader2,
  BarChart3,
  Download,
  History
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { BulkExport } from "@/components/export/bulk-export";
import Link from "next/link";

interface ScheduledAuditStats {
  totalWebsites: number;
  totalScheduledAudits: number;
  completedToday: number;
  failedToday: number;
  nextScheduledAudit: string | null;
}

interface RecentActivity {
  id: string;
  type: "audit_completed" | "audit_scheduled" | "audit_failed" | "export_generated";
  websiteName: string;
  websiteId: string;
  timestamp: string;
  details?: {
    auditId?: string;
    score?: number;
    exportType?: string;
    errorMessage?: string;
  };
}

interface AuditReport {
  id: string;
  website: string;
  date: string;
  score: number;
  status: string;
}

export function AdminOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scheduledStats, setScheduledStats] = useState<ScheduledAuditStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditReport[]>([]);
  const { toast } = useToast();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch scheduled audits stats
      const statsResponse = await fetch("/api/cron/run-scheduled-audits", {
        method: "GET",
      });
      
      if (!statsResponse.ok) {
        throw new Error("Failed to fetch scheduled audits statistics");
      }
      
      const statsData = await statsResponse.json();
      setScheduledStats(statsData);
      
      // Fetch recent activity (mock data for now)
      // In a real implementation, this would be fetched from an API
      const mockActivity: RecentActivity[] = [
        {
          id: "act1",
          type: "audit_completed",
          websiteName: "example.com",
          websiteId: "web1",
          timestamp: new Date().toISOString(),
          details: {
            auditId: "audit1",
            score: 87
          }
        },
        {
          id: "act2",
          type: "audit_scheduled",
          websiteName: "testsite.org",
          websiteId: "web2",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "act3",
          type: "export_generated",
          websiteName: "demo.net",
          websiteId: "web3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: {
            exportType: "PDF"
          }
        },
        {
          id: "act4",
          type: "audit_failed",
          websiteName: "broken.site",
          websiteId: "web4",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          details: {
            errorMessage: "Connection timeout"
          }
        }
      ];
      
      setRecentActivity(mockActivity);
      
      // Fetch recent audits for bulk export
      // In a real implementation, this would be fetched from an API
      const mockAudits: AuditReport[] = [
        {
          id: "audit1",
          website: "example.com",
          date: new Date().toISOString(),
          score: 87,
          status: "completed"
        },
        {
          id: "audit2",
          website: "testsite.org",
          date: new Date(Date.now() - 86400000).toISOString(),
          score: 92,
          status: "completed"
        },
        {
          id: "audit3",
          website: "demo.net",
          date: new Date(Date.now() - 172800000).toISOString(),
          score: 76,
          status: "completed"
        },
        {
          id: "audit4",
          website: "company.co",
          date: new Date(Date.now() - 259200000).toISOString(),
          score: 81,
          status: "completed"
        }
      ];
      
      setRecentAudits(mockAudits);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      await fetchDashboardData();
      toast({
        title: "Dashboard refreshed",
        description: "The dashboard data has been updated.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const runScheduledAudits = async () => {
    try {
      setIsRefreshing(true);
      
      // Call the cron API to run scheduled audits
      const response = await fetch("/api/cron/run-scheduled-audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cron-secret": "manual-trigger-from-admin" // This would be replaced with a proper secret in production
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run scheduled audits");
      }
      
      const data = await response.json();
      
      toast({
        title: "Scheduled audits triggered",
        description: `Processed ${data.processed} audits out of ${data.total} scheduled.`,
      });
      
      // Refresh dashboard data after running audits
      await fetchDashboardData();
    } catch (error) {
      console.error("Error running scheduled audits:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "audit_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "audit_scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "audit_failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "export_generated":
        return <Download className="h-4 w-4 text-purple-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case "audit_completed":
        return `Audit completed for ${activity.websiteName} with score ${activity.details?.score || 'N/A'}`;
      case "audit_scheduled":
        return `Audit scheduled for ${activity.websiteName}`;
      case "audit_failed":
        return `Audit failed for ${activity.websiteName}: ${activity.details?.errorMessage || 'Unknown error'}`;
      case "export_generated":
        return `${activity.details?.exportType || 'Report'} export generated for ${activity.websiteName}`;
      default:
        return `Activity on ${activity.websiteName}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <Button 
          variant="outline" 
          onClick={refreshData}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Audits</TabsTrigger>
          <TabsTrigger value="export">Bulk Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scheduledStats?.totalWebsites || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Being monitored by AutomatIQ
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Scheduled Audits</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scheduledStats?.totalScheduledAudits || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Active recurring schedules
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scheduledStats?.completedToday || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Audits completed today
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scheduledStats?.failedToday || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Audits failed today
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions and events across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {getActivityText(activity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <History className="h-4 w-4 mr-2" />
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Next Scheduled Audit */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Scheduled Audit</CardTitle>
                  <CardDescription>
                    Upcoming automated audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledStats?.nextScheduledAudit ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {format(parseISO(scheduledStats.nextScheduledAudit), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scheduled to run automatically
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={runScheduledAudits}
                        disabled={isRefreshing}
                      >
                        {isRefreshing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Run Now
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-16">
                      <p className="text-muted-foreground">No upcoming scheduled audits</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Audits</CardTitle>
              <CardDescription>
                Manage and monitor recurring website audits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Summary */}
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Websites</p>
                      <p className="text-2xl font-bold">{scheduledStats?.totalWebsites || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Active Schedules</p>
                      <p className="text-2xl font-bold">{scheduledStats?.totalScheduledAudits || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Completed Today</p>
                      <p className="text-2xl font-bold">{scheduledStats?.completedToday || 0}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Failed Today</p>
                      <p className="text-2xl font-bold">{scheduledStats?.failedToday || 0}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={runScheduledAudits}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Run All Due Audits
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/admin/schedules">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Schedules
                      </Link>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {/* Next Scheduled */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Next Scheduled Audit</h3>
                    {scheduledStats?.nextScheduledAudit ? (
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-3 text-primary" />
                          <div>
                            <p className="font-medium">
                              {format(parseISO(scheduledStats.nextScheduledAudit), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Will run automatically via cron job
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Scheduled
                        </Badge>
                      </div>
                    ) : (
                      <div className="bg-muted/30 p-4 rounded-lg flex items-center">
                        <AlertCircle className="h-5 w-5 mr-3 text-yellow-500" />
                        <p>No upcoming scheduled audits found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Export</CardTitle>
              <CardDescription>
                Export multiple audit reports at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <BulkExport 
                  reports={recentAudits}
                  onExportComplete={refreshData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
