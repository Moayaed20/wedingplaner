import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "rose",
  className,
}: {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: "rose" | "violet" | "mint" | "sky" | "peach";
  className?: string;
}) {
  const toneStyles = {
    rose: "bg-rose-50 text-rose-600",
    violet: "bg-violet-100 text-violet-600",
    mint: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    peach: "bg-orange-50 text-orange-600",
  };

  return (
    <div className={cn("rounded-[1.75rem] border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-soft", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", toneStyles[tone])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
