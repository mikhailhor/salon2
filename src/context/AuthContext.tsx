import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Customer } from "@/types";
import { loadFromStorage, saveToStorage, STORAGE_KEYS, uid } from "@/lib/storage";
import { useData } from "@/context/DataContext";

interface AuthContextValue {
  user: Customer | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (phoneOrEmail: string, password: string) => { ok: boolean; message?: string };
  register: (data: { fullName: string; phone: string; email?: string; password: string }) => { ok: boolean; message?: string };
  logout: () => void;
  updateProfile: (patch: Partial<Customer>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { customers, updateCustomer, addCustomer } = useData();
  const [user, setUser] = useState<Customer | null>(() => {
    const stored = loadFromStorage<Customer | null>(STORAGE_KEYS.auth, null);
    return stored;
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.auth, user);
  }, [user]);

  // sync user when customers list updates (e.g., notes change externally)
  useEffect(() => {
    if (user) {
      const fresh = customers.find((c) => c.id === user.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(user)) {
        setUser(fresh);
      }
    }
  }, [customers, user]);

  const login = useCallback((phoneOrEmail: string, password: string) => {
    const found = customers.find(
      (c) => (c.phone === phoneOrEmail || c.email === phoneOrEmail) && c.password === password
    );
    if (!found) return { ok: false, message: "شماره موبایل/ایمیل یا رمز عبور اشتباه است." };
    setUser(found);
    return { ok: true };
  }, [customers]);

  const register = useCallback((data: { fullName: string; phone: string; email?: string; password: string }) => {
    if (customers.some((c) => c.phone === data.phone)) {
      return { ok: false, message: "این شماره موبایل قبلاً ثبت شده است." };
    }
    if (data.email && customers.some((c) => c.email === data.email)) {
      return { ok: false, message: "این ایمیل قبلاً ثبت شده است." };
    }
    const newCust: Customer = {
      id: uid("cust"),
      fullName: data.fullName,
      name: data.fullName.split(" ")[0] || data.fullName,
      familyName: data.fullName.split(" ").slice(1).join(" ") || "",
      phone: data.phone,
      email: data.email,
      password: data.password,
      avatar: "",
      createdAt: new Date().toISOString(),
      role: "customer",
    };
    addCustomer(newCust);
    setUser(newCust);
    return { ok: true };
  }, [customers, addCustomer]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<Customer>) => {
    if (!user) return;
    const updated = { ...user, ...patch };
    setUser(updated);
    updateCustomer(user.id, patch);
  }, [user, updateCustomer]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
  }), [user, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
