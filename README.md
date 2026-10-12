# Ventida – frontend

Next.js 16 (App Router) + React 19 + Tailwind 4. Backend: repo `ventida-backend`.

```bash
npm install
echo 'NEXT_PUBLIC_SERVER_URL=http://localhost:6969' > .env.local
npm run dev        # http://localhost:3000
```

## Struktura

- `src/app` – strony (`/`, `/listing`, `/listing/[id]`, `/listing/create`, `/account`, `/chat`, `/favourites`, `/login`, `/register`…)
- `src/components` – `Navbar`, `ListingCard`, `ListingForm`, `Modal`, `Avatar`, `AuthShell`…
- `src/context/UserContext.tsx` – sesja (`useUser`, `useRequireAuth` dla stron chronionych)
- `src/lib` – klient API (`api`), `mediaUrl`, `apiError`, pomocnicze funkcje auth
- `src/app/globals.css` – paleta (primary `#f94144`, secondary `#f3722c`) i klasy `btn-*`, `input`, `card`…

Uwaga: katalog `models_backend/` to stara kopia kodu backendu – nie jest używany ani kompilowany; kontraktem API jest backend.
Token JWT trzymany jest w `localStorage`; nagłówki bezpieczeństwa/CSP ustawia `next.config.ts`.
