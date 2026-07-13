"use client";

import Image from "next/image";
import { Camera, Cake, Sparkles, Music2, Car, MoreHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useApi } from "@/hooks/use-api";
import { ServicesAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/types";

const iconMap: Record<string, typeof Camera> = {
  photography: Camera,
  cake: Cake,
  decoration: Sparkles,
  music: Music2,
  cars: Car,
};

const toneMap: Record<string, string> = {
  photography: "bg-violet-100 text-violet-600",
  cake: "bg-rose-100 text-rose-600",
  decoration: "bg-emerald-100 text-emerald-600",
  music: "bg-sky-100 text-sky-600",
  cars: "bg-orange-100 text-orange-600",
};

export default function ServicesPage() {
  const { data: services, isLoading } = useApi<Service[]>(() => ServicesAPI.list(), []);

  return (
    <>
      <SiteHeader />
      <main className="container py-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-100 to-violet-100 px-8 py-16 text-center">
          <div className="mesh-blob mesh-blob-rose -top-10 -right-10 h-48 w-48 animate-blob" />
          <div className="mesh-blob mesh-blob-sky -bottom-10 -left-10 h-56 w-56 animate-blob" style={{ animationDelay: "2s" }} />
          <h1 className="relative z-10 text-3xl font-extrabold text-ink md:text-4xl">خدماتنا</h1>
          <p className="relative z-10 mx-auto mt-3 max-w-lg text-muted-foreground">
            كل ما تحتاجه لإنجاح مناسبتك في مكان واحد
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="col-span-full text-center text-sm text-muted-foreground">جارٍ التحميل...</p>}
          {(services ?? []).map((service) => {
            const Icon = iconMap[service.type] ?? MoreHorizontal;
            return (
              <div
                key={service.id}
                className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-soft"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
                  <Image
                    src={service.images?.[0] ?? "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", toneMap[service.type] ?? "bg-secondary text-ink")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.type}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <p className="mt-auto text-lg font-extrabold text-primary">{formatSYP(service.price)}</p>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
