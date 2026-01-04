"use client";

import { AppNav } from "@/components/app-nav";
import { ReactNode } from "react";

export function OrderDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <div className="container mx-auto p-4 max-w-7xl flex-1 pb-36 md:pb-4">
        {children}
      </div>
    </div>
  );
}

