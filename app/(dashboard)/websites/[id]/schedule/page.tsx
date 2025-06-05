// src/app/(dashboard)/websites/[id]/schedule/page.tsx
// Page for managing scheduled audits for a website

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScheduleForm } from "@/components/scheduled-audit/schedule-form";
import { ScheduleHistory } from "@/components/scheduled-audit/schedule-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, History } from "lucide-react";

interface SchedulePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: SchedulePageProps): Promise<Metadata> {
  const website = await getWebsite(params.id);
  
  if (!website) {
    return {
      title: "Website Not Found",
    };
  }
  
  return {
    title: `Schedule Audits - ${website.name}`,
    description: `Configure scheduled audits for ${website.name}`,
  };
}

async function getWebsite(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }
  
  const website = await prisma.website.findFirst({
    where: {
      id,
      user: {
        email: session.user.email,
      },
    },
    include: {
      auditSchedule: true,
    },
  });
  
  return website;
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const website = await getWebsite(params.id);
  
  if (!website) {
    notFound();
  }
  
  // Extract schedule data for the form
  const scheduleData = website.auditSchedule
    ? {
        enabled: website.auditSchedule.enabled,
        frequency: website.auditSchedule.frequency,
        dayOfWeek: website.auditSchedule.dayOfWeek,
        dayOfMonth: website.auditSchedule.dayOfMonth,
        categories: website.auditSchedule.categories,
      }
    : undefined;
  
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduled Audits</h1>
        <p className="text-muted-foreground">
          Configure and manage automated recurring audits for {website.name}
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="configure" className="w-full">
        <TabsList>
          <TabsTrigger value="configure" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Configure Schedule
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure" className="mt-6">
          <ScheduleForm 
            websiteId={website.id} 
            initialData={scheduleData} 
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <ScheduleHistory websiteId={website.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
