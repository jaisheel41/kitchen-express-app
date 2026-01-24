"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoPrint({ returnUrl }: { returnUrl: string }) {
  const router = useRouter();

  useEffect(() => {
    // Wait 300ms then trigger print dialog
    const printTimer = setTimeout(() => {
      window.print();
    }, 300);

    // After print dialog, wait 1500ms then redirect
    const redirectTimer = setTimeout(() => {
      router.push(returnUrl);
    }, 1500);

    return () => {
      clearTimeout(printTimer);
      clearTimeout(redirectTimer);
    };
  }, [router, returnUrl]);

  return null; // This component doesn't render anything
}

