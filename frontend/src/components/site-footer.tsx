import Link from "next/link";
import { Logo } from "./logo";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            منصتك الأولى لاكتشاف وحجز أجمل قاعات الأفراح والخدمات المرافقة بكل سهولة وثقة.
          </p>
          <div className="flex gap-3 pt-2">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-ink/70 transition-colors hover:bg-primary-100 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">استكشف</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/halls" className="hover:text-primary">
                القاعات
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-primary">
                الخدمات
              </Link>
            </li>
            <li>الأسئلة الشائعة</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold text-ink">الشركة</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about" className="hover:text-primary">
                حولنا
              </Link>
            </li>
            <li>تواصل معنا</li>
            <li>سياسة الخصوصية</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 WeddingBook. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
