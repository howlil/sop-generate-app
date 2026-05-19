/**
 * Login Form - Modern Clean Design
 *
 * Design: Clean, minimalist, futuristic
 * - Simple, focused layout
 * - Clear visual hierarchy
 * - Professional aesthetic
 */
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginRequestDto } from "@/types/dto/auth.dto";

export interface LoginFormProps {
  isSubmitting: boolean;
  onSubmitLogin: (payload: LoginRequestDto) => Promise<unknown>;
}

export function LoginForm({ isSubmitting, onSubmitLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Email wajib diisi");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format email tidak valid");
      return false;
    }

    if (!password) {
      setPasswordError("Password wajib diisi");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("Password minimal 8 karakter");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Navigation is handled in useAuth onSuccess hook
      await onSubmitLogin({ email, kataSandi: password });
    } catch (error: unknown) {
      // Error is already handled by useAuth's onError (shows toast)
      // Only handle field-specific errors here
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes("email")) {
          setEmailError(error.message);
        } else if (
          message.includes("password") ||
          message.includes("kata sandi")
        ) {
          setPasswordError(error.message);
        }
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Selamat Datang
        </h1>
        <p className="text-sm text-slate-500">Masuk ke Sistem Informasi SOP</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" required>
            Email
          </Label>
          <div className="relative">
            <Mail
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@instansi.go.id"
              disabled={isSubmitting}
              autoComplete="email"
              errorMessage={emailError}
              className="pl-10"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <Lock
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={isSubmitting}
              autoComplete="current-password"
              errorMessage={passwordError}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              disabled={isSubmitting}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
