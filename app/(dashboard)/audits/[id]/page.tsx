// src/app/(dashboard)/audits/[id]/page.tsx
// Page for displaying audit details with export and comparative analysis

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportAuditButton } from "@/components/audit/export-audit-button";
import { ComparativeAnalysis } from "@/components/audit/comparative-analysis";
import { AuditOverview } from "@/components/audit/audit-overview";
import { AuditResults } from "@/components/audit/audit-results";
import { AuditPages } from "@/components/audit/audit-pages";
import { AuditRecommendations } from "@/components/audit/audit-recommendations";

interface AuditDetailsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AuditDetailsPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      title: "Audit Details | AutomatIQ",
    };
  }
  
  const audit = await prisma.audit.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      website: true,
    },
  });
  
  if (!audit) {
    return {
      title: "Audit Not Found | AutomatIQ",
    };
  }
  
  return {
    title: `${audit.website.name} Audit | AutomatIQ`,
    description: `Audit results for ${audit.website.url} conducted on ${audit.completedAt ? new Date(audit.completedAt).toLocaleDateString() : 'In Progress'}`,
  };
}

export default async function AuditDetailsPage({ params }: AuditDetailsPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return notFound();
  }
  
  const audit = await prisma.audit.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      website: true,
      auditSummary: true,
    },
  });
  
  if (!audit) {
    return notFound();
  }
  
  const isCompleted = audit.status === "COMPLETED";
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Results</h1>
          <p className="text-muted-foreground">
            {audit.website.name} • {new Date(audit.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {isCompleted && (
          <ExportAuditButton 
            auditId={audit.id} 
            websiteName={audit.website.name} 
          />
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <AuditOverview audit={audit} />
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          <AuditResults auditId={audit.id} />
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-6">
          <AuditPages auditId={audit.id} />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-6">
          <AuditRecommendations auditId={audit.id} />
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <ComparativeAnalysis 
            websiteId={audit.websiteId} 
            currentAuditId={audit.id} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
