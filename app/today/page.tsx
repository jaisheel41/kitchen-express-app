import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { TodayClient } from "./today-client";

async function TodayData() {
  noStore();
  const supabase = await createClient();
  
  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Get today's date range
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch orders where due_at is today OR created_at is today
  // Use separate queries and combine
  const { data: ordersByDue, error: error1 } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      order_type,
      due_at,
      created_at,
      status,
      customer_name_snapshot,
      customer_phone_snapshot,
      total,
      payment_method,
      payment_status
    `,
    )
    .gte("due_at", todayStart.toISOString())
    .lte("due_at", todayEnd.toISOString());

  const { data: ordersByCreated, error: error2 } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      order_type,
      due_at,
      created_at,
      status,
      customer_name_snapshot,
      customer_phone_snapshot,
      total,
      payment_method,
      payment_status
    `,
    )
    .gte("created_at", todayStart.toISOString())
    .lte("created_at", todayEnd.toISOString());

  const error = error1 || error2;
  
  // Combine and deduplicate by id
  const allOrders = [...(ordersByDue || []), ...(ordersByCreated || [])];
  const uniqueOrders = allOrders.filter(
    (order, index, self) => index === self.findIndex((o) => o.id === order.id),
  );
  
  const orders = uniqueOrders.sort(
    (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
  );

  if (error) {
    console.error("Error fetching orders:", error);
    return <TodayClient orders={[]} />;
  }

  // Fetch order items for preview (first 2 items per order)
  const orderIds = orders?.map((o) => o.id) || [];
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, item_name_snapshot, quantity")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  // Group items by order_id
  const itemsByOrderId: Record<string, Array<{ item_name_snapshot: string; quantity: number }>> = {};
  orderItems?.forEach((item) => {
    if (!itemsByOrderId[item.order_id]) {
      itemsByOrderId[item.order_id] = [];
    }
    itemsByOrderId[item.order_id].push({
      item_name_snapshot: item.item_name_snapshot,
      quantity: item.quantity,
    });
  });

  // Combine orders with their items
  const ordersWithItems = orders?.map((order) => ({
    ...order,
    items: itemsByOrderId[order.id] || [],
  })) || [];

  return <TodayClient orders={ordersWithItems} />;
}

function TodayLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

export default function TodayPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Today&apos;s Orders
          </h1>
          <p className="text-sm text-muted-foreground">Manage your daily operations</p>
        </div>
        <Suspense fallback={<TodayLoading />}>
          <TodayData />
        </Suspense>
      </div>
    </div>
  );
}
