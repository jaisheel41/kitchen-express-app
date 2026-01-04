import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

async function HomeRedirect() {
  noStore();
  const supabase = await createClient();
  
  // Use getClaims() which is faster and doesn't block
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // If user is authenticated, redirect to today page
  if (user) {
    redirect("/today");
    return null; // This line won't execute, but satisfies TypeScript
  }

  // If not authenticated, show login page
  redirect("/auth/login");
  return null; // This line won't execute, but satisfies TypeScript
}

export default function Home() {
  return (
    <Suspense>
      <HomeRedirect />
    </Suspense>
  );
}
