import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear, scaleUtc } from "@visx/scale";
import { localPoint } from "@visx/event";
import { defaultStyles, useTooltip } from "@visx/tooltip";
import { useDashboardUIStore } from "@/features/dashboard/useDashboardUIStore";
import type { DailyMetricPoint } from "@/features/metrics/useDailyMetrics";

const CHART_HEIGHT = 260;
const CHART_MARGIN = { top: 10, right: 16, bottom: 36, left: 55 } as const;
const POINTER_TOLERANCE = 20;
const TOOLTIP_SIZE = { width: 190, height: 64 };

const tooltipStyles = {
  ...defaultStyles,
  background: "rgba(0,0,0,0.85)",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  maxWidth: TOOLTIP_SIZE.width,
  width: "max-content",
} as const;

type NumericValue = number | { valueOf(): number };

export function useEngagementLineChart(days: DailyMetricPoint[]) {
  const [width, setWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { chartMode, setChartMode } = useDashboardUIStore();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const resize = () => setWidth(Math.max(360, node.clientWidth));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(
    () =>
      days.map((d) => ({
        date: new Date(d.date + "T00:00:00Z").getTime(),
        engagement: d.engagement ?? 0,
      })),
    [days]
  );

  const xDomain: [number, number] = useMemo(() => {
    if (data.length === 0) return [0, 0];
    return [data[0].date, data[data.length - 1].date];
  }, [data]);

  const maxY = useMemo(() => {
    const values = data.map((d) => d.engagement);
    const peak = values.length > 0 ? Math.max(...values) : 0;
    const padding = Math.max(5, Math.round(peak * 0.1));
    return peak + padding;
  }, [data]);

  const xScale = useMemo(
    () =>
      scaleUtc<number>({
        domain: xDomain,
        range: [CHART_MARGIN.left, width - CHART_MARGIN.right],
      }),
    [width, xDomain]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, maxY],
        range: [CHART_HEIGHT - CHART_MARGIN.bottom, CHART_MARGIN.top],
        nice: true,
      }),
    [maxY]
  );

  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<{ date: number; engagement: number }>();

  const handlePointerMove = useCallback(
    (evt: React.PointerEvent<SVGRectElement>) => {
      const p = localPoint(evt);
      if (!p) return;

      const xMin = CHART_MARGIN.left;
      const xMax = width - CHART_MARGIN.right;
      const x = Math.max(xMin, Math.min(xMax, p.x));

      const inv = xScale.invert(x);
      const target =
        inv instanceof Date ? inv.getTime() : new Date(inv).getTime();

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
    },
    [data, showTooltip, width, xScale, yScale]
  );

  const handlePointerOut = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        hideTooltip();
      }
    },
    [hideTooltip]
  );

  const axisLeftTickProps = useCallback(
    () => ({
      fontSize: 10,
      textAnchor: "end" as const,
      dx: "-0.25em",
      dy: "0.25em",
    }),
    []
  );

  const axisBottomTickProps = useCallback(
    () => ({
      fontSize: 10,
      textAnchor: "middle" as const,
      dy: "0.5em",
    }),
    []
  );

  const axisBottomTickFormat = useCallback((d: Date | NumericValue) => {
    const ts = d instanceof Date ? d.getTime() : d.valueOf();
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatTooltipDate = useCallback(
    (date: number) =>
      new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const setLineMode = useCallback(() => setChartMode("line"), [setChartMode]);
  const setAreaMode = useCallback(() => setChartMode("area"), [setChartMode]);

  const tooltipPosition = useMemo(() => {
    if (!tooltipData) return null;
    const rawLeft = tooltipLeft ?? 0;
    const rawTop = tooltipTop ?? 0;

    const left = Math.min(
      Math.max(0, rawLeft - TOOLTIP_SIZE.width / 2),
      width - TOOLTIP_SIZE.width
    );

    const top = Math.min(
      Math.max(0, rawTop - TOOLTIP_SIZE.height - 10),
      CHART_HEIGHT - TOOLTIP_SIZE.height
    );

    return { left, top };
  }, [tooltipData, tooltipLeft, tooltipTop, width]);

  const overlayBounds = useMemo(
    () => ({
      x: Math.max(0, CHART_MARGIN.left - POINTER_TOLERANCE),
      y: Math.max(0, CHART_MARGIN.top - POINTER_TOLERANCE),
      width: width - CHART_MARGIN.left - CHART_MARGIN.right + POINTER_TOLERANCE,
      height:
        CHART_HEIGHT -
        CHART_MARGIN.top -
        CHART_MARGIN.bottom +
        POINTER_TOLERANCE,
    }),
    [width]
  );

  return {
    containerRef,
    width,
    height: CHART_HEIGHT,
    margin: CHART_MARGIN,
    chartMode,
    setChartMode,
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
    setLineMode,
    setAreaMode,
    overlayBounds,
    pointerTolerance: POINTER_TOLERANCE,
  };
}
