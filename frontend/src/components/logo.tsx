import { Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
        <Heart className="h-[18px] w-[18px] fill-white" />
      </span>
      <span className="text-lg font-extrabold text-ink">WeddingBook</span>
    </Link>
  );
}
