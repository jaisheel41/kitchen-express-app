"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingCart, Calendar, Receipt, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/orders/new", label: "New Order", icon: ShoppingCart },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Calendar },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className="hidden md:flex items-center justify-between w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-accent/8 to-primary/10 backdrop-blur-md px-6 py-4 sticky top-0 z-50 shadow-lg">
        <Link href="/today" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            {/* Logo - Add your logo.png file to the public folder and uncomment below */}
             <Image src="/logo.jpg" alt="Kitchen Express" width={40} height={40} className="rounded-lg" />
            {/* Fallback icon if no logo */}
            {/* <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div> {/* <div className="p-2.5 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div> */}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Kitchen Express
            </span>
            
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-md"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-xl border-t-2 border-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="grid grid-cols-4 gap-0.5 p-1.5">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex flex-col items-center gap-1 h-auto py-2.5 px-1 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-b from-primary to-accent text-primary-foreground shadow-lg scale-105"
                      : "hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/10 active:scale-95"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-0.5 p-1.5 border-t border-border/50">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex items-center justify-center gap-1.5 h-auto py-2.5 rounded-xl transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                      : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 active:scale-95"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 h-auto py-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Logout</span>
          </Button>
        </div>
      </nav>
    </>
  );
}

