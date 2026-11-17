export function formatToman(amount: number): string {
  const fa = amount.toLocaleString("fa-IR");
  return `${fa} تومان`;
}

export function formatPriceRange(min: number, max?: number | null, type?: string): string {
  if (type === "consultation") return "توافقی";
  if (max && max !== min) return `${formatToman(min)} – ${formatToman(max)}`;
  return formatToman(min);
}

export function toFaDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${toFaDigits(minutes)} دقیقه`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${toFaDigits(h)} ساعت`;
  return `${toFaDigits(h)} ساعت و ${toFaDigits(m)} دقیقه`;
}

export function calcDeposit(total: number, type: "fixed" | "percent", value: number): number {
  if (type === "percent") return Math.round((total * value) / 100);
  return value;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-");
}

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export const BOOKING_STATUSES: Record<string, { label: string; color: string }> = {
  pending: { label: "در انتظار تأیید", color: "text-amber-300 border-amber-300/30 bg-amber-300/10" },
  awaiting_payment: { label: "در انتظار پرداخت", color: "text-orange-300 border-orange-300/30 bg-orange-300/10" },
  confirmed: { label: "تأیید شده", color: "text-emerald-300 border-emerald-300/30 bg-emerald-300/10" },
  completed: { label: "انجام شده", color: "text-champagne border-champagne/30 bg-champagne/10" },
  cancelled: { label: "لغو شده", color: "text-red-300 border-red-300/30 bg-red-300/10" },
  rejected: { label: "رد شده", color: "text-red-400 border-red-400/30 bg-red-400/10" },
  no_show: { label: "عدم حضور", color: "text-mist border-white/10 bg-white/5" },
};
