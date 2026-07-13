"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, CalendarCheck, Star, Heart, User, Settings } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Rating } from "@/components/rating";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { BookingsAPI, HallsAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { MapPin } from "lucide-react";
import type { Booking, Hall } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: Home },
  { href: "/dashboard/bookings", label: "حجوزاتي", icon: CalendarCheck },
  { href: "/dashboard/reviews", label: "التقييمات", icon: Star },
  { href: "/dashboard/favorites", label: "المفضلة", icon: Heart },
  { href: "/dashboard/profile", label: "حسابي", icon: User },
];

function CustomerDashboard() {
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useApi<Booking[]>(
    (token) => BookingsAPI.mine(token),
    []
  );
  const { data: halls, isLoading: hallsLoading } = useApi<Hall[]>(() => HallsAPI.list({}), []);
  const { mutate: cancel } = useMutation<Booking, string>((id, token) => BookingsAPI.cancel(id, token!));

  const myBookings = bookings ?? [];
  const suggestions = halls?.slice(0, 4) ?? [];

  const handleCancel = async (id: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
    await cancel(id);
    refetchBookings();
  };

  return (
    <DashboardShell navItems={navItems} userName="عميل" userRoleLabel="استكشف وحجز قاعات وخدمات أحلامك">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">حجوزاتي القادمة</h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-primary hover:underline">
            عرض التفاصيل
          </Link>
        </div>

        {bookingsLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
        {bookingsError && <p className="text-sm text-red-500">{bookingsError}</p>}

        <div className="space-y-4">
          {myBookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-soft sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:w-40">
                <Image
                  src={b.hall?.images?.[0] ?? "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"}
                  alt={b.hall?.name ?? "القاعة"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink">{b.hall?.name ?? "القاعة"}</h3>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {b.hall?.city ?? "دمشق"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(b.event_date)} · {b.guest_count} ضيف
                  </p>
                </div>
                <div className="text-end">
                  <p className="mb-2 font-bold text-primary">{formatSYP(b.total_price)}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" asChild>
                      <Link href={`/halls/${b.hall_id}`}>عرض التفاصيل</Link>
                    </Button>
                    {b.status === "pending" && (
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => handleCancel(b.id)}>
                        إلغاء
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!bookingsLoading && myBookings.length === 0 && (
            <p className="rounded-[1.75rem] border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
              لا توجد حجوزات قادمة بعد.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-extrabold text-ink">اقتراحات لك</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {hallsLoading && <p className="text-sm text-muted-foreground sm:col-span-2">جارٍ التحميل...</p>}
          {suggestions.map((hall) => (
            <Link
              key={hall.id}
              href={`/halls/${hall.id}`}
              className="flex items-center gap-4 rounded-[1.75rem] border border-border bg-white p-3 shadow-card transition-shadow hover:shadow-soft"
            >
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                <Image src={hall.images[0]} alt={hall.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-bold text-ink">{hall.name}</p>
                <Rating value={hall.rating} className="my-1" />
                <p className="text-sm text-muted-foreground">
                  يبدأ من <span className="font-bold text-primary">{formatSYP(hall.price_per_person)}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

export default function CustomerDashboardPage() {
  return (
    <RequireAuth role="customer">
      <CustomerDashboard />
    </RequireAuth>
  );
}
