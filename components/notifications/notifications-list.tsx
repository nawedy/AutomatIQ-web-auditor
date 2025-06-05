// src/components/notifications/notifications-list.tsx
// Component for displaying a list of notifications

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScheduledAuditNotification } from "./scheduled-audit-notification";
import { Loader2, BellOff, Bell, CheckCircle } from "lucide-react";

interface Notification {
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
}

export function NotificationsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const router = useRouter();
  const { toast } = useToast();

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, read: true }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      // Refresh router to update notification count in UI
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
      
      // Refresh router to update notification count in UI
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      if (unreadIds.length === 0) return;
      
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      
      // Refresh router to update notification count in UI
      router.refresh();
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread") {
      return !notification.read;
    }
    return true;
  });

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "unread")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </div>
            Unread
            {unreadCount > 0 && ` (${unreadCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id}>
                  <ScheduledAuditNotification
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">All caught up!</h3>
              <p className="text-muted-foreground">
                You've read all your notifications
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id}>
                  <ScheduledAuditNotification
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
