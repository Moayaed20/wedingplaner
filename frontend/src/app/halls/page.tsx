"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type { Hall } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: Building2 },
  { href: "/admin/halls", label: "القاعات", icon: Building2 },
];

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

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه القاعة؟")) return;
    try {
      await remove(id);
      refetch();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleEdit = (id: string) => {
    // مؤقتاً: عرض رسالة، ولكن يمكنك تفعيل التوجيه إلى صفحة التعديل
    alert(`سيتم توجيهك إلى صفحة تعديل القاعة (${id}) قريباً`);
    // router.push(`/admin/halls/edit/${id}`);
  };

  return (
    <DashboardShell
      navItems={navItems}
      userName="المشرف"
      userRoleLabel="إدارة القاعات"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">القاعات</h2>
        <Button
          className="rounded-full"
          onClick={() => router.push("/admin/halls/new")}
        >
          <Plus className="h-4 w-4" />
          إضافة قاعة
        </Button>
      </div>
      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(halls ?? []).map((hall) => (
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
                {/* زر التعديل - يعمل الآن */}
                <Button
                  size="sm"
                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => handleEdit(hall.id)}
                >
                  <Pencil className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                {/* زر الحذف - يعمل الآن */}
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
