import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TopProduct } from "../analytics.service";
import { formatCurrency } from "../formatters";

type TopProductsChartProps = {
  items: TopProduct[];
  isLoading: boolean;
  onExport: () => void;
};

export function TopProductsChart({ items, isLoading, onExport }: TopProductsChartProps) {
  const formatShortName = (name: string): string =>
    name.length > 18 ? `${name.slice(0, 18)}...` : name;

  const chartData = items.slice(0, 6).map((item) => ({
    name: item.productName,
    revenue: Number(item.totalRevenue),
    quantity: item.totalQuantity,
  }));

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Top Products by Revenue</h2>
          <p className="mt-1 text-sm text-slate-400">Highest-grossing products in current dataset.</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={isLoading || items.length === 0}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      <div className="mt-6 h-64">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-800" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                tickFormatter={formatShortName}
                interval={0}
                height={50}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number, dataKey: string) => {
                  if (dataKey === "revenue") {
                    return formatCurrency(String(value));
                  }
                  return value;
                }}
                labelFormatter={(value: string) => `Product: ${value}`}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
              />
              <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
