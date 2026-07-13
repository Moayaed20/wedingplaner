import {
  Building2,
  CalendarCheck,
  LayoutGrid,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutGrid },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/halls", label: "القاعات", icon: Building2 },
  { href: "/admin/services", label: "الخدمات", icon: Sparkles },
  { href: "/admin/bookings", label: "الحجوزات", icon: CalendarCheck },
];
