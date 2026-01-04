import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MenuClient } from "./menu-client";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

async function MenuData() {
  noStore();
  const supabase = await createClient();
  
  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch categories ordered by sort_order
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch all menu items
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("name", { ascending: true });

  return (
    <MenuClient
      categories={categories || []}
      items={items || []}
    />
  );
}

function MenuLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

export default function MenuPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <div className="container mx-auto p-4 max-w-6xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Menu
          </h1>
          <p className="text-sm text-muted-foreground">Manage your menu items and categories</p>
        </div>
        <Suspense fallback={<MenuLoading />}>
          <MenuData />
        </Suspense>
      </div>
    </div>
  );
}
