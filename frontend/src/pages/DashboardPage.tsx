import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useDashboardData } from "../features/analytics/use-dashboard-data";
import { DashboardHeader } from "../features/analytics/components/DashboardHeader";
import { DashboardFilters } from "../features/analytics/components/DashboardFilters";
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
import type { RevenueRange } from "../features/analytics/analytics.service";

function parseRange(value: string | null): RevenueRange {
  if (value === "7d" || value === "90d") {
    return value;
  }

  return "30d";
}

function getEmailDomain(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1] : "unknown";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const selectedRange = parseRange(searchParams.get("range"));
  const selectedStatus = searchParams.get("status") ?? "ALL";
  const selectedCategory = searchParams.get("category") ?? "ALL";
  const selectedCustomerDomain = searchParams.get("customer") ?? "ALL";
  const {
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
  } = useDashboardData(selectedRange);

  const statusOptions = ["ALL", ...new Set(orderStatusMix.map((item) => item.status))];
  const categoryOptions = ["ALL", ...new Set(products.map((item) => item.category))];
  const customerOptions = [
    "ALL",
    ...new Set(orders.map((item) => getEmailDomain(item.customer.email))),
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;
    const matchesCustomer =
      selectedCustomerDomain === "ALL" ||
      getEmailDomain(order.customer.email) === selectedCustomerDomain;
    return matchesStatus && matchesCustomer;
  });

  const filteredTopProducts = topProducts.filter(
    (item) => selectedCategory === "ALL" || item.category === selectedCategory,
  );
  const filteredProducts = products.filter(
    (item) => selectedCategory === "ALL" || item.category === selectedCategory,
  );
  const filteredCategoryDistribution = categoryDistribution.filter(
    (item) => selectedCategory === "ALL" || item.category === selectedCategory,
  );
  const filteredOrderStatusMix = orderStatusMix.filter(
    (item) => selectedStatus === "ALL" || item.status === selectedStatus,
  );
  const filteredRevenueByStatus = revenueByStatus.filter(
    (item) => selectedStatus === "ALL" || item.status === selectedStatus,
  );

  function updateQueryParam(key: string, value: string, fallback: string): void {
    const next = new URLSearchParams(searchParams);

    if (value === fallback) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setSearchParams(next, { replace: true });
  }

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  }

  function handleExportTopProducts(): void {
    const rows = filteredTopProducts.map((item) => [
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
    const rows = filteredOrders.map((order) => [
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
          onSelect={(range) => updateQueryParam("range", range, "30d")}
        />
        <DashboardFilters
          status={selectedStatus}
          category={selectedCategory}
          customer={selectedCustomerDomain}
          statusOptions={statusOptions}
          categoryOptions={categoryOptions}
          customerOptions={customerOptions}
          onStatusChange={(value) => updateQueryParam("status", value, "ALL")}
          onCategoryChange={(value) => updateQueryParam("category", value, "ALL")}
          onCustomerChange={(value) => updateQueryParam("customer", value, "ALL")}
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
            items={filteredTopProducts}
            isLoading={isLoading}
            onExport={handleExportTopProducts}
          />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <OrderStatusChart items={filteredOrderStatusMix} isLoading={isLoading} />
          <ProductCategoryChart items={filteredCategoryDistribution} isLoading={isLoading} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <OrderVolumeTrendChart
            points={orderTrend}
            selectedRange={selectedRange}
            isLoading={isLoading}
          />
          <RevenueByStatusChart items={filteredRevenueByStatus} isLoading={isLoading} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <RecentOrdersTable
            orders={filteredOrders}
            isLoading={isLoading}
            onExport={handleExportOrders}
          />
          <ProductsListPanel products={filteredProducts} isLoading={isLoading} />
        </div>
      </section>
    </main>
  );
}
