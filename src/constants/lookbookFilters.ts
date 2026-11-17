import type { LookbookMediaType } from "@/types";

export const MEDIA_TYPE_LABEL: Record<LookbookMediaType, string> = {
  single: "تک‌عکس",
  beforeAfter: "قبل / بعد",
  video: "ویدیو",
};

export const LOOKBOOK_FILTERS: { id: "" | LookbookMediaType; label: string }[] = [
  { id: "", label: "همه" },
  { id: "single", label: "تک‌عکس" },
  { id: "beforeAfter", label: "قبل / بعد" },
  { id: "video", label: "ویدیو" },
];
