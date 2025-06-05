// src/components/scheduled-audit/schedule-history.tsx
// Component for displaying scheduled audit history

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface AuditHistoryItem {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  categories: string[];
  overallScore?: number;
}

interface ScheduleHistoryProps {
  websiteId: string;
}

export function ScheduleHistory({ websiteId }: ScheduleHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const { toast } = useToast();

  // Fetch scheduled audit history
  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/websites/${websiteId}/schedule/history?page=${page}&pageSize=${pageSize}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch audit history");
        }

        const data = await response.json();
        setHistory(data.audits || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        toast({
          title: "Error",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [websiteId, page, toast]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  // View audit details
  const viewAudit = (auditId: string) => {
    router.push(`/audits/${auditId}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scheduled Audit History</CardTitle>
        <CardDescription>
          View history of scheduled audits for this website
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No scheduled audit history found</p>
            <p className="text-sm">
              Once scheduled audits run, they will appear here
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>A list of scheduled audits for this website</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatDate(audit.startedAt).split(",")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(audit.startedAt).split(",")[1]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(audit.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {audit.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {audit.overallScore !== undefined ? (
                      <span
                        className={`font-medium ${
                          audit.overallScore >= 90
                            ? "text-green-600"
                            : audit.overallScore >= 70
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {audit.overallScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewAudit(audit.id)}
                      disabled={audit.status.toLowerCase() !== "completed"}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber: number;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (page <= 3) {
                  pageNumber = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = page - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === page}
                      onClick={() => handlePageChange(pageNumber)}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
