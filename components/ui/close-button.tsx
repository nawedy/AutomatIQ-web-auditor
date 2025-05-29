"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CloseButtonProps {
  onClick: () => void
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "ghost" | "outline" | "default"
}

export function CloseButton({ onClick, className, size = "default", variant = "ghost" }: CloseButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      className={cn(
        "text-gray-400 hover:text-white transition-colors",
        size === "sm" && "h-6 w-6",
        size === "lg" && "h-10 w-10",
        className,
      )}
      aria-label="Close"
    >
      <X className={cn("h-4 w-4", size === "sm" && "h-3 w-3", size === "lg" && "h-5 w-5")} />
    </Button>
  )
}
