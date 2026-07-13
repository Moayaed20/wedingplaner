"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useApi } from "@/hooks/use-api";
import { HallsAPI } from "@/lib/api";
import { formatSYP } from "@/lib/utils";
import type { Hall } from "@/lib/types";

const navItems = [
  { href: "/owner", label: "لوحة التحكم", icon: Building2 },
  { href: "/owner/halls", label: "قاعاتي", icon: Building2 },
];

function OwnerHallsPage() {
  const { data: halls, isLoading, error } = useApi<Hall[]>((token) => HallsAPI.mine(token), []);

  return (
    <DashboardShell navItems={navItems} userName="مالك القاعة" userRoleLabel="قاعاتي">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">قاعاتي</h2>
        <Button className="rounded-full" disabled>
          إضافة قاعة (قريبًا)
        </Button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(halls ?? []).map((hall) => (
          <Link
            key={hall.id}
            href={`/halls/${hall.id}`}
            className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card transition-shadow hover:shadow-soft"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image src={hall.images[0]} alt={hall.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-ink">{hall.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{hall.city}</p>
              <p className="mt-2 text-sm font-bold text-primary">يبدأ من {formatSYP(hall.price_per_person)} / الشخص</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}

export default function Page() {
  return (
    <RequireAuth role="hall_owner">
      <OwnerHallsPage />
    </RequireAuth>
  );
}
