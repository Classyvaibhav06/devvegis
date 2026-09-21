"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex items-center justify-center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  asChild,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="inline-flex" {...props}>
      {children}
    </div>
  );
}

export function TooltipContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  sideOffset?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div
      role="tooltip"
      style={{ bottom: `calc(100% + ${sideOffset}px)` }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-md bg-slate-900 px-3 py-1.5 text-xs text-slate-50 shadow-md animate-in fade-in-0 zoom-in-95 pointer-events-none whitespace-nowrap dark:bg-slate-100 dark:text-slate-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
