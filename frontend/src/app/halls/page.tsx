"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HallCard } from "@/components/hall-card";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import type { Hall } from "@/lib/types";

function HallsListPage() {
  const { data: halls, isLoading, error } = useApi<Hall[]>(() => HallsAPI.list({}), []);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const cities = useMemo(
    () => [...new Set((halls ?? []).map((h) => h.city).filter(Boolean))],
    [halls],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (halls ?? []).filter((h) => {
      const matchSearch = !q || h.name.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q);
      const matchCity = !cityFilter || h.city === cityFilter;
      return matchSearch && matchCity;
    });
    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price_per_person - b.price_per_person);
    if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price_per_person - a.price_per_person);
    if (sortBy === "capacity") list = [...list].sort((a, b) => b.max_capacity - a.max_capacity);
    return list;
  }, [halls, search, cityFilter, sortBy]);

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">القاعات المتاحة</h1>

        {/* شريط البحث والفلترة */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المدينة..."
              className="w-full rounded-full border border-border bg-white py-2 pr-9 pl-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">الترتيب الافتراضي</option>
            <option value="price_asc">السعر: الأقل أولاً</option>
            <option value="price_desc">السعر: الأعلى أولاً</option>
            <option value="capacity">الأكبر سعةً</option>
          </select>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
        {!isLoading && filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <HallsListPage />
    </RequireAuth>
  );
}
