import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueRange } from "../analytics.service";
import { formatCurrency } from "../formatters";

type RevenueComparisonChartProps = {
  revenueByRange: Record<RevenueRange, string>;
  selectedRange: RevenueRange;
  isLoading: boolean;
};

export function RevenueComparisonChart({
  revenueByRange,
  selectedRange,
  isLoading,
}: RevenueComparisonChartProps) {
  const chartData = (Object.keys(revenueByRange) as RevenueRange[]).map((range) => ({
    range,
    value: Number(revenueByRange[range]),
  }));
  const currentRevenue = revenueByRange[selectedRange] ?? "0";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Revenue Comparison</h2>
      <p className="mt-1 text-sm text-slate-400">
        Selected range ({selectedRange}): {isLoading ? "..." : formatCurrency(currentRevenue)}
      </p>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="range" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => formatCurrency(String(value))}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#revenueColor)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
