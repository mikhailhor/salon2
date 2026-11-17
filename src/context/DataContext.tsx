import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  AuditLog,
  BeautyHistory,
  Booking,
  Customer,
  LookbookItem,
  MediaItem,
  NotificationItem,
  Service,
  ServiceCategory,
  SiteSection,
  SiteSettings,
  Specialist,
} from "@/types";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, uid } from "@/lib/storage";
import { seedCategories, seedLookbook, seedSections, seedServices, seedSettings, seedSpecialists } from "@/lib/seed";
import { TIME_SLOTS } from "@/lib/format";

interface DataContextValue {
  categories: ServiceCategory[];
  services: Service[];
  specialists: Specialist[];
  lookbook: LookbookItem[];
  bookings: Booking[];
  customers: Customer[];
  history: BeautyHistory[];
  media: MediaItem[];
  sections: SiteSection[];
  settings: SiteSettings;
  notifications: NotificationItem[];
  auditLogs: AuditLog[];

  // category ops
  addCategory: (c: Partial<ServiceCategory>) => void;
  updateCategory: (id: string, patch: Partial<ServiceCategory>) => void;
  deleteCategory: (id: string) => { ok: boolean; message?: string };
  moveCategoryOrder: (id: string, direction: "up" | "down") => void;

  // service ops
  addService: (s: Partial<Service>) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  deleteService: (id: string) => void;
  moveServiceOrder: (id: string, dir: "up" | "down") => void;

  // specialist
  addSpecialist: (s: Partial<Specialist>) => void;
  updateSpecialist: (id: string, patch: Partial<Specialist>) => void;
  deleteSpecialist: (id: string) => void;

  // lookbook
  addLookbook: (l: Partial<LookbookItem>) => void;
  updateLookbook: (id: string, patch: Partial<LookbookItem>) => void;
  deleteLookbook: (id: string) => void;

  // bookings
  createBooking: (b: Omit<Booking, "id" | "createdAt" | "updatedAt">) => { ok: boolean; booking?: Booking; message?: string };
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  getAvailableSlots: (date: string, specialistId: string) => string[];
  getBookingsByCustomer: (customerId: string) => Booking[];

  // customers/history
  addCustomer: (c: Customer) => void;
  addCustomerNote: (customerId: string, note: string) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addHistory: (h: Omit<BeautyHistory, "id">) => void;

