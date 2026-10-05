export const IMAGES = {
  hero: "/images/hero/hero-01.jpg",
  interior: "/images/about/salon-interior.jpg",
  brandModel: "/images/about/brand-model.jpg",
  hair: "/images/services/hair.jpg",
  makeup: "/images/services/makeup.jpg",
  bridal: "/images/services/bridal.jpg",
  color: "/images/services/color.jpg",
  portrait: "/images/services/portrait.jpg",
  nails: "/images/services/nails.jpg",
  chair: "/images/booking/chair.jpg",
} as const;

export const ALL_IMAGES = Object.values(IMAGES);

export function toFaDigits(value: number | string) {
  return String(value).replace(/[0-9]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export const BRAND = {
  name: "مرکز زیبایی لیندا جعفرپناه",
  short: "لیندا",
  owner: "جعفرپناه",
  tagline: "زیبایی، از نو تعریف می‌شود.",
  statement: "جایی که زیبایی به یک تجربه تبدیل می‌شود",
  city: "تهران",
  location:
    "فلکه دوم صادقیه، بلوار آیت‌الله کاشانی، بعد از بلوار اباذر، نرسیده به مهران، روبروی بوستان یاران، جنب کاشی ایفا، ساختمان راز، پلاک ۶۱، بلوک A، طبقه ۴، واحد ۴۰۴",
  locationShort: "تهران، صادقیه، بلوار کاشانی، ساختمان راز، واحد ۴۰۴",
  phones: [
    { label: "تلفن ثابت", value: "021-44929913", tel: "+982144929913" },
    { label: "موبایل / مشاوره", value: "09129103243", tel: "+989129103243" },
    { label: "واتساپ", value: "09190151591", tel: "+989190151591", wa: "989190151591" },
  ],
  whatsapp: "989190151591",
  whatsappDisplay: "09190151591",
  mapsQuery: "مرکز زیبایی لیندا جعفرپناه ساختمان راز تهران صادقیه",
};

export type ServiceCategory =
  | "Hair"
  | "Color"
  | "Makeup"
  | "Bridal"
  | "Nails"
  | "Beauty";

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  Hair: "مو",
  Color: "رنگ مو",
  Makeup: "میکاپ",
  Bridal: "عروس",
  Nails: "ناخن",
  Beauty: "زیبایی",
};

export interface CinematicService {
  id: string;
  index: string;
  name: string;
  eyebrow: string;
  description: string;
  image: string;
  objectPosition: string;
  category: ServiceCategory;
}

export const CINEMATIC_SERVICES: CinematicService[] = [
  { id: "hair", index: "۰۱", name: "مو", eyebrow: "کات و فینیش", description: "کاتی سنجیده و پایانی نرم؛ فرمی که به شما تعلق دارد، نه به یک ترند.", image: IMAGES.hair, objectPosition: "center 20%", category: "Hair" },
  { id: "color", index: "۰۲", name: "رنگ مو", eyebrow: "رنگ در آتلیه", description: "بالیاژ، گلاس و نوری زنده؛ رنگی مثل یک حال‌وهوا، نه یک نقاب.", image: IMAGES.color, objectPosition: "center center", category: "Color" },
  { id: "styling", index: "۰۳", name: "استایل مو", eyebrow: "فرم ادیتوریال", description: "موج، ساختار و حرکت؛ برای شب یا برای سینمایی‌تر شدن روزمرگی.", image: IMAGES.brandModel, objectPosition: "center 15%", category: "Hair" },
  { id: "makeup", index: "۰۴", name: "میکاپ", eyebrow: "پوست، نور، خط", description: "چهره در روشن‌ترین بیان خود؛ معماری‌ای نرم، بدون ساختن یک ماسک.", image: IMAGES.makeup, objectPosition: "center 40%", category: "Makeup" },
  { id: "brows", index: "۰۵", name: "ابرو", eyebrow: "قاب چهره", description: "معماری ظریف ابرو که بی‌صدا تمام پرتره را دوباره تنظیم می‌کند.", image: IMAGES.makeup, objectPosition: "center 18%", category: "Beauty" },
  { id: "lashes", index: "۰۶", name: "مژه", eyebrow: "گشودن نور", description: "کاری برای مژه که نگاه را بازتر می‌کند، بی‌آنکه خودش را اعلام کند.", image: IMAGES.makeup, objectPosition: "center 35%", category: "Beauty" },
  { id: "nails", index: "۰۷", name: "ناخن", eyebrow: "پایان آرام", description: "نود، آیوری و شامپاین؛ مانیکوری دقیق به ظرافت یک جواهر.", image: IMAGES.nails, objectPosition: "center center", category: "Nails" },
  { id: "facial", index: "۰۸", name: "فیشال و مراقبت پوست", eyebrow: "آیین مراقبت", description: "لمس آهسته و عمیق؛ پوست به شفافیت برمی‌گردد، نه به پوشانده شدن.", image: IMAGES.portrait, objectPosition: "center 15%", category: "Beauty" },
  { id: "bridal", index: "۰۹", name: "عروس", eyebrow: "سیتینگ خصوصی", description: "آتلیه‌ای خصوصی برای عروس؛ مو، پوست و میکاپ برای روز و تصویر.", image: IMAGES.bridal, objectPosition: "center 20%", category: "Bridal" },
  { id: "occasion", index: "۱۰", name: "مناسبت ویژه", eyebrow: "بعد از تاریکی", description: "برای اتاق‌هایی که به حضور نیاز دارند؛ ادیتوریال، آرام و به‌یادماندنی.", image: IMAGES.hero, objectPosition: "center 20%", category: "Beauty" },
];

export interface BookingService {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  image: string;
  specialties: string[];
}

export const BOOKING_SERVICES: BookingService[] = [
  { id: "haircut", name: "کوتاهی مو", duration: "۷۵ دقیقه", price: "۱۸۰ یورو", description: "مشاوره، کوتاهی و فینیش ابریشمی.", image: IMAGES.hair, specialties: ["hair"] },
  { id: "color", name: "رنگ مو", duration: "۱۵۰ دقیقه", price: "۲۴۰ یورو", description: "گلاس، تون و اصلاح رنگ.", image: IMAGES.color, specialties: ["color"] },
  { id: "balayage", name: "بالیاژ", duration: "۲۱۰ دقیقه", price: "۳۲۰ یورو", description: "نورپردازی دست‌ساز که از روز اول طبیعی به نظر می‌رسد.", image: IMAGES.color, specialties: ["color"] },
  { id: "makeup", name: "میکاپ", duration: "۶۰ دقیقه", price: "۱۵۰ یورو", description: "میکاپ نرم ادیتوریال یا میکاپ کامل برای مناسبت.", image: IMAGES.makeup, specialties: ["makeup"] },
  { id: "bridal", name: "میکاپ و موی عروس", duration: "نیم‌روز", price: "۴۵۰ یورو", description: "تست جداگانه محاسبه می‌شود؛ مو، میکاپ و آرامش.", image: IMAGES.bridal, specialties: ["bridal", "makeup", "hair"] },
  { id: "nails", name: "ناخن", duration: "۶۰ دقیقه", price: "۹۵ یورو", description: "مانیکور امضای نود و شامپاین.", image: IMAGES.nails, specialties: ["nails"] },
  { id: "facial", name: "فیشال", duration: "۸۰ دقیقه", price: "۱۸۰ یورو", description: "آیین آرام مراقبت برای شفافیت و نور پوست.", image: IMAGES.portrait, specialties: ["skin"] },
];

export interface Stylist {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  specialties: string[];
}

export const STYLISTS: Stylist[] = [
  { id: "camille", name: "کمیل مورو", role: "مدیر خلاق", bio: "بیست سال تجربه در ساختن فرم؛ از پاریس و لندن تا لیندا. امروز در قلب صادقیه.", image: IMAGES.brandModel, specialties: ["hair", "bridal"] },
  { id: "elena", name: "النا ووس", role: "آتلیه رنگ", bio: "بالیاژ به مثابه مطالعه نور؛ رنگی که متولدشده به نظر می‌رسد، نه اجراشده.", image: IMAGES.color, specialties: ["color", "hair"] },
  { id: "amara", name: "آمارا دیالو", role: "پوست و زیبایی", bio: "فیشالیست و معمار ابرو؛ نوعی آرام‌تر از دگرگونی.", image: IMAGES.portrait, specialties: ["skin", "nails", "makeup"] },
  { id: "lea", name: "لئا فُنتن", role: "میکاپ و عروس", bio: "چهره‌هایی برای عکس‌هایی که قرار است بمانند؛ نرم، دقیق و ماندگار.", image: IMAGES.bridal, specialties: ["makeup", "bridal"] },
];

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  category: ServiceCategory;
  image: string;
  objectPosition: string;
}

