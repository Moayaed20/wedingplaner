import type {
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  User,
  CreateUserBody,
  UpdateUserBody,
  Hall,
  HallFilters,
  CreateHallBody,
  UpdateHallBody,
  Service,
  CreateServiceBody,
  UpdateServiceBody,
  Booking,
  CreateBookingBody,
  Review,
  CreateReviewBody,
  Catering,
  CreateCateringBody,
  UpdateCateringBody,
  Decoration,
  CreateDecorationBody,
  UpdateDecorationBody,
  Car,
  CreateCarBody,
  UpdateCarBody,
  Music,
  CreateMusicBody,
  UpdateMusicBody,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function ensureToken(token: string | null | undefined): string {
  if (!token) throw new ApiError("يجب تسجيل الدخول أولًا", 401);
  return token;
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function buildQuery(
  filters: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, String(value));
  });
  const q = params.toString();
  return q ? `?${q}` : "";
}

// ---------- دالة تطبيع الاستجابات من الباكند ----------
const FALLBACK_IMAGES: Record<string, string> = {
  decoration: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
  car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
  hall: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
  default: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop",
};

function normalizeDocument(doc: any): any {
  if (Array.isArray(doc)) {
    return doc.map((item) => normalizeDocument(item));
  }

  if (!doc || typeof doc !== "object") {
    return doc;
  }

  // shallow copy to avoid mutating original
  const result: any = { ...doc };

  // تحويل _id إلى id
  if (result._id !== undefined) {
    result.id = result._id.toString ? result._id.toString() : String(result._id);
    delete result._id;
  }

  // المرور على جميع الحقول
  for (const key of Object.keys(result)) {
    const value = result[key];

    // معالجة حقل الصور
    if (key === "images" && Array.isArray(value)) {
      result[key] = value.map((url: string) =>
        typeof url === "string" && (url.includes("example.com") || url === "" || !url)
          ? FALLBACK_IMAGES.default
          : url
      );
      continue;
    }
    
    // إذا كان حقل الصور غير موجود أو فارغ، نضيف صورة افتراضية
    if (key === "images" && (!value || (Array.isArray(value) && value.length === 0))) {
      result[key] = [FALLBACK_IMAGES.default];
      continue;
    }

    if (value === null || value === undefined) continue;

    // populated reference: حقل ينتهي بـ _id وقيمته object مملوء (فيه _id)
    if (
      key.endsWith("_id") &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value._id !== undefined
    ) {
      result[key] = value._id.toString ? value._id.toString() : String(value._id);
      const populatedKey = key.slice(0, -3);
      result[populatedKey] = normalizeDocument({ ...value });
      continue;
    }
    
    // populated array: حقل ينتهي بـ _ids
    if (key.endsWith("_ids") && Array.isArray(value)) {
      // معالجة المصفوفة
      const processedIds: string[] = [];
      const populatedItems: any[] = [];
      
      for (const item of value) {
        if (typeof item === "object" && item !== null && item._id !== undefined) {
          // كائن مملوء
          const id = item._id.toString ? item._id.toString() : String(item._id);
          processedIds.push(id);
          populatedItems.push(normalizeDocument({ ...item }));
        } else if (typeof item === "string" || item?.toString) {
          // ID فقط
          processedIds.push(String(item));
        }
      }
      
      result[key] = processedIds;
      
      // إنشاء حقل للمصفوفة المملوءة إذا كان هناك كائنات مملوءة
      if (populatedItems.length > 0) {
        const baseKey = key.slice(0, -4); // إزالة "_ids"
        const pluralKey = baseKey.endsWith('y') ? baseKey.slice(0, -1) + 'ies' : baseKey + 's';
        result[pluralKey] = populatedItems;
      } else if (processedIds.length > 0) {
        // إذا كان في IDs بس، ننشئ حقل فارغ للمصفوفة المملوءة عشان الـ UI ما يتحطم
        const baseKey = key.slice(0, -4);
        const pluralKey = baseKey.endsWith('y') ? baseKey.slice(0, -1) + 'ies' : baseKey + 's';
        result[pluralKey] = []; // مصفوفة فارغة
      }
      
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      result[key] = normalizeDocument(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item: any) =>
        typeof item === "object" && item !== null ? normalizeDocument(item) : item
      );
    }
  }

  return result;
}

