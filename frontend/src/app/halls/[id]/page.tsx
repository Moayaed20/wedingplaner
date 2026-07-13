"use client";

import Image from "next/image";
import type { ComponentType, FormEvent } from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Heart, Share2, MapPin, Users, Car, BedDouble, UtensilsCrossed, Snowflake, Phone, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApi, useMutation } from "@/hooks/use-api";
import {
  BookingsAPI,
  CateringsAPI,
  CarsAPI,
  DecorationsAPI,
  HallsAPI,
  MusicAPI,
  ReviewsAPI,
} from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import type { Booking, Catering, Car as CarType, Decoration, Hall, Music, Review } from "@/lib/types";

const amenityIcons = [
  { icon: Users, label: "سعة واسعة" },
  { icon: BedDouble, label: "غرفة عروس" },
  { icon: Car, label: "موقف سيارات" },
  { icon: UtensilsCrossed, label: "صالة طعام" },
  { icon: Snowflake, label: "تكييف" },
];

function GuestCapacity({ min, max }: { min: number; max: number }) {
  return <span className="text-xs font-semibold text-ink/80">{min}–{max} ضيف</span>;
}

export default function HallDetailPage() {
  const params = useParams<{ id: string }>();
  const hallId = params.id ?? "";
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuth();

  const { data: hall, isLoading: hallLoading } = useApi<Hall>(() => HallsAPI.get(hallId), [hallId]);
  const { data: caterings } = useApi<Catering[]>(() => CateringsAPI.list(hallId), [hallId]);
  const { data: decorations } = useApi<Decoration[]>(() => DecorationsAPI.list(hallId), [hallId]);
  const { data: cars } = useApi<CarType[]>(() => CarsAPI.list(hallId), [hallId]);
  const { data: musicOptions } = useApi<Music[]>(() => MusicAPI.list(hallId), [hallId]);
  const { data: reviews, refetch: refetchReviews } = useApi<Review[]>(() => ReviewsAPI.forHall(hallId), [hallId]);

  // Booking form state
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState<number | "">("");
  const [selectedCateringIds, setSelectedCateringIds] = useState<Record<string, number>>({});
  const [selectedDecorationId, setSelectedDecorationId] = useState<string>("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [selectedMusicId, setSelectedMusicId] = useState<string>("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { mutate: createBooking, isLoading: bookingLoading } = useMutation<Booking, void>(
    (_, t) =>
      BookingsAPI.create(
        {
          hall_id: hallId,
          event_date: eventDate,
          guest_count: Number(guestCount),
          selected_caterings: Object.entries(selectedCateringIds)
            .filter(([, q]) => q > 0)
            .map(([id, quantity]) => ({ catering_id: id, quantity })),
          selected_decoration_id: selectedDecorationId || undefined,
          selected_car_id: selectedCarId || undefined,
          selected_music_id: selectedMusicId || undefined,
        },
        t!
      )
  );

  const { mutate: createReview } = useMutation<Review, void>((_, t) =>
    ReviewsAPI.create({ hall_id: hallId, rating, review_text: reviewText }, t!)
  );

  if (hallLoading) return <DetailSkeleton />;
  if (!hall) return notFound();

  const handleBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push("/login");
    if (!eventDate || !guestCount) return;
    setBookingError(null);
    setBookingSuccess(false);
    try {
      await createBooking();
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "فشل إنشاء الحجز");
    }
  };

  const handleReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== "customer") return;
    await createReview();
    setReviewText("");
    setRating(5);
    refetchReviews();
  };

  const toggleCatering = (id: string) => {
    setSelectedCateringIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };

  const estimatedTotal =
    (hall.price_per_person * Number(guestCount || 0)) +
    (caterings ?? []).reduce((sum, c) => sum + c.price_per_person * Number(guestCount || 0) * (selectedCateringIds[c.id] ?? 0), 0) +
    ((decorations?.find((d) => d.id === selectedDecorationId)?.price) ?? 0) +
    ((cars?.find((c) => c.id === selectedCarId)?.price) ?? 0) +
    ((musicOptions?.find((m) => m.id === selectedMusicId)?.price) ?? 0);

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        {/* Gallery */}
        <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-[2rem] sm:grid-cols-[2fr_1fr] sm:h-[420px]">
          <div className="relative h-64 sm:h-full">
            <Image src={hall.images[0]} alt={hall.name} fill className="object-cover" priority />
            <div className="absolute left-4 top-4 flex gap-2">
              <IconPill icon={Heart} />
              <IconPill icon={Share2} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:h-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative h-28 sm:h-full">
                <Image
                  src={hall.images[i % hall.images.length] ?? hall.images[0]}
                  alt=""
                  fill
                  className="object-cover"
                />
                {i === 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sm font-semibold text-white">
                    عرض كل الصور
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{hall.name}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {hall.city}، {hall.address}
                </p>
              </div>
              <Rating value={hall.rating} className="text-base" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {amenityIcons.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary/50 py-4 text-center"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-semibold text-ink/80">{label}</span>
                </div>
              ))}
            </div>

            <Tabs defaultValue="about" className="mt-8">
              <TabsList className="rounded-full bg-secondary/70 p-1">
                <TabsTrigger value="about" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  نبذة
                </TabsTrigger>
                <TabsTrigger value="services" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  الخدمات
                </TabsTrigger>
                <TabsTrigger value="location" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  الموقع
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  التقييمات ({(reviews ?? []).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <p className="leading-8 text-ink/80">
                  {hall.name} في {hall.city} تتسع لـ{hall.min_capacity}–{hall.max_capacity} ضيف. السعر يبدأ من{" "}
                  {formatSYP(hall.price_per_person)} للشخص. للتواصل: {hall.contact || "غير متوفر"}.
                </p>
              </TabsContent>

              <TabsContent value="services">
                <h3 className="mb-4 font-bold text-ink">الخدمات والإضافات المتوفرة</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ServiceList title="الضيافة" items={caterings ?? []} render={(c) => `${c.menu_name} — ${formatSYP(c.price_per_person)} / الشخص`} />
                  <ServiceList title="الديكور" items={decorations ?? []} render={(d) => `${d.theme_name} — ${formatSYP(d.price)}`} />
                  <ServiceList title="السيارات" items={cars ?? []} render={(c) => `${c.car_name} (${c.model}) — ${formatSYP(c.price)}`} />
                  <ServiceList title="الموسيقى" items={musicOptions ?? []} render={(m) => `${m.name} — ${formatSYP(m.price)}`} />
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground">
                  خريطة الموقع — {hall.address}, {hall.city}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-5">
                  {isAuthenticated && user?.role === "customer" && (
                    <form onSubmit={handleReview} className="rounded-2xl border border-border bg-white p-4 shadow-card">
                      <h4 className="mb-3 font-bold text-ink">أضف تقييمك</h4>
                      <div className="mb-3 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRating(n)}
                            className={cn("rounded-full p-1 transition-colors", n <= rating ? "text-gold" : "text-border")}
                          >
                            <Star className="h-5 w-5 fill-current" />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="اكتب رأيك..."
                        className="h-24 w-full rounded-2xl border border-input bg-white p-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                      />
                      <Button className="mt-2 rounded-full" size="sm" type="submit">
                        نشر التقييم
                      </Button>
                    </form>
                  )}

                  {(reviews ?? []).map((r) => (
                    <div key={r.id} className="flex gap-3 border-b border-border pb-5 last:border-0">
                      <Avatar>
                        <AvatarFallback className="bg-primary-100 text-primary">{r.customer?.name?.charAt(0) ?? "م"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">{r.customer?.name ?? "عميل"}</p>
                          <Rating value={r.rating} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{r.review_text}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">{formatDate(r.createdAt ?? new Date().toISOString())}</p>
                      </div>
                    </div>
                  ))}
                  {(reviews ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking sidebar */}
          <aside className="h-fit space-y-4 rounded-[2rem] border border-border bg-white p-5 shadow-card lg:sticky lg:top-24">
            <h3 className="font-bold text-ink">احجز هذا المكان</h3>
            <form onSubmit={handleBooking} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">التاريخ</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm text-ink/80 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">عدد الضيوف</label>
                <input
                  type="number"
                  required
                  min={hall.min_capacity}
                  max={hall.max_capacity}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="عدد الضيوف"
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
                <p className="text-xs text-muted-foreground">
                  السعة: {hall.min_capacity}–{hall.max_capacity} ضيف
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">الضيافة (اختياري)</p>
                {(caterings ?? []).map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-2 text-sm hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={!!selectedCateringIds[c.id]}
                      onChange={() => toggleCatering(c.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">{c.menu_name}</span>
                    <span className="font-bold text-primary">{formatSYP(c.price_per_person)}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">الديكور (اختياري)</p>
                <select
                  value={selectedDecorationId}
                  onChange={(e) => setSelectedDecorationId(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">بدون ديكور</option>
                  {(decorations ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.theme_name} — {formatSYP(d.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">السيارة (اختياري)</p>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">بدون سيارة</option>
                  {(cars ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.car_name} — {formatSYP(c.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">الموسيقى (اختياري)</p>
                <select
                  value={selectedMusicId}
                  onChange={(e) => setSelectedMusicId(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">بدون موسيقى</option>
                  {(musicOptions ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {formatSYP(m.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-3 py-2.5 text-sm">
                <span className="text-muted-foreground">المبلغ المتوقع</span>
                <span className="font-bold text-primary">{formatSYP(estimatedTotal)}</span>
              </div>

              {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
              {bookingSuccess && <p className="text-sm font-semibold text-emerald-600">تم إرسال طلب الحجز بنجاح!</p>}

              <Button className="w-full rounded-full" size="lg" type="submit" disabled={bookingLoading}>
                {bookingLoading ? "جارٍ الحجز..." : isAuthenticated ? "احجز الآن" : "سجّل الدخول للحجز"}
              </Button>
            </form>

            {hall.contact && (
              <Button variant="outline" className="w-full gap-2 rounded-full">
                <Phone className="h-4 w-4" />
                تواصل مع المالك
              </Button>
            )}
            <p className="text-center text-xs text-muted-foreground">لا يتم دفع أي مبلغ الآن</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ServiceList<T extends { id: string }>({
  title,
  items,
  render,
}: {
  title: string;
  items: T[];
  render: (item: T) => string;
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
      <h4 className="mb-2 font-bold text-ink">{title}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            {render(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconPill({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink/70 backdrop-blur transition-colors hover:text-primary">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function DetailSkeleton() {
  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <div className="h-80 w-full animate-pulse rounded-[2rem] bg-secondary" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded-xl bg-secondary" />
            <div className="h-4 w-1/3 animate-pulse rounded-xl bg-secondary" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary" />
          </div>
          <div className="h-96 animate-pulse rounded-[2rem] bg-secondary" />
        </div>
      </main>
    </>
  );
}
