import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types";

const config: Record<BookingStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  confirmed: { label: "مؤكد", variant: "success" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  rejected: { label: "مرفوض", variant: "destructive" },
  cancelled: { label: "ملغى", variant: "secondary" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
