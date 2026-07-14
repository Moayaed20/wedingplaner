// Types that mirror the backend DTOs/entities exactly.
// Every type is shared across role-specific dashboards and public pages.

export type Role = "admin" | "hall_owner" | "customer";

export enum UserRole {
  ADMIN = "admin",
  HALL_OWNER = "hall_owner",
  CUSTOMER = "customer",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum HallStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum CalendarStatus {
  AVAILABLE = "available",
  PENDING = "pending",
  BOOKED = "booked",
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  favorite_halls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: Role;
  phone?: string;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  phone?: string;
}

export interface Hall {
  id: string;
  _id?: string;
  owner_id: string | null;
  owner?: User; // الكائن المملوء (عند الطلب)
  name: string;
  address: string;
  city: string;
  postcode?: string;
  price_per_person: number;
  min_capacity: number;
  max_capacity: number;
  rating: number;
  images: string[];
  images_360?: string[];
  contact?: string;
  status: HallStatus;
  availability_calendar?: { date: string; status: CalendarStatus }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHallBody {
  owner_id?: string | null;
  name: string;
  address: string;
  city: string;
  postcode?: string;
  price_per_person: number;
  min_capacity: number;
  max_capacity: number;
  contact?: string;
  status?: HallStatus;
  images?: string[];
}

export interface UpdateHallBody extends Partial<CreateHallBody> {}

export interface HallFilters {
  city?: string;
  minCapacity?: number;
  maxCapacity?: number;
  maxPrice?: number;
  rating?: number;
}

export interface Service {
  id: string;
  _id?: string;
  type: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  status: HallStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceBody {
  type: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  status?: HallStatus;
}

export interface UpdateServiceBody extends Partial<CreateServiceBody> {}

export interface Catering {
  id: string;
  _id?: string;
  hall_id: string;
  hall?: Hall;
  menu_name: string;
  price_per_person: number;
  menu_type: string;
  description?: string;
  images: string[];
  status: HallStatus;
}

export interface CreateCateringBody {
  menu_name: string;
  price_per_person: number;
  menu_type: string;
  description?: string;
  images?: string[];
  status?: HallStatus;
}

export interface UpdateCateringBody extends Partial<CreateCateringBody> {}

export interface Decoration {
  id: string;
  _id?: string;
  hall_id: string;
  hall?: Hall;
  theme_name: string;
  price: number;
  description?: string;
  images: string[];
  status: HallStatus;
}

export interface CreateDecorationBody {
  theme_name: string;
  price: number;
  description?: string;
  images?: string[];
  status?: HallStatus;
}

export interface UpdateDecorationBody extends Partial<CreateDecorationBody> {}

export interface Car {
  id: string;
  _id?: string;
  hall_id: string;
  hall?: Hall;
  car_name: string;
  model: string;
  price: number;
  capacity: number;
  description?: string;
  images: string[];
  status: HallStatus;
}

export interface CreateCarBody {
  car_name: string;
  model: string;
  price: number;
  capacity: number;
  description?: string;
  images?: string[];
  status?: HallStatus;
}

export interface UpdateCarBody extends Partial<CreateCarBody> {}

export interface Music {
  id: string;
  _id?: string;
  hall_id: string;
  hall?: Hall;
  name: string;
  type: string;
  price: number;
  description?: string;
  images?: string[];
  status: HallStatus;
}

export interface CreateMusicBody {
  name: string;
  type: string;
  price: number;
  description?: string;
  status?: HallStatus;
}

export interface UpdateMusicBody extends Partial<CreateMusicBody> {}

export interface SelectedCatering {
  catering_id: string;
  quantity: number;
}

export interface Booking {
  id: string;
  _id?: string;
  customer_id: string;
  customer?: User;
  hall_id: string;
  hall?: Hall;
  event_date: string;
  guest_count: number;
  status: BookingStatus;
  total_price: number;
  selected_caterings: {
    catering_id: string;
    name: string;
    price_per_person: number;
    total: number;
  }[];
  selected_decoration_ids: string[];
  selected_decorations?: Decoration[];
  selected_car_id: string | null;
  selected_car?: Car | null;
  selected_music_ids: string[];
  selected_musics?: Music[];
  qr_code?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingBody {
  hall_id: string;
  event_date: string;
  guest_count: number;
  selected_caterings?: SelectedCatering[];
  selected_decoration_ids?: string[];
  selected_car_id?: string;
  selected_music_ids?: string[];
}

export interface Review {
  id: string;
  _id?: string;
  user_id: string;
  user?: User;
  customer?: User;
  hall_id: string;
  hall?: Hall;
  rating: number;
  review_text?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewBody {
  hall_id: string;
  rating: number;
  review_text?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalHalls: number;
  totalBookings: number;
  totalRevenue: number;
}
