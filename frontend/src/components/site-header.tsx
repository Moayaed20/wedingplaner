"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, CalendarCheck, Star, Heart, UserCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const publicNavLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/halls", label: "القاعات" },
  { href: "/services", label: "الخدمات" },
  { href: "/about", label: "حولنا" },
];

const customerNavLinks = [
  { href: "/halls", label: "القاعات" },
  { href: "/dashboard/bookings", label: "حجوزاتي", icon: CalendarCheck },
  { href: "/dashboard/reviews", label: "تقييماتي", icon: Star },
  { href: "/dashboard/favorites", label: "المفضلة", icon: Heart },
  { href: "/dashboard/profile", label: "الملف الشخصي", icon: UserCircle },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCustomer = user?.role === "customer";
  const navLinks = isCustomer ? customerNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-[68px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/") && link.href !== "/halls";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 py-2 text-sm font-semibold text-ink/70 transition-colors hover:text-primary",
                  active && "text-primary"
                )}
              >
                {"icon" in link && link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
                {active && <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-sm font-semibold text-ink sm:block">
                {user.name.split(" ")[0]}
              </span>
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
          {/* mobile menu toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2.5 text-sm font-semibold text-ink/70 hover:text-primary",
                pathname === link.href && "text-primary"
              )}
            >
              {"icon" in link && link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
