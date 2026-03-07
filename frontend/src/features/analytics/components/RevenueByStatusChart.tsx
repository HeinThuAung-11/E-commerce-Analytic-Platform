import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { RevenueByStatusPoint } from "../analytics.service";
import { formatCurrency } from "../formatters";

type RevenueByStatusChartProps = {
  items: RevenueByStatusPoint[];
  isLoading: boolean;
};

export function RevenueByStatusChart({ items, isLoading }: RevenueByStatusChartProps) {
  const data = items.map((item) => ({
    status: item.status,
    revenue: Number(item.revenue),
    orders: item.orders,
  }));

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Revenue by Order Status</h2>
      <p className="mt-1 text-sm text-slate-400">Gross order value grouped by status.</p>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="status" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => formatCurrency(String(value))}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
              />
              <Bar dataKey="revenue" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
