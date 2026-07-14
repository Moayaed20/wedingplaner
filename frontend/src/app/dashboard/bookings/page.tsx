"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { BookingsAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import type { Booking } from "@/lib/types";

function MyBookingsPage() {
  const { data: bookings, isLoading, error, refetch } = useApi<Booking[]>((token) => BookingsAPI.mine(token), []);
  const { mutate: cancel } = useMutation<Booking, string>((id, token) => BookingsAPI.cancel(id, token!));

  const handleCancel = async (id: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
    await cancel(id);
    refetch();
  };

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">حجوزاتي</h1>
        {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-4">
          {(bookings ?? []).map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-white p-4 shadow-card sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:w-40">
                <Image
                  src={b.hall?.images?.[0] ?? "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"}
                  alt={b.hall?.name ?? "القاعة"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-ink">{b.hall?.name ?? "القاعة"}</h3>
                  <BookingStatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(b.event_date)} · {b.guest_count} ضيف
                </p>
                <p className="mt-1 font-bold text-primary">{formatSYP(b.total_price)}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" variant="outline" className="rounded-full" asChild>
                  <Link href={`/halls/${b.hall_id}`}>القاعة</Link>
                </Button>
                {b.status === "pending" && (
                  <Button size="sm" variant="destructive" className="rounded-full" onClick={() => handleCancel(b.id)}>
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!isLoading && (bookings ?? []).length === 0 && (
            <p className="rounded-[1.75rem] border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
              لا توجد حجوزات.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <MyBookingsPage />
    </RequireAuth>
  );
}
