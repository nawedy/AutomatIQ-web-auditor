// src/app/(dashboard)/notifications/page.tsx
// Page for displaying user notifications

import { Metadata } from "next";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Notifications | AutomatIQ",
  description: "View and manage your notifications",
};

export default function NotificationsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          View and manage your notifications for scheduled audits and other events
        </p>
      </div>
      
      <Separator />
      
      <NotificationsList />
    </div>
  );
}
