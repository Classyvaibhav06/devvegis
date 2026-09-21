import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variantStyles = {
      default:
        "bg-emerald-600 text-white shadow hover:bg-emerald-700 active:scale-[0.98]",
      secondary:
        "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-xs hover:bg-slate-200 dark:hover:bg-white/20",
      outline:
        "border border-slate-200 dark:border-white/10 bg-transparent shadow-xs hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200",
      ghost:
        "hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300",
      link:
        "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
    }[variant];

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }[size];

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
