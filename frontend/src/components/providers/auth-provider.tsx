"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/api";
import type { LoginBody, RegisterBody, Role, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRole: (role: Role | Role[]) => boolean;
  login: (body: LoginBody) => Promise<User>;
  register: (body: RegisterBody) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "weddingbook-auth";

function getDashboardPath(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "hall_owner") return "/owner";
  return "/halls";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw) as { token: string; user: User };
        setToken(parsed.token);
        setUser(parsed.user);
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: nextToken, user: nextUser }),
      );
    }
  }, []);

  const login = useCallback(
    async (body: LoginBody) => {
      setIsLoading(true);
      try {
        const res = await AuthAPI.login(body);
        if (!res.success || !res.token || !res.user) {
          throw new Error(res.message || "فشل تسجيل الدخول");
        }
        persist(res.token, res.user);
        const nextPath = getDashboardPath(res.user.role);
        router.replace(nextPath);
        return res.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persist, router],
  );

  const register = useCallback(
    async (body: RegisterBody) => {
      setIsLoading(true);
      try {
        const res = await AuthAPI.register(body);
        if (!res.success || !res.user) {
          throw new Error(res.message || "فشل إنشاء الحساب");
        }
        // After registration, login automatically
        const loginRes = await AuthAPI.login({
          email: body.email,
          password: body.password,
        });
        if (!loginRes.success || !loginRes.token || !loginRes.user) {
          throw new Error(
            loginRes.message || "تم إنشاء الحساب لكن تعذر تسجيل الدخول",
          );
        }
        persist(loginRes.token, loginRes.user);
        router.push(getDashboardPath(loginRes.user.role));
        return loginRes.user;
      } finally {
        setIsLoading(false);
      }
    },
    [persist, router],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  const isRole = useCallback(
    (role: Role | Role[]) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      isRole,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, isRole, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