// ---------- دالة الطلب الأساسية ----------
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  if (!res.ok) {
    const message =
      typeof json === "object" && json && "message" in json
        ? String((json as { message?: string }).message)
        : `API ${res.status}`;
    throw new ApiError(message || `API ${res.status}`, res.status, json);
  }

  const normalized = normalizeDocument(json);
  
  // Debug: log booking data for troubleshooting
  if (path.includes('/bookings') && Array.isArray(normalized)) {
    console.log('📊 Bookings API DEBUG:', {
      path,
      count: normalized.length,
      sample: normalized[0] ? {
        id: normalized[0].id,
        guest_count: normalized[0].guest_count,
        selected_decoration_ids: normalized[0].selected_decoration_ids,
        selected_decorations: normalized[0].selected_decorations,
        selected_music_ids: normalized[0].selected_music_ids,
        selected_musics: normalized[0].selected_musics,
        selected_caterings: normalized[0].selected_caterings,
        // تحقق من جميع الحقول
        allKeys: Object.keys(normalized[0])
      } : null,
      rawFirstItem: json[0] ? {
        selected_decoration_ids: json[0].selected_decoration_ids,
        selected_music_ids: json[0].selected_music_ids,
        // تحقق من نوع البيانات
        decorationIdsType: typeof json[0].selected_decoration_ids,
        isDecorationIdsArray: Array.isArray(json[0].selected_decoration_ids),
        decorationIdsFirstItem: json[0].selected_decoration_ids?.[0],
        decorationIdsFirstItemType: typeof json[0].selected_decoration_ids?.[0]
      } : null
    });
  }
  
  return normalized as T;
}

// ----- Upload -----
export const UploadAPI = {
  upload: async (
    file: File,
    token: string | null | undefined,
  ): Promise<string> => {
    const t = ensureToken(token);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
      body: form,
    });
    const json = await res.json();
    if (!res.ok)
      throw new ApiError(
        json?.message ?? `API ${res.status}`,
        res.status,
        json,
      );
    return json.url as string;
  },
};

