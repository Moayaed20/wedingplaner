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
function normalizeDocument(doc: any): any {
  if (Array.isArray(doc)) {
    return doc.map((item) => normalizeDocument(item));
  }

  if (!doc || typeof doc !== "object") {
    return doc;
  }

  // تحويل _id إلى id
  if (doc._id !== undefined) {
    doc.id = doc._id.toString ? doc._id.toString() : doc._id;
    delete doc._id;
  }

  // المرور على جميع الحقول
  for (const key of Object.keys(doc)) {
    const value = doc[key];

    // معالجة حقل الصور (استبدال example.com بروابط Unsplash حقيقية)
    if (key === "images" && Array.isArray(value)) {
      doc[key] = value.map((url: string) => {
        if (typeof url === "string" && url.includes("example.com")) {
          return "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop";
        }
        return url;
      });
      continue;
    }

    // معالجة الحقول المرجعية (تنتهي بـ _id)
    if (value && typeof value === "object") {
      if (key.endsWith("_id") && value._id !== undefined) {
        // تحويل الحقل إلى سلسلة (معرف المرجع)
        doc[key] = value._id.toString ? value._id.toString() : value._id;
        // إضافة حقل مملوء (بدون _id)
        const populatedKey = key.slice(0, -3);
        doc[populatedKey] = normalizeDocument(value);
      } else {
        // تطبيع الكائن الداخلي
        doc[key] = normalizeDocument(value);
      }
    } else if (Array.isArray(value)) {
      // تطبيع المصفوفات الداخلية
      doc[key] = value.map((item) => normalizeDocument(item));
    }
  }

  return doc;
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

  // تطبيق التطبيع على الاستجابة بأكملها
  const normalized = normalizeDocument(json);
  return normalized as T;
}

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
  list: (hallId: string) => request<Catering[]>(`/halls/${hallId}/caterings`),
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
  list: (hallId: string) =>
    request<Decoration[]>(`/halls/${hallId}/decorations`),
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
  list: (hallId: string) => request<Car[]>(`/halls/${hallId}/cars`),
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
  list: (hallId: string) => request<Music[]>(`/halls/${hallId}/music`),
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
