import type { LookbookItem, Service, ServiceCategory, Specialist, SiteSection, SiteSettings } from "@/types";
import { IMAGES } from "@/data/salon";

export function seedCategories(): ServiceCategory[] {
  const cats: Omit<ServiceCategory, "order">[] = [
    {
      id: "cat_hair_color",
      slug: "hair-color",
      nameFa: "رنگ مو",
      nameEn: "Hair Color",
      descriptionFa: "بالیاژ، آمبره، هایلایت و ترمیم تخصصی رنگ با متد روز دنیا",
      descriptionEn: "Balayage, ombre and color correction",
      image: IMAGES.color,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_hair_cut",
      slug: "hair-cut",
      nameFa: "کوتاهی اختصاصی",
      nameEn: "Hair Cut",
      descriptionFa: "طراحی کوتاهی بر اساس فرم چهره و استایل شخصی شما",
      descriptionEn: "Bespoke cuts tailored to face shape",
      image: IMAGES.hair,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_hair_styling",
      slug: "hair-styling",
      nameFa: "شنیون و استایل مو",
      nameEn: "Hair Styling",
      descriptionFa: "شنیون عروس، استایل ادیتوریال و براشینگ حرفه‌ای",
      descriptionEn: "Bridal updos and editorial styling",
      image: IMAGES.brandModel,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_braids",
      slug: "studio-braids",
      nameFa: "بافت مو",
      nameEn: "Studio Braids",
      descriptionFa: "بافت‌های آفریقایی، هلندی و فانتزی با ماندگاری بالا",
      descriptionEn: "Protective and fashion braids",
      image: IMAGES.hair,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_nail",
      slug: "nail",
      nameFa: "ناخن",
      nameEn: "Nail",
      descriptionFa: "مانیکور، کاشت ژل، طراحی و ترمیم ناخن",
      descriptionEn: "Manicure, gel extensions, art",
      image: IMAGES.nails,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_lash_line",
      slug: "lash-line",
      nameFa: "بن مژه و خط چشم دائم",
      nameEn: "Lash Line",
      descriptionFa: "بن مژه ظریف و خط چشم دائم با ماندگاری بالا",
      descriptionEn: "Permanent eyeliner and lash line enhancement",
      image: IMAGES.makeup,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_lip_blush",
      slug: "lip-blush",
      nameFa: "شیدینگ و رژ لب دائم",
      nameEn: "Lip Blush",
      descriptionFa: "شیدینگ لب، کانتور و رژ لب دائم با پیگمنت ارگانیک",
      descriptionEn: "Lip blush and contour",
      image: IMAGES.portrait,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_brow_pigmentation",
      slug: "brow-pigmentation",
      nameFa: "لاین تخصصی پیگمنتیشن ابرو",
      nameEn: "Brow Pigmentation",
      descriptionFa: "کامل‌ترین لاین پیگمنتیشن ابرو با تکنیک‌های روز دنیا",
      descriptionEn: "Advanced brow pigmentation atelier",
      image: IMAGES.makeup,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_lash_lift",
      slug: "lash-lift",
      nameFa: "لیفت مژه",
      nameEn: "Lash Lift",
      descriptionFa: "لیفت، لمینت و کراتینه مژه برای فر طبیعی و جذاب",
      descriptionEn: "Lash lift and lamination",
      image: IMAGES.makeup,
      parentId: null,
      isActive: true,
    },
    {
      id: "cat_lash_ext",
      slug: "lash-extension",
      nameFa: "اکستنشن مژه",
      nameEn: "Lash Extension",
      descriptionFa: "اکستنشن کلاسیک، والیوم و مگاوالیوم",
      descriptionEn: "Classic, volume and mega volume extensions",
      image: IMAGES.makeup,
      parentId: null,
      isActive: true,
    },
  ];

  const subCats: Omit<ServiceCategory, "order">[] = [
    { id: "sub_phi_brows", slug: "phibrows", nameFa: "فیبروز ابرو", nameEn: "PhiBrows", descriptionFa: "فیبروز با متد آکادمی فی", descriptionEn: "PhiBrows technique", image: IMAGES.makeup, parentId: "cat_brow_pigmentation", isActive: true },
    { id: "sub_microblading", slug: "microblading", nameFa: "میکروبلیدینگ", nameEn: "Microblading", descriptionFa: "میکروبلیدینگ دستی با ظرافت تار به تار", descriptionEn: "Handmade microblading", image: IMAGES.makeup, parentId: "cat_brow_pigmentation", isActive: true },
    { id: "sub_machine_brows", slug: "machine-brows", nameFa: "میکرو ابرو با دستگاه", nameEn: "Machine Brows", descriptionFa: "اجرای دقیق با دستگاه دیجیتال", descriptionEn: "Digital machine brows", image: IMAGES.makeup, parentId: "cat_brow_pigmentation", isActive: true },
    { id: "sub_brow_shading", slug: "brow-shading", nameFa: "شیدینگ ابرو", nameEn: "Brow Shading", descriptionFa: "سایه پودری نرم و طبیعی", descriptionEn: "Powder shading", image: IMAGES.portrait, parentId: "cat_brow_pigmentation", isActive: true },
    { id: "sub_nano_brows", slug: "nano-brows", nameFa: "نانو بروز", nameEn: "Nano Brows", descriptionFa: "تارهای نانویی فوق ظریف با ماندگاری بالا", descriptionEn: "Ultra-fine nano strokes", image: IMAGES.portrait, parentId: "cat_brow_pigmentation", isActive: true },
    { id: "sub_combination", slug: "combination-brows", nameFa: "تکنیک ترکیبی ابرو", nameEn: "Combination Brows", descriptionFa: "ترکیب میکروبلیدینگ و شیدینگ", descriptionEn: "Microblading + shading combo", image: IMAGES.makeup, parentId: "cat_brow_pigmentation", isActive: true },
  ];

  const all = [...cats, ...subCats].map((c, idx) => ({ ...c, order: idx + 1 }));
  return all;
}

