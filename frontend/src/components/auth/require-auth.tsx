"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import type { Role } from "@/lib/types";

interface RequireAuthProps {
  role?: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequireAuth({ role, fallback, children }: RequireAuthProps) {
  const { user, isLoading, isAuthenticated, isRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role && !isRole(role)) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, role, isRole, router, pathname]);

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (role && !isRole(role)) return fallback ?? null;

  return <>{children}</>;
}
