import { ReactNode } from "react";
import { BadgeCheck, MessageCircle, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";

const perks = [
  { icon: BadgeCheck, text: "Wystawianie ogłoszeń jest darmowe" },
  { icon: MessageCircle, text: "Bezpośredni czat z kupującym lub sprzedającym" },
  { icon: ShieldCheck, text: "Opinie o użytkownikach i bezpieczne konta" },
];

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Panel marki */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-secondary p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        <Logo light className="relative" />
        <div className="relative max-w-md">
          <h2 className="mb-8 text-4xl font-light leading-tight">
            Kupuj i sprzedawaj <span className="font-semibold">bez zbędnych komplikacji.</span>
          </h2>
          <ul className="space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">© {new Date().getFullYear()} Ventida</p>
      </aside>

      {/* Formularz */}
      <main className="flex flex-col">
        <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 lg:hidden">
          <Logo light />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {subtitle && <p className="mb-8 text-neutral-500">{subtitle}</p>}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
