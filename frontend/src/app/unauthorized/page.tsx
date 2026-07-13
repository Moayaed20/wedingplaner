"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-extrabold text-primary">403</h1>
      <p className="mt-4 text-xl font-bold text-ink">لا تملك صلاحية الوصول</p>
      <p className="mt-2 text-muted-foreground">هذه الصفحة مخصصة لدور آخر في المنصة.</p>
      <Button className="mt-6 rounded-full" asChild>
        <Link href="/">العودة للرئيسية</Link>
      </Button>
    </main>
  );
}
