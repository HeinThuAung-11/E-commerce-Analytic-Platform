import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { OrderTrendPoint, RevenueRange } from "../analytics.service";

type OrderVolumeTrendChartProps = {
  points: OrderTrendPoint[];
  selectedRange: RevenueRange;
  isLoading: boolean;
};

function formatDayLabel(value: string): string {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function OrderVolumeTrendChart({
  points,
  selectedRange,
  isLoading,
}: OrderVolumeTrendChartProps) {
  const data = points.map((point) => ({
    day: point.date,
    count: point.orderCount,
  }));

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Order Trend ({selectedRange})</h2>
      <p className="mt-1 text-sm text-slate-400">Daily order volume across selected period.</p>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickFormatter={formatDayLabel} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                labelFormatter={(value: string) => formatDayLabel(value)}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
