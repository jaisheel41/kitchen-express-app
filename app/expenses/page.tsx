import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { ExpensesClient } from "./expenses-client";

async function ExpensesData() {
  noStore();
  const supabase = await createClient();

  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all expenses
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return <ExpensesClient expenses={[]} />;
  }

  return <ExpensesClient expenses={expenses || []} />;
}

function ExpensesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}

import { AppNav } from "@/components/app-nav";

export default function ExpensesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">Track your daily expenses</p>
        </div>
        <Suspense fallback={<ExpensesLoading />}>
          <ExpensesData />
        </Suspense>
      </div>
    </div>
  );
}
