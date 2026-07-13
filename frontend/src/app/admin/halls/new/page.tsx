"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireAuth } from "@/components/auth/require-auth";
import { useMutation } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import type { CreateHallBody, Hall } from "@/lib/types";
import { adminNavItems } from "@/components/admin/admin-nav-items";

function NewHallPage() {
  const router = useRouter();
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

  const {
    mutate: createHall,
    isLoading,
    error,
  } = useMutation<Hall, CreateHallBody>((body, token) =>
    HallsAPI.create(body, token),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await createHall(formData);
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

  return (
    <DashboardShell
      navItems={adminNavItems}
      userName="المشرف"
      userRoleLabel="إضافة قاعة جديدة"
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
        <h2 className="text-lg font-extrabold text-ink">إضافة قاعة جديدة</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {error}
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
          <Button type="submit" className="rounded-full" disabled={isLoading}>
            {isLoading ? "جاري الإضافة..." : "إضافة القاعة"}
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
      <NewHallPage />
    </RequireAuth>
  );
}
