"use client";

import { useState } from "react";
import { Sparkles, Pencil, Trash2, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { ServicesAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type { Service, CreateServiceBody } from "@/lib/types";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: Sparkles },
  { href: "/admin/services", label: "الخدمات", icon: Sparkles },
];

const SERVICE_TYPES = ["photography", "videography", "flowers", "makeup", "other"];

const emptyForm: CreateServiceBody = { type: "", name: "", price: 0, description: "" };

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-medium text-ink";

function ServicesPage() {
  const { data: services, isLoading, error, refetch } = useApi<Service[]>(() => ServicesAPI.list(), []);

  const { mutate: createMutate, isLoading: creating } = useMutation<Service, CreateServiceBody>(
    (body, t) => ServicesAPI.create(body, t!),
  );
  const { mutate: updateMutate, isLoading: updating } = useMutation<Service, { id: string; body: CreateServiceBody }>(
    ({ id, body }, t) => ServicesAPI.update(id, body, t!),
  );
  const { mutate: removeMutate } = useMutation<{ deleted: boolean }, string>(
    (id, t) => ServicesAPI.remove(id, t!),
  );

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateServiceBody>(emptyForm);

  const [editService, setEditService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState<CreateServiceBody>(emptyForm);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createMutate(createForm);
    if (result) { setShowCreate(false); setCreateForm(emptyForm); refetch(); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;
    const result = await updateMutate({ id: editService.id, body: editForm });
    if (result) { setEditService(null); refetch(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    await removeMutate(id);
    refetch();
  };

  const openEdit = (s: Service) => {
    setEditService(s);
    setEditForm({ type: s.type, name: s.name, price: s.price, description: s.description ?? "" });
  };

  const renderForm = (form: CreateServiceBody, setForm: React.Dispatch<React.SetStateAction<CreateServiceBody>>) => (
    <>
      <div>
        <label className={labelCls}>النوع</label>
        <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
          <option value="">اختر النوع</option>
          {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>الاسم</label>
        <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className={labelCls}>السعر (ل.س)</label>
        <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} required />
      </div>
      <div>
        <label className={labelCls}>الوصف</label>
        <input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
    </>
  );

  return (
    <DashboardShell navItems={navItems} userName="المشرف" userRoleLabel="إدارة الخدمات العالمية">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">الخدمات</h2>
        <Button className="rounded-full" onClick={() => { setShowCreate(true); setCreateForm(emptyForm); }}>
          <Plus className="ml-1 h-4 w-4" />إضافة خدمة
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && (services ?? []).length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">لا توجد خدمات.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-bold text-ink">إضافة خدمة جديدة</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              {renderForm(createForm, setCreateForm)}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowCreate(false)}>إلغاء</Button>
                <Button type="submit" className="rounded-full" disabled={creating}>{creating ? "جارٍ الحفظ..." : "حفظ"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 font-bold text-ink">تعديل الخدمة</h3>
            <form onSubmit={handleEdit} className="space-y-3">
              {renderForm(editForm, setEditForm)}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditService(null)}>إلغاء</Button>
                <Button type="submit" className="rounded-full" disabled={updating}>{updating ? "جارٍ الحفظ..." : "حفظ"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
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
