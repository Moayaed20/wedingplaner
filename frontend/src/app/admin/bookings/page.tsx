"use client";

import { useState, useMemo } from "react";
import { CalendarCheck, Plus, Pencil, Trash2, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import {
  BookingsAPI,
  HallsAPI,
  UsersAPI,
  CateringsAPI,
  DecorationsAPI,
  CarsAPI,
  MusicAPI,
} from "@/lib/api";
import { formatSYP, formatDate } from "@/lib/utils";
import { BookingStatus } from "@/lib/types";
import type {
  Booking,
  Hall,
  User,
  CreateBookingBody,
  Catering,
  Decoration,
  Car,
  Music,
} from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: CalendarCheck },
  { href: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
];

const STATUS_OPTIONS = [
  { value: BookingStatus.PENDING, label: "قيد الانتظار" },
  { value: BookingStatus.CONFIRMED, label: "مؤكد" },
  { value: BookingStatus.REJECTED, label: "مرفوض" },
  { value: BookingStatus.CANCELLED, label: "ملغى" },
];

type EditForm = {
  event_date: string;
  guest_count: number;
  status: BookingStatus;
  total_price: number;
  selected_decoration_ids: string[];
  selected_car_id: string;
  selected_music_ids: string[];
};

type CreateForm = CreateBookingBody & { 
  customer_id: string;
  selected_decoration_ids?: string[];
  selected_music_ids?: string[];
};

type Addons = {
  caterings: Catering[];
  decorations: Decoration[];
  cars: Car[];
  music: Music[];
};

// 🔄 تم تعديل هذه الدالة لاستقبال token وتمريره
async function fetchHallAddons(
  hallId: string,
  token: string | null,
): Promise<Addons> {
  const [caterings, decorations, cars, music] = await Promise.all([
    CateringsAPI.list(hallId, token),
    DecorationsAPI.list(hallId, token),
    CarsAPI.list(hallId, token),
    MusicAPI.list(hallId, token),
  ]);
  return { caterings, decorations, cars, music };
}

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-medium text-ink";

