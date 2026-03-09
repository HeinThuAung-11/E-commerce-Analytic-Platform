import { expect, test, type Page } from "@playwright/test";

const mockUser = {
  id: "user-1",
  name: "Demo Analyst",
  email: "analyst@example.com",
  role: "ANALYST",
} as const;

function revenueForRange(range: string): string {
  if (range === "7d") {
    return "7000";
  }
  if (range === "90d") {
    return "90000";
  }
  return "30000";
}

async function mockDashboardApi(page: Page): Promise<void> {
  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        message: "Refresh token is invalid",
        errorCode: "AUTH_004",
      }),
    });
  });

  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Login successful",
        data: {
          accessToken: "test-access-token",
          user: mockUser,
        },
      }),
    });
  });

  await page.route("**/analytics/overview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          totalRevenue: "120000",
          totalOrders: 420,
          completedOrders: 390,
          totalCustomers: 180,
          totalProductsSold: 2600,
        },
      }),
    });
  });

  await page.route("**/analytics/revenue?*", async (route) => {
    const url = new URL(route.request().url());
    const range = url.searchParams.get("range") ?? "30d";

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          range,
          revenue: revenueForRange(range),
          startDate: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route("**/analytics/top-products?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            productId: "product-1",
            productName: "Mechanical Keyboard Pro",
            category: "Electronics",
            totalQuantity: 120,
            totalRevenue: "15999.00",
          },
          {
            productId: "product-2",
            productName: "Noise Canceling Headphones",
            category: "Electronics",
            totalQuantity: 90,
            totalRevenue: "12999.00",
          },
        ],
      }),
    });
  });

  await page.route("**/analytics/order-status-mix?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { status: "COMPLETED", count: 28 },
          { status: "PENDING", count: 8 },
          { status: "CANCELLED", count: 3 },
        ],
      }),
    });
  });

  await page.route("**/analytics/order-trend?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { date: "2026-03-01T00:00:00.000Z", orderCount: 11 },
          { date: "2026-03-02T00:00:00.000Z", orderCount: 14 },
          { date: "2026-03-03T00:00:00.000Z", orderCount: 9 },
        ],
      }),
    });
  });

  await page.route("**/analytics/revenue-by-status?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { status: "COMPLETED", revenue: "24000", orders: 28 },
          { status: "PENDING", revenue: "6200", orders: 8 },
        ],
      }),
    });
  });

  await page.route("**/analytics/category-distribution?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { category: "Electronics", count: 120 },
          { category: "Home", count: 70 },
        ],
      }),
    });
  });

  await page.route("**/orders?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: "order-001",
              status: "COMPLETED",
              totalAmount: "499.99",
              createdAt: "2026-03-01T10:00:00.000Z",
              customer: {
                id: "customer-1",
                name: "Jane Doe",
                email: "jane@example.com",
              },
            },
          ],
          meta: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
          },
        },
      }),
    });
  });

  await page.route("**/products?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          items: [
            {
              id: "product-1",
              name: "Mechanical Keyboard Pro",
              sku: "SKU-1001",
              category: "Electronics",
              price: "129.99",
              stock: 50,
              createdAt: "2026-03-01T10:00:00.000Z",
              updatedAt: "2026-03-01T10:00:00.000Z",
            },
          ],
          meta: {
            page: 1,
            limit: 50,
            total: 1,
            totalPages: 1,
          },
        },
      }),
    });
  });
}

test("user can login and land on dashboard", async ({ page }) => {
  await mockDashboardApi(page);

  await page.goto("/login");
  await page.getByLabel("Email").fill("analyst@example.com");
  await page.getByLabel("Password").fill("StrongPass123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Analytics Dashboard" })).toBeVisible();
  await expect(page.getByText("Total Revenue")).toBeVisible();
});

test("changing range triggers range-based analytics reload", async ({ page }) => {
  const seenRanges = new Set<string>();

  await mockDashboardApi(page);

  await page.route("**/analytics/order-trend?*", async (route) => {
    const url = new URL(route.request().url());
    const range = url.searchParams.get("range") ?? "30d";
    seenRanges.add(range);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          { date: "2026-03-01T00:00:00.000Z", orderCount: 11 },
          { date: "2026-03-02T00:00:00.000Z", orderCount: 14 },
        ],
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("analyst@example.com");
  await page.getByLabel("Password").fill("StrongPass123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Analytics Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "7d" }).click();
  await expect.poll(() => seenRanges.has("7d")).toBeTruthy();
});
