"use client";
import { scaleLinear, scaleUtc } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { AreaClosed, LinePath } from "@visx/shape";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { localPoint } from "@visx/event";
import { TooltipWithBounds, defaultStyles, useTooltip } from "@visx/tooltip";

type DailyMetric = {
  date: string; // YYYY-MM-DD
  engagement: number;
  reach: number;
};

export function EngagementLineChart({ days }: { days: DailyMetric[] }) {
  // Fixed internal dimensions, but scales visually with CSS (simple & reliable)
  const [mode, setMode] = useState<"line" | "area">("line");

  const width = 800;
  const height = 260;
  const margin = { top: 10, right: 16, bottom: 36, left: 44 };
  const toleranceValue = 20;

  const data = days.map((d) => ({
    date: new Date(d.date + "T00:00:00Z").getTime(), // unix ms
    engagement: d.engagement ?? 0,
  }));

  const xDomain: [number, number] = [data[0].date, data[data.length - 1].date];
  const maxY = Math.max(1, ...data.map((d) => d.engagement));

  const xScale = scaleUtc<number>({
    domain: xDomain,
    range: [margin.left, width - margin.right],
  });

  const yScale = scaleLinear<number>({
    domain: [0, maxY],
    range: [height - margin.bottom, margin.top],
    nice: true,
  });

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<{ date: number; engagement: number }>();

  const tooltipStyles = {
    ...defaultStyles,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
  } as const;

  function handlePointerMove(evt: React.PointerEvent<SVGRectElement>) {
    const p = localPoint(evt);
    if (!p) return;

    // Clamp x to the drawable chart area
    const xMin = margin.left;
    const xMax = width - margin.right;
    const x = Math.max(xMin, Math.min(xMax, p.x));

    // Convert pixel x -> domain time (ms) and snap to nearest datum
    const inv = xScale.invert(x);
    const target =
      inv instanceof Date ? inv.getTime() : new Date(inv).getTime();

    // data is ordered by date asc, use binary search for nearest index
    let lo = 0;
    let hi = data.length - 1;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (data[mid].date < target) lo = mid + 1;
      else hi = mid;
    }

    const i = lo;
    const prev = data[Math.max(0, i - 1)];
    const curr = data[i];
    const nearest =
      Math.abs(prev.date - target) <= Math.abs(curr.date - target)
        ? prev
        : curr;

    const left = xScale(nearest.date) ?? 0;
    const top = yScale(nearest.engagement) ?? 0;

    showTooltip({
      tooltipData: { date: nearest.date, engagement: nearest.engagement },
      tooltipLeft: left,
      tooltipTop: top,
    });
  }

  return (
    <div className="w-full overflow-x-auto space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant={mode === "line" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("line")}
        >
          Line
        </Button>
        <Button
          type="button"
          variant={mode === "area" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("area")}
        >
          Area
        </Button>
      </div>

      <div className="relative overflow-hidden">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label="Engagement line chart for the last 30 days"
        >
          <AxisLeft
            scale={yScale}
            left={margin.left}
            tickLabelProps={() => ({
              fontSize: 10,
              textAnchor: "end",
              dx: "-0.25em",
              dy: "0.25em",
            })}
          />
          <AxisBottom
            scale={xScale}
            top={height - margin.bottom}
            numTicks={6}
            tickFormat={(d) => {
              const ts = d instanceof Date ? d.getTime() : d.valueOf();
              return new Date(ts).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            }}
            tickLabelProps={() => ({
              fontSize: 10,
              textAnchor: "middle",
              dy: "0.5em",
            })}
          />

          {tooltipData ? (
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill="currentColor"
              pointerEvents="none"
            />
          ) : null}

          {mode === "area" ? (
            <AreaClosed
              data={data}
              x={(d) => xScale(d.date) ?? 0}
              y={(d) => yScale(d.engagement) ?? 0}
              yScale={yScale}
              stroke="currentColor"
              strokeWidth={2}
              fill="currentColor"
              fillOpacity={0.12}
              pointerEvents="none"
            />
          ) : (
            <LinePath
              data={data}
              x={(d) => xScale(d.date) ?? 0}
              y={(d) => yScale(d.engagement) ?? 0}
              stroke="currentColor"
              strokeWidth={2}
              pointerEvents="none"
            />
          )}

          {/* Pointer overlay (slightly larger to avoid edge dead-zones) */}
          <rect
            x={Math.max(0, margin.left - toleranceValue)}
            y={Math.max(0, margin.top - toleranceValue)}
            width={width - margin.left - margin.right + toleranceValue}
            height={height - margin.top - margin.bottom + toleranceValue}
            fill="transparent"
            pointerEvents="all"
            onPointerMove={handlePointerMove}
            onPointerOut={(e) => {
              // Only hide when leaving the SVG entirely, not when moving between elements
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                hideTooltip();
              }
            }}
          />
        </svg>

        {tooltipData
          ? (() => {
              // Keep tooltip inside the chart bounds to avoid layout/scroll overflow.
              const TOOLTIP_W = 190;
              const TOOLTIP_H = 64;

              const rawLeft = tooltipLeft ?? 0;
              const rawTop = tooltipTop ?? 0;

              // Center tooltip horizontally on the point, but clamp to [0, width - TOOLTIP_W]
              const left = Math.min(
                Math.max(0, rawLeft - TOOLTIP_W / 2),
                width - TOOLTIP_W
              );

              // Prefer tooltip above the point, but clamp to [0, height - TOOLTIP_H]
              const top = Math.min(
                Math.max(0, rawTop - TOOLTIP_H - 10),
                height - TOOLTIP_H
              );

              return (
                <TooltipWithBounds left={left} top={top} style={tooltipStyles}>
                  <div className="font-medium">
                    {new Date(tooltipData.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="opacity-90">
                    Engagement: {tooltipData.engagement}
                  </div>
                </TooltipWithBounds>
              );
            })()
          : null}
      </div>
    </div>
  );
}
