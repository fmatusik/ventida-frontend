"use client";
import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { safeNext } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, login, isLoading } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Zalogowany użytkownik nie ma tu czego szukać
  useEffect(() => {
    if (!isLoading && user) router.replace(next);
  }, [isLoading, user, next, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post<{ accessToken: string }>("/auth/login", { email, password });
      await login(res.data.accessToken);
      router.replace(next);
    } catch (err) {
      setError(apiError(err, "Nie udało się zalogować"));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Witaj ponownie" subtitle="Zaloguj się, aby dodawać ogłoszenia i pisać do sprzedających.">
      <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
        {error && (
          <div role="alert" className="alert-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="jan@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Hasło
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-12"
              placeholder="Twoje hasło"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </button>

        <p className="text-center text-sm text-neutral-500">
          Nie masz konta?{" "}
          <Link href={next === "/" ? "/register" : `/register?next=${encodeURIComponent(next)}`} className="font-semibold text-primary hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
