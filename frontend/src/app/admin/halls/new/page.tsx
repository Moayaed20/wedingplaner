"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/require-auth";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useApi, useMutation } from "@/hooks/use-api";
import { HallsAPI, UsersAPI, CateringsAPI, DecorationsAPI, CarsAPI, MusicAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import { adminNavItems } from "@/components/admin/admin-nav-items";
import type {
  CreateHallBody, Hall, User,
  Catering, CreateCateringBody,
  Decoration, CreateDecorationBody,
  Car, CreateCarBody,
  Music, CreateMusicBody,
} from "@/lib/types";

const TABS = ["الكاترينج", "الديكور", "السيارات", "الموسيقى"] as const;
type Tab = (typeof TABS)[number];

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-medium text-ink";

function AddonSection<T extends { id: string }, C>({
  items, loading, renderRow, renderForm, emptyForm,
  onCreate, onUpdate, onDelete, creating, updating,
}: {
  items: T[];
  loading: boolean;
  renderRow: (item: T) => React.ReactNode;
  renderForm: (form: C, setForm: React.Dispatch<React.SetStateAction<C>>) => React.ReactNode;
  emptyForm: C;
  onCreate: (form: C) => Promise<void>;
  onUpdate: (id: string, form: C) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  creating: boolean;
  updating: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<C>(emptyForm);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [editForm, setEditForm] = useState<C>(emptyForm);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" className="rounded-full" onClick={() => { setShowAdd(true); setAddForm(emptyForm); }}>
          <Plus className="ml-1 h-4 w-4" />إضافة
        </Button>
      </div>

      {loading && <p className="text-xs text-muted-foreground">جارٍ التحميل...</p>}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-right text-sm">
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border first:border-0">
                  <td className="px-4 py-2.5">{renderRow(item)}</td>
                  <td className="px-4 py-2.5 w-20">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" className="rounded-full h-7 w-7 p-0"
                        onClick={() => { setEditItem(item); setEditForm(item as unknown as C); }}>
                        <Pencil className="h-3 w-3 text-blue-500" />
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full h-7 w-7 p-0"
                        onClick={() => onDelete(item.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 font-bold text-ink">إضافة جديد</h4>
            <div className="space-y-3">{renderForm(addForm, setAddForm)}</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setShowAdd(false)}>إلغاء</Button>
              <Button className="rounded-full" disabled={creating}
                onClick={async () => { await onCreate(addForm); setShowAdd(false); }}>
                {creating ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 font-bold text-ink">تعديل</h4>
            <div className="space-y-3">{renderForm(editForm, setEditForm)}</div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setEditItem(null)}>إلغاء</Button>
              <Button className="rounded-full" disabled={updating}
                onClick={async () => { await onUpdate(editItem.id, editForm); setEditItem(null); }}>
                {updating ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewHallPage() {
  const router = useRouter();
  const [createdHall, setCreatedHall] = useState<Hall | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("الكاترينج");

  const [formData, setFormData] = useState<CreateHallBody>({
    name: "", address: "", city: "", postcode: "",
    price_per_person: 0, min_capacity: 0, max_capacity: 0, contact: "", images: [],
    owner_id: "",
  });

  const { data: users } = useApi<User[]>((t) => UsersAPI.list(t), []);
  const hallOwners = (users ?? []).filter((u) => u.role === "hall_owner");

  const { mutate: createHall, isLoading, error } = useMutation<Hall, CreateHallBody>(
    (body, token) => HallsAPI.create(body, token),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = { ...formData };
    if (!body.owner_id) delete body.owner_id;
    const result = await createHall(body);
    if (result) setCreatedHall(result as Hall);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  // Add-ons (only active after hall is created)
  const hallId = createdHall?.id ?? "";

  const { data: caterings, isLoading: loadingCat, refetch: refetchCat } =
    useApi<Catering[]>(() => hallId ? CateringsAPI.list(hallId) : Promise.resolve([]), [hallId]);
  const { data: decorations, isLoading: loadingDec, refetch: refetchDec } =
    useApi<Decoration[]>(() => hallId ? DecorationsAPI.list(hallId) : Promise.resolve([]), [hallId]);
  const { data: cars, isLoading: loadingCar, refetch: refetchCar } =
    useApi<Car[]>(() => hallId ? CarsAPI.list(hallId) : Promise.resolve([]), [hallId]);
  const { data: music, isLoading: loadingMus, refetch: refetchMus } =
    useApi<Music[]>(() => hallId ? MusicAPI.list(hallId) : Promise.resolve([]), [hallId]);

  const { mutate: createCat, isLoading: creatingCat } = useMutation<Catering, CreateCateringBody>(
    (b, t) => CateringsAPI.create(hallId, b, t));
  const { mutate: updateCat, isLoading: updatingCat } = useMutation<Catering, { id: string; body: CreateCateringBody }>(
    ({ id, body }, t) => CateringsAPI.update(id, body, t));
  const { mutate: deleteCat } = useMutation<{ deleted: boolean }, string>(
    (id, t) => CateringsAPI.remove(id, t));

  const { mutate: createDec, isLoading: creatingDec } = useMutation<Decoration, CreateDecorationBody>(
    (b, t) => DecorationsAPI.create(hallId, b, t));
  const { mutate: updateDec, isLoading: updatingDec } = useMutation<Decoration, { id: string; body: CreateDecorationBody }>(
    ({ id, body }, t) => DecorationsAPI.update(id, body, t));
  const { mutate: deleteDec } = useMutation<{ deleted: boolean }, string>(
    (id, t) => DecorationsAPI.remove(id, t));

  const { mutate: createCar, isLoading: creatingCar } = useMutation<Car, CreateCarBody>(
    (b, t) => CarsAPI.create(hallId, b, t));
  const { mutate: updateCar, isLoading: updatingCar } = useMutation<Car, { id: string; body: CreateCarBody }>(
    ({ id, body }, t) => CarsAPI.update(id, body, t));
  const { mutate: deleteCar } = useMutation<{ deleted: boolean }, string>(
    (id, t) => CarsAPI.remove(id, t));

  const { mutate: createMus, isLoading: creatingMus } = useMutation<Music, CreateMusicBody>(
    (b, t) => MusicAPI.create(hallId, b, t));
  const { mutate: updateMus, isLoading: updatingMus } = useMutation<Music, { id: string; body: CreateMusicBody }>(
    ({ id, body }, t) => MusicAPI.update(id, body, t));
  const { mutate: deleteMus } = useMutation<{ deleted: boolean }, string>(
    (id, t) => MusicAPI.remove(id, t));

  return (
    <DashboardShell navItems={adminNavItems} userName="المشرف" userRoleLabel="إضافة قاعة جديدة">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-4 w-4" />رجوع
        </Button>
        <h2 className="text-lg font-extrabold text-ink">إضافة قاعة جديدة</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</div>
      )}

      {!createdHall ? (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {/* Owner */}
          <div className="space-y-1.5">
            <Label htmlFor="owner_id">مالك القاعة (hall owner)</Label>
            <select id="owner_id" name="owner_id" className={inputCls} value={formData.owner_id ?? ""}
              onChange={handleChange} required>
              <option value="">اختر المالك</option>
              {hallOwners.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">اسم القاعة</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="مثال: قاعة روز" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required placeholder="مثال: دمشق" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">العنوان</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="العنوان بالتفصيل" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="price_per_person">السعر للشخص (ل.س)</Label>
              <Input id="price_per_person" name="price_per_person" type="number" value={formData.price_per_person} onChange={handleChange} required min={0} placeholder="25000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="min_capacity">الحد الأدنى للضيوف</Label>
              <Input id="min_capacity" name="min_capacity" type="number" value={formData.min_capacity} onChange={handleChange} required min={0} placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max_capacity">الحد الأقصى للضيوف</Label>
              <Input id="max_capacity" name="max_capacity" type="number" value={formData.max_capacity} onChange={handleChange} required min={0} placeholder="500" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contact">رقم التواصل</Label>
              <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} placeholder="+963 9XX XXX XXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postcode">الرمز البريدي</Label>
              <Input id="postcode" name="postcode" value={formData.postcode} onChange={handleChange} placeholder="مثال: 12210" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>الصور</Label>
            <ImageUploader
              images={formData.images ?? []}
              onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="rounded-full" disabled={isLoading}>
              {isLoading ? "جاري الإضافة..." : "إضافة القاعة والمتابعة"}
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => router.back()}>إلغاء</Button>
          </div>
        </form>
      ) : (
        <div className="max-w-2xl">
          <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✓ تم إنشاء القاعة "{createdHall.name}" بنجاح. أضف الإضافات الآن أو
            <button className="mr-1 underline" onClick={() => router.push("/admin/halls")}>انتقل للقائمة</button>
          </div>

          <h3 className="mb-4 text-base font-extrabold text-ink">إضافات القاعة</h3>

          <div className="mb-4 flex gap-2 border-b border-border">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-2 px-3 text-sm font-medium transition-colors ${
                  activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-ink"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "الكاترينج" && (
            <AddonSection<Catering, CreateCateringBody>
              items={caterings ?? []}
              loading={loadingCat}
              emptyForm={{ menu_name: "", price_per_person: 0, menu_type: "", description: "", images: [] }}
              renderRow={(c) => (
                <span className="flex items-center gap-3">
                  {c.images?.[0] && <img src={c.images[0]} alt={c.menu_name} className="h-10 w-14 rounded object-cover flex-shrink-0" />}
                  <span>
                    <span className="font-medium">{c.menu_name}</span>
                    <span className="mx-2 text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">{c.menu_type}</span>
                    <span className="mx-2 font-bold text-primary">{formatSYP(c.price_per_person)}/شخص</span>
                  </span>
                </span>
              )}
              renderForm={(form, setForm) => (
                <>
                  <div><label className={labelCls}>اسم القائمة</label>
                    <input className={inputCls} value={form.menu_name} onChange={(e) => setForm((f) => ({ ...f, menu_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>نوع القائمة</label>
                    <input className={inputCls} value={form.menu_type} onChange={(e) => setForm((f) => ({ ...f, menu_type: e.target.value }))} /></div>
                  <div><label className={labelCls}>السعر للشخص (ل.س)</label>
                    <input type="number" min={0} className={inputCls} value={form.price_per_person} onChange={(e) => setForm((f) => ({ ...f, price_per_person: Number(e.target.value) }))} /></div>
                  <div><label className={labelCls}>الوصف</label>
                    <input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                  <div><label className={labelCls}>الصور</label>
                    <ImageUploader images={form.images ?? []} onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))} max={5} /></div>
                </>
              )}
              onCreate={async (form) => { await createCat(form); refetchCat(); }}
              onUpdate={async (id, form) => { await updateCat({ id, body: form }); refetchCat(); }}
              onDelete={async (id) => { if (!confirm("حذف؟")) return; await deleteCat(id); refetchCat(); }}
              creating={creatingCat}
              updating={updatingCat}
            />
          )}

          {activeTab === "الديكور" && (
            <AddonSection<Decoration, CreateDecorationBody>
              items={decorations ?? []}
              loading={loadingDec}
              emptyForm={{ theme_name: "", price: 0, description: "", images: [] }}
              renderRow={(d) => (
                <span className="flex items-center gap-3">
                  {d.images?.[0] && <img src={d.images[0]} alt={d.theme_name} className="h-10 w-14 rounded object-cover flex-shrink-0" />}
                  <span>
                    <span className="font-medium">{d.theme_name}</span>
                    <span className="mx-2 font-bold text-primary">{formatSYP(d.price)}</span>
                  </span>
                </span>
              )}
              renderForm={(form, setForm) => (
                <>
                  <div><label className={labelCls}>اسم الثيم</label>
                    <input className={inputCls} value={form.theme_name} onChange={(e) => setForm((f) => ({ ...f, theme_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>السعر (ل.س)</label>
                    <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} /></div>
                  <div><label className={labelCls}>الوصف</label>
                    <input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                  <div><label className={labelCls}>الصور</label>
                    <ImageUploader images={form.images ?? []} onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))} max={5} /></div>
                </>
              )}
              onCreate={async (form) => { await createDec(form); refetchDec(); }}
              onUpdate={async (id, form) => { await updateDec({ id, body: form }); refetchDec(); }}
              onDelete={async (id) => { if (!confirm("حذف؟")) return; await deleteDec(id); refetchDec(); }}
              creating={creatingDec}
              updating={updatingDec}
            />
          )}

          {activeTab === "السيارات" && (
            <AddonSection<Car, CreateCarBody>
              items={cars ?? []}
              loading={loadingCar}
              emptyForm={{ car_name: "", model: "", price: 0, capacity: 1, description: "", images: [] }}
              renderRow={(c) => (
                <span className="flex items-center gap-3">
                  {c.images?.[0] && <img src={c.images[0]} alt={c.car_name} className="h-10 w-14 rounded object-cover flex-shrink-0" />}
                  <span>
                    <span className="font-medium">{c.car_name}</span>
                    <span className="mx-1 text-muted-foreground">{c.model}</span>
                    <span className="mx-2 font-bold text-primary">{formatSYP(c.price)}</span>
                    <span className="text-xs text-muted-foreground">({c.capacity} راكب)</span>
                  </span>
                </span>
              )}
              renderForm={(form, setForm) => (
                <>
                  <div><label className={labelCls}>اسم السيارة</label>
                    <input className={inputCls} value={form.car_name} onChange={(e) => setForm((f) => ({ ...f, car_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>الموديل</label>
                    <input className={inputCls} value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>السعر (ل.س)</label>
                      <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} /></div>
                    <div><label className={labelCls}>السعة</label>
                      <input type="number" min={1} className={inputCls} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} /></div>
                  </div>
                  <div><label className={labelCls}>الوصف</label>
                    <input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                  <div><label className={labelCls}>الصور</label>
                    <ImageUploader images={form.images ?? []} onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))} max={5} /></div>
                </>
              )}
              onCreate={async (form) => { await createCar(form); refetchCar(); }}
              onUpdate={async (id, form) => { await updateCar({ id, body: form }); refetchCar(); }}
              onDelete={async (id) => { if (!confirm("حذف؟")) return; await deleteCar(id); refetchCar(); }}
              creating={creatingCar}
              updating={updatingCar}
            />
          )}

          {activeTab === "الموسيقى" && (
            <AddonSection<Music, CreateMusicBody>
              items={music ?? []}
              loading={loadingMus}
              emptyForm={{ name: "", type: "", price: 0, description: "" }}
              renderRow={(m) => (
                <span>
                  <span className="font-medium">{m.name}</span>
                  <span className="mx-2 text-xs text-muted-foreground">({m.type})</span>
                  <span className="font-bold text-primary">{formatSYP(m.price)}</span>
                </span>
              )}
              renderForm={(form, setForm) => (
                <>
                  <div><label className={labelCls}>الاسم</label>
                    <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className={labelCls}>النوع</label>
                    <input className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} /></div>
                  <div><label className={labelCls}>السعر (ل.س)</label>
                    <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} /></div>
                  <div><label className={labelCls}>الوصف</label>
                    <input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                </>
              )}
              onCreate={async (form) => { await createMus(form); refetchMus(); }}
              onUpdate={async (id, form) => { await updateMus({ id, body: form }); refetchMus(); }}
              onDelete={async (id) => { if (!confirm("حذف؟")) return; await deleteMus(id); refetchMus(); }}
              creating={creatingMus}
              updating={updatingMus}
            />
          )}

          <div className="mt-6">
            <Button className="rounded-full" onClick={() => router.push("/admin/halls")}>
              انتهيت — الذهاب للقائمة
            </Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <NewHallPage />
    </RequireAuth>
  );
}
