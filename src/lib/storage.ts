export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export const STORAGE_KEYS = {
  categories: "salon_categories_v2",
  services: "salon_services_v2",
  specialists: "salon_specialists_v2",
  lookbook: "salon_lookbook_v2",
  bookings: "salon_bookings_v2",
  customers: "salon_customers_v2",
  history: "salon_history_v2",
  media: "salon_media_v2",
  sections: "salon_sections_v2",
  settings: "salon_settings_v2",
  notifications: "salon_notifications_v2",
  audit: "salon_audit_v2",
  auth: "salon_auth_v2",
  cmsContent: "salon_cms_v2",
};
