"use client";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { safeNext } from "@/lib/auth";
import { useUser } from "@/context/UserContext";

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,30}$/;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, login, isLoading } = useUser();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace(next);
  }, [isLoading, user, next, router]);

  const rules = useMemo(
    () => [
      { label: "min. 8 znaków", ok: password.length >= 8 },
      { label: "mała litera", ok: /[a-z]/.test(password) },
      { label: "wielka litera", ok: /[A-Z]/.test(password) },
      { label: "cyfra", ok: /[0-9]/.test(password) },
    ],
    [password],
  );
  const passwordOk = rules.every((r) => r.ok);
  const usernameOk = username === "" || USERNAME_RE.test(username);
  const matches = confirm === "" || confirm === password;

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!passwordOk) return setError("Hasło nie spełnia wymagań");
    if (password !== confirm) return setError("Hasła nie są identyczne");
    if (!usernameOk) return setError("Nazwa użytkownika: 3–30 znaków (litery, cyfry, _ . -)");
    if (!accepted) return setError("Zaakceptuj regulamin i politykę prywatności");

    setSubmitting(true);
    try {
      await api.post("/user", { email, password, ...(username ? { username } : {}) });
      // od razu logujemy - bez dodatkowego kroku
      const res = await api.post<{ accessToken: string }>("/auth/login", { email, password });
      await login(res.data.accessToken);
      router.replace(next);
    } catch (err) {
      setError(apiError(err, "Nie udało się utworzyć konta"));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Załóż konto" subtitle="Dołącz do Ventida – to zajmie mniej niż minutę.">
      <form onSubmit={handleRegister} className="space-y-5">
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
          <label htmlFor="username" className="label">
            Nazwa użytkownika <span className="font-normal text-neutral-400">(opcjonalnie)</span>
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            maxLength={30}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!usernameOk}
            className={`input ${usernameOk ? "" : "!border-red-400 focus:!ring-red-200"}`}
            placeholder="jan_kowalski"
          />
          {!usernameOk && <p className="mt-1 text-xs text-red-600">3–30 znaków: litery, cyfry, _ . -</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Hasło
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-12"
              placeholder="Silne hasło"
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
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Wymagania hasła">
            {rules.map((r) => (
              <li key={r.label} className={`flex items-center gap-1 ${r.ok ? "text-green-600" : "text-neutral-400"}`}>
                {r.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="confirm" className="label">
            Powtórz hasło
          </label>
          <input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={72}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!matches}
            className={`input ${matches ? "" : "!border-red-400 focus:!ring-red-200"}`}
          />
          {!matches && <p className="mt-1 text-xs text-red-600">Hasła nie są identyczne</p>}
        </div>

        <label className="flex items-start gap-3 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-primary"
          />
          <span>
            Akceptuję{" "}
            <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">
              regulamin
            </Link>{" "}
            i{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">
              politykę prywatności
            </Link>
            .
          </span>
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Tworzenie konta...
            </>
          ) : (
            "Załóż konto"
          )}
        </button>

        <p className="text-center text-sm text-neutral-500">
          Masz już konto?{" "}
          <Link href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`} className="font-semibold text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
