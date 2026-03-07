import type { OrderItem } from "../analytics.service";
import { formatCurrency, formatDate } from "../formatters";

type RecentOrdersTableProps = {
  orders: OrderItem[];
  isLoading: boolean;
  onExport: () => void;
};

export function RecentOrdersTable({ orders, isLoading, onExport }: RecentOrdersTableProps) {
  const previewOrders = orders.slice(0, 8);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <button
          type="button"
          onClick={onExport}
          disabled={isLoading || orders.length === 0}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-2">Order</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`order-skeleton-${index}`} className="border-t border-slate-800">
                    <td className="py-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
                    </td>
                    <td className="py-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
                    </td>
                    <td className="py-2">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
                    </td>
                    <td className="py-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-800" />
                    </td>
                    <td className="py-2">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
                    </td>
                  </tr>
                ))
              : null}
            {previewOrders.map((order) => (
              <tr key={order.id} className="border-t border-slate-800">
                <td className="py-2">{order.id.slice(0, 8)}</td>
                <td className="py-2">{order.customer.name}</td>
                <td className="py-2">{order.status}</td>
                <td className="py-2">{formatCurrency(order.totalAmount)}</td>
                <td className="py-2">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && orders.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No orders available.</p>
        ) : null}
      </div>
    </article>
  );
}
