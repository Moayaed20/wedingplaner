"use client";

import { Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAuth } from "@/components/auth/require-auth";

function ReviewsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">تقييماتي</h1>
        <p className="rounded-[1.75rem] border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          ستُعرض هنا التقييمات التي كتبتها. (يمكنك إضافة تقييم من صفحة تفاصيل القاعة)
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <ReviewsPage />
    </RequireAuth>
  );
}
