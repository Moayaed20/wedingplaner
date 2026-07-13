"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi, useMutation } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import type { CreateHallBody, Hall } from "@/lib/types";
import { adminNavItems } from "@/components/admin/admin-nav-items";

function EditHallPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const hallId = params.id;

  // جلب بيانات القاعة
  const {
    data: hall,
    isLoading: loadingHall,
    error: fetchError,
  } = useApi<Hall>(() => HallsAPI.get(hallId), [hallId]);

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
  });

  // تعبئة النموذج عند تحميل البيانات
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
      });
    }
  }, [hall]);

  const {
    mutate: updateHall,
    isLoading: updating,
    error: updateError,
  } = useMutation<Hall, CreateHallBody>((body, token) =>
    HallsAPI.update(hallId, body, token),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateHall(formData);
      if (result) {
        router.push("/admin/halls");
      }
    } catch (err) {
      // error handled by useMutation
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  if (loadingHall) {
    return (
      <DashboardShell
        navItems={adminNavItems}
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
      <DashboardShell
        navItems={adminNavItems}
        userName="المشرف"
        userRoleLabel="خطأ"
      >
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
      navItems={adminNavItems}
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

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
              placeholder="25000"
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
              placeholder="100"
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
              placeholder="500"
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
          <Label htmlFor="images">روابط الصور (افصل بينها بفاصلة)</Label>
          <Input
            id="images"
            name="images"
            value={formData.images?.join(", ") || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                images: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
          />
        </div>

        <div className="flex gap-3 pt-4">
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
