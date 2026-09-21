"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, checked, defaultChecked = false, onCheckedChange, disabled, className, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked);

    const controlled = checked !== undefined;
    const currentChecked = controlled ? checked : isChecked;

    const handleToggle = () => {
      if (disabled) return;
      const next = !currentChecked;
      if (!controlled) setIsChecked(next);
      onCheckedChange?.(next);
    };

    return (
      <button
        type="button"
        role="switch"
        id={id}
        ref={ref}
        aria-checked={currentChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          currentChecked ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
            currentChecked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Switch.displayName = "Switch";
