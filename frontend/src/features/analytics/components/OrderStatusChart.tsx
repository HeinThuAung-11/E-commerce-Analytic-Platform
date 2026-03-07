import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { OrderStatusMixPoint } from "../analytics.service";

type OrderStatusChartProps = {
  items: OrderStatusMixPoint[];
  isLoading: boolean;
};

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

export function OrderStatusChart({ items, isLoading }: OrderStatusChartProps) {
  const data = items.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Order Status Mix</h2>
      <p className="mt-1 text-sm text-slate-400">Distribution of lifecycle states for recent orders.</p>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} label>
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  color: "#e2e8f0",
                }}
                labelStyle={{ color: "#f8fafc", fontWeight: 600 }}
                itemStyle={{ color: "#e2e8f0" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
