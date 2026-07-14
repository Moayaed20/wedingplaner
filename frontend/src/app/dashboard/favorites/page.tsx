"use client";

import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAuth } from "@/components/auth/require-auth";

function FavoritesPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">المفضلة</h1>
        <p className="rounded-[1.75rem] border border-dashed border-border bg-white p-8 text-center text-sm text-muted-foreground">
          لا توجد قاعات في المفضلة بعد. تصفح القاعات وأضف ما يعجبك!
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <FavoritesPage />
    </RequireAuth>
  );
}