export const PORTFOLIO: PortfolioItem[] = [
  { id: "p1", title: "ورود", subtitle: "پرتره ادیتوریال", category: "Beauty", image: IMAGES.hero, objectPosition: "center 18%" },
  { id: "p2", title: "حجم عسلی", subtitle: "کات و استایل", category: "Hair", image: IMAGES.brandModel, objectPosition: "center 12%" },
  { id: "p3", title: "موج نیمه‌شب", subtitle: "فینیش امضا", category: "Hair", image: IMAGES.hair, objectPosition: "center 20%" },
  { id: "p4", title: "نور مسی", subtitle: "رنگ آتلیه", category: "Color", image: IMAGES.color, objectPosition: "center center" },
  { id: "p5", title: "نگاه نرم", subtitle: "مطالعه میکاپ", category: "Makeup", image: IMAGES.makeup, objectPosition: "center 40%" },
  { id: "p6", title: "پیمان آیوری", subtitle: "سیتینگ عروس", category: "Bridal", image: IMAGES.bridal, objectPosition: "center 18%" },
  { id: "p7", title: "قدرت آرام", subtitle: "آیین پوست", category: "Beauty", image: IMAGES.portrait, objectPosition: "center 12%" },
  { id: "p8", title: "فینیش شامپاین", subtitle: "آتلیه ناخن", category: "Nails", image: IMAGES.nails, objectPosition: "center center" },
  { id: "p9", title: "بعد از ساعت‌ها", subtitle: "خود مزون", category: "Beauty", image: IMAGES.interior, objectPosition: "center center" },
  { id: "p10", title: "صندلی", subtitle: "یک ساعت خصوصی", category: "Beauty", image: IMAGES.chair, objectPosition: "center center" },
];

