"use client";

import React from "react";
import { useChart } from "./chart-context";

export interface SegmentBackgroundProps {
  fill?: string;
  className?: string;
}

export function SegmentBackground({
  fill = "var(--chart-segment-background)",
  className,
}: SegmentBackgroundProps) {
  const chart = useChart();
  const selection = (chart as any)?.selection;
  if (!selection?.active || selection.startIndex == null || selection.endIndex == null) {
    return null;
  }
  const xStart = (chart as any)?.xScale?.((chart as any)?.data?.[selection.startIndex]?.date) ?? 0;
  const xEnd = (chart as any)?.xScale?.((chart as any)?.data?.[selection.endIndex]?.date) ?? 0;
  const left = Math.min(xStart, xEnd);
  const width = Math.abs(xEnd - xStart);
  const height = (chart as any)?.innerHeight ?? (chart as any)?.height ?? 200;

  return (
    <rect
      x={left}
      y={0}
      width={width}
      height={height}
      fill={fill}
      className={className}
      pointerEvents="none"
    />
  );
}

export interface SegmentLineProps {
  stroke?: string;
  strokeWidth?: number;
  variant?: "dashed" | "solid" | "gradient";
  className?: string;
}

export function SegmentLineFrom({
  stroke = "var(--chart-segment-line)",
  strokeWidth = 1,
  variant = "dashed",
  className,
}: SegmentLineProps) {
  const chart = useChart();
  const selection = (chart as any)?.selection;
  if (!selection?.active || selection.startIndex == null) return null;
  const x = (chart as any)?.xScale?.((chart as any)?.data?.[selection.startIndex]?.date) ?? 0;
  const height = (chart as any)?.innerHeight ?? (chart as any)?.height ?? 200;

  return (
    <line
      x1={x}
      y1={0}
      x2={x}
      y2={height}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={variant === "dashed" ? "4 4" : undefined}
      className={className}
      pointerEvents="none"
    />
  );
}

export function SegmentLineTo({
  stroke = "var(--chart-segment-line)",
  strokeWidth = 1,
  variant = "dashed",
  className,
}: SegmentLineProps) {
  const chart = useChart();
  const selection = (chart as any)?.selection;
  if (!selection?.active || selection.endIndex == null) return null;
  const x = (chart as any)?.xScale?.((chart as any)?.data?.[selection.endIndex]?.date) ?? 0;
  const height = (chart as any)?.innerHeight ?? (chart as any)?.height ?? 200;

  return (
    <line
      x1={x}
      y1={0}
      x2={x}
      y2={height}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={variant === "dashed" ? "4 4" : undefined}
      className={className}
      pointerEvents="none"
    />
  );
}

export interface ChartBrushProps {
  initialSelection?: [number, number];
  onSelectionChange?: (selection: [number, number] | null) => void;
  className?: string;
}

export function ChartBrush({
  initialSelection: _initialSelection,
  onSelectionChange: _onSelectionChange,
  className: _className,
}: ChartBrushProps) {
  return null;
}

export interface ChartBrushLayoutProps {
  data?: any[];
  enabled?: boolean;
  height?: number;
  brushStrip?: (layout: any) => React.ReactNode;
  children?: ((layout: any) => React.ReactNode) | React.ReactNode;
}

export function ChartBrushLayout({
  data = [],
  enabled: _enabled = true,
  height = 72,
  brushStrip,
  children,
}: ChartBrushLayoutProps) {
  const [brushSelection, setBrushSelection] = React.useState<[number, number] | null>(null);

  const layout = {
    brushSelection,
    onBrushSelectionChange: setBrushSelection,
    xDomain: undefined,
    xDomainSlotCount: data?.length,
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="w-full">
        {typeof children === "function" ? children(layout) : children}
      </div>
      {brushStrip && (
        <div style={{ height }} className="w-full">
          {brushStrip(layout)}
        </div>
      )}
    </div>
  );
}
