"use client";

import Link from "next/link";
import { LayoutGrid, Building2, CalendarCheck, Sparkles, Star, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { BookingsAPI, HallsAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import type { Booking, Hall } from "@/lib/types";

const navItems = [
  { href: "/owner", label: "لوحة التحكم", icon: LayoutGrid },
  { href: "/owner/halls", label: "قاعاتي", icon: Building2 },
  { href: "/owner/bookings", label: "الحجوزات", icon: CalendarCheck },
];

function OwnerDashboard() {
  const { user } = useAuth();
  const { data: halls, isLoading: hallsLoading, refetch: refetchHalls } = useApi<Hall[]>((token) => HallsAPI.mine(token), []);

  // Fetch bookings per hall and merge
  const { data: allBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useApi<Booking[]>(
    async (token) => {
      if (!halls?.length) return [];
      const lists = await Promise.all(halls.map((h) => BookingsAPI.forHall(h.id, undefined, token!)));
      return lists.flat();
    },
    [halls?.length]
  );

  const { mutate: confirm } = useMutation<Booking, string>((id, token) => BookingsAPI.confirm(id, token!));
  const { mutate: reject } = useMutation<Booking, string>((id, token) => BookingsAPI.reject(id, token!));

  const ownerBookings = allBookings ?? [];
  const revenueThisMonth = ownerBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.total_price, 0);
  const avgRating = halls?.length ? (halls.reduce((s, h) => s + h.rating, 0) / halls.length).toFixed(1) : "0.0";

  const handleConfirm = async (id: string) => {
    await confirm(id);
    refetchBookings();
  };
  const handleReject = async (id: string) => {
    await reject(id);
    refetchBookings();
  };

  return (
    <DashboardShell
      navItems={navItems}
      userName={user?.name ?? "صاحب القاعة"}
      userRoleLabel="إدارة قاعاتك وحجوزاتك"
    >
      <section>
        <h2 className="mb-4 text-lg font-extrabold text-ink">إحصائيات سريعة</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="قاعاتي" value={String(halls?.length ?? 0)} icon={Building2} tone="violet" />
          <StatCard label="إجمالي الحجوزات" value={String(ownerBookings.length)} icon={CalendarCheck} tone="sky" />
          <StatCard label="إيرادات هذا الشهر" value={formatSYP(revenueThisMonth)} icon={Sparkles} tone="mint" />
          <StatCard label="متوسط التقييم" value={avgRating} icon={Star} tone="peach" />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">الحجوزات الأخيرة</h2>
          <Link href="/owner/bookings" className="text-sm font-semibold text-primary hover:underline">
            عرض جميع الحجوزات
          </Link>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">العرض</th>
                <th className="px-5 py-3 font-semibold">تاريخ المناسبة</th>
                <th className="px-5 py-3 font-semibold">الضيوف</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 font-semibold">المبلغ</th>
                <th className="px-5 py-3 font-semibold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {ownerBookings.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-semibold text-ink">{b.hall?.name ?? "القاعة"}</p>
                      <p className="text-xs text-muted-foreground">{b.customer?.name ?? "عميل"}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink/80">{formatDate(b.event_date)}</td>
                  <td className="px-5 py-3 text-ink/80">{b.guest_count}</td>
                  <td className="px-5 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3 font-bold text-primary">{formatSYP(b.total_price)}</td>
                  <td className="px-5 py-3">
                    {b.status === "pending" ? (
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full" onClick={() => handleConfirm(b.id)}>
                          قبول
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleReject(b.id)}>
                          رفض
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!bookingsLoading && ownerBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    لا توجد حجوزات حاليًا.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function OwnerDashboardPage() {
  return (
    <RequireAuth role="hall_owner">
      <OwnerDashboard />
    </RequireAuth>
  );
}
