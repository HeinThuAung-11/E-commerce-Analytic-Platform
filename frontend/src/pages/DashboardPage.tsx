import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDashboardData } from "../features/analytics/use-dashboard-data";
import { DashboardHeader } from "../features/analytics/components/DashboardHeader";
import { MetricCard } from "../features/analytics/components/MetricCard";
import { RevenueRangeSelector } from "../features/analytics/components/RevenueRangeSelector";
import { RevenueComparisonChart } from "../features/analytics/components/RevenueComparisonChart";
import { TopProductsChart } from "../features/analytics/components/TopProductsChart";
import { OrderStatusChart } from "../features/analytics/components/OrderStatusChart";
import { ProductCategoryChart } from "../features/analytics/components/ProductCategoryChart";
import { OrderVolumeTrendChart } from "../features/analytics/components/OrderVolumeTrendChart";
import { RevenueByStatusChart } from "../features/analytics/components/RevenueByStatusChart";
import { RecentOrdersTable } from "../features/analytics/components/RecentOrdersTable";
import { ProductsListPanel } from "../features/analytics/components/ProductsListPanel";
import { formatCurrency, formatDateTime } from "../features/analytics/formatters";
import { useAuth } from "../features/auth/auth-context";
import { downloadCsv } from "../utils/csv";

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    selectedRange,
    setSelectedRange,
    revenueRanges,
    isLoading,
    errorMessage,
    overview,
    topProducts,
    orderStatusMix,
    orders,
    products,
    orderTrend,
    revenueByStatus,
    categoryDistribution,
    lastUpdatedAt,
    apiVersionMismatch,
    revenueByRange,
  } = useDashboardData();

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  }

  function handleExportTopProducts(): void {
    const rows = topProducts.map((item) => [
      item.productId,
      item.productName,
      item.category,
      String(item.totalQuantity),
      item.totalRevenue,
    ]);
    downloadCsv(
      "top-products.csv",
      ["productId", "productName", "category", "totalQuantity", "totalRevenue"],
      rows,
    );
  }

  function handleExportOrders(): void {
    const rows = orders.map((order) => [
      order.id,
      order.customer.name,
      order.customer.email,
      order.status,
      order.totalAmount,
      order.createdAt,
    ]);
    downloadCsv(
      "recent-orders.csv",
      ["orderId", "customerName", "customerEmail", "status", "totalAmount", "createdAt"],
      rows,
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto w-full max-w-[1600px] px-6 py-10">
        <DashboardHeader
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          lastUpdatedAt={lastUpdatedAt ? formatDateTime(lastUpdatedAt) : null}
        />
        <RevenueRangeSelector
          ranges={revenueRanges}
          selectedRange={selectedRange}
          onSelect={setSelectedRange}
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Revenue"
            value={overview ? formatCurrency(overview.totalRevenue) : "..."}
            isLoading={isLoading}
            hint="Sum of completed-order revenue across the selected analytics scope."
          />
          <MetricCard
            label="Total Orders"
            value={overview?.totalOrders ?? "..."}
            isLoading={isLoading}
            hint="Count of all non-deleted orders in the platform."
          />
          <MetricCard
            label="Customers"
            value={overview?.totalCustomers ?? "..."}
            isLoading={isLoading}
            hint="Unique active customers currently stored in the system."
          />
          <MetricCard
            label="Products Sold"
            value={overview?.totalProductsSold ?? "..."}
            isLoading={isLoading}
            hint="Total units sold from completed orders."
          />
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {apiVersionMismatch ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Backend API version mismatch detected. Rebuild/restart backend so new analytics routes are
            available (`/analytics/order-trend`, `/analytics/revenue-by-status`,
            `/analytics/category-distribution`).
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <RevenueComparisonChart
            revenueByRange={revenueByRange}
            selectedRange={selectedRange}
            isLoading={isLoading}
          />
          <TopProductsChart
            items={topProducts}
            isLoading={isLoading}
            onExport={handleExportTopProducts}
          />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <OrderStatusChart items={orderStatusMix} isLoading={isLoading} />
          <ProductCategoryChart items={categoryDistribution} isLoading={isLoading} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <OrderVolumeTrendChart
            points={orderTrend}
            selectedRange={selectedRange}
            isLoading={isLoading}
          />
          <RevenueByStatusChart items={revenueByStatus} isLoading={isLoading} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <RecentOrdersTable
            orders={orders}
            isLoading={isLoading}
            onExport={handleExportOrders}
          />
          <ProductsListPanel products={products} isLoading={isLoading} />
        </div>
      </section>
    </main>
  );
}
