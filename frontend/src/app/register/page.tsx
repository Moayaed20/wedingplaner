"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password, phone, role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء الحساب");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden py-12">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-bl from-rose-200 to-orange-100 opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-sky-200 to-indigo-100 opacity-60 blur-3xl" />

        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-border/60 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-ink">إنشاء حساب جديد</h1>
            <p className="mt-1 text-sm text-muted-foreground">انضم إلينا واحجز قاعة أحلامك اليوم</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: علي أحمد" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+963 9XX XXX XXX" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="space-y-1.5">
              <Label>نوع الحساب</Label>
              <div className="grid grid-cols-2 gap-2">
                <RoleChip active={role === "customer"} onClick={() => setRole("customer")}>
                  عميل يبحث عن قاعة
                </RoleChip>
                <RoleChip active={role === "hall_owner"} onClick={() => setRole("hall_owner")}>
                  مالك قاعة
                </RoleChip>
              </div>
            </div>

            <Button className="w-full rounded-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؈{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

function RoleChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-2xl border-2 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary-50 text-primary"
          : "border-border bg-white text-ink/70 hover:border-primary/50 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
