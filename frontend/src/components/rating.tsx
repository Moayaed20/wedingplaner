import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold text-ink", className)}>
      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-muted-foreground">({count})</span>}
    </span>
  );
}
