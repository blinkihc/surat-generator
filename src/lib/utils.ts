import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return "";
  const str = String(value).replace(/[^0-9]/g, '');
  if (!str) return "";
  const num = parseInt(str, 10);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat('id-ID').format(num);
}
