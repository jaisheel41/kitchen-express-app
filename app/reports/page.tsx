import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { ReportsClient } from "./reports-client";

async function ReportsData({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  noStore();
  const supabase = await createClient();

  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Fetch completed orders in date range
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total, payment_method, due_at")
    .eq("status", "completed")
    .gte("due_at", start.toISOString())
    .lte("due_at", end.toISOString());

  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
  }

  // Fetch expenses in date range
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, category, expense_date")
    .gte("expense_date", startDate)
    .lte("expense_date", endDate);

  if (expensesError) {
    console.error("Error fetching expenses:", expensesError);
  }

  // Calculate totals
  const ordersList = orders || [];
  const expensesList = expenses || [];

  const salesTotal = ordersList.reduce((sum, order) => sum + (order.total || 0), 0);
  const ordersCount = ordersList.length;
  const avgOrderValue = ordersCount > 0 ? salesTotal / ordersCount : 0;

  const codTotal = ordersList
    .filter((order) => order.payment_method === "cod")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const upiTotal = ordersList
    .filter((order) => order.payment_method === "upi")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const expensesTotal = expensesList.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0,
  );

  const profitEstimate = salesTotal - expensesTotal;

  // Sales by day
  const salesByDayMap = new Map<string, { total: number; count: number }>();
  ordersList.forEach((order) => {
    const date = new Date(order.due_at).toISOString().split("T")[0];
    const existing = salesByDayMap.get(date) || { total: 0, count: 0 };
    salesByDayMap.set(date, {
      total: existing.total + (order.total || 0),
      count: existing.count + 1,
    });
  });

  const salesByDay = Array.from(salesByDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Expenses by category
  const expensesByCategoryMap = new Map<string, number>();
  expensesList.forEach((expense) => {
    const existing = expensesByCategoryMap.get(expense.category) || 0;
    expensesByCategoryMap.set(expense.category, existing + (expense.amount || 0));
  });

  const expensesByCategory = Array.from(expensesByCategoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <ReportsClient
      initialData={{
        salesTotal,
        ordersCount,
        avgOrderValue,
        codTotal,
        upiTotal,
        expensesTotal,
        profitEstimate,
        salesByDay,
        expensesByCategory,
      }}
      startDate={startDate}
      endDate={endDate}
    />
  );
}

function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

async function ReportsParams({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();

  // Determine date range
  let startDate: string;
  let endDate: string = new Date(now).toISOString().split("T")[0];

  if (params.start && params.end) {
    startDate = params.start;
    endDate = params.end;
  } else {
    // Default to today
    startDate = endDate;
  }

  return <ReportsData startDate={startDate} endDate={endDate} />;
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <AppNav />
      </Suspense>
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-sm text-muted-foreground">View sales and profit analytics</p>
        </div>
        <Suspense fallback={<ReportsLoading />}>
          <ReportsParams searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
