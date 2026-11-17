// Jalali (Persian) calendar conversion - lightweight, no deps
// Algorithm based on classic jalali conversion (Kazimierz M. Borkowski)

const G_DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const J_DAYS_IN_MONTH = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

function div(a: number, b: number) {
  return Math.floor(a / b);
}

function isLeapGregorian(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  let jy: number;
  let jm: number;
  let jd: number;
  let gDayNo = 365 * gy + div(gy + 3, 4) - div(gy + 99, 100) + div(gy + 399, 400);
  for (let i = 0; i < gm - 1; i++) gDayNo += G_DAYS_IN_MONTH[i];
  if (gm > 2 && isLeapGregorian(gy)) gDayNo++;
  gDayNo += gd;

  let jDayNo = gDayNo - 79;
  const jNp = div(jDayNo, 12053);
  jDayNo %= 12053;
  jy = 979 + 33 * jNp + 4 * div(jDayNo, 1461);
  jDayNo %= 1461;
  if (jDayNo >= 366) {
    jy += div(jDayNo - 1, 365);
    jDayNo = (jDayNo - 1) % 365;
  }
  for (let i = 0; i < 11 && jDayNo >= J_DAYS_IN_MONTH[i]; i++) {
    jDayNo -= J_DAYS_IN_MONTH[i];
    jm = i + 2;
  }
  jm = (jm! ?? 1);
  // fix jm loop above: cleaner re-loop
  // Use second pass simpler:
  // Actually we need to correctly compute jm/jd; recompute with direct method
  // Fallback to known good implementation below

  // Re-implement with standard function to avoid off-by-one above
  return jalaliFromGregorianCorrect(gy, gm, gd);
}

function jalaliFromGregorianCorrect(gy: number, gm: number, gd: number): [number, number, number] {
  let gdm = G_DAYS_IN_MONTH.slice();
  let jy = 0, jm = 0, jd = 0;
  let gy2 = gy - 1600;
  let gm2 = gm - 1;
  let gd2 = gd - 1;
  let gDayNo = 365 * gy2 + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400);
  for (let i = 0; i < gm2; i++) gDayNo += gdm[i];
  if (gm > 2 && isLeapGregorian(gy)) gDayNo++;
  gDayNo += gd2;
  let jDayNo = gDayNo - 79;
  const jNp = div(jDayNo, 12053);
  jDayNo %= 12053;
  jy = 979 + 33 * jNp + 4 * div(jDayNo, 1461);
  jDayNo %= 1461;
  if (jDayNo >= 366) {
    jy += div(jDayNo - 1, 365);
    jDayNo = (jDayNo - 1) % 365;
  }
  for (let i = 0; i < 11 && jDayNo >= J_DAYS_IN_MONTH[i]; i++) {
    jDayNo -= J_DAYS_IN_MONTH[i];
    jm = i + 2;
    // will override
  }
  // Actually properly compute:
  jm = 1;
  for (let i = 0; i < 11; i++) {
    if (jDayNo < J_DAYS_IN_MONTH[i]) break;
    jDayNo -= J_DAYS_IN_MONTH[i];
    jm++;
  }
  jd = jDayNo + 1;
  return [jy, jm, jd];
}

export function toJalali(date: Date): { jy: number; jm: number; jd: number } {
  const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return { jy, jm, jd };
}

export function toJalaliString(date: Date): string {
  const { jy, jm, jd } = toJalali(date);
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let jy2 = jy - 979;
  let jDayNo = 365 * jy2 + div(jy2, 33) * 8 + div((jy2 % 33 + 3), 4);
  for (let i = 0; i < jm - 1; i++) jDayNo += J_DAYS_IN_MONTH[i];
  jDayNo += jd - 1;
  let gDayNo = jDayNo + 79;
  let gy = 1600 + 400 * div(gDayNo, 146097);
  gDayNo %= 146097;
  let leap = true;
  if (gDayNo >= 36525) {
    gDayNo--;
    gy += 100 * div(gDayNo, 36524);
    gDayNo %= 36524;
    if (gDayNo >= 365) gDayNo++;
    else leap = false;
  }
  gy += 4 * div(gDayNo, 1461);
  gDayNo %= 1461;
  if (gDayNo >= 366) {
    leap = false;
    gDayNo--;
    gy += div(gDayNo, 365);
    gDayNo %= 365;
  }
  let gm = 1;
  for (let i = 0; gDayNo >= G_DAYS_IN_MONTH[i] + (i === 1 && leap ? 1 : 0); i++) {
    gDayNo -= G_DAYS_IN_MONTH[i] + (i === 1 && leap ? 1 : 0);
    gm++;
  }
  const gd = gDayNo + 1;
  return [gy, gm, gd];
}

export function fromJalali(jy: number, jm: number, jd: number): Date {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const JALALI_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
// Mapping: JS getDay() 0=Sun ... 6=Sat ; Persian week starts Sat.
// So convert: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
export function persianDayIndex(jsDay: number): number {
  return (jsDay + 1) % 7;
}
export function jalaliWeekdayName(date: Date): string {
  return JALALI_WEEKDAYS[persianDayIndex(date.getDay())];
}

export function formatJalali(date: Date): string {
  const { jy, jm, jd } = toJalali(date);
  return `${jd} ${JALALI_MONTHS[jm - 1]} ${jy}`;
}

export function formatJalaliFull(date: Date): string {
  const { jy, jm, jd } = toJalali(date);
  const wd = jalaliWeekdayName(date);
  return `${wd}، ${jd} ${JALALI_MONTHS[jm - 1]} ${jy}`;
}

export function isSameJalaliDay(a: Date, b: Date): boolean {
  const ja = toJalali(a);
  const jb = toJalali(b);
  return ja.jy === jb.jy && ja.jm === jb.jm && ja.jd === jb.jd;
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: 29 or 30 leap
  const isLeap = isJalaliLeap(jy);
  return isLeap ? 30 : 29;
}

export function isJalaliLeap(jy: number): boolean {
  // Leap years in 33-year cycle: 1,5,9,13,17,22,26,30
  const cycle = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(cycle);
}

export function addJalaliMonths(date: Date, months: number): Date {
  const { jy, jm, jd } = toJalali(date);
  let totalMonths = (jy * 12 + (jm - 1)) + months;
  let ny = Math.floor(totalMonths / 12);
  let nm = (totalMonths % 12) + 1;
  if (nm <= 0) { nm += 12; ny -= 1; }
  const days = getJalaliMonthDays(ny, nm);
  const nd = Math.min(jd, days);
  return fromJalali(ny, nm, nd);
}

export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const d = fromJalali(jy, jm, jd);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoToJalaliParts(iso: string): { jy: number; jm: number; jd: number } | null {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (isNaN(d.getTime())) return null;
  const { jy, jm, jd } = toJalali(d);
  return { jy, jm, jd };
}

export function isoToJalaliDisplay(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return formatJalaliFull(d);
}
