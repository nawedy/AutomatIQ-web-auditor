import type React from "react"
import { BarChart3, Download, FileText, Globe, Home, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Websites",
    url: "/websites",
    icon: Globe,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Export",
    url: "/export",
    icon: Download,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ className, ...props }: AppSidebarProps) {
  return (
    <div
      className={cn("flex flex-col space-y-6 w-64 border-r border-gold/20 bg-black/50 backdrop-blur-xl p-3", className)}
      {...props}
    >
      <Link href="/" className="flex items-center space-x-2 group">
        <div className="w-8 h-8 rounded-lg gold-shimmer flex items-center justify-center glow-gold">
          <span className="text-black font-bold text-sm">A</span>
        </div>
        <span className="font-bold text-gold text-lg group-hover:glow-gold transition-all duration-300">
          AutomatIQ.AI
        </span>
      </Link>
      <Separator className="bg-gold/20" />
      <div className="flex flex-col space-y-1">
        {items.map((item) => (
          <Link href={item.url} key={item.title}>
            <Button
              variant="ghost"
              className="justify-start text-silver hover:text-gold hover:bg-gold/10 transition-all duration-300 group"
            >
              <item.icon className="mr-2 h-4 w-4 group-hover:text-gold transition-colors" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
      <Separator className="bg-gold/20" />
      <div className="flex-1" />
      <div className="flex flex-col space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-silver hover:text-gold hover:bg-gold/10 transition-all duration-300"
            >
              <Avatar className="mr-2 h-5 w-5 border border-gold/30">
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback className="bg-gold text-black text-xs">AI</AvatarFallback>
              </Avatar>
              <span>My Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" forceMount className="glass-card border-gold/20">
            <DropdownMenuItem className="text-silver hover:text-gold">
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-silver hover:text-gold">
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-silver hover:text-gold">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gold/20" />
            <DropdownMenuItem className="text-silver hover:text-gold">
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </div>
  )
}
