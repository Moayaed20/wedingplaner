import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSYP(amount: number) {
  return new Intl.NumberFormat("ar-SY").format(amount) + " ل.س";
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
