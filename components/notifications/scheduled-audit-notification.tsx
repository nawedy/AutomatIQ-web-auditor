// src/components/notifications/scheduled-audit-notification.tsx
// Component for displaying scheduled audit notifications

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ScheduledAuditNotificationProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    data?: {
      auditId?: string;
      websiteId?: string;
      websiteName?: string;
      score?: number;
      status?: string;
    };
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduledAuditNotification({
  notification,
  onMarkAsRead,
  onDelete,
}: ScheduledAuditNotificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  // Handle view audit action
  const handleViewAudit = () => {
    if (notification.data?.auditId) {
      router.push(`/audits/${notification.data.auditId}`);
      
      // Mark as read when viewed
      if (!notification.read) {
        onMarkAsRead(notification.id);
      }
    } else {
      toast({
        title: "Error",
        description: "Audit details not available",
        variant: "destructive",
      });
    }
  };

  // Handle mark as read action
  const handleMarkAsRead = () => {
    setIsLoading(true);
    onMarkAsRead(notification.id);
    setIsLoading(false);
  };

  // Handle delete action
  const handleDelete = () => {
    setIsLoading(true);
    onDelete(notification.id);
    setIsLoading(false);
  };

  // Determine status badge
  const getStatusBadge = () => {
    if (!notification.data?.status) return null;
    
    switch (notification.data.status.toLowerCase()) {
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{notification.data.status}</Badge>
        );
    }
  };

  // Determine score badge
  const getScoreBadge = () => {
    if (notification.data?.score === undefined) return null;
    
    const score = notification.data.score;
    let variant = "default";
    
    if (score >= 90) variant = "success";
    else if (score >= 70) variant = "warning";
    else variant = "destructive";
    
    return (
      <Badge variant={variant as any} className="ml-2">
        Score: {score}
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "w-full transition-all duration-300",
      !notification.read ? "border-primary/50 bg-primary/5" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">{notification.title}</CardTitle>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getScoreBadge()}
          </div>
        </div>
        <CardDescription className="text-xs">
          {timeAgo} • {notification.data?.websiteName || "Unknown website"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm">{notification.message}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAsRead}
              disabled={isLoading}
            >
              Mark as read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </Button>
        </div>
        {notification.data?.auditId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAudit}
            className="flex items-center gap-1"
          >
            View Audit
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