function BookingsPage() {
  const { token } = useAuth(); // 🔄 أضفنا token من useAuth
  const {
    data: allBookings,
    isLoading,
    error,
    refetch,
  } = useApi<Booking[]>((t) => BookingsAPI.listAll(t), []);
  const { data: halls } = useApi<Hall[]>(() => HallsAPI.list({}), []);
  const { data: users } = useApi<User[]>((t) => UsersAPI.list(t), []);

  const { mutate: confirmMutate } = useMutation<Booking, string>((id, t) =>
    BookingsAPI.confirm(id, t!),
  );
  const { mutate: rejectMutate } = useMutation<Booking, string>((id, t) =>
    BookingsAPI.reject(id, t!),
  );
  const { mutate: removeMutate } = useMutation<{ deleted: boolean }, string>(
    (id, t) => BookingsAPI.remove(id, t!),
  );
  const { mutate: updateMutate, isLoading: updating } = useMutation<
    Booking,
    { id: string; body: any }
  >(({ id, body }, t) => BookingsAPI.update(id, body, t!));
  const { mutate: createMutate, isLoading: creating } = useMutation<
    Booking,
    CreateForm
  >((body, t) => BookingsAPI.create(body, t!));

  // ── add-ons state ──
  const emptyAddons: Addons = {
    caterings: [],
    decorations: [],
    cars: [],
    music: [],
  };
  const [addons, setAddons] = useState<Addons>(emptyAddons);
  const [addonsLoading, setAddonsLoading] = useState(false);

  // 🔄 تم تعديل loadAddons لاستقبال token وتمريره
  const loadAddons = async (hallId: string) => {
    if (!hallId) {
      setAddons(emptyAddons);
      return;
    }
    setAddonsLoading(true);
    try {
      const data = await fetchHallAddons(hallId, token);
      setAddons(data);
    } finally {
      setAddonsLoading(false);
    }
  };

  // ── Edit modal ──
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    event_date: "",
    guest_count: 1,
    status: BookingStatus.PENDING,
    total_price: 0,
    selected_decoration_ids: [],
    selected_car_id: "",
    selected_music_ids: [],
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editAddons, setEditAddons] = useState<Addons>(emptyAddons);

  const getHall = (id: string) => (halls ?? []).find((h) => h.id === id);

  const editHall = editBooking
    ? (getHall(editBooking.hall_id as string) ??
      getHall(editBooking.hall?.id ?? ""))
    : null;

  // 🔄 تم تعديل openEdit لاستقبال token وتمريره
  const openEdit = async (b: Booking) => {
    setEditBooking(b);
    setEditForm({
      event_date: b.event_date?.slice(0, 10) ?? "",
      guest_count: b.guest_count,
      status: b.status,
      total_price: b.total_price,
      selected_decoration_ids: Array.isArray(b.selected_decoration_ids) ? b.selected_decoration_ids : [],
      selected_car_id: (b.selected_car_id as string) ?? "",
      selected_music_ids: Array.isArray(b.selected_music_ids) ? b.selected_music_ids : [],
    });
    setEditError(null);
    const hallId = (b.hall_id as string) || b.hall?.id || "";
    if (hallId) {
      setAddonsLoading(true);
      try {
        const data = await fetchHallAddons(hallId, token);
        setEditAddons(data);
      } finally {
        setAddonsLoading(false);
      }
    }
  };

  const recalcEdit = (
    form: EditForm,
    hall: Hall | null | undefined,
    ea: Addons,
  ) => {
    let total = (hall?.price_per_person ?? 0) * form.guest_count;
    if (form.selected_decoration_ids.length > 0) {
      for (const decoId of form.selected_decoration_ids) {
        const d = ea.decorations.find((x) => x.id === decoId);
        if (d) total += d.price;
      }
    }
    if (form.selected_car_id) {
      const c = ea.cars.find((x) => x.id === form.selected_car_id);
      if (c) total += c.price;
    }
    if (form.selected_music_ids.length > 0) {
      for (const musicId of form.selected_music_ids) {
        const m = ea.music.find((x) => x.id === musicId);
        if (m) total += m.price;
      }
    }
    return total;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBooking) return;
    setEditError(null);
    const body: any = {
      event_date: editForm.event_date,
      guest_count: editForm.guest_count,
      status: editForm.status,
      total_price: editForm.total_price,
      selected_decoration_ids: editForm.selected_decoration_ids,
      selected_car_id: editForm.selected_car_id || null,
      selected_music_ids: editForm.selected_music_ids,
    };
    const result = await updateMutate({ id: editBooking.id, body });
    if (result) {
      setEditBooking(null);
      refetch();
    }
  };

  // ── Create modal ──
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({
    hall_id: "",
    event_date: "",
    guest_count: 1,
    customer_id: "",
    selected_decoration_ids: [],
    selected_car_id: "",
    selected_music_ids: [],
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const recalcCreate = (form: CreateForm, a: Addons) => {
    const hall = getHall(form.hall_id);
    let total = (hall?.price_per_person ?? 0) * form.guest_count;
    if (form.selected_decoration_ids && form.selected_decoration_ids.length > 0) {
      for (const decoId of form.selected_decoration_ids) {
        const d = a.decorations.find((x) => x.id === decoId);
        if (d) total += d.price;
      }
    }
    if (form.selected_car_id) {
      const c = a.cars.find((x) => x.id === form.selected_car_id);
      if (c) total += c.price;
    }
    if (form.selected_music_ids && form.selected_music_ids.length > 0) {
      for (const musicId of form.selected_music_ids) {
        const m = a.music.find((x) => x.id === musicId);
        if (m) total += m.price;
      }
    }
    return total;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!createForm.hall_id) return setCreateError("القاعة مطلوبة");
    if (!createForm.customer_id) return setCreateError("العميل مطلوب");
    if (!createForm.event_date) return setCreateError("التاريخ مطلوب");
    if (createForm.guest_count < 1)
      return setCreateError("عدد الضيوف يجب أن يكون أكبر من صفر");
    const body: any = {
      hall_id: createForm.hall_id,
      event_date: createForm.event_date,
      guest_count: createForm.guest_count,
      customer_id: createForm.customer_id,
      selected_caterings: createForm.selected_caterings ?? [],
    };
    if (createForm.selected_decoration_ids && createForm.selected_decoration_ids.length > 0) body.selected_decoration_ids = createForm.selected_decoration_ids;
    if (createForm.selected_car_id) body.selected_car_id = createForm.selected_car_id;
    if (createForm.selected_music_ids && createForm.selected_music_ids.length > 0) body.selected_music_ids = createForm.selected_music_ids;
    const result = await createMutate(body);
    if (result) {
      setShowCreate(false);
      setCreateForm({ hall_id: "", event_date: "", guest_count: 1, customer_id: "" });
      setAddons(emptyAddons);
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز؟")) return;
    await removeMutate(id);
    refetch();
  };

  const customers = (users ?? []).filter((u) => u.role === "customer");
  const createCost = recalcCreate(createForm, addons);
  const editCost = recalcEdit(editForm, editHall, editAddons);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (allBookings ?? []).filter((b) => {
      const matchSearch =
        !q ||
        b.hall?.name?.toLowerCase().includes(q) ||
        b.customer?.name?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || b.status === statusFilter;
      const date = b.event_date?.slice(0, 10) ?? "";
      const matchFrom = !dateFrom || date >= dateFrom;
      const matchTo = !dateTo || date <= dateTo;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [allBookings, search, statusFilter, dateFrom, dateTo]);

  return (
    <DashboardShell
      navItems={navItems}
      userName="المشرف"
      userRoleLabel="جميع الحجوزات"
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-extrabold text-ink">الحجوزات</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالقاعة أو العميل..."
              className="w-full rounded-full border border-border py-2 pr-9 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-full border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            title="من تاريخ"
          />
          <span className="text-sm text-muted-foreground">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-full border border-border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            title="إلى تاريخ"
          />
        </div>
        <Button
          className="rounded-full"
          onClick={() => { setShowCreate(true); setCreateError(null); setAddons(emptyAddons); }}
        >
          <Plus className="ml-1 h-4 w-4" />
          إضافة حجز
        </Button>
      </div>

      {/* tabs الحالات */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ value: "", label: "كل الحالات" }, ...STATUS_OPTIONS].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-ink hover:bg-secondary/80"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-secondary/60 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">القاعة</th>
              <th className="px-5 py-3 font-semibold">العميل</th>
              <th className="px-5 py-3 font-semibold">التاريخ</th>
              <th className="px-5 py-3 font-semibold">الحالة</th>
              <th className="px-5 py-3 font-semibold">المبلغ</th>
              <th className="px-5 py-3 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="px-5 py-3 font-semibold text-ink">
                  {b.hall?.name ?? "—"}
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {b.customer?.name ?? "—"}
                </td>
                <td className="px-5 py-3 text-ink/80">
                  {formatDate(b.event_date)}
                </td>
                <td className="px-5 py-3">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="px-5 py-3 font-bold text-primary">
                  {formatSYP(b.total_price)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {b.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={async () => {
                            await confirmMutate(b.id);
                            refetch();
                          }}
                        >
                          قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={async () => {
                            await rejectMutate(b.id);
                            refetch();
                          }}
                        >
                          رفض
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => openEdit(b)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-muted-foreground"
                >
                  لا توجد حجوزات.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal ── */}
      {editBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">تعديل الحجز</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>تاريخ الحدث</label>
                <input
                  type="date"
                  className={inputCls}
                  value={editForm.event_date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, event_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>عدد الضيوف</label>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={editForm.guest_count}
                  onChange={(e) => {
                    const guests = Number(e.target.value);
                    const newForm = { ...editForm, guest_count: guests };
                    setEditForm({
                      ...newForm,
                      total_price: recalcEdit(newForm, editHall, editAddons),
                    });
                  }}
                />
                {editHall?.price_per_person ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    التكلفة المتوقعة:{" "}
                    <span className="font-bold text-primary">
                      {formatSYP(editCost)}
                    </span>{" "}
                    ({formatSYP(editHall.price_per_person)}/شخص)
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelCls}>الحالة</label>
                <select
                  className={inputCls}
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      status: e.target.value as BookingStatus,
                    }))
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {addonsLoading ? (
                <p className="text-xs text-muted-foreground">
                  جارٍ تحميل الإضافات...
                </p>
              ) : (
                <>
                  {editAddons.caterings.length > 0 && (
                    <div>
                      <label className={labelCls}>الكاترينج</label>
                      <select className={inputCls} value="" onChange={() => {}}>
                        <option value="">— الكاترينج الحالي محفوظ —</option>
                        {editAddons.caterings.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.menu_name} — {formatSYP(c.price_per_person)}/شخص
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        الكاترينج لا يمكن تعديله مباشرة — أنشئ حجزاً جديداً
                        لتغييره
                      </p>
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>الديكور</label>
                    <div className="space-y-2">
                      {editAddons.decorations.map((d) => (
                        <label key={d.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.selected_decoration_ids.includes(d.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...editForm.selected_decoration_ids, d.id]
                                : editForm.selected_decoration_ids.filter(id => id !== d.id);
                              const newForm = { ...editForm, selected_decoration_ids: newIds };
                              setEditForm({
                                ...newForm,
                                total_price: recalcEdit(newForm, editHall, editAddons),
                              });
                            }}
                          />
                          <span>
                            {d.theme_name} — {formatSYP(d.price)}
                            {d.images?.[0] && (
                              <img src={d.images[0]} alt={d.theme_name} className="h-10 w-14 rounded object-cover mt-1" />
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>السيارة</label>
                    <select
                      className={inputCls}
                      value={editForm.selected_car_id}
                      onChange={(e) => {
                        const newForm = {
                          ...editForm,
                          selected_car_id: e.target.value,
                        };
                        setEditForm({
                          ...newForm,
                          total_price: recalcEdit(
                            newForm,
                            editHall,
                            editAddons,
                          ),
                        });
                      }}
                    >
                      <option value="">بدون سيارة</option>
                      {editAddons.cars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.car_name} {c.model} — {formatSYP(c.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>الموسيقى</label>
                    <div className="space-y-2">
                      {editAddons.music.map((m) => (
                        <label key={m.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.selected_music_ids.includes(m.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked
                                ? [...editForm.selected_music_ids, m.id]
                                : editForm.selected_music_ids.filter(id => id !== m.id);
                              const newForm = { ...editForm, selected_music_ids: newIds };
                              setEditForm({
                                ...newForm,
                                total_price: recalcEdit(newForm, editHall, editAddons),
                              });
                            }}
                          />
                          <span>
                            {m.name} ({m.type}) — {formatSYP(m.price)}
                            {m.images?.[0] && (
                              <img src={m.images[0]} alt={m.name} className="h-10 w-14 rounded object-cover mt-1" />
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className={labelCls}>المبلغ الإجمالي</label>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={editForm.total_price}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      total_price: Number(e.target.value),
                    }))
                  }
                />
              </div>

              {editError && <p className="text-sm text-red-500">{editError}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setEditBooking(null)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={updating}
                >
                  {updating ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-ink">إضافة حجز جديد</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>القاعة</label>
                <select
                  className={inputCls}
                  value={createForm.hall_id}
                  onChange={(e) => {
                    const hallId = e.target.value;
                    setCreateForm((f) => ({
                      ...f,
                      hall_id: hallId,
                      selected_decoration_ids: [],
                      selected_car_id: "",
                      selected_music_ids: [],
                    }));
                    loadAddons(hallId);
                  }}
                >
                  <option value="">اختر القاعة</option>
                  {(halls ?? []).map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {formatSYP(h.price_per_person)}/شخص
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>العميل</label>
                <select
                  className={inputCls}
                  value={createForm.customer_id}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      customer_id: e.target.value,
                    }))
                  }
                >
                  <option value="">اختر العميل</option>
                  {customers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>تاريخ الحدث</label>
                <input
                  type="date"
                  className={inputCls}
                  value={createForm.event_date}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, event_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>عدد الضيوف</label>
                <input
                  type="number"
                  min={getHall(createForm.hall_id)?.min_capacity ?? 1}
                  max={getHall(createForm.hall_id)?.max_capacity}
                  className={inputCls}
                  value={createForm.guest_count}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      guest_count: Number(e.target.value),
                    }))
                  }
                />
                {createForm.hall_id && getHall(createForm.hall_id) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    السعة: {getHall(createForm.hall_id)!.min_capacity}–{getHall(createForm.hall_id)!.max_capacity} ضيف
                  </p>
                )}
              </div>

              {createForm.hall_id &&
                (addonsLoading ? (
                  <p className="text-xs text-muted-foreground">
                    جارٍ تحميل الإضافات...
                  </p>
                ) : (
                  <>
                    {addons.caterings.length > 0 && (
                      <div>
                        <label className={labelCls}>الكاترينج</label>
                        <select
                          className={inputCls}
                          value={
                            (createForm.selected_caterings?.[0] as any)
                              ?.catering_id ?? ""
                          }
                          onChange={(e) => {
                            const id = e.target.value;
                            setCreateForm((f) => ({
                              ...f,
                              selected_caterings: id
                                ? [{ catering_id: id, quantity: 1 }]
                                : [],
                            }));
                          }}
                        >
                          <option value="">بدون كاترينج</option>
                          {addons.caterings.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.menu_name} — {formatSYP(c.price_per_person)}
                              /شخص
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {addons.decorations.length > 0 && (
                      <div>
                        <label className={labelCls}>الديكور</label>
                        <div className="space-y-2">
                          {addons.decorations.map((d) => (
                            <label key={d.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={createForm.selected_decoration_ids?.includes(d.id) || false}
                                onChange={(e) => {
                                  const currentIds = createForm.selected_decoration_ids || [];
                                  const newIds = e.target.checked
                                    ? [...currentIds, d.id]
                                    : currentIds.filter(id => id !== d.id);
                                  setCreateForm(f => ({ ...f, selected_decoration_ids: newIds }));
                                }}
                              />
                              <span>
                                {d.theme_name} — {formatSYP(d.price)}
                                {d.images?.[0] && (
                                  <img src={d.images[0]} alt={d.theme_name} className="h-10 w-14 rounded object-cover mt-1" />
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {addons.cars.length > 0 && (
                      <div>
                        <label className={labelCls}>السيارة</label>
                        <select
                          className={inputCls}
                          value={createForm.selected_car_id ?? ""}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              selected_car_id: e.target.value || undefined,
                            }))
                          }
                        >
                          <option value="">بدون سيارة</option>
                          {addons.cars.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.car_name} {c.model} — {formatSYP(c.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {addons.music.length > 0 && (
                      <div>
                        <label className={labelCls}>الموسيقى</label>
                        <div className="space-y-2">
                          {addons.music.map((m) => (
                            <label key={m.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={createForm.selected_music_ids?.includes(m.id) || false}
                                onChange={(e) => {
                                  const currentIds = createForm.selected_music_ids || [];
                                  const newIds = e.target.checked
                                    ? [...currentIds, m.id]
                                    : currentIds.filter(id => id !== m.id);
                                  setCreateForm(f => ({ ...f, selected_music_ids: newIds }));
                                }}
                              />
                              <span>
                                {m.name} ({m.type}) — {formatSYP(m.price)}
                                {m.images?.[0] && (
                                  <img src={m.images[0]} alt={m.name} className="h-10 w-14 rounded object-cover mt-1" />
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ))}

              {createForm.hall_id && (
                <p className="text-sm text-muted-foreground">
                  التكلفة الإجمالية المتوقعة:{" "}
                  <span className="font-bold text-primary">
                    {formatSYP(createCost)}
                  </span>
                </p>
              )}

              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowCreate(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={creating}
                >
                  {creating ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
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
      <BookingsPage />
    </RequireAuth>
  );
}
