// src/app/(dashboard)/websites/[id]/layout.tsx
// Layout for website details pages

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WebsiteNav } from "@/components/website/website-nav";
import { Separator } from "@/components/ui/separator";

interface WebsiteLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
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
  });
  
  return website;
}

export default async function WebsiteLayout({ children, params }: WebsiteLayoutProps) {
  const website = await getWebsite(params.id);
  
  if (!website) {
    notFound();
  }
  
  return (
    <div className="flex flex-col space-y-8">
      <div className="container py-4">
        <h1 className="text-2xl font-bold tracking-tight">{website.name}</h1>
        <p className="text-muted-foreground">{website.url}</p>
        
        <div className="mt-6">
          <WebsiteNav websiteId={website.id} />
          <Separator className="my-4" />
        </div>
      </div>
      
      <div className="flex-1">{children}</div>
    </div>
  );
}
