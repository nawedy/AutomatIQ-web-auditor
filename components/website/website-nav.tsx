// src/components/website/website-nav.tsx
// Navigation component for website details pages

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CalendarClock,
  FileText,
  Globe,
  Settings,
} from "lucide-react";

interface WebsiteNavProps {
  websiteId: string;
}

export function WebsiteNav({ websiteId }: WebsiteNavProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: "Overview",
      href: `/websites/${websiteId}`,
      icon: Globe,
    },
    {
      title: "Audits",
      href: `/websites/${websiteId}/audits`,
      icon: FileText,
    },
    {
      title: "Scheduled Audits",
      href: `/websites/${websiteId}/schedule`,
      icon: CalendarClock,
    },
    {
      title: "Analytics",
      href: `/websites/${websiteId}/analytics`,
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: `/websites/${websiteId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 overflow-auto pb-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary border-b-2 border-primary pb-1"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