export const PORTFOLIO_FILTERS: Array<"All" | ServiceCategory> = ["All", "Hair", "Color", "Makeup", "Bridal", "Nails", "Beauty"];

export interface JourneyStep {
  id: string;
  index: string;
  title: string;
  line: string;
  body: string;
  image: string;
}

export const JOURNEY: JourneyStep[] = [
  { id: "book", index: "۰۱", title: "رزرو", line: "یک ساعت خصوصی، برای شما.", body: "سیتینگ‌ها محدود هستند؛ شما هنر، هنرمند و نور روز را انتخاب می‌کنید.", image: IMAGES.interior },
  { id: "arrive", index: "۰۲", title: "ورود", line: "در بسته می‌شود و شهر عقب می‌ماند.", body: "نوشیدنی خوش‌آمد، نور گرم و زمانی که فقط برای شماست.", image: IMAGES.interior },
  { id: "consult", index: "۰۳", title: "مشاوره", line: "پیش از شروع، گوش می‌دهیم.", body: "مو، پوست، مناسبت و تصویر؛ گفت‌وگویی کوتاه که همه‌چیز را تغییر می‌دهد.", image: IMAGES.portrait },
  { id: "treatment", index: "۰۴", title: "آیین زیبایی", line: "دست‌ها، نور و زمانی بی‌عجله.", body: "کار آرام است؛ می‌توانید صحبت کنید یا نه. مزون هر دو را در خود جا می‌دهد.", image: IMAGES.hair },
  { id: "final", index: "۰۵", title: "چهره نهایی", line: "خود شما، شفاف‌تر.", body: "آخرین نگاه در آینه؛ نه آدمی تازه، بلکه همان کسی که منتظرش بودید.", image: IMAGES.hero },
];

export const BOOKING_JOURNEY = [
  { id: "booked", title: "نوبت شما ثبت شد.", line: "مزون شما را پذیرفته است.", image: IMAGES.interior },
  { id: "preparing", title: "استایلیست شما آماده می‌شود.", line: "ابزارها چیده شده‌اند؛ نور تنظیم است.", image: IMAGES.nails },
  { id: "chair", title: "صندلی شما منتظر است.", line: "جایی آرام که از همین حالا برای شماست.", image: IMAGES.chair },
  { id: "soon", title: "به‌زودی می‌بینیمتان.", line: "چند دقیقه زودتر برسید؛ باقی کار با ماست.", image: IMAGES.hero },
];

export const TIME_SLOTS = ["۰۹:۰۰", "۰۹:۳۰", "۱۰:۰۰", "۱۰:۳۰", "۱۱:۰۰", "۱۱:۳۰", "۱۲:۰۰", "۱۳:۰۰", "۱۳:۳۰", "۱۴:۰۰", "۱۴:۳۰", "۱۵:۰۰", "۱۵:۳۰", "۱۶:۰۰", "۱۶:۳۰", "۱۷:۰۰", "۱۷:۳۰", "۱۸:۰۰", "۱۸:۳۰"];

export const NAV = [
  { id: "home", label: "خانه" },
  { id: "services", label: "خدمات" },
  { id: "portfolio", label: "نمونه‌کارها" },
  { id: "about", label: "درباره ما" },
] as const;

export const CINEMATIC_SCENES = [
  { id: "arrival", index: "۰۱", label: "ورود", start: 0, end: 0.12 },
  { id: "atelier", index: "۰۲", label: "آتلیه", start: 0.12, end: 0.24 },
  { id: "services", index: "۰۳", label: "خدمات", start: 0.24, end: 0.62 },
  { id: "ritual", index: "۰۴", label: "آیین", start: 0.62, end: 0.88 },
  { id: "invitation", index: "۰۵", label: "دعوت", start: 0.88, end: 1 },
] as const;