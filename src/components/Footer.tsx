import Link from "next/link";
import Logo from "@/components/Logo";

const columns = [
  {
    title: "Kupuj",
    links: [
      { href: "/listing", label: "Wszystkie ogłoszenia" },
      { href: "/listing?type=profiles", label: "Użytkownicy" },
      { href: "/favourites", label: "Ulubione" },
    ],
  },
  {
    title: "Sprzedawaj",
    links: [
      { href: "/listing/create", label: "Dodaj ogłoszenie" },
      { href: "/seller-guide", label: "Poradnik sprzedawcy" },
      { href: "/pricing", label: "Cennik" },
    ],
  },
  {
    title: "Informacje",
    links: [
      { href: "/terms", label: "Regulamin" },
      { href: "/privacy", label: "Polityka prywatności" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600">
              Twój zaufany rynek do kupowania i sprzedawania przedmiotów – prosto, szybko i bezpiecznie.
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 text-sm font-semibold text-neutral-900">{col.title}</h2>
              <ul className="space-y-2 text-sm text-neutral-600">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
          © {new Date().getFullYear()} Ventida. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