  // media
  addMedia: (m: Omit<MediaItem, "id" | "uploadedAt">) => void;
  updateMedia: (id: string, patch: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;

  // cms
  updateSection: (id: string, patch: Partial<SiteSection>) => void;
  addSection: (s: Partial<SiteSection>) => void;
  deleteSection: (id: string) => void;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  reorderSections: (orderedIds: string[]) => void;

  // helpers
  getCategoryTree: () => ServiceCategory[];
  getServicesByCategory: (catId: string) => Service[];
  getCategoryById: (id: string) => ServiceCategory | undefined;
  getServiceById: (id: string) => Service | undefined;

  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const stored = loadFromStorage<ServiceCategory[] | null>(STORAGE_KEYS.categories, null);
    if (stored && stored.length > 0) return stored;
    return seedCategories();
  });
  const [services, setServices] = useState<Service[]>(() => {
    const stored = loadFromStorage<Service[] | null>(STORAGE_KEYS.services, null);
    if (stored && stored.length > 0) return stored;
    return seedServices();
  });
  const [specialists, setSpecialists] = useState<Specialist[]>(() => {
    const stored = loadFromStorage<Specialist[] | null>(STORAGE_KEYS.specialists, null);
    if (stored && stored.length > 0) return stored;
    return seedSpecialists();
  });
  const [lookbook, setLookbook] = useState<LookbookItem[]>(() => {
    const stored = loadFromStorage<LookbookItem[] | null>(STORAGE_KEYS.lookbook, null);
    if (stored && stored.length > 0) return stored;
    return seedLookbook();
  });
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage(STORAGE_KEYS.bookings, [] as Booking[]));
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = loadFromStorage<Customer[] | null>(STORAGE_KEYS.customers, null);
    if (stored && stored.length > 0) return stored;
    // seed admin + demo customer
    return [
      { id: "cust_admin", fullName: "مدیر لیندا", name: "مدیر", phone: "09120000000", email: "admin@linda.ir", password: "admin123", avatar: "", createdAt: new Date().toISOString(), role: "admin" as const },
      { id: "cust_demo", fullName: "سارا احمدی", name: "سارا", familyName: "احمدی", phone: "09129103243", email: "sara@example.com", password: "123456", avatar: "", createdAt: new Date().toISOString(), role: "customer" as const },
    ];
  });
  const [history, setHistory] = useState<BeautyHistory[]>(() => loadFromStorage(STORAGE_KEYS.history, [] as BeautyHistory[]));
  const [media, setMedia] = useState<MediaItem[]>(() => {
    const stored = loadFromStorage<MediaItem[] | null>(STORAGE_KEYS.media, null);
    if (stored && stored.length > 0) return stored;
    // seed with public images
    const initial: MediaItem[] = [
      { id: "m1", url: "/images/hero/hero-01.jpg", filename: "hero-01.jpg", altText: "هیرو لیندا", mimeType: "image/jpeg", uploadedAt: new Date().toISOString(), usedIn: ["hero"] },
      { id: "m2", url: "/images/services/color.jpg", filename: "color.jpg", altText: "رنگ مو", mimeType: "image/jpeg", uploadedAt: new Date().toISOString(), usedIn: ["services"] },
      { id: "m3", url: "/images/services/hair.jpg", filename: "hair.jpg", altText: "مو", mimeType: "image/jpeg", uploadedAt: new Date().toISOString(), usedIn: [] },
      { id: "m4", url: "/images/about/salon-interior.jpg", filename: "salon-interior.jpg", altText: "داخل سالن", mimeType: "image/jpeg", uploadedAt: new Date().toISOString(), usedIn: [] },
      { id: "m5", url: "/images/about/brand-model.jpg", filename: "brand-model.jpg", altText: "مدل برند", mimeType: "image/jpeg", uploadedAt: new Date().toISOString(), usedIn: [] },
    ];
    return initial;
  });
  const [sections, setSections] = useState<SiteSection[]>(() => {
    const stored = loadFromStorage<SiteSection[] | null>(STORAGE_KEYS.sections, null);
    if (stored && stored.length > 0) return stored;
    return seedSections();
  });
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const stored = loadFromStorage<SiteSettings | null>(STORAGE_KEYS.settings, null);
    if (stored) return stored;
    return seedSettings();
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage(STORAGE_KEYS.notifications, [] as NotificationItem[]));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage(STORAGE_KEYS.audit, [] as AuditLog[]));

  // persist
  useEffect(() => saveToStorage(STORAGE_KEYS.categories, categories), [categories]);
  useEffect(() => saveToStorage(STORAGE_KEYS.services, services), [services]);
  useEffect(() => saveToStorage(STORAGE_KEYS.specialists, specialists), [specialists]);
  useEffect(() => saveToStorage(STORAGE_KEYS.lookbook, lookbook), [lookbook]);
  useEffect(() => saveToStorage(STORAGE_KEYS.bookings, bookings), [bookings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.customers, customers), [customers]);
  useEffect(() => saveToStorage(STORAGE_KEYS.history, history), [history]);
  useEffect(() => saveToStorage(STORAGE_KEYS.media, media), [media]);
  useEffect(() => saveToStorage(STORAGE_KEYS.sections, sections), [sections]);
  useEffect(() => saveToStorage(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => saveToStorage(STORAGE_KEYS.notifications, notifications), [notifications]);
  useEffect(() => saveToStorage(STORAGE_KEYS.audit, auditLogs), [auditLogs]);

  const logAudit = useCallback((action: string, entity: string, entityId: string, detail?: string) => {
    const entry: AuditLog = { id: uid("audit"), action, entity, entityId, detail, timestamp: new Date().toISOString() };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const addCategory = useCallback((c: Partial<ServiceCategory>) => {
    const cat: ServiceCategory = {
      id: c.id || uid("cat"),
      slug: c.slug || `cat-${Date.now()}`,
      nameFa: c.nameFa || "دسته جدید",
      nameEn: c.nameEn || "New Category",
      descriptionFa: c.descriptionFa || "",
      descriptionEn: c.descriptionEn || "",
      image: c.image || "/images/services/color.jpg",
      parentId: c.parentId ?? null,
      order: c.order ?? categories.length + 1,
      isActive: c.isActive ?? true,
    };
    setCategories((prev) => [...prev, cat]);
    logAudit("create", "category", cat.id, cat.nameFa);
  }, [categories.length, logAudit]);

  const updateCategory = useCallback((id: string, patch: Partial<ServiceCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    logAudit("update", "category", id);
  }, [logAudit]);

  const deleteCategory = useCallback((id: string) => {
    const hasServices = services.some((s) => s.categoryId === id || s.subCategoryId === id);
    const hasChildren = categories.some((c) => c.parentId === id);
    const hasLookbook = lookbook.some((l) => l.categoryId === id || l.subCategoryId === id);
    if (hasServices || hasChildren || hasLookbook) {
      return { ok: false, message: "این دسته دارای خدمات، زیردسته یا نمونه‌کار وابسته است. ابتدا آنها را منتقل یا حذف کنید." };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit("delete", "category", id);
    return { ok: true };
  }, [services, categories, lookbook, logAudit]);

  const moveCategoryOrder = useCallback((id: string, direction: "up" | "down") => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const a = sorted[idx], b = sorted[swapIdx];
      const newA = { ...a, order: b.order };
      const newB = { ...b, order: a.order };
      return prev.map((c) => {
        if (c.id === a.id) return newA;
        if (c.id === b.id) return newB;
        return c;
      });
    });
  }, []);

  const addService = useCallback((s: Partial<Service>) => {
    const svc: Service = {
      id: s.id || uid("svc"),
      slug: s.slug || `svc-${Date.now()}`,
      nameFa: s.nameFa || "خدمت جدید",
      nameEn: s.nameEn || "New Service",
      categoryId: s.categoryId || categories.find((c) => !c.parentId)?.id || "cat_hair_color",
      subCategoryId: s.subCategoryId || null,
      description: s.description || "",
      longDescription: s.longDescription || "",
      image: s.image || "/images/services/color.jpg",
      gallery: s.gallery || [],
      durationMinutes: s.durationMinutes ?? 60,
      price: s.price ?? 1000000,
      priceMax: s.priceMax ?? null,
      priceType: s.priceType || "fixed",
      depositEnabled: s.depositEnabled ?? false,
      depositType: s.depositType || "percent",
      depositValue: s.depositValue ?? 20,
      bookingEnabled: s.bookingEnabled ?? true,
      order: s.order ?? services.length + 1,
      isActive: s.isActive ?? true,
      featured: s.featured ?? false,
      specialistIds: s.specialistIds || [],
    };
    setServices((prev) => [...prev, svc]);
    logAudit("create", "service", svc.id, svc.nameFa);
  }, [categories, services.length, logAudit]);

  const updateService = useCallback((id: string, patch: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    logAudit("update", "service", id);
  }, [logAudit]);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    logAudit("delete", "service", id);
  }, [logAudit]);

  const moveServiceOrder = useCallback((id: string, dir: "up" | "down") => {
    setServices((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const a = sorted[idx], b = sorted[swapIdx];
      return prev.map((s) => {
        if (s.id === a.id) return { ...s, order: b.order };
        if (s.id === b.id) return { ...s, order: a.order };
        return s;
      });
    });
  }, []);

  const addSpecialist = useCallback((s: Partial<Specialist>) => {
    const sp: Specialist = {
      id: s.id || uid("sp"),
      name: s.name || "متخصص جدید",
      role: s.role || "متخصص",
      bio: s.bio || "",
      image: s.image || "/images/about/brand-model.jpg",
      categoryIds: s.categoryIds || [],
      isActive: s.isActive ?? true,
      workingHours: s.workingHours || [
        { dayOfWeek: 0, isWorking: true, start: "09:00", end: "19:00" },
        { dayOfWeek: 1, isWorking: true, start: "09:00", end: "19:00" },
        { dayOfWeek: 2, isWorking: true, start: "09:00", end: "19:00" },
        { dayOfWeek: 3, isWorking: true, start: "09:00", end: "19:00" },
        { dayOfWeek: 4, isWorking: true, start: "09:00", end: "19:00" },
        { dayOfWeek: 5, isWorking: true, start: "09:00", end: "14:00" },
        { dayOfWeek: 6, isWorking: false, start: "09:00", end: "14:00" },
      ],
      capacityPerSlot: s.capacityPerSlot ?? 1,
    };
    setSpecialists((prev) => [...prev, sp]);
    logAudit("create", "specialist", sp.id);
  }, [logAudit]);

  const updateSpecialist = useCallback((id: string, patch: Partial<Specialist>) => {
    setSpecialists((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    logAudit("update", "specialist", id);
  }, [logAudit]);

  const deleteSpecialist = useCallback((id: string) => {
    setSpecialists((prev) => prev.filter((s) => s.id !== id));
    logAudit("delete", "specialist", id);
  }, [logAudit]);

  const addLookbook = useCallback((l: Partial<LookbookItem>) => {
    const item: LookbookItem = {
      id: l.id || uid("lb"),
      titleFa: l.titleFa || "نمونه‌کار جدید",
      description: l.description || "",
      categoryId: l.categoryId || categories[0]?.id || "cat_hair_color",
      subCategoryId: l.subCategoryId || null,
      serviceId: l.serviceId || null,
      serviceName: l.serviceName || "",
      beforeImage: l.beforeImage || "/images/hero/hero-01.jpg",
      afterImage: l.afterImage || "/images/services/color.jpg",
      featured: l.featured ?? false,
      isActive: l.isActive ?? true,
      order: l.order ?? lookbook.length + 1,
      createdAt: new Date().toISOString(),
    };
    setLookbook((prev) => [...prev, item]);
    logAudit("create", "lookbook", item.id);
  }, [categories, lookbook.length, logAudit]);

  const updateLookbook = useCallback((id: string, patch: Partial<LookbookItem>) => {
    setLookbook((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    logAudit("update", "lookbook", id);
  }, [logAudit]);

  const deleteLookbook = useCallback((id: string) => {
    setLookbook((prev) => prev.filter((l) => l.id !== id));
    logAudit("delete", "lookbook", id);
  }, [logAudit]);

  const getAvailableSlots = useCallback((date: string, specialistId: string) => {
    const booked = bookings
      .filter((b) => b.date === date && b.specialistId === specialistId && !["cancelled", "rejected"].includes(b.status))
      .map((b) => b.timeSlot);
    const sp = specialists.find((s) => s.id === specialistId);
    const capacity = sp?.capacityPerSlot ?? 1;
    // count bookings per slot
    const counts: Record<string, number> = {};
    bookings
      .filter((b) => b.date === date && b.specialistId === specialistId && !["cancelled", "rejected"].includes(b.status))
      .forEach((b) => {
        counts[b.timeSlot] = (counts[b.timeSlot] || 0) + 1;
      });
    return TIME_SLOTS.filter((slot) => (counts[slot] || 0) < capacity);
  }, [bookings, specialists]);

  const createBooking = useCallback((b: Omit<Booking, "id" | "createdAt" | "updatedAt">) => {
    // atomic capacity check
    const counts: Record<string, number> = {};
    bookings
      .filter((x) => x.date === b.date && x.specialistId === b.specialistId && !["cancelled", "rejected"].includes(x.status))
      .forEach((x) => {
        counts[x.timeSlot] = (counts[x.timeSlot] || 0) + 1;
      });
    const sp = specialists.find((s) => s.id === b.specialistId);
    const cap = sp?.capacityPerSlot ?? 1;
    if ((counts[b.timeSlot] || 0) >= cap) {
      return { ok: false, message: "این بازه زمانی توسط متخصص رزرو شده است. لطفاً ساعت دیگری انتخاب کنید." };
    }
    const booking: Booking = {
      ...b,
      id: uid("bk"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBookings((prev) => [booking, ...prev]);
    // notification for customer
    const notif: NotificationItem = {
      id: uid("notif"),
      customerId: b.customerId,
      title: "رزرو ثبت شد",
      message: `رزرو شما برای ${b.jalaliDate} ساعت ${b.timeSlot} ثبت شد و در انتظار تأیید است.`,
      read: false,
      createdAt: new Date().toISOString(),
      type: "booking",
    };
    setNotifications((prev) => [notif, ...prev]);
    logAudit("create", "booking", booking.id);
    return { ok: true, booking };
  }, [bookings, specialists, logAudit]);

  const updateBookingStatus = useCallback((id: string, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b)));
    logAudit("update", "booking", id, `status -> ${status}`);
  }, [logAudit]);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b)));
    logAudit("update", "booking", id);
  }, [logAudit]);

  const deleteBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    logAudit("delete", "booking", id);
  }, [logAudit]);

  const addCustomer = useCallback((c: Customer) => {
    setCustomers((prev) => [...prev, c]);
  }, []);

  const addCustomerNote = useCallback((customerId: string, note: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, notes: note } : c)));
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const addHistory = useCallback((h: Omit<BeautyHistory, "id">) => {
    const item: BeautyHistory = { ...h, id: uid("hist") };
    setHistory((prev) => [item, ...prev]);
    logAudit("create", "history", item.id);
  }, [logAudit]);

  const addMedia = useCallback((m: Omit<MediaItem, "id" | "uploadedAt">) => {
    const item: MediaItem = { ...m, id: uid("media"), uploadedAt: new Date().toISOString() };
    setMedia((prev) => [item, ...prev]);
  }, []);

  const updateMedia = useCallback((id: string, patch: Partial<MediaItem>) => {
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const deleteMedia = useCallback((id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<SiteSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    logAudit("update", "section", id);
  }, [logAudit]);

  const addSection = useCallback((s: Partial<SiteSection>) => {
    const sec: SiteSection = {
      id: s.id || uid("sec"),
      key: s.key || `sec_${Date.now()}`,
      titleFa: s.titleFa || "سکشن جدید",
      subtitle: s.subtitle || "",
      description: s.description || "",
      image: s.image || "",
      video: s.video || "",
      buttonText: s.buttonText || "",
      buttonLink: s.buttonLink || "",
      order: s.order ?? sections.length + 1,
      isActive: s.isActive ?? true,
      mode: s.mode || "both",
    };
    setSections((prev) => [...prev, sec]);
    logAudit("create", "section", sec.id);
  }, [sections.length, logAudit]);

  const deleteSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    logAudit("delete", "section", id);
  }, [logAudit]);

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    logAudit("update", "settings", "global");
  }, [logAudit]);

  const reorderSections = useCallback((orderedIds: string[]) => {
    setSections((prev) => {
      const map = new Map(prev.map((s) => [s.id, s]));
      return orderedIds.map((id, idx) => {
        const s = map.get(id);
        if (!s) return null as any;
        return { ...s, order: idx + 1 };
      }).filter(Boolean);
    });
  }, []);

  const getCategoryTree = useCallback(() => categories.slice().sort((a, b) => a.order - b.order), [categories]);
  const getServicesByCategory = useCallback((catId: string) => services.filter((s) => s.categoryId === catId || s.subCategoryId === catId).sort((a,b)=>a.order-b.order), [services]);
  const getCategoryById = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);
  const getServiceById = useCallback((id: string) => services.find((s) => s.id === id), [services]);
  const getBookingsByCustomer = useCallback((customerId: string) => bookings.filter((b) => b.customerId === customerId).sort((a,b)=> b.createdAt.localeCompare(a.createdAt)), [bookings]);

  const refresh = useCallback(() => {
    // force re-read from storage (for preview etc)
    setCategories(loadFromStorage(STORAGE_KEYS.categories, seedCategories()));
  }, []);

  const value = useMemo<DataContextValue>(() => ({
    categories, services, specialists, lookbook, bookings, customers, history, media, sections, settings, notifications, auditLogs,
    addCategory, updateCategory, deleteCategory, moveCategoryOrder,
    addService, updateService, deleteService, moveServiceOrder,
    addSpecialist, updateSpecialist, deleteSpecialist,
    addLookbook, updateLookbook, deleteLookbook,
    createBooking, updateBookingStatus, updateBooking, deleteBooking, getAvailableSlots,
    addCustomer, addCustomerNote, updateCustomer, addHistory,
    addMedia, updateMedia, deleteMedia,
    updateSection, addSection, deleteSection, updateSettings, reorderSections,
    getCategoryTree, getServicesByCategory, getCategoryById, getServiceById, getBookingsByCustomer,
    refresh,
  }), [
    categories, services, specialists, lookbook, bookings, customers, history, media, sections, settings, notifications, auditLogs,
    addCategory, updateCategory, deleteCategory, moveCategoryOrder,
    addService, updateService, deleteService, moveServiceOrder,
    addSpecialist, updateSpecialist, deleteSpecialist,
    addLookbook, updateLookbook, deleteLookbook,
    createBooking, updateBookingStatus, updateBooking, deleteBooking, getAvailableSlots,
    addCustomer, addCustomerNote, updateCustomer, addHistory,
    addMedia, updateMedia, deleteMedia,
    updateSection, addSection, deleteSection, updateSettings, reorderSections,
    getCategoryTree, getServicesByCategory, getCategoryById, getServiceById, getBookingsByCustomer, refresh
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
