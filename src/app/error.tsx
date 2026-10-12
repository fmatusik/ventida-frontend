"use client";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-6xl font-black text-transparent">Ups!</p>
      <h1 className="mt-4 text-2xl font-semibold">Coś poszło nie tak</h1>
      <p className="mt-2 max-w-md text-neutral-500">Wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">
          Spróbuj ponownie
        </button>
        <Link href="/" className="btn-outline">
          Strona główna
        </Link>
      </div>
    </main>
  );
}
