"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2, CalendarCheck, Star, CheckCircle2, XCircle,
  Clock, ChevronRight, X, User, Calendar, Users, Palette, Car, Music, UtensilsCrossed,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { BookingsAPI, HallsAPI, ReviewsAPI } from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import type { Booking, Hall, Review } from "@/lib/types";

const navItems = [
  { href: "/owner", label: "لوحة التحكم", icon: Building2 },
  { href: "/owner/halls", label: "قاعاتي", icon: Building2 },
];

// ─── Booking Detail Modal ────────────────────────────────────────────────────
function BookingDetailModal({
  booking,
  onClose,
  onConfirm,
  onReject,
  actionId,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  actionId: string | null;
}) {
  const busy = actionId === booking.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-extrabold text-ink text-lg">{booking.hall?.name ?? "تفاصيل الحجز"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">#{booking.id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer info */}
          <Section icon={User} title="معلومات العميل">
            <Row label="الاسم" value={booking.customer?.name ?? "—"} />
            <Row label="البريد" value={booking.customer?.email ?? "—"} />
            {booking.customer?.phone && <Row label="الهاتف" value={booking.customer.phone} />}
          </Section>

          {/* Event info */}
          <Section icon={Calendar} title="تفاصيل المناسبة">
            <Row label="التاريخ" value={formatDate(booking.event_date)} />
            <Row label="عدد الضيوف" value={`${booking.guest_count} ضيف`} />
            <Row label="إجمالي المبلغ" value={formatSYP(booking.total_price)} highlight />
          </Section>

          {/* Decoration */}
          {booking.selected_decorations && booking.selected_decorations.length > 0 && (
            <Section icon={Palette} title="الديكور المختار">
              {booking.selected_decorations.map((deco: any, i: number) => (
                <div key={i} className="flex gap-3 items-center mb-3 last:mb-0">
                  {deco.images?.[0] && (
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image src={deco.images[0]} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-ink">{deco.theme_name}</p>
                    {deco.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{deco.description}</p>
                    )}
                    <p className="text-sm font-bold text-primary mt-1">{formatSYP(deco.price)}</p>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Car */}
          {booking.selected_car && (
            <Section icon={Car} title="السيارة المختارة">
              <div className="flex gap-3 items-center">
                {(booking.selected_car as any).images?.[0] && (
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={(booking.selected_car as any).images[0]} alt="" fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ink">{(booking.selected_car as any).car_name}</p>
                  <p className="text-xs text-muted-foreground">{(booking.selected_car as any).model}</p>
                  {(booking.selected_car as any).description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{(booking.selected_car as any).description}</p>
                  )}
                  <p className="text-sm font-bold text-primary mt-1">{formatSYP((booking.selected_car as any).price)}</p>
                </div>
              </div>
            </Section>
          )}

          {/* Music */}
          {booking.selected_musics && booking.selected_musics.length > 0 && (
            <Section icon={Music} title="الموسيقى المختارة">
              {booking.selected_musics.map((music: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex gap-3 items-center">
                    {music.images?.[0] && (
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                        <Image src={music.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-ink">{music.name}</p>
                      <p className="text-xs text-muted-foreground">{music.type}</p>
                      {music.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{music.description}</p>
                      )}
                      <p className="text-sm font-bold text-primary mt-1">{formatSYP(music.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Catering */}
          {booking.selected_caterings?.length > 0 && (
            <Section icon={UtensilsCrossed} title="الضيافة المختارة">
              {booking.selected_caterings.map((c, i) => {
                // محاولة جلب صور الكاترينج من البيانات المملوءة
                const cateringImages = (c as any).images || [];
                return (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex gap-3 items-center">
                      {cateringImages[0] && (
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                          <Image src={cateringImages[0]} alt={c.name} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-ink">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatSYP(c.price_per_person)}/شخص × {booking.guest_count} ضيف
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">{formatSYP(c.total)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Section>
          )}

          {/* Actions */}
          {booking.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={busy}
                onClick={() => onConfirm(booking.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
                {busy ? "جارٍ..." : "قبول الحجز"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full gap-2 border-red-200 text-red-600 hover:bg-red-50"
                disabled={busy}
                onClick={() => onReject(booking.id)}
              >
                <XCircle className="h-4 w-4" />
                رفض الحجز
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <p className="font-bold text-sm text-ink">{title}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", highlight ? "text-primary" : "text-ink")}>{value}</span>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
function OwnerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"bookings" | "reviews">("bookings");
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: halls } = useApi<Hall[]>((token) => HallsAPI.mine(token), []);

  const { data: allBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useApi<Booking[]>(
    async (token) => {
      if (!halls?.length) return [];
      const lists = await Promise.all(halls.map((h) => BookingsAPI.forHall(h.id, undefined, token!)));
      const bookings = lists.flat();
      
      // إثراء البيانات إذا كانت IDs بس
      const enrichedBookings = await Promise.all(
        bookings.map(b => BookingsAPI.enrichBookingDetails(b, token))
      );
      
      return enrichedBookings;
    },
    [halls?.length]
  );

  const { data: allReviews, isLoading: reviewsLoading } = useApi<Review[]>(
    async () => {
      if (!halls?.length) return [];
      const lists = await Promise.all(halls.map((h) => ReviewsAPI.forHall(h.id)));
      return lists.flat();
    },
    [halls?.length]
  );

  const { mutate: confirm } = useMutation<Booking, string>((id, token) => BookingsAPI.confirm(id, token!));
  const { mutate: reject } = useMutation<Booking, string>((id, token) => BookingsAPI.reject(id, token!));

  const handleConfirm = async (id: string) => {
    setActionId(id);
    await confirm(id);
    await refetchBookings();
    setActionId(null);
    setSelectedBooking(null);
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    await reject(id);
    await refetchBookings();
    setActionId(null);
    setSelectedBooking(null);
  };

  const bookings = allBookings ?? [];
  const reviews = allReviews ?? [];
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const revenue = bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total_price, 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <DashboardShell navItems={navItems} userName={user?.name ?? "مالك القاعة"} userRoleLabel="إدارة قاعاتك وحجوزاتك">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: "بانتظار القبول", value: String(pending), icon: Clock, color: "text-amber-500 bg-amber-50" },
          { label: "حجوزات مؤكدة", value: String(confirmed), icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "إجمالي الإيرادات", value: formatSYP(revenue), icon: Building2, color: "text-primary bg-primary/10" },
          { label: "متوسط التقييم", value: avgRating, icon: Star, color: "text-amber-500 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4 shadow-card">
            <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-extrabold text-ink">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {(["bookings", "reviews"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "pb-3 px-1 text-sm font-semibold transition-colors border-b-2 -mb-px",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-ink"
            )}
          >
            {t === "bookings" ? `الحجوزات (${bookings.length})` : `التقييمات (${reviews.length})`}
          </button>
        ))}
      </div>

      {/* ── Bookings ── */}
      {tab === "bookings" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "pending", "confirmed", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                  filter === f ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {{ all: "الكل", pending: "قيد الانتظار", confirmed: "مؤكد", rejected: "مرفوض" }[f]}
              </button>
            ))}
          </div>

          {bookingsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary" />)}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-ink">{b.hall?.name ?? "القاعة"}</p>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    العميل: <span className="font-medium text-ink">{b.customer?.name ?? "—"}</span>
                    {" · "}
                    {formatDate(b.event_date)}
                    {" · "}
                    {b.guest_count} ضيف
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-base font-extrabold text-primary">{formatSYP(b.total_price)}</p>

                  {b.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-full gap-1 bg-emerald-600 hover:bg-emerald-700 text-xs"
                        disabled={actionId === b.id} onClick={() => handleConfirm(b.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> قبول
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                        disabled={actionId === b.id} onClick={() => handleReject(b.id)}>
                        <XCircle className="h-3.5 w-3.5" /> رفض
                      </Button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedBooking(b)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    التفاصيل <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {!bookingsLoading && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
                لا توجد حجوزات في هذه الفئة.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Reviews ── */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviewsLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-secondary" />)}
            </div>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-card">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(r as any).customer?.name?.charAt(0) ?? r.user?.name?.charAt(0) ?? "م"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-ink">{(r as any).customer?.name ?? r.user?.name ?? "عميل"}</p>
                    <p className="text-xs text-muted-foreground">{r.hall?.name ?? halls?.find((h) => h.id === r.hall_id)?.name ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Rating value={r.rating} />
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt ?? "")}</span>
                  </div>
                </div>
                {r.review_text && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.review_text}</p>
                )}
              </div>
            </div>
          ))}
          {!reviewsLoading && reviews.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-white py-16 text-center text-sm text-muted-foreground">
              لا توجد تقييمات بعد.
            </div>
          )}
        </div>
      )}

      {/* Booking detail modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          actionId={actionId}
        />
      )}
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
