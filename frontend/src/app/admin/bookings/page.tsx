"use client";

import { CalendarCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { BookingsAPI, HallsAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import type { Booking, Hall } from "@/lib/types";
import { adminNavItems } from "@/components/admin/admin-nav-items";

function BookingsPage() {
  const { data: halls } = useApi<Hall[]>(() => HallsAPI.list({}), []);
  const {
    data: allBookings,
    isLoading,
    refetch,
  } = useApi<Booking[]>(
    async (token) => {
      if (!halls?.length) return [];
      const lists = await Promise.all(
        halls.map((h) => BookingsAPI.forHall(h.id, undefined, token!)),
      );
      return lists.flat();
    },
    [halls?.length],
  );

  const { mutate: confirm } = useMutation<Booking, string>((id, token) =>
    BookingsAPI.confirm(id, token!),
  );
  const { mutate: reject } = useMutation<Booking, string>((id, token) =>
    BookingsAPI.reject(id, token!),
  );

  const handleConfirm = async (id: string) => {
    await confirm(id);
    refetch();
  };
  const handleReject = async (id: string) => {
    await reject(id);
    refetch();
  };

  return (
    <DashboardShell
      navItems={adminNavItems}
      userName="المشرف"
      userRoleLabel="جميع الحجوزات"
    >
      <h2 className="mb-4 text-lg font-extrabold text-ink">الحجوزات</h2>
      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      )}
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">القاعة</th>
              <th className="px-5 py-3 font-semibold">العميل</th>
              <th className="px-5 py-3 font-semibold">التاريخ</th>
              <th className="px-5 py-3 font-semibold">الحالة</th>
              <th className="px-5 py-3 font-semibold">المبلغ</th>
              <th className="px-5 py-3 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {(allBookings ?? []).map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-5 py-3 font-semibold text-ink">
                  {b.hall?.name ?? "القاعة"}
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {b.customer?.name ?? "عميل"}
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {formatDate(b.event_date)}
                </td>
                <td className="px-5 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-5 py-3 font-bold text-primary">
                  {formatSYP(b.total_price)}
                </td>
                <td className="px-5 py-3">
                  {b.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleConfirm(b.id)}
                      >
                        قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleReject(b.id)}
                      >
                        رفض
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && (allBookings ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-muted-foreground"
                >
                  لا توجد حجوزات.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <BookingsPage />
    </RequireAuth>
  );
}
