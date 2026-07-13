"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export function DashboardShell({
  navItems,
  userName,
  userRoleLabel,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  userRoleLabel: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-e border-border bg-white px-4 py-6 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Heart className="h-[18px] w-[18px] fill-white" />
          </span>
          <span className="text-lg font-extrabold text-ink">WeddingBook</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary",
                  active && "bg-primary text-white hover:bg-primary"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-secondary"
        >
          <LogOut className="h-[18px] w-[18px]" />
          تسجيل خروج
        </button>
      </aside>

      {/* Mobile header + drawer */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Heart className="h-4 w-4 fill-white" />
          </span>
          <span className="font-extrabold text-ink">WeddingBook</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-20 border-b border-border bg-white p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary",
                    active && "bg-primary text-white hover:bg-primary"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-secondary"
            >
              <LogOut className="h-[18px] w-[18px]" />
              تسجيل خروج
            </button>
          </nav>
        </div>
      )}

      {/* Main */}
      <div className="flex w-full flex-col pt-16 md:ms-64 md:pt-0">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-4 md:px-8">
          <div>
            <p className="text-sm text-muted-foreground">{userRoleLabel}</p>
            <h1 className="text-lg font-extrabold text-ink">مرحبًا، {userName} 👋</h1>
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary-100 text-primary">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>
        <main className="flex-1 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
