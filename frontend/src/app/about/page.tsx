import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

const points = [
  { icon: Heart, title: "مختارة بعناية", text: "كل قاعة على المنصة تمر بمعايير جودة قبل نشرها." },
  { icon: ShieldCheck, title: "حجز آمن وموثوق", text: "تواصل مباشر مع أصحاب القاعات وبدون أي دفع مسبق." },
  { icon: Sparkles, title: "تجربة متكاملة", text: "من القاعة إلى الديكور والموسيقى، كل شيء في مكان واحد." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold text-ink">عن WeddingBook</h1>
          <p className="mt-4 leading-8 text-muted-foreground">
            منصة سورية تجمع أجمل قاعات الأفراح وخدمات المناسبات في مكان واحد، لنجعل رحلة التخطيط
            لحفل زفافك أبسط وأكثر متعة، من البحث والمقارنة وحتى الحجز النهائي.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-white p-6 text-center shadow-card">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
