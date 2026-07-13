import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { Hall } from "@/lib/types";
import { Rating } from "./rating";
import { formatSYP } from "@/lib/utils";

export function HallCard({ hall, featured = false }: { hall: Hall; featured?: boolean }) {
  return (
    <Link
      href={`/halls/${hall.id}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
    >
      <div className={`relative w-full overflow-hidden ${featured ? "aspect-[4/3]" : "aspect-[16/11]"}`}>
        <Image
          src={hall.images[0]}
          alt={hall.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/70 backdrop-blur transition-colors hover:text-primary">
          <Heart className="h-4 w-4" />
        </span>
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow-sm">
          <Rating value={hall.rating} />
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="font-bold text-ink">{hall.name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {hall.city}
        </p>
        <p className="text-sm text-muted-foreground">
          يبدأ من{" "}
          <span className="font-bold text-primary">{formatSYP(hall.price_per_person)}</span>
          <span> / الشخص</span>
        </p>
      </div>
    </Link>
  );
}