export function seedServices(): Service[] {
  const services: Service[] = [
    // Hair Color
    { id: "svc_bal", slug: "balayage", nameFa: "بالیاژ فرانسوی", nameEn: "French Balayage", categoryId: "cat_hair_color", description: "نورپردازی دست‌ساز با تون سرد یا گرم بر اساس رنگ پوست", longDescription: "بالیاژ امضای لیندا با تکنیک air-touch و فویل‌لس برای رشد طبیعی.", image: IMAGES.color, gallery: [IMAGES.color, IMAGES.hair], durationMinutes: 180, price: 4500000, priceType: "range", priceMax: 6500000, depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 1, isActive: true, featured: true },
    { id: "svc_color_full", slug: "full-color", nameFa: "رنگ کامل", nameEn: "Full Color", categoryId: "cat_hair_color", description: "پوشش یکدست با کالر تاچ و گلاس پایانی", image: IMAGES.color, gallery: [IMAGES.color], durationMinutes: 120, price: 2800000, priceType: "fixed", depositEnabled: false, depositType: "percent", depositValue: 15, bookingEnabled: true, order: 2, isActive: true },
    { id: "svc_omb", slug: "ombre", nameFa: "آمبره و سامبره", nameEn: "Ombre", categoryId: "cat_hair_color", description: "گرادیانت نرم از تیره به روشن", image: IMAGES.color, gallery: [IMAGES.color], durationMinutes: 210, price: 5200000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 3, isActive: true },
    { id: "svc_highlight", slug: "highlight", nameFa: "هایلایت و لولایت", nameEn: "Highlights", categoryId: "cat_hair_color", description: "هایلایت ریز برای حجم و عمق", image: IMAGES.color, gallery: [IMAGES.color], durationMinutes: 150, price: 3800000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 4, isActive: true },

    // Hair Cut
    { id: "svc_cut_w", slug: "cut-women", nameFa: "کوتاهی بانوان", nameEn: "Women's Cut", categoryId: "cat_hair_cut", description: "مشاوره، کوتاهی و فینیش ابریشمی", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 60, price: 1200000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 200000, bookingEnabled: true, order: 5, isActive: true, featured: true },
    { id: "svc_cut_m", slug: "cut-men", nameFa: "کوتاهی آقایان (در بخش VIP)", nameEn: "Gentleman Cut", categoryId: "cat_hair_cut", description: "فید، کات کلاسیک و استایل", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 45, price: 800000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 6, isActive: true },
    { id: "svc_bangs", slug: "bangs", nameFa: "چتری و فریم", nameEn: "Fringe Design", categoryId: "cat_hair_cut", description: "طراحی چتری متناسب با فرم صورت", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 30, price: 500000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 7, isActive: true },

    // Hair Styling
    { id: "svc_bridal_hair", slug: "bridal-hair", nameFa: "شنیون عروس", nameEn: "Bridal Updo", categoryId: "cat_hair_styling", description: "شنیون تخصصی با پرو و اکسسوری", image: IMAGES.bridal, gallery: [IMAGES.bridal], durationMinutes: 120, price: 6000000, priceType: "range", priceMax: 8500000, depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 8, isActive: true, featured: true },
    { id: "svc_styling", slug: "styling", nameFa: "براشینگ و استایل", nameEn: "Blowout & Style", categoryId: "cat_hair_styling", description: "موج، حجم و فرم ادیتوریال", image: IMAGES.brandModel, gallery: [IMAGES.brandModel], durationMinutes: 45, price: 900000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 9, isActive: true },
    { id: "svc_keratin", slug: "keratin", nameFa: "کراتین و احیا", nameEn: "Keratin Treatment", categoryId: "cat_hair_styling", description: "احیا و صافی با مواد اورجینال", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 180, price: 5000000, priceType: "range", priceMax: 8000000, depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 10, isActive: true },

    // Braids
    { id: "svc_box_braids", slug: "box-braids", nameFa: "بافت باکس", nameEn: "Box Braids", categoryId: "cat_braids", description: "بافت آفریقایی با موی اضافه", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 240, price: 3500000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 25, bookingEnabled: true, order: 11, isActive: true },
    { id: "svc_cornrows", slug: "cornrows", nameFa: "بافت کف سر", nameEn: "Cornrows", categoryId: "cat_braids", description: "کورنرو با طراحی هندسی", image: IMAGES.hair, gallery: [IMAGES.hair], durationMinutes: 90, price: 1800000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 12, isActive: true },

    // Nail
    { id: "svc_gel_ext", slug: "gel-extension", nameFa: "کاشت ژل", nameEn: "Gel Extension", categoryId: "cat_nail", description: "کاشت ژل با فرم دلخواه", image: IMAGES.nails, gallery: [IMAGES.nails], durationMinutes: 90, price: 1500000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 13, isActive: true, featured: true },
    { id: "svc_manicure", slug: "manicure", nameFa: "مانیکور روسی", nameEn: "Russian Manicure", categoryId: "cat_nail", description: "مانیکور دقیق با ابزار روسی", image: IMAGES.nails, gallery: [IMAGES.nails], durationMinutes: 60, price: 800000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 14, isActive: true },
    { id: "svc_nail_art", slug: "nail-art", nameFa: "طراحی ناخن", nameEn: "Nail Art", categoryId: "cat_nail", description: "دیزاین مینیمال تا فانتزی", image: IMAGES.nails, gallery: [IMAGES.nails], durationMinutes: 45, price: 600000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 15, isActive: true },

    // Lash Line
    { id: "svc_ben_moje", slug: "lash-line-enhancement", nameFa: "بن مژه", nameEn: "Lash Line Enhancement", categoryId: "cat_lash_line", description: "تقویت خط مژه با پیگمنت طبیعی", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 90, price: 3500000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 16, isActive: true },
    { id: "svc_eyeliner", slug: "permanent-eyeliner", nameFa: "خط چشم دائم", nameEn: "Permanent Eyeliner", categoryId: "cat_lash_line", description: "خط چشم کلاسیک و دنباله‌دار", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 120, price: 4500000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 17, isActive: true },

    // Lip Blush
    { id: "svc_lip_blush", slug: "lip-blush-service", nameFa: "شیدینگ لب", nameEn: "Lip Blush", categoryId: "cat_lip_blush", description: "رژ لب دائم با طیف نود تا رزی", image: IMAGES.portrait, gallery: [IMAGES.portrait], durationMinutes: 120, price: 5000000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 18, isActive: true },
    { id: "svc_lip_contour", slug: "lip-contour", nameFa: "کانتور لب", nameEn: "Lip Contour", categoryId: "cat_lip_blush", description: "مرز لب دقیق و حجم‌دهی", image: IMAGES.portrait, gallery: [IMAGES.portrait], durationMinutes: 90, price: 4000000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 25, bookingEnabled: true, order: 19, isActive: true },

    // Brow Pigmentation - 6 techniques
    { id: "svc_phi_brows", slug: "phi-brows-service", nameFa: "فیبروز ابرو", nameEn: "PhiBrows", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_phi_brows", description: "تار مویی فیبروز با سوزن نانو", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 120, price: 5500000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 20, isActive: true, featured: true },
    { id: "svc_microblade", slug: "microblading-service", nameFa: "میکروبلیدینگ", nameEn: "Microblading", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_microblading", description: "میکروبلیدینگ کلاسیک", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 120, price: 4800000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 21, isActive: true },
    { id: "svc_machine", slug: "machine-brows-service", nameFa: "میکرو ابرو با دستگاه", nameEn: "Machine Brows", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_machine_brows", description: "پودر بروز با دستگاه", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 90, price: 4200000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 25, bookingEnabled: true, order: 22, isActive: true },
    { id: "svc_shading", slug: "brow-shading-service", nameFa: "شیدینگ ابرو", nameEn: "Brow Shading", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_brow_shading", description: "سایه ابرو مخملی", image: IMAGES.portrait, gallery: [IMAGES.portrait], durationMinutes: 90, price: 4000000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 25, bookingEnabled: true, order: 23, isActive: true },
    { id: "svc_nano", slug: "nano-brows-service", nameFa: "نانو بروز", nameEn: "Nano Brows", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_nano_brows", description: "نانو استروک فوق ظریف", image: IMAGES.portrait, gallery: [IMAGES.portrait], durationMinutes: 150, price: 6000000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 24, isActive: true, featured: true },
    { id: "svc_combo", slug: "combo-brows-service", nameFa: "تکنیک ترکیبی ابرو", nameEn: "Combination Brows", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_combination", description: "ترکیب تار و سایه برای عمق طبیعی", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 150, price: 5800000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 30, bookingEnabled: true, order: 25, isActive: true, featured: true },

    // Lash Lift
    { id: "svc_lash_lift", slug: "lash-lift-service", nameFa: "لیفت مژه", nameEn: "Lash Lift", categoryId: "cat_lash_lift", description: "فر مژه با کراتین", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 60, price: 1500000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 26, isActive: true },
    { id: "svc_lash_laminate", slug: "lash-lamination", nameFa: "لمینت مژه", nameEn: "Lash Lamination", categoryId: "cat_lash_lift", description: "لمینت و رنگ مژه", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 75, price: 1800000, priceType: "fixed", depositEnabled: false, depositType: "fixed", depositValue: 0, bookingEnabled: true, order: 27, isActive: true },

    // Lash Extension
    { id: "svc_classic_ext", slug: "classic-extension", nameFa: "اکستنشن کلاسیک", nameEn: "Classic Extension", categoryId: "cat_lash_ext", description: "تار به تار طبیعی", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 90, price: 2000000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 28, isActive: true },
    { id: "svc_volume_ext", slug: "volume-extension", nameFa: "اکستنشن والیوم", nameEn: "Volume Extension", categoryId: "cat_lash_ext", description: "فن 3D تا 6D", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 120, price: 2800000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 20, bookingEnabled: true, order: 29, isActive: true },
    { id: "svc_mega_ext", slug: "mega-volume", nameFa: "مگاوالیوم", nameEn: "Mega Volume", categoryId: "cat_lash_ext", description: "پر و مخملی", image: IMAGES.makeup, gallery: [IMAGES.makeup], durationMinutes: 150, price: 3500000, priceType: "fixed", depositEnabled: true, depositType: "percent", depositValue: 25, bookingEnabled: true, order: 30, isActive: true },
  ];
  return services;
}

export function seedSpecialists(): Specialist[] {
  const makeHours = (offDays: number[] = []): any => {
    // Persian week: Sat(0)-Fri(6) mapped to JS: need mapping
    // Specialist works Sat-Wed 09-18, Thu 09-14, Fri off
    return [0, 1, 2, 3, 4, 5, 6].map((d) => {
      if (offDays.includes(d)) return { dayOfWeek: d, isWorking: false, start: "09:00", end: "18:00" };
      if (d === 6) return { dayOfWeek: d, isWorking: false, start: "09:00", end: "18:00" }; // Friday off
      if (d === 5) return { dayOfWeek: d, isWorking: true, start: "09:00", end: "14:00" }; // Thursday half
      return { dayOfWeek: d, isWorking: true, start: "09:00", end: "19:00" };
    });
  };

  return [
    { id: "sp_1", name: "لیندا جعفرپناه", role: "موسس و مدیر هنری", bio: "بنیان‌گذار لیندا، متخصص پیگمنتیشن و رنگ با ۱۵ سال تجربه بین‌المللی.", image: IMAGES.brandModel, categoryIds: ["cat_brow_pigmentation", "cat_hair_color", "cat_lash_line", "cat_lip_blush"], isActive: true, workingHours: makeHours(), capacityPerSlot: 1 },
    { id: "sp_2", name: "سارا رحیمی", role: "آتلیه رنگ", bio: "بالیاژ و لایت تخصصی، مدرس بین‌المللی رنگ.", image: IMAGES.color, categoryIds: ["cat_hair_color", "cat_hair_styling"], isActive: true, workingHours: makeHours([0]), capacityPerSlot: 1 },
    { id: "sp_3", name: "نگار عباسی", role: "استایلیست مو", bio: "کوتاهی و شنیون عروس، برنده جشنواره استایل ۱۴۰۲.", image: IMAGES.hair, categoryIds: ["cat_hair_cut", "cat_hair_styling", "cat_braids"], isActive: true, workingHours: makeHours(), capacityPerSlot: 1 },
    { id: "sp_4", name: "آوا کریمی", role: "ناخن و مژه", bio: "ناخن‌کار حرفه‌ای و مژه‌کار والیوم.", image: IMAGES.nails, categoryIds: ["cat_nail", "cat_lash_ext", "cat_lash_lift"], isActive: true, workingHours: makeHours(), capacityPerSlot: 2 },
  ];
}

export function seedLookbook(): LookbookItem[] {
  return [
    { id: "lb_1", titleFa: "بالیاژ عسلی", description: "تبدیل موی تیره به بالیاژ عسلی گرم", categoryId: "cat_hair_color", serviceName: "بالیاژ فرانسوی", serviceId: "svc_bal", mediaType: "beforeAfter", beforeImage: IMAGES.hair, afterImage: IMAGES.color, featured: true, isActive: true, order: 1, createdAt: new Date().toISOString() },
    { id: "lb_2", titleFa: "کوتاهی لیر", description: "کوتاهی لایه‌ای با فریم صورت", categoryId: "cat_hair_cut", serviceName: "کوتاهی بانوان", serviceId: "svc_cut_w", mediaType: "beforeAfter", beforeImage: IMAGES.brandModel, afterImage: IMAGES.hair, featured: false, isActive: true, order: 2, createdAt: new Date().toISOString() },
    { id: "lb_3", titleFa: "شنیون عروس", description: "شنیون کلاسیک با تاج مروارید", categoryId: "cat_hair_styling", serviceName: "شنیون عروس", serviceId: "svc_bridal_hair", mediaType: "single", image: IMAGES.bridal, featured: true, isActive: true, order: 3, createdAt: new Date().toISOString() },
    { id: "lb_4", titleFa: "فیبروز طبیعی", description: "فیبروز ابرو با تار نانو", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_phi_brows", serviceName: "فیبروز ابرو", serviceId: "svc_phi_brows", mediaType: "beforeAfter", beforeImage: IMAGES.portrait, afterImage: IMAGES.makeup, featured: true, isActive: true, order: 4, createdAt: new Date().toISOString() },
    { id: "lb_5", titleFa: "ترکیب ابرو", description: "کامبینیشن بروز با شیدینگ", categoryId: "cat_brow_pigmentation", subCategoryId: "sub_combination", serviceName: "تکنیک ترکیبی", serviceId: "svc_combo", mediaType: "beforeAfter", beforeImage: IMAGES.portrait, afterImage: IMAGES.makeup, featured: false, isActive: true, order: 5, createdAt: new Date().toISOString() },
    { id: "lb_6", titleFa: "مانیکور شامپاین", description: "کاشت ژل با طراحی مینیمال", categoryId: "cat_nail", serviceName: "کاشت ژل", serviceId: "svc_gel_ext", mediaType: "single", image: IMAGES.nails, featured: false, isActive: true, order: 6, createdAt: new Date().toISOString() },
    { id: "lb_7", titleFa: "بن مژه ویدیو", description: "آموزش مراقبت بن مژه — ویدیو کوتاه", categoryId: "cat_lash_line", serviceName: "بن مژه", serviceId: "svc_ben_moje", mediaType: "video", videoUrl: "/cinematic2.mp4", videoThumbnail: IMAGES.makeup, featured: true, isActive: true, order: 7, createdAt: new Date().toISOString() },
    { id: "lb_8", titleFa: "رژ لب دائم", description: "شیدینگ لب نود — تک تصویر", categoryId: "cat_lip_blush", serviceName: "شیدینگ لب", serviceId: "svc_lip_blush", mediaType: "single", image: IMAGES.portrait, featured: false, isActive: true, order: 8, createdAt: new Date().toISOString() },
    { id: "lb_9", titleFa: "لیفت مژه", description: "لیفت و لمینت مژه — قبل و بعد", categoryId: "cat_lash_lift", serviceName: "لیفت مژه", serviceId: "svc_lash_lift", mediaType: "beforeAfter", beforeImage: IMAGES.makeup, afterImage: IMAGES.makeup, featured: false, isActive: true, order: 9, createdAt: new Date().toISOString() },
    { id: "lb_10", titleFa: "اکستنشن والیوم", description: "والیوم 4D — تک تصویر ویژه", categoryId: "cat_lash_ext", serviceName: "اکستنشن والیوم", serviceId: "svc_volume_ext", mediaType: "single", image: IMAGES.brandModel, featured: true, isActive: true, order: 10, createdAt: new Date().toISOString() },
    { id: "lb_11", titleFa: "رنگ مو ویدیو", description: "پروسه بالیاژ از نزدیک — ویدیو", categoryId: "cat_hair_color", serviceName: "بالیاژ", serviceId: "svc_bal", mediaType: "video", videoUrl: "/cinematic2.mp4", videoThumbnail: IMAGES.color, featured: false, isActive: true, order: 11, createdAt: new Date().toISOString() },
    { id: "lb_12", titleFa: "بافت هلندی", description: "بافت کف سر هلندی — تک تصویر", categoryId: "cat_braids", serviceName: "بافت کف سر", serviceId: "svc_cornrows", mediaType: "single", image: IMAGES.hair, featured: false, isActive: true, order: 12, createdAt: new Date().toISOString() },
  ];
}

export function seedSections(): SiteSection[] {
  return [
    { id: "sec_hero", key: "hero", titleFa: "زیبایی، از نو تعریف می‌شود.", subtitle: "آرامش زیبایی تهران", description: "مزونی خصوصی برای مو، رنگ، پوست و میکاپ؛ هر سیتینگ با آرامش و نگاه ادیتوریال.", image: IMAGES.hero, video: "/cinematic2.mp4", buttonText: "رزرو نوبت", buttonLink: "#booking", order: 1, isActive: true, mode: "both" },
    { id: "sec_about", key: "about", titleFa: "جایی که زیبایی به یک تجربه تبدیل می‌شود", subtitle: "مزون", description: "لیندا یک سالن معمولی نیست؛ تئاتری آرام از نور، بافت و مراقبت است.", image: IMAGES.brandModel, order: 2, isActive: true, mode: "both" },
    { id: "sec_atelier", key: "atelier", titleFa: "آتلیه خدمات", subtitle: "۱۰ تخصص، یک زبان مشترک", description: "هر سیتینگ طراحی می‌شود و به سمت کاتالوگ شتاب نمی‌کند.", order: 3, isActive: true, mode: "both" },
    { id: "sec_lookbook", key: "lookbook", titleFa: "لُک‌بوک", subtitle: "نمونه‌کارهای ما", description: "مقایسه قبل و بعد با اسلایدر تعاملی.", order: 4, isActive: true, mode: "both" },
    { id: "sec_journey", key: "journey", titleFa: "از رزرو تا زیبایی", subtitle: "مسیر", description: "۵ قدم تا تجربه لیندا", order: 5, isActive: true, mode: "both" },
  ];
}

export function seedSettings(): SiteSettings {
  return {
    brandName: "مرکز زیبایی لیندا جعفرپناه",
    brandShort: "لیندا",
    tagline: "زیبایی، از نو تعریف می‌شود.",
    statement: "جایی که زیبایی به یک تجربه تبدیل می‌شود",
    city: "تهران",
    location: "فلکه دوم صادقیه، بلوار آیت‌الله کاشانی، بعد از بلوار اباذر، نرسیده به مهران، روبروی بوستان یاران، جنب کاشی ایفا، ساختمان راز، پلاک ۶۱، بلوک A، طبقه ۴، واحد ۴۰۴",
    locationShort: "تهران، صادقیه، بلوار کاشانی، ساختمان راز، واحد ۴۰۴",
    phones: [
      { label: "تلفن ثابت", value: "021-44929913", tel: "+982144929913" },
      { label: "موبایل / مشاوره", value: "09129103243", tel: "+989129103243" },
      { label: "واتساپ", value: "09190151591", tel: "+989190151591", wa: "989190151591" },
    ],
    whatsapp: "989190151591",
    whatsappDisplay: "09190151591",
    mapsQuery: "مرکز زیبایی لیندا جعفرپناه ساختمان راز تهران صادقیه",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/linda.beauty", icon: "instagram" },
      { platform: "whatsapp", url: "https://wa.me/989190151591", icon: "whatsapp" },
      { platform: "telegram", url: "https://t.me/linda", icon: "telegram" },
    ],
    currency: "TOMAN",
    depositGlobalEnabled: true,
    depositGlobalType: "percent",
    depositGlobalValue: 20,
    workingHoursNote: "شنبه تا چهارشنبه ۹ تا ۱۹، پنج‌شنبه ۹ تا ۱۴، جمعه تعطیل",
    holidays: [],
    seoTitle: "مرکز زیبایی لیندا جعفرپناه — زیبایی، از نو تعریف می‌شود",
    seoDescription: "آتلیه‌ای خصوصی برای مو، رنگ، میکاپ، عروس و مراقبت پوست در تهران، صادقیه.",
  };
}
