import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { OrderForm } from "./order-form";

async function OrderData() {
  noStore();
  const supabase = await createClient();
  
  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch active menu items with category info
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, name, price, category_id, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <OrderForm
      menuItems={menuItems || []}
      categories={categories || []}
    />
  );
}

function OrderLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

export default function NewOrderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <AppNav />
      </Suspense>
      <div className="container mx-auto p-4 max-w-4xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            New Order
          </h1>
          <p className="text-sm text-muted-foreground">Create a new order for your customer</p>
        </div>
        <Suspense fallback={<OrderLoading />}>
          <OrderData />
        </Suspense>
      </div>
    </div>
  );
}
