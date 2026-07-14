"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type { Hall } from "@/lib/types";
import { adminNavItems } from "@/components/admin/admin-nav-items";

function HallsPage() {
  const router = useRouter();
  const {
    data: halls,
    isLoading,
    error,
    refetch,
  } = useApi<Hall[]>(() => HallsAPI.list({}), []);
  const { mutate: remove } = useMutation<{ deleted: boolean }, string>(
    (id, token) => HallsAPI.remove(id, token!),
  );

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const cities = useMemo(
    () => [...new Set((halls ?? []).map((h) => h.city).filter(Boolean))],
    [halls],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (halls ?? []).filter((h) => {
      const matchSearch =
        !q || h.name.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q);
      const matchCity = !cityFilter || h.city === cityFilter;
      return matchSearch && matchCity;
    });
  }, [halls, search, cityFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعة؟")) return;
    try {
      await remove(id);
      refetch();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <DashboardShell
      navItems={adminNavItems}
      userName="المشرف"
      userRoleLabel="إدارة القاعات"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-extrabold text-ink">القاعات</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو المدينة..."
              className="w-full rounded-full border border-border py-2 pr-9 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-full border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <Button className="rounded-full" onClick={() => router.push("/admin/halls/new")}>
          <Plus className="h-4 w-4" />
          إضافة قاعة
        </Button>
      </div>
      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {filtered.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">لا توجد نتائج.</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((hall) => (
          <div
            key={hall.id}
            className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={hall.images[0]}
                alt={hall.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-ink">{hall.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{hall.city}</p>
              <p className="mt-2 text-sm font-bold text-primary">
                {formatSYP(hall.price_per_person)} / الشخص
              </p>
              <div className="mt-3 flex gap-2">
                {/* زر التعديل - ينتقل إلى صفحة التعديل */}
                <Button
                  size="sm"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => router.push(`/admin/halls/edit/${hall.id}`)}
                >
                  <Pencil className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                {/* زر الحذف */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => handleDelete(hall.id)}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <HallsPage />
    </RequireAuth>
  );
}
