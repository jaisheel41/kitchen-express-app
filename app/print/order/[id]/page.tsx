import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { ReceiptPrint } from "./receipt-print";
import { AutoPrint } from "./auto-print";

async function ReceiptData({ id }: { id: string }) {
  noStore();
  const supabase = await createClient();

  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch order (including created_at for receipt)
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, created_at")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  // Fetch order items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Error fetching order items:", itemsError);
  }

  return (
    <ReceiptPrint
      order={order}
      items={items || []}
    />
  );
}

function ReceiptLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4" />
        <p className="text-muted-foreground">Loading receipt...</p>
      </div>
    </div>
  );
}

async function ReceiptParams({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string; return?: string }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const autoprint = search.autoprint === "1";
  const returnUrl = search.return || "/today";

  return (
    <>
      {autoprint && <AutoPrint returnUrl={returnUrl} />}
      <ReceiptData id={id} />
    </>
  );
}

export default async function PrintOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string; return?: string }>;
}) {
  return (
    <Suspense fallback={<ReceiptLoading />}>
      <ReceiptParams params={params} searchParams={searchParams} />
    </Suspense>
  );
}

