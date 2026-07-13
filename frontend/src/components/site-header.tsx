"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/halls", label: "القاعات" },
  { href: "/services", label: "الخدمات" },
  { href: "/about", label: "حولنا" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboardHref = user?.role === "admin" ? "/admin" : user?.role === "hall_owner" ? "/owner" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-[68px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-semibold text-ink/70 transition-colors hover:text-primary",
                  active && "text-primary"
                )}
              >
                {link.label}
                {active && <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden gap-2 sm:inline-flex">
                <Link href={dashboardHref}>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary-100 text-xs text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {user.name.split(" ")[0]}
                </Link>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={logout} aria-label="تسجيل الخروج">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="hidden rounded-full sm:inline-flex">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button size="sm" asChild className="rounded-full">
                <Link href="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
