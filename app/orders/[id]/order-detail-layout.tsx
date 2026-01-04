import { Suspense } from "react";
import { AppNav } from "@/components/app-nav";

export function OrderDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={null}>
        <AppNav />
      </Suspense>
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        {children}
      </div>
    </div>
  );
}
