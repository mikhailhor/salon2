export type Currency = "TOMAN";

export interface ServiceCategory {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  image: string;
  icon?: string;
  parentId: string | null;
  order: number;
  isActive: boolean;
  color?: string;
}

export interface Service {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  categoryId: string;
  subCategoryId?: string | null;
  description: string;
  longDescription?: string;
  image: string;
  gallery: string[];
  durationMinutes: number;
  price: number; // in Toman
  priceMax?: number | null;
  priceType: "fixed" | "range" | "consultation";
  depositEnabled: boolean;
  depositType: "fixed" | "percent";
  depositValue: number;
  bookingEnabled: boolean;
  order: number;
  isActive: boolean;
  featured?: boolean;
  specialistIds?: string[];
}

export type BookingStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "no_show";

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  categoryId: string;
  subCategoryId?: string | null;
  specialistId: string;
  date: string; // ISO gregorian YYYY-MM-DD
  jalaliDate: string; // YYYY/MM/DD
  timeSlot: string; // "09:00"
  status: BookingStatus;
  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded";
  notes?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specialist {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  bio: string;
  image: string;
  categoryIds: string[];
  serviceIds?: string[];
  phone?: string;
  isActive: boolean;
  workingHours: WorkingHour[];
  capacityPerSlot: number;
  daysOff?: string[]; // ISO dates
}

export interface WorkingHour {
  dayOfWeek: number; // 0 = شنبه (Saturday) in Persian week, 6 = Friday
  // We use 0-6 where 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
  isWorking: boolean;
  start: string;
  end: string;
  breaks?: { start: string; end: string }[];
}

export interface Customer {
  id: string;
  name: string;
  familyName?: string;
  fullName: string;
  phone: string;
  email?: string;
  password?: string; // plain for demo - in real app hashed
  avatar?: string;
  createdAt: string;
  notes?: string;
  role: "customer" | "admin";
}

export interface BeautyHistory {
  id: string;
  customerId: string;
  bookingId?: string;
  serviceId: string;
  categoryId: string;
  date: string; // ISO
  jalaliDate: string;
  specialistId: string;
  specialistName: string;
  serviceName: string;
  beforeImage?: string;
  afterImage?: string;
  description?: string;
  pricePaid: number;
  status: "completed" | "in_progress";
}

export interface LookbookItem {
  id: string;
  titleFa: string;
  titleEn?: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string | null;
  serviceId?: string | null;
  serviceName?: string;
  beforeImage: string;
  afterImage: string;
  featured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText: string;
  mimeType: string;
  sizeLabel?: string;
  uploadedAt: string;
  usedIn: string[];
}

export interface SiteSection {
  id: string;
  key: string;
  titleFa: string;
  titleEn?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  video?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  mode: "both" | "cinematic" | "standard";
  bgColor?: string;
}

export interface SiteSettings {
  brandName: string;
  brandShort: string;
  tagline: string;
  statement: string;
  city: string;
  location: string;
  locationShort: string;
  phones: { label: string; value: string; tel: string; wa?: string }[];
  whatsapp: string;
  whatsappDisplay: string;
  mapsQuery: string;
  socialLinks: { platform: string; url: string; icon: string }[];
  currency: Currency;
  depositGlobalEnabled: boolean;
  depositGlobalType: "fixed" | "percent";
  depositGlobalValue: number;
  workingHoursNote?: string;
  holidays: string[]; // ISO dates
  seoTitle?: string;
  seoDescription?: string;
}

export interface CmsContent {
  sections: SiteSection[];
  settings: SiteSettings;
  hero: {
    titleFa: string;
    titleEn?: string;
    subtitle: string;
    description: string;
    image: string;
    video: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

export interface NotificationItem {
  id: string;
  customerId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "booking" | "system" | "promotion";
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  detail?: string;
  timestamp: string;
}
