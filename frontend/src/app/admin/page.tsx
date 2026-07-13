"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Building2,
  Sparkles,
  CalendarCheck,
  BarChart3,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi } from "@/hooks/use-api";
import { BookingsAPI, HallsAPI, UsersAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import type { Booking, Hall, User } from "@/lib/types";
import { adminNavItems } from "@/components/admin/admin-nav-items";

function AdminDashboard() {
  const { token, user } = useAuth();
  const { data: users, isLoading: usersLoading } = useApi<User[]>(
    (token) => UsersAPI.list(token),
    [],
  );
  const { data: halls, isLoading: hallsLoading } = useApi<Hall[]>(
    () => HallsAPI.list({}),
    [],
  );
  const { data: bookings, isLoading: bookingsLoading } = useApi<Booking[]>(
    async (token) => {
      if (!halls?.length) return [];
      const lists = await Promise.all(
        halls.map((h) => BookingsAPI.forHall(h.id, undefined, token!)),
      );
      return lists.flat();
    },
    [halls?.length],
  );

  const totalRevenue = (bookings ?? [])
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => s + b.total_price, 0);
  const recentBookings = [...(bookings ?? [])]
    .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))
    .slice(0, 5);

  return (
    <DashboardShell
      navItems={adminNavItems}
      userName={user?.name ?? "المشرف"}
      userRoleLabel="نظرة عامة على المنصة"
    >
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={String(users?.length ?? 0)}
          icon={Users}
          tone="violet"
        />
        <StatCard
          label="إجمالي القاعات"
          value={String(halls?.length ?? 0)}
          icon={Building2}
          tone="sky"
        />
        <StatCard
          label="إجمالي الحجوزات"
          value={String(bookings?.length ?? 0)}
          icon={CalendarCheck}
          tone="mint"
        />
        <StatCard
          label="إجمالي الإيرادات"
          value={formatSYP(totalRevenue)}
          icon={BarChart3}
          tone="peach"
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-card">
          <h2 className="mb-4 font-bold text-ink">آخر الحجوزات</h2>
          <div className="space-y-4">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={
                      b.hall?.images?.[0] ??
                      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200&auto=format&fit=crop"
                    }
                    alt={b.hall?.name ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {b.hall?.name ?? "القاعة"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(b.event_date)}
                  </p>
                </div>
                <BookingStatusBadge status={b.status} />
                <p className="shrink-0 text-sm font-bold text-primary">
                  {formatSYP(b.total_price)}
                </p>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                لا توجد حجوزات بعد.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-card">
          <h2 className="mb-4 font-bold text-ink">روابط سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink
              href="/admin/users"
              label="المستخدمون"
              icon={Users}
              tone="bg-violet-100 text-violet-600"
            />
            <QuickLink
              href="/admin/halls"
              label="القاعات"
              icon={Building2}
              tone="bg-sky-100 text-sky-600"
            />
            <QuickLink
              href="/admin/services"
              label="الخدمات"
              icon={Sparkles}
              tone="bg-emerald-100 text-emerald-600"
            />
            <QuickLink
              href="/admin/bookings"
              label="الحجوزات"
              icon={CalendarCheck}
              tone="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-soft"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl",
          tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
    </Link>
  );
}

import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <RequireAuth role="admin">
      <AdminDashboard />
    </RequireAuth>
  );
}
