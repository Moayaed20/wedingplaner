"use client";

import { Sparkles, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { ServicesAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type { Service } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: Sparkles },
  { href: "/admin/services", label: "الخدمات", icon: Sparkles },
];

function ServicesPage() {
  const { data: services, isLoading, error, refetch } = useApi<Service[]>(() => ServicesAPI.list(), []);
  const { mutate: remove } = useMutation<{ deleted: boolean }, string>((id, token) => ServicesAPI.remove(id, token!));

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    await remove(id);
    refetch();
  };

  return (
    <DashboardShell navItems={navItems} userName="المشرف" userRoleLabel="إدارة الخدمات العالمية">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">الخدمات</h2>
        <Button className="rounded-full" disabled>
          إضافة خدمة
        </Button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">النوع</th>
              <th className="px-5 py-3 font-semibold">الاسم</th>
              <th className="px-5 py-3 font-semibold">السعر</th>
              <th className="px-5 py-3 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-5 py-3 text-ink/80">{s.type}</td>
                <td className="px-5 py-3 font-semibold text-ink">{s.name}</td>
                <td className="px-5 py-3 font-bold text-primary">{formatSYP(s.price)}</td>
                <td className="px-5 py-3">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <ServicesPage />
    </RequireAuth>
  );
}
