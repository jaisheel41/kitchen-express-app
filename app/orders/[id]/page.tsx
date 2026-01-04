import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { OrderDetailClient } from "./order-detail-client";
import { notFound } from "next/navigation";

async function OrderDetailData({ id }: { id: string }) {
  noStore();
  const supabase = await createClient();

  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch order
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch order items
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  // Fetch active menu items for editing
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, name, price")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <OrderDetailClient
      order={{ ...order, items: items || [] }}
      menuItems={menuItems || []}
    />
  );
}

function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

import { OrderDetailLayout } from "./order-detail-layout";

async function OrderDetailParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailData id={id} />;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <OrderDetailLayout>
      <Suspense fallback={<OrderDetailLoading />}>
        <OrderDetailParams params={params} />
      </Suspense>
    </OrderDetailLayout>
  );
}
