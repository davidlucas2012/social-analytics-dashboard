"use client";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { AreaClosed, LinePath } from "@visx/shape";
import { TooltipWithBounds } from "@visx/tooltip";
import { Button } from "@/components/ui/button";
import { useEngagementLineChart } from "@/app/dashboard/useEngagementLineChart";
import type { DailyMetricPoint } from "@/features/metrics/useDailyMetrics";

export function EngagementLineChart({ days }: { days: DailyMetricPoint[] }) {
  const {
    containerRef,
    width,
    height,
    margin,
    chartMode,
    setLineMode,
    setAreaMode,
    data,
    xScale,
    yScale,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipStyles,
    tooltipPosition,
    formatTooltipDate,
    handlePointerMove,
    handlePointerOut,
    axisLeftTickProps,
    axisBottomTickProps,
    axisBottomTickFormat,
    overlayBounds,
  } = useEngagementLineChart(days);

  return (
    <div ref={containerRef} className="w-full overflow-x-auto space-y-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant={chartMode === "line" ? "default" : "outline"}
          size="sm"
          onClick={setLineMode}
        >
          Line
        </Button>
        <Button
          type="button"
          variant={chartMode === "area" ? "default" : "outline"}
          size="sm"
          onClick={setAreaMode}
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
          aria-label="Engagement chart for the last 30 days"
        >
          <g transform={`translate(${margin.left}, ${margin.top + 4})`}>
            <circle r={5} fill="currentColor" cx={0} cy={0} />
            <text x={10} y={4} fontSize={11} className="fill-current">
              Engagement (likes + comments + shares + saves)
            </text>
          </g>

          <AxisLeft
            scale={yScale}
            left={margin.left}
            tickLabelProps={axisLeftTickProps}
          />
          <AxisBottom
            scale={xScale}
            top={height - margin.bottom}
            numTicks={6}
            tickFormat={axisBottomTickFormat}
            tickLabelProps={axisBottomTickProps}
          />

          <text
            x={width / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize={11}
            className="fill-current"
          >
            Date (UTC)
          </text>
          <text
            x={-height / 2}
            y={14}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize={11}
            className="fill-current"
          >
            Engagement
          </text>

          {tooltipData ? (
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill="currentColor"
              pointerEvents="none"
            />
          ) : null}

          {chartMode === "area" ? (
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

          <rect
            x={overlayBounds.x}
            y={overlayBounds.y}
            width={overlayBounds.width}
            height={overlayBounds.height}
            fill="transparent"
            pointerEvents="all"
            onPointerMove={handlePointerMove}
            onPointerOut={handlePointerOut}
          />
        </svg>

        {tooltipData && tooltipPosition ? (
          <TooltipWithBounds
            left={tooltipPosition.left}
            top={tooltipPosition.top}
            style={tooltipStyles}
          >
            <div className="font-medium">
              {formatTooltipDate(tooltipData.date)}
            </div>
            <div className="opacity-90">
              Engagement: {tooltipData.engagement}
            </div>
          </TooltipWithBounds>
        ) : null}
      </div>
    </div>
  );
}
