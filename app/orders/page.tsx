import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { OrdersClient } from "./orders-client";

async function OrdersData({
  search,
  startDate,
  endDate,
  status,
  paymentMethod,
  paymentStatus,
  page,
  limit,
}: {
  search: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  page: number;
  limit: number;
}) {
  noStore();
  const supabase = await createClient();

  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Build query
  let query = supabase
    .from("orders")
    .select("id, order_number, due_at, status, total, payment_method, payment_status", {
      count: "exact",
    });

  // Apply search
  if (search) {
    const searchNum = parseInt(search);
    if (!isNaN(searchNum)) {
      // Search by order number
      query = query.eq("order_number", searchNum);
    } else {
      // Search by customer phone
      query = query.ilike("customer_phone_snapshot", `%${search}%`);
    }
  }

  // Apply date range filter
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    query = query.gte("due_at", start.toISOString());
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    query = query.lte("due_at", end.toISOString());
  }

  // Apply status filter
  if (status) {
    query = query.eq("status", status);
  }

  // Apply payment method filter
  if (paymentMethod) {
    query = query.eq("payment_method", paymentMethod);
  }

  // Apply payment status filter
  if (paymentStatus) {
    query = query.eq("payment_status", paymentStatus);
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.order("due_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: orders, error, count } = await query;

  if (error) {
    console.error("Error fetching orders:", error);
    return (
      <OrdersClient
        initialData={{ orders: [], total: 0, page, limit }}
        initialSearch={search}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialStatus={status}
        initialPaymentMethod={paymentMethod}
        initialPaymentStatus={paymentStatus}
      />
    );
  }

  return (
    <OrdersClient
      initialData={{
        orders: orders || [],
        total: count || 0,
        page,
        limit,
      }}
      initialSearch={search}
      initialStartDate={startDate}
      initialEndDate={endDate}
      initialStatus={status}
      initialPaymentMethod={paymentMethod}
      initialPaymentStatus={paymentStatus}
    />
  );
}

function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

async function OrdersParams({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    start?: string;
    end?: string;
    status?: string;
    payment_method?: string;
    payment_status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.search || "";
  const startDate = params.start || "";
  const endDate = params.end || "";
  const status = params.status || "";
  const paymentMethod = params.payment_method || "";
  const paymentStatus = params.payment_status || "";
  const page = parseInt(params.page || "1", 10);
  const limit = 20; // Items per page

  return (
    <OrdersData
      search={search}
      startDate={startDate}
      endDate={endDate}
      status={status}
      paymentMethod={paymentMethod}
      paymentStatus={paymentStatus}
      page={page}
      limit={limit}
    />
  );
}

export default function OrdersHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    start?: string;
    end?: string;
    status?: string;
    payment_method?: string;
    payment_status?: string;
    page?: string;
  }>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Order History
          </h1>
          <p className="text-sm text-muted-foreground">View and manage all orders</p>
        </div>
        <Suspense fallback={<OrdersLoading />}>
          <OrdersParams searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
