// src/components/audit/comparative-analysis.tsx
// Component for comparing audit results over time

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, LineChart as LineChartIcon } from "lucide-react";

interface AuditScores {
  id: string;
  date: string;
  formattedDate: string;
  overallScore: number;
  seoScore?: number;
  performanceScore?: number;
  accessibilityScore?: number;
  securityScore?: number;
  mobileScore?: number;
  contentScore?: number;
}

interface ComparativeAnalysisProps {
  websiteId: string;
  currentAuditId?: string;
  className?: string;
}

export function ComparativeAnalysis({
  websiteId,
  currentAuditId,
  className,
}: ComparativeAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [auditHistory, setAuditHistory] = useState<AuditScores[]>([]);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["overallScore"]);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch audit history data
  useEffect(() => {
    fetchAuditHistory();
  }, [websiteId, timeRange]);

  // Fetch audit history from API
  const fetchAuditHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/websites/${websiteId}/audits/history?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch audit history");
      }
      
      const data = await response.json();
      
      // Format data for charts
      const formattedData = data.audits.map((audit: any) => ({
        id: audit.id,
        date: audit.completedAt || audit.createdAt,
        formattedDate: format(new Date(audit.completedAt || audit.createdAt), "MMM d, yyyy"),
        overallScore: audit.overallScore || 0,
        seoScore: audit.seoScore || 0,
        performanceScore: audit.performanceScore || 0,
        accessibilityScore: audit.accessibilityScore || 0,
        securityScore: audit.securityScore || 0,
        mobileScore: audit.mobileScore || 0,
        contentScore: audit.contentScore || 0,
      }));
      
      // Sort by date ascending
      formattedData.sort((a: AuditScores, b: AuditScores) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setAuditHistory(formattedData);
    } catch (error) {
      console.error("Error fetching audit history:", error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle metric selection
  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric]);
    }
  };

  // Calculate improvement between first and last audit
  const calculateImprovement = (metric: string) => {
    if (auditHistory.length < 2) return null;
    
    const firstValue = auditHistory[0][metric as keyof AuditScores] as number;
    const lastValue = auditHistory[auditHistory.length - 1][metric as keyof AuditScores] as number;
    
    const diff = lastValue - firstValue;
    const percentage = firstValue === 0 ? 0 : (diff / firstValue) * 100;
    
    return {
      diff,
      percentage: Math.round(percentage * 10) / 10,
      improved: diff > 0,
    };
  };

  // Get trend icon based on improvement
  const getTrendIcon = (improvement: { diff: number; percentage: number; improved: boolean } | null) => {
    if (!improvement) return <Minus className="h-4 w-4" />;
    
    return improvement.improved ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  // Get color for metric
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "overallScore":
        return "#4F46E5"; // Indigo
      case "seoScore":
        return "#2563EB"; // Blue
      case "performanceScore":
        return "#D97706"; // Amber
      case "accessibilityScore":
        return "#059669"; // Emerald
      case "securityScore":
        return "#DC2626"; // Red
      case "mobileScore":
        return "#7C3AED"; // Violet
      case "contentScore":
        return "#0891B2"; // Cyan
      default:
        return "#6B7280"; // Gray
    }
  };

  // Format metric name for display
  const formatMetricName = (metric: string) => {
    switch (metric) {
      case "overallScore":
        return "Overall";
      case "seoScore":
        return "SEO";
      case "performanceScore":
        return "Performance";
      case "accessibilityScore":
        return "Accessibility";
      case "securityScore":
        return "Security";
      case "mobileScore":
        return "Mobile";
      case "contentScore":
        return "Content";
      default:
        return metric;
    }
  };

  // Handle audit selection
  const handleAuditSelect = (auditId: string) => {
    router.push(`/audits/${auditId}`);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Comparative Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as any)}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <CardDescription>
          Compare audit scores over time to track improvements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : auditHistory.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Not enough audit data available for comparison.
              Run more audits to see trends over time.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {["overallScore", "seoScore", "performanceScore", "accessibilityScore", "securityScore", "mobileScore", "contentScore"].map((metric) => (
                <Badge
                  key={metric}
                  variant={selectedMetrics.includes(metric) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedMetrics.includes(metric) ? getMetricColor(metric) : "transparent",
                    borderColor: getMetricColor(metric),
                    color: selectedMetrics.includes(metric) ? "white" : getMetricColor(metric),
                  }}
                  onClick={() => toggleMetric(metric)}
                >
                  {formatMetricName(metric)}
                </Badge>
              ))}
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={auditHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="formattedDate" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}`, ""]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {selectedMetrics.map((metric) => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        name={formatMetricName(metric)}
                        stroke={getMetricColor(metric)}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={auditHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="formattedDate" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}`, ""]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {selectedMetrics.map((metric) => (
                      <Bar
                        key={metric}
                        dataKey={metric}
                        name={formatMetricName(metric)}
                        fill={getMetricColor(metric)}
                      />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {auditHistory.length >= 2 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Improvements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedMetrics.map((metric) => {
                    const improvement = calculateImprovement(metric);
                    return (
                      <div key={metric} className="flex flex-col p-3 border rounded-md">
                        <div className="text-xs text-muted-foreground">
                          {formatMetricName(metric)}
                        </div>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(improvement)}
                          <span className={`text-lg font-medium ml-1 ${
                            improvement?.improved 
                              ? "text-green-600" 
                              : improvement?.diff === 0 
                                ? "text-gray-500" 
                                : "text-red-600"
                          }`}>
                            {improvement ? `${improvement.diff > 0 ? "+" : ""}${improvement.diff}` : "-"}
                          </span>
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({improvement ? `${improvement.percentage > 0 ? "+" : ""}${improvement.percentage}%` : "-"})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      {auditHistory.length > 0 && (
        <CardFooter className="flex-col items-start pt-0">
          <Separator className="mb-4" />
          <div className="w-full">
            <h4 className="text-sm font-medium mb-2">Recent Audits</h4>
            <div className="space-y-2">
              {auditHistory.slice(-3).reverse().map((audit) => (
                <div 
                  key={audit.id}
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
                    currentAuditId === audit.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleAuditSelect(audit.id)}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm">{audit.formattedDate}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">{audit.overallScore}/100</span>
                    <Button variant="ghost" size="sm" className="ml-2">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
