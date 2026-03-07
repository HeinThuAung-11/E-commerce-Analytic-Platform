import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { CategoryDistributionPoint } from "../analytics.service";

type ProductCategoryChartProps = {
  items: CategoryDistributionPoint[];
  isLoading: boolean;
};

export function ProductCategoryChart({ items, isLoading }: ProductCategoryChartProps) {
  const data = items.slice(0, 6);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Product Category Mix</h2>
      <p className="mt-1 text-sm text-slate-400">SKU distribution by category across active products.</p>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
