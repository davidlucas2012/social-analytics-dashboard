"use client";
import { scaleLinear, scaleUtc } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { AreaClosed, LinePath } from "@visx/shape";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
          />
        ) : (
          <LinePath
            data={data}
            x={(d) => xScale(d.date) ?? 0}
            y={(d) => yScale(d.engagement) ?? 0}
            stroke="currentColor"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
}
