"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentType, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Cake, Sparkles, Music2, Car, MoreHorizontal, MapPin, CalendarDays, Users, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HallCard } from "@/components/hall-card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import type { Hall } from "@/lib/types";

const services = [
  { icon: Camera, label: "تصوير", tone: "bg-violet-100 text-violet-600" },
  { icon: Cake, label: "كيك", tone: "bg-rose-100 text-rose-600" },
  { icon: Sparkles, label: "ديكور", tone: "bg-emerald-100 text-emerald-600" },
  { icon: Music2, label: "موسيقى / DJ", tone: "bg-sky-100 text-sky-600" },
  { icon: Car, label: "سيارات", tone: "bg-orange-100 text-orange-600" },
  { icon: MoreHorizontal, label: "المزيد", tone: "bg-secondary text-ink" },
];

export default function HomePage() {
  const router = useRouter();
  const { data: halls, isLoading } = useApi<Hall[]>(() => HallsAPI.list({}), []);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (guests) params.set("minCapacity", guests);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/halls?${params.toString()}`);
  };

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mesh-blob mesh-blob-rose -left-20 top-20 h-96 w-96 opacity-50 animate-blob" />
          <div className="mesh-blob mesh-blob-sky -right-20 top-40 h-80 w-80 opacity-50 animate-blob" style={{ animationDelay: "3s" }} />

          <div className="relative z-10 flex min-h-[540px] flex-col items-center justify-center px-4 pb-28 pt-28 text-center md:min-h-[600px]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              احجز قاعة أحلامك بكل سهولة
            </span>
            <h1 className="max-w-2xl text-balance text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              مناسبتك تبدأ من <span className="text-primary">قاعة مثالية</span>
            </h1>
            <p className="mt-4 max-w-lg text-balance text-lg text-muted-foreground">
              اكتشف أجمل القاعات والخدمات واحجز موعدك المثالي في دقائق معدودة
            </p>
          </div>

          {/* Floating search card */}
          <div className="container relative z-20 -mt-20 pb-12">
            <form
              onSubmit={handleSearch}
              className="mx-auto grid max-w-4xl grid-cols-1 gap-4 rounded-[2rem] border border-border/70 bg-white/95 p-5 shadow-float backdrop-blur-sm sm:grid-cols-2 md:grid-cols-5 md:items-end"
            >
              <SearchField icon={MapPin} label="المدينة" placeholder="اختر المدينة" value={city} onChange={setCity} />
              <SearchField icon={CalendarDays} label="التاريخ" placeholder="اختر التاريخ" value="" onChange={() => {}} />
              <SearchField icon={Users} label="عدد الضيوف" placeholder="عدد الضيوف" value={guests} onChange={setGuests} type="number" />
              <SearchField icon={Wallet} label="الحد الأقصى" placeholder="السعر" value={maxPrice} onChange={setMaxPrice} type="number" />
              <Button size="lg" type="submit" className="w-full rounded-full md:h-11">
                بحث
              </Button>
            </form>
          </div>
        </section>

        {/* Featured halls */}
        <section className="container py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">الأكثر طلبًا</p>
              <h2 className="text-2xl font-extrabold text-ink md:text-3xl">قاعات مميزة</h2>
            </div>
            <Link href="/halls" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline md:flex">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">جارٍ تحميل القاعات...</p>}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(halls ?? []).slice(0, 4).map((hall) => (
              <HallCard key={hall.id} hall={hall} featured />
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="relative overflow-hidden bg-secondary/60 py-20">
          <div className="mesh-blob mesh-blob-mint -left-10 top-10 h-64 w-64 opacity-40 animate-blob" />
          <div className="mesh-blob mesh-blob-peach -right-10 bottom-10 h-72 w-72 opacity-40 animate-blob" style={{ animationDelay: "4s" }} />
          <div className="container relative z-10">
            <h2 className="mb-8 text-2xl font-extrabold text-ink md:text-3xl">خدماتنا</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              {services.map(({ icon: Icon, label, tone }) => (
                <Link
                  key={label}
                  href="/services"
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                >
                  <span className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", tone)}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SearchField({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="flex h-11 items-center gap-2 rounded-2xl border border-input bg-white px-3 text-sm shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-ink/80 outline-none placeholder:text-muted-foreground"
        />
      </span>
    </label>
  );
}

import { cn } from "@/lib/utils";
