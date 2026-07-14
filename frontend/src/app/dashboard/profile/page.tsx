"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-ink">الملف الشخصي</h1>
        <div className="max-w-md rounded-[1.75rem] border border-border bg-white p-6 shadow-card">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                {user?.name?.charAt(0) ?? "؟"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-ink">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {user?.phone && (
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default function Page() {
  return (
    <RequireAuth role="customer">
      <ProfilePage />
    </RequireAuth>
  );
}
