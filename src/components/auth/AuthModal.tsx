import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoldButton, GhostButton, IconClose } from "@/components/primitives";
import { cn } from "@/utils/cn";

export default function AuthModal({ open, onClose, initialMode = "login" }: { open: boolean; onClose: () => void; initialMode?: "login" | "register" }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = () => {
    setError(null);
    const res = login(phone || email, password);
    if (!res.ok) setError(res.message || "خطا");
    else {
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); }, 800);
    }
  };
  const handleRegister = () => {
    setError(null);
    if (!name || !phone || !password) { setError("نام، موبایل و رمز عبور الزامی است."); return; }
    const res = register({ fullName: name, phone, email: email || undefined, password });
    if (!res.ok) setError(res.message || "خطا");
    else {
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); }, 800);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-ink-2 p-6 md:p-8">
        <button onClick={onClose} className="absolute top-4 left-4 text-ivory"><IconClose className="h-5 w-5" /></button>
        <h3 className="text-center font-serif text-2xl text-ivory">{mode === "login" ? "ورود" : "ثبت‌نام"}</h3>
        <p className="mt-2 text-center text-xs text-mist">{mode === "login" ? "با موبایل یا ایمیل وارد شوید" : "حساب کاربری خود را بسازید"}</p>

        <div className="mt-6 flex gap-2 rounded-full bg-ink p-1">
          <button onClick={() => setMode("login")} className={cn("flex-1 rounded-full py-2 text-xs font-bold tracking-[0.15em]", mode === "login" ? "bg-champagne text-ink" : "text-ivory")}>ورود</button>
          <button onClick={() => setMode("register")} className={cn("flex-1 rounded-full py-2 text-xs font-bold tracking-[0.15em]", mode === "register" ? "bg-champagne text-ink" : "text-ivory")}>ثبت‌نام</button>
        </div>

        <div className="mt-6 grid gap-3">
          {mode === "register" && (
            <label className="block">
              <span className="text-xs text-mist">نام و نام خانوادگی *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" placeholder="سارا احمدی" />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-mist">{mode === "login" ? "موبایل یا ایمیل" : "شماره موبایل *"}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" placeholder="0912..." dir="ltr" />
          </label>
          <label className="block">
            <span className="text-xs text-mist">ایمیل {mode === "register" ? "(اختیاری)" : ""}</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" placeholder="email@example.com" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-xs text-mist">رمز عبور *</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" placeholder="••••••" />
          </label>
          {mode === "login" && <p className="text-xs text-mist">ادمین: 09120000000 / admin123 — کاربر نمونه: 09129103243 / 123456</p>}
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        {success && <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-300">عملیات موفق بود!</p>}

        <div className="mt-6 flex gap-3">
          {mode === "login" ? (
            <GoldButton onClick={handleLogin} className="flex-1">ورود</GoldButton>
          ) : (
            <GoldButton onClick={handleRegister} className="flex-1">ثبت‌نام</GoldButton>
          )}
          <GhostButton onClick={onClose}>انصراف</GhostButton>
        </div>
      </div>
    </div>
  );
}