// ----- Auth -----
export const AuthAPI = {
  register: (body: RegisterBody) =>
    request<RegisterResponse>("/auth/register", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  login: (body: LoginBody) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  me: (token: string) =>
    request<User>("/auth/me", { headers: authHeaders(token) }),
};

// ----- Users (admin) -----
export const UsersAPI = {
  list: (token: string | null | undefined) =>
    request<User[]>("/users", { headers: authHeaders(ensureToken(token)) }),
  get: (id: string, token: string | null | undefined) =>
    request<User>(`/users/${id}`, { headers: authHeaders(ensureToken(token)) }),
  create: (body: CreateUserBody, token: string | null | undefined) =>
    request<User>("/users", {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateUserBody,
    token: string | null | undefined,
  ) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Halls -----
export const HallsAPI = {
  list: (filters?: HallFilters) =>
    request<Hall[]>(
      `/halls${buildQuery({
        city: filters?.city,
        minCapacity: filters?.minCapacity,
        maxCapacity: filters?.maxCapacity,
        maxPrice: filters?.maxPrice,
        rating: filters?.rating,
      })}`,
    ),
  get: (id: string) => request<Hall>(`/halls/${id}`),
  mine: (token: string | null | undefined) =>
    request<Hall[]>("/halls/mine", {
      headers: authHeaders(ensureToken(token)),
    }),
  create: (body: CreateHallBody, token: string | null | undefined) =>
    request<Hall>("/halls", {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateHallBody,
    token: string | null | undefined,
  ) =>
    request<Hall>(`/halls/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/halls/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Global services -----
export const ServicesAPI = {
  list: (type?: string) =>
    request<Service[]>(`/services${buildQuery({ type })}`),
  create: (body: CreateServiceBody, token: string | null | undefined) =>
    request<Service>("/services", {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateServiceBody,
    token: string | null | undefined,
  ) =>
    request<Service>(`/services/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/services/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Caterings per hall -----
export const CateringsAPI = {
  list: (hallId: string, token?: string | null) =>
    request<Catering[]>(`/halls/${hallId}/caterings`, {
      headers: authHeaders(token),
    }),
  create: (
    hallId: string,
    body: CreateCateringBody,
    token: string | null | undefined,
  ) =>
    request<Catering>(`/halls/${hallId}/caterings`, {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateCateringBody,
    token: string | null | undefined,
  ) =>
    request<Catering>(`/caterings/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/caterings/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Decorations per hall -----
export const DecorationsAPI = {
  list: (hallId: string, token?: string | null) =>
    request<Decoration[]>(`/halls/${hallId}/decorations`, {
      headers: authHeaders(token),
    }),
  get: (id: string, token?: string | null) =>
    request<Decoration>(`/decorations/${id}`, {
      headers: authHeaders(token),
    }),
  create: (
    hallId: string,
    body: CreateDecorationBody,
    token: string | null | undefined,
  ) =>
    request<Decoration>(`/halls/${hallId}/decorations`, {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateDecorationBody,
    token: string | null | undefined,
  ) =>
    request<Decoration>(`/decorations/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/decorations/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Cars per hall -----
export const CarsAPI = {
  list: (hallId: string, token?: string | null) =>
    request<Car[]>(`/halls/${hallId}/cars`, { headers: authHeaders(token) }),
  create: (
    hallId: string,
    body: CreateCarBody,
    token: string | null | undefined,
  ) =>
    request<Car>(`/halls/${hallId}/cars`, {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (id: string, body: UpdateCarBody, token: string | null | undefined) =>
    request<Car>(`/cars/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/cars/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Music per hall -----
export const MusicAPI = {
  list: (hallId: string, token?: string | null) =>
    request<Music[]>(`/halls/${hallId}/music`, { headers: authHeaders(token) }),
  get: (id: string, token?: string | null) =>
    request<Music>(`/music/${id}`, {
      headers: authHeaders(token),
    }),
  create: (
    hallId: string,
    body: CreateMusicBody,
    token: string | null | undefined,
  ) =>
    request<Music>(`/halls/${hallId}/music`, {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  update: (
    id: string,
    body: UpdateMusicBody,
    token: string | null | undefined,
  ) =>
    request<Music>(`/music/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/music/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Bookings -----
export const BookingsAPI = {
  listAll: (token: string | null | undefined) =>
    request<Booking[]>("/bookings", {
      headers: authHeaders(ensureToken(token)),
    }),
  create: (body: CreateBookingBody, token: string | null | undefined) =>
    request<Booking>("/bookings", {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  mine: (token: string | null | undefined) =>
    request<Booking[]>("/bookings/mine", {
      headers: authHeaders(ensureToken(token)),
    }),
  get: (id: string, token: string | null | undefined) =>
    request<Booking>(`/bookings/${id}`, {
      headers: authHeaders(ensureToken(token)),
    }),
  forHall: (
    hallId: string,
    status: Booking["status"] | undefined,
    token: string | null | undefined,
  ) =>
    request<Booking[]>(`/bookings/hall/${hallId}${buildQuery({ status })}`, {
      headers: authHeaders(ensureToken(token)),
    }),
  
  // دالة مساعدة لجلب تفاصيل الديكور والموسيقى إذا كانت IDs بس
  enrichBookingDetails: async (booking: Booking, token?: string | null): Promise<Booking> => {
    const enriched = { ...booking };
    
    console.log('🔄 Enriching booking:', booking.id, {
      hasDecorationIds: booking.selected_decoration_ids?.length > 0,
      hasDecorations: !!booking.selected_decorations,
      hasMusicIds: booking.selected_music_ids?.length > 0,
      hasMusics: !!booking.selected_musics
    });
    
    // إذا كان selected_decoration_ids موجود ومش فارغ، و selected_decorations مش موجود
    if (booking.selected_decoration_ids?.length > 0 && !booking.selected_decorations) {
      try {
        console.log('📦 Fetching decoration details for IDs:', booking.selected_decoration_ids);
        // جلب تفاصيل كل الديكورات
        const decorationPromises = booking.selected_decoration_ids.map(id => 
          DecorationsAPI.get(id, token).catch((err) => {
            console.error(`Failed to fetch decoration ${id}:`, err);
            return null;
          })
        );
        const decorations = await Promise.all(decorationPromises);
        const validDecorations = decorations.filter(d => d !== null) as any;
        console.log('✅ Fetched decorations:', validDecorations.length);
        enriched.selected_decorations = validDecorations;
      } catch (error) {
        console.error('Error fetching decoration details:', error);
      }
    }
    
    // إذا كان selected_music_ids موجود ومش فارغ، و selected_musics مش موجود
    if (booking.selected_music_ids?.length > 0 && !booking.selected_musics) {
      try {
        console.log('🎵 Fetching music details for IDs:', booking.selected_music_ids);
        // جلب تفاصيل كل الموسيقى
        const musicPromises = booking.selected_music_ids.map(id => 
          MusicAPI.get(id, token).catch((err) => {
            console.error(`Failed to fetch music ${id}:`, err);
            return null;
          })
        );
        const music = await Promise.all(musicPromises);
        const validMusic = music.filter(m => m !== null) as any;
        console.log('✅ Fetched music:', validMusic.length);
        enriched.selected_musics = validMusic;
      } catch (error) {
        console.error('Error fetching music details:', error);
      }
    }
    
    console.log('🎉 Enriched booking result:', {
      decorations: enriched.selected_decorations?.length || 0,
      music: enriched.selected_musics?.length || 0
    });
    
    return enriched;
  },
  confirm: (id: string, token: string | null | undefined) =>
    request<Booking>(`/bookings/${id}/confirm`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
    }),
  reject: (id: string, token: string | null | undefined) =>
    request<Booking>(`/bookings/${id}/reject`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
    }),
  cancel: (id: string, token: string | null | undefined) =>
    request<Booking>(`/bookings/${id}/cancel`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
    }),
  update: (
    id: string,
    body: Partial<CreateBookingBody> & {
      status?: Booking["status"];
      total_price?: number;
    },
    token: string | null | undefined,
  ) =>
    request<Booking>(`/bookings/${id}`, {
      method: "PUT",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/bookings/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};

// ----- Reviews -----
export const ReviewsAPI = {
  forHall: (hallId: string) => request<Review[]>(`/halls/${hallId}/reviews`),
  create: (body: CreateReviewBody, token: string | null | undefined) =>
    request<Review>("/reviews", {
      method: "POST",
      headers: authHeaders(ensureToken(token)),
      body: JSON.stringify(body),
    }),
  remove: (id: string, token: string | null | undefined) =>
    request<{ deleted: boolean }>(`/reviews/${id}`, {
      method: "DELETE",
      headers: authHeaders(ensureToken(token)),
    }),
};
