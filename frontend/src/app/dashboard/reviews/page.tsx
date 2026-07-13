"use client";

import { Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: Star },
  { href: "/dashboard/reviews", label: "التقييمات", icon: Star },
];

function ReviewsPage() {
  return (
    <DashboardShell navItems={navItems} userName="عميل" userRoleLabel="تقييماتي">
      <h2 className="mb-4 text-lg font-extrabold text-ink">تقييماتي</h2>
      <p className="rounded-[1.75rem] border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
        ستُعرض هنا التقييمات التي كتبتها. (يمكنك إضافة تقييم من صفحة تفاصيل القاعة)
      </p>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <ReviewsPage />
    </RequireAuth>
  );
}
