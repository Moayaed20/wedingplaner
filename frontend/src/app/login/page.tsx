"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      if (returnUrl) window.location.href = returnUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تسجيل الدخول");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden py-12">
        <PastelBlob className="absolute -top-20 -left-20 h-72 w-72 bg-gradient-to-br from-primary-200 to-primary-100 opacity-60" />
        <PastelBlob className="absolute -bottom-20 -right-20 h-96 w-96 bg-gradient-to-tl from-violet-200 to-indigo-100 opacity-60" />

        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-border/60 bg-white/90 p-8 shadow-soft backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-ink">تسجيل الدخول</h1>
            <p className="mt-1 text-sm text-muted-foreground">مرحبًا بعودتك، سجّل الدخول لمتابعة حجوزاتك</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <Button className="w-full rounded-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "جارٍ الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؈{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

function PastelBlob({ className }: { className?: string }) {
  return <div className={cn("pointer-events-none rounded-full blur-3xl", className)} />;
}

import { cn } from "@/lib/utils";
