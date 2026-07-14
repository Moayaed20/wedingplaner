"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/require-auth";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useApi, useMutation } from "@/hooks/use-api";
import {
  HallsAPI,
  CateringsAPI,
  DecorationsAPI,
  CarsAPI,
  MusicAPI,
  UsersAPI,
} from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type {
  CreateHallBody,
  Hall,
  User,
  Catering,
  CreateCateringBody,
  Decoration,
  CreateDecorationBody,
  Car,
  CreateCarBody,
  Music,
  CreateMusicBody,
} from "@/lib/types";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: Building2 },
  { href: "/admin/halls", label: "القاعات", icon: Building2 },
];

const TABS = ["الكاترينج", "الديكور", "السيارات", "الموسيقى"] as const;
type Tab = (typeof TABS)[number];

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-medium text-ink";

// ─── Generic add-on section ───────────────────────────────────────────────────
function AddonSection<T extends { id: string }, C, U extends Partial<C>>({
  items,
  loading,
  renderRow,
  renderForm,
  emptyForm,
  toForm,
  onCreate,
  onUpdate,
  onDelete,
  creating,
  updating,
}: {
  items: T[];
  loading: boolean;
  renderRow: (item: T) => React.ReactNode;
  renderForm: (
    form: C,
    setForm: React.Dispatch<React.SetStateAction<C>>,
    isEdit: boolean,
  ) => React.ReactNode;
  emptyForm: C;
  toForm: (item: T) => C;
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
        <Button
          size="sm"
          className="rounded-full"
          onClick={() => {
            setShowAdd(true);
            setAddForm(emptyForm);
          }}
        >
          <Plus className="ml-1 h-4 w-4" />
          إضافة
        </Button>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground">جارٍ التحميل...</p>
      )}

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <table className="w-full text-right text-sm">
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-border first:border-0"
                >
                  <td className="px-4 py-2.5">{renderRow(item)}</td>
                  <td className="px-4 py-2.5 w-20">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-7 w-7 p-0"
                        onClick={() => {
                          setEditItem(item);
                          setEditForm(toForm(item));
                        }}
                      >
                        <Pencil className="h-3 w-3 text-blue-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-7 w-7 p-0"
                        onClick={() => onDelete(item.id)}
                      >
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

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 font-bold text-ink">إضافة جديد</h4>
            <div className="space-y-3">
              {renderForm(addForm, setAddForm, false)}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowAdd(false)}
              >
                إلغاء
              </Button>
              <Button
                className="rounded-full"
                disabled={creating}
                onClick={async () => {
                  await onCreate(addForm);
                  setShowAdd(false);
                }}
              >
                {creating ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 font-bold text-ink">تعديل</h4>
            <div className="space-y-3">
              {renderForm(editForm, setEditForm, true)}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setEditItem(null)}
              >
                إلغاء
              </Button>
              <Button
                className="rounded-full"
                disabled={updating}
                onClick={async () => {
                  await onUpdate(editItem.id, editForm);
                  setEditItem(null);
                }}
              >
                {updating ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function EditHallPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const hallId = params.id;

  const {
    data: hall,
    isLoading: loadingHall,
    error: fetchError,
  } = useApi<Hall>(() => HallsAPI.get(hallId), [hallId]);
  const { data: users } = useApi<User[]>((token) => UsersAPI.list(token), []);
  const hallOwners = (users ?? []).filter((u) => u.role === "hall_owner");

  const [formData, setFormData] = useState<CreateHallBody>({
    name: "",
    address: "",
    city: "",
    postcode: "",
    price_per_person: 0,
    min_capacity: 0,
    max_capacity: 0,
    contact: "",
    images: [],
    owner_id: "",
  });

  useEffect(() => {
    if (hall) {
      setFormData({
        name: hall.name,
        address: hall.address,
        city: hall.city,
        postcode: hall.postcode || "",
        price_per_person: hall.price_per_person,
        min_capacity: hall.min_capacity,
        max_capacity: hall.max_capacity,
        contact: hall.contact || "",
        images: hall.images || [],
        owner_id:
          typeof hall.owner_id === "string"
            ? hall.owner_id
            : ((hall.owner_id as any)?._id ?? ""),
      });
    }
  }, [hall]);

  const {
    mutate: updateHall,
    isLoading: updating,
    error: updateError,
  } = useMutation<Hall, CreateHallBody>((body, t) =>
    HallsAPI.update(hallId, body, t),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await updateHall(formData);
    if (result) router.push("/admin/halls");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // ── Add-ons ──
  const [activeTab, setActiveTab] = useState<Tab>("الكاترينج");

  // 🔄 تم تعديل هذه الاستدعاءات لتمرير التوكن
  const {
    data: caterings,
    isLoading: loadingCat,
    refetch: refetchCat,
  } = useApi<Catering[]>((token) => CateringsAPI.list(hallId, token), [hallId]);
  const {
    data: decorations,
    isLoading: loadingDec,
    refetch: refetchDec,
  } = useApi<Decoration[]>(
    (token) => DecorationsAPI.list(hallId, token),
    [hallId],
  );
  const {
    data: cars,
    isLoading: loadingCar,
    refetch: refetchCar,
  } = useApi<Car[]>((token) => CarsAPI.list(hallId, token), [hallId]);
  const {
    data: music,
    isLoading: loadingMus,
    refetch: refetchMus,
  } = useApi<Music[]>((token) => MusicAPI.list(hallId, token), [hallId]);

  const { mutate: createCat, isLoading: creatingCat } = useMutation<
    Catering,
    CreateCateringBody
  >((b, t) => CateringsAPI.create(hallId, b, t));
  const { mutate: updateCat, isLoading: updatingCat } = useMutation<
    Catering,
    { id: string; body: CreateCateringBody }
  >(({ id, body }, t) => CateringsAPI.update(id, body, t));
  const { mutate: deleteCat } = useMutation<{ deleted: boolean }, string>(
    (id, t) => CateringsAPI.remove(id, t),
  );

  const { mutate: createDec, isLoading: creatingDec } = useMutation<
    Decoration,
    CreateDecorationBody
  >((b, t) => DecorationsAPI.create(hallId, b, t));
  const { mutate: updateDec, isLoading: updatingDec } = useMutation<
    Decoration,
    { id: string; body: CreateDecorationBody }
  >(({ id, body }, t) => DecorationsAPI.update(id, body, t));
  const { mutate: deleteDec } = useMutation<{ deleted: boolean }, string>(
    (id, t) => DecorationsAPI.remove(id, t),
  );

  const { mutate: createCar, isLoading: creatingCar } = useMutation<
    Car,
    CreateCarBody
  >((b, t) => CarsAPI.create(hallId, b, t));
  const { mutate: updateCar, isLoading: updatingCar } = useMutation<
    Car,
    { id: string; body: CreateCarBody }
  >(({ id, body }, t) => CarsAPI.update(id, body, t));
  const { mutate: deleteCar } = useMutation<{ deleted: boolean }, string>(
    (id, t) => CarsAPI.remove(id, t),
  );

  const { mutate: createMus, isLoading: creatingMus } = useMutation<
    Music,
    CreateMusicBody
  >((b, t) => MusicAPI.create(hallId, b, t));
  const { mutate: updateMus, isLoading: updatingMus } = useMutation<
    Music,
    { id: string; body: CreateMusicBody }
  >(({ id, body }, t) => MusicAPI.update(id, body, t));
  const { mutate: deleteMus } = useMutation<{ deleted: boolean }, string>(
    (id, t) => MusicAPI.remove(id, t),
  );

  if (loadingHall) {
    return (
      <DashboardShell
        navItems={navItems}
        userName="المشرف"
        userRoleLabel="جاري التحميل..."
      >
        <p className="text-sm text-muted-foreground">
          جارٍ تحميل بيانات القاعة...
        </p>
      </DashboardShell>
    );
  }

  if (fetchError || !hall) {
    return (
      <DashboardShell navItems={navItems} userName="المشرف" userRoleLabel="خطأ">
        <p className="text-sm text-red-500">
          حدث خطأ أثناء تحميل البيانات: {fetchError}
        </p>
        <Button
          className="mt-4 rounded-full"
          onClick={() => router.push("/admin/halls")}
        >
          العودة للقائمة
        </Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      navItems={navItems}
      userName="المشرف"
      userRoleLabel="تعديل القاعة"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowRight className="h-4 w-4" />
          رجوع
        </Button>
        <h2 className="text-lg font-extrabold text-ink">
          تعديل القاعة: {hall.name}
        </h2>
      </div>

      {(updateError || fetchError) && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {updateError || fetchError}
        </div>
      )}

      {/* ── Hall form ── */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {/* Owner */}
        <div className="space-y-1.5">
          <Label htmlFor="owner_id">مالك القاعة (hall owner)</Label>
          <select
            id="owner_id"
            name="owner_id"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            value={formData.owner_id ?? ""}
            onChange={handleChange}
          >
            <option value="">بدون مالك</option>
            {hallOwners.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">اسم القاعة</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="مثال: قاعة روز"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">المدينة</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="مثال: دمشق"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="address">العنوان</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="العنوان بالتفصيل"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="price_per_person">السعر للشخص (ل.س)</Label>
            <Input
              id="price_per_person"
              name="price_per_person"
              type="number"
              value={formData.price_per_person}
              onChange={handleChange}
              required
              min={0}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min_capacity">الحد الأدنى للضيوف</Label>
            <Input
              id="min_capacity"
              name="min_capacity"
              type="number"
              value={formData.min_capacity}
              onChange={handleChange}
              required
              min={0}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_capacity">الحد الأقصى للضيوف</Label>
            <Input
              id="max_capacity"
              name="max_capacity"
              type="number"
              value={formData.max_capacity}
              onChange={handleChange}
              required
              min={0}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact">رقم التواصل</Label>
            <Input
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="+963 9XX XXX XXX"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postcode">الرمز البريدي</Label>
            <Input
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              placeholder="مثال: 12210"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>الصور</Label>
          <ImageUploader
            images={formData.images ?? []}
            onChange={(imgs) =>
              setFormData((prev) => ({ ...prev, images: imgs }))
            }
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="rounded-full" disabled={updating}>
            {updating ? "جاري التحديث..." : "تحديث القاعة"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
        </div>
      </form>

      {/* ── Add-ons section ── */}
      <div className="mt-10 max-w-2xl">
        <h3 className="mb-4 text-base font-extrabold text-ink">
          إضافات القاعة
        </h3>

        <div className="mb-4 flex gap-2 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Caterings */}
        {activeTab === "الكاترينج" && (
          <AddonSection<
            Catering,
            CreateCateringBody,
            Partial<CreateCateringBody>
          >
            items={caterings ?? []}
            loading={loadingCat}
            emptyForm={{
              menu_name: "",
              price_per_person: 0,
              menu_type: "",
              description: "",
              images: [],
            }}
            toForm={(c) => ({
              menu_name: c.menu_name,
              price_per_person: c.price_per_person,
              menu_type: c.menu_type,
              description: c.description ?? "",
              images: c.images ?? [],
            })}
            renderRow={(c) => (
              <span className="flex items-center gap-3">
                {c.images?.[0] && (
                  <img
                    src={c.images[0]}
                    alt={c.menu_name}
                    className="h-10 w-14 rounded object-cover flex-shrink-0"
                  />
                )}
                <span>
                  <span className="font-medium">{c.menu_name}</span>
                  <span className="mx-2 text-muted-foreground">—</span>
                  <span className="text-xs text-muted-foreground">
                    {c.menu_type}
                  </span>
                  <span className="mx-2 font-bold text-primary">
                    {formatSYP(c.price_per_person)}/شخص
                  </span>
                </span>
              </span>
            )}
            renderForm={(form, setForm) => (
              <>
                <div>
                  <label className={labelCls}>اسم القائمة</label>
                  <input
                    className={inputCls}
                    value={form.menu_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, menu_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>نوع القائمة</label>
                  <input
                    className={inputCls}
                    value={form.menu_type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, menu_type: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>السعر للشخص (ل.س)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={form.price_per_person}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price_per_person: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الوصف</label>
                  <input
                    className={inputCls}
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الصور</label>
                  <ImageUploader
                    images={form.images ?? []}
                    onChange={(imgs) =>
                      setForm((f) => ({ ...f, images: imgs }))
                    }
                    max={5}
                  />
                </div>
              </>
            )}
            onCreate={async (form) => {
              await createCat(form);
              refetchCat();
            }}
            onUpdate={async (id, form) => {
              await updateCat({ id, body: form });
              refetchCat();
            }}
            onDelete={async (id) => {
              if (!confirm("حذف؟")) return;
              await deleteCat(id);
              refetchCat();
            }}
            creating={creatingCat}
            updating={updatingCat}
          />
        )}

        {/* Decorations */}
        {activeTab === "الديكور" && (
          <AddonSection<
            Decoration,
            CreateDecorationBody,
            Partial<CreateDecorationBody>
          >
            items={decorations ?? []}
            loading={loadingDec}
            emptyForm={{
              theme_name: "",
              price: 0,
              description: "",
              images: [],
            }}
            toForm={(d) => ({
              theme_name: d.theme_name,
              price: d.price,
              description: d.description ?? "",
              images: d.images ?? [],
            })}
            renderRow={(d) => (
              <span className="flex items-center gap-3">
                {d.images?.[0] && (
                  <img
                    src={d.images[0]}
                    alt={d.theme_name}
                    className="h-10 w-14 rounded object-cover flex-shrink-0"
                  />
                )}
                <span>
                  <span className="font-medium">{d.theme_name}</span>
                  <span className="mx-2 font-bold text-primary">
                    {formatSYP(d.price)}
                  </span>
                </span>
              </span>
            )}
            renderForm={(form, setForm) => (
              <>
                <div>
                  <label className={labelCls}>اسم الثيم</label>
                  <input
                    className={inputCls}
                    value={form.theme_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, theme_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>السعر (ل.س)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الوصف</label>
                  <input
                    className={inputCls}
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الصور</label>
                  <ImageUploader
                    images={form.images ?? []}
                    onChange={(imgs) =>
                      setForm((f) => ({ ...f, images: imgs }))
                    }
                    max={5}
                  />
                </div>
              </>
            )}
            onCreate={async (form) => {
              await createDec(form);
              refetchDec();
            }}
            onUpdate={async (id, form) => {
              await updateDec({ id, body: form });
              refetchDec();
            }}
            onDelete={async (id) => {
              if (!confirm("حذف؟")) return;
              await deleteDec(id);
              refetchDec();
            }}
            creating={creatingDec}
            updating={updatingDec}
          />
        )}

        {/* Cars */}
        {activeTab === "السيارات" && (
          <AddonSection<Car, CreateCarBody, Partial<CreateCarBody>>
            items={cars ?? []}
            loading={loadingCar}
            emptyForm={{
              car_name: "",
              model: "",
              price: 0,
              capacity: 1,
              description: "",
              images: [],
            }}
            toForm={(c) => ({
              car_name: c.car_name,
              model: c.model,
              price: c.price,
              capacity: c.capacity,
              description: c.description ?? "",
              images: c.images ?? [],
            })}
            renderRow={(c) => (
              <span className="flex items-center gap-3">
                {c.images?.[0] && (
                  <img
                    src={c.images[0]}
                    alt={c.car_name}
                    className="h-10 w-14 rounded object-cover flex-shrink-0"
                  />
                )}
                <span>
                  <span className="font-medium">{c.car_name}</span>
                  <span className="mx-1 text-muted-foreground">{c.model}</span>
                  <span className="mx-2 font-bold text-primary">
                    {formatSYP(c.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({c.capacity} راكب)
                  </span>
                </span>
              </span>
            )}
            renderForm={(form, setForm) => (
              <>
                <div>
                  <label className={labelCls}>اسم السيارة</label>
                  <input
                    className={inputCls}
                    value={form.car_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, car_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الموديل</label>
                  <input
                    className={inputCls}
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, model: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>السعر (ل.س)</label>
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>السعة</label>
                    <input
                      type="number"
                      min={1}
                      className={inputCls}
                      value={form.capacity}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          capacity: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>الوصف</label>
                  <input
                    className={inputCls}
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الصور</label>
                  <ImageUploader
                    images={form.images ?? []}
                    onChange={(imgs) =>
                      setForm((f) => ({ ...f, images: imgs }))
                    }
                    max={5}
                  />
                </div>
              </>
            )}
            onCreate={async (form) => {
              await createCar(form);
              refetchCar();
            }}
            onUpdate={async (id, form) => {
              await updateCar({ id, body: form });
              refetchCar();
            }}
            onDelete={async (id) => {
              if (!confirm("حذف؟")) return;
              await deleteCar(id);
              refetchCar();
            }}
            creating={creatingCar}
            updating={updatingCar}
          />
        )}

        {/* Music */}
        {activeTab === "الموسيقى" && (
          <AddonSection<Music, CreateMusicBody, Partial<CreateMusicBody>>
            items={music ?? []}
            loading={loadingMus}
            emptyForm={{ name: "", type: "", price: 0, description: "" }}
            toForm={(m) => ({
              name: m.name,
              type: m.type,
              price: m.price,
              description: m.description ?? "",
            })}
            renderRow={(m) => (
              <span>
                <span className="font-medium">{m.name}</span>
                <span className="mx-2 text-xs text-muted-foreground">
                  ({m.type})
                </span>
                <span className="font-bold text-primary">
                  {formatSYP(m.price)}
                </span>
              </span>
            )}
            renderForm={(form, setForm) => (
              <>
                <div>
                  <label className={labelCls}>الاسم</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>النوع</label>
                  <input
                    className={inputCls}
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>السعر (ل.س)</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>الوصف</label>
                  <input
                    className={inputCls}
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
              </>
            )}
            onCreate={async (form) => {
              await createMus(form);
              refetchMus();
            }}
            onUpdate={async (id, form) => {
              await updateMus({ id, body: form });
              refetchMus();
            }}
            onDelete={async (id) => {
              if (!confirm("حذف؟")) return;
              await deleteMus(id);
              refetchMus();
            }}
            creating={creatingMus}
            updating={updatingMus}
          />
        )}
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="admin">
      <EditHallPage />
    </RequireAuth>
  );
}
