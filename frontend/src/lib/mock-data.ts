import type { Hall, Booking, Review, User, Catering, Decoration, Car, Music, Service } from "./types";

export const currentUser = {
  customer: { id: "u1", name: "أحمد الخطيب", role: "customer" as const },
  owner: { id: "u2", name: "صاحب القاعة - سامر ناصر", role: "hall_owner" as const },
  admin: { id: "u3", name: "مدير المنصة", role: "admin" as const },
};

export const halls: Hall[] = [
  {
    id: "h1",
    owner_id: "u2",
    name: "قاعة روز",
    address: "المزة، شارع الوادي",
    city: "دمشق",
    postcode: "12210",
    price_per_person: 25000,
    min_capacity: 100,
    max_capacity: 500,
    contact: "+963988000111",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470753323753-3f8091bb0232?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop",
    ],
    rating: 4.8,
    status: "active",
  },
  {
    id: "h2",
    owner_id: "u2",
    name: "قاعة الماسة",
    address: "أبو رمانة، شارع الجلاء",
    city: "دمشق",
    postcode: "12100",
    price_per_person: 35000,
    min_capacity: 150,
    max_capacity: 600,
    contact: "+963988000222",
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop",
    ],
    rating: 4.9,
    status: "active",
  },
  {
    id: "h3",
    owner_id: "u2",
    name: "قاعة الياسمين",
    address: "المزة، شارع 11",
    city: "دمشق",
    postcode: "12345",
    price_per_person: 22500,
    min_capacity: 100,
    max_capacity: 400,
    contact: "+963988000333",
    images: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop",
    ],
    rating: 4.7,
    status: "active",
  },
  {
    id: "h4",
    owner_id: "u2",
    name: "قاعة الشام",
    address: "دمر، الطريق العام",
    city: "دمشق",
    postcode: "12500",
    price_per_person: 30000,
    min_capacity: 200,
    max_capacity: 700,
    contact: "+963988000444",
    images: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop",
    ],
    rating: 4.6,
    status: "active",
  },
  {
    id: "h5",
    owner_id: "u2",
    name: "قاعة اللؤلؤة",
    address: "كفرسوسة",
    city: "دمشق",
    postcode: "12600",
    price_per_person: 27500,
    min_capacity: 100,
    max_capacity: 450,
    contact: "+963988000555",
    images: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1600&auto=format&fit=crop",
    ],
    rating: 4.5,
    status: "active",
  },
  {
    id: "h6",
    owner_id: "u2",
    name: "قاعة الأميرة",
    address: "المالكي",
    city: "دمشق",
    postcode: "12700",
    price_per_person: 40000,
    min_capacity: 200,
    max_capacity: 550,
    contact: "+963988000666",
    images: [
      "https://images.unsplash.com/photo-1550005809-91ad75fb315f?q=80&w=1600&auto=format&fit=crop",
    ],
    rating: 4.6,
    status: "active",
  },
];

export const caterings: Catering[] = [
  { id: "c1", hall_id: "h1", menu_name: "بوفيه ملكي", price_per_person: 25000, menu_type: "بوفيه", description: "مقبلات + طبق رئيسي + حلويات شرقية", status: "active" },
  { id: "c2", hall_id: "h1", menu_name: "بوفيه فاخر", price_per_person: 20000, menu_type: "بوفيه", description: "أطباق مشاوي وأرز ومقبلات باردة وساخنة", status: "active" },
  { id: "c3", hall_id: "h1", menu_name: "بوفيه تقليدي", price_per_person: 25000, menu_type: "بوفيه", description: "قائمة اقتصادية متكاملة", status: "active" },
];

export const decorations: Decoration[] = [
  { id: "d1", hall_id: "h1", theme_name: "كلاسيكي فخم", price: 800000, description: "ورود بيضاء وإضاءة ذهبية", images: [], status: "active" },
  { id: "d2", hall_id: "h1", theme_name: "عصري بسيط", price: 550000, description: "خطوط نظيفة وإضاءة دافئة", images: [], status: "active" },
];

export const cars: Car[] = [
  { id: "car1", hall_id: "h1", car_name: "رولز رويس فانتوم", model: "2023", price: 500000, capacity: 4, description: "سيارة العروس مع سائق رسمي", images: [], status: "active" },
];

export const musicOptions: Music[] = [
  { id: "m1", hall_id: "h1", name: "DJ ساهر", type: "DJ", price: 400000, description: "أغاني عربية وغربية ومايك للزفة", status: "active" },
];

export const globalServices: Service[] = [
  { id: "s1", type: "photography", name: "مصور محترف - الباقة الذهبية", price: 700000, description: "12 ساعة تصوير + ألبومين", images: [], status: "active" },
  { id: "s2", type: "cake", name: "كيك 4 طوابق", price: 300000, description: "تصميم مخصص حسب الطلب", images: [], status: "active" },
];

export const bookings: Booking[] = [
  {
    id: "b1",
    customer_id: "u1",
    hall_id: "h2",
    event_date: "2026-05-12",
    guest_count: 200,
    status: "confirmed",
    total_price: 7000000,
    selected_caterings: [{ catering_id: "c1", name: "بوفيه ملكي", price_per_person: 25000, total: 5000000 }],
    selected_decoration_id: null,
    selected_car_id: null,
    selected_music_id: null,
    qr_code: null,
  },
];

export const reviews: Review[] = [
  { id: "r1", user_id: "u1", hall_id: "h1", rating: 5, review_text: "صالة رائعة وتعامل ممتاز مع فريق محترف من البداية للنهاية." },
  { id: "r2", user_id: "u4", hall_id: "h1", rating: 4, review_text: "ديكور جميل جدًا والطعام كان لذيذ، ننصح بها." },
];

export const platformUsers: User[] = [
  { id: "u1", name: "أحمد الخطيب", email: "ahmad@example.com", phone: "+963911111111", role: "customer", createdAt: "2025-11-01" },
  { id: "u2", name: "سامر ناصر", email: "samer@example.com", phone: "+963922222222", role: "hall_owner", createdAt: "2025-10-01" },
  { id: "u3", name: "مدير المنصة", email: "admin@example.com", phone: "+963933333333", role: "admin", createdAt: "2025-01-01" },
  { id: "u4", name: "ليلى منصور", email: "layla@example.com", phone: "+963944444444", role: "customer", createdAt: "2025-12-05" },
];

export const monthlyBookingsChart = [
  { month: "يناير", bookings: 22 },
  { month: "فبراير", bookings: 30 },
  { month: "مارس", bookings: 26 },
  { month: "أبريل", bookings: 34 },
  { month: "مايو", bookings: 29 },
  { month: "يونيو", bookings: 45 },
];

export const platformStats = {
  totalUsers: 156,
  totalHalls: 32,
  totalBookings: 231,
  totalRevenue: 856400000,
};

export function getHallById(id: string) {
  return halls.find((h) => h.id === id);
}
