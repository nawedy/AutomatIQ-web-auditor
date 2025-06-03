"use client";

import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function PlaceholderImage({
  width = 400,
  height = 300,
  className,
  text = "Placeholder",
  backgroundColor = "#334E68",
  textColor = "#D4AF37"
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border border-slate-steel/30 rounded-lg",
        className
      )}
      style={{
        width: width,
        height: height,
        backgroundColor: backgroundColor,
        color: textColor,
        minWidth: width,
        minHeight: height
      }}
    >
      <div className="text-center">
        <div className="text-sm font-medium">{text}</div>
        <div className="text-xs opacity-70 mt-1">{width} × {height}</div>
      </div>
    </div>
  );
} 