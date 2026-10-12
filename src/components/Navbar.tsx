"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";
import Logo from "./Logo";
import Avatar from "./Avatar";
import { useUser } from "@/context/UserContext";

const links = [
  { href: "/listing", label: "Przeglądaj", icon: ShoppingBag },
  { href: "/listing?type=profiles", label: "Użytkownicy", icon: Users },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Zamknij menu po zmianie strony (aktualizacja stanu podczas renderu zamiast w efekcie)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setUserMenuOpen(false);
  }

  // Zamknij menu użytkownika po kliknięciu poza nim / Esc
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUserMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  // Blokada przewijania tła przy otwartym menu mobilnym
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/listing?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setMenuOpen(false);
  };

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    if (href.includes("type=profiles")) return false;
    return pathname === path || (path !== "/" && pathname.startsWith(path + "/") && path !== "/listing");
  };

  const searchForm = (idSuffix: string) => (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor={`nav-search-${idSuffix}`} className="sr-only">
        Szukaj ogłoszeń
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        id={`nav-search-${idSuffix}`}
        type="search"
        placeholder="Czego szukasz?"
        value={searchQuery}
        maxLength={100}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-full border border-neutral-200 bg-neutral-100 py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </form>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200 bg-white/85 backdrop-blur-md">
        <div className="container-page">
          <div className="flex h-16 items-center gap-4 sm:h-20 lg:gap-8">
            <Logo />

            <nav className="hidden items-center gap-1 md:flex" aria-label="Główna nawigacja">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 ${
                    isActive(l.href) ? "text-primary" : "text-neutral-600"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mx-auto hidden max-w-md flex-1 md:block">{searchForm("desktop")}</div>

            <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
              <Link href="/listing/create" className="btn-primary hidden !px-4 !py-2.5 sm:inline-flex">
                <Plus className="h-4 w-4" />
                Dodaj ogłoszenie
              </Link>

              {!isLoading && user && (
                <>
                  <Link
                    href="/chat"
                    aria-label="Wiadomości"
                    className="hidden rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary sm:block"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/favourites"
                    aria-label="Ulubione"
                    className="hidden rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary sm:block"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>

                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                      aria-label="Menu użytkownika"
                      className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-neutral-100"
                    >
                      <Avatar name={user.username || user.email} src={user.pictureUrl} size={32} />
                      <span className="hidden max-w-[120px] truncate text-sm font-medium text-neutral-700 lg:block">
                        {user.username || "Konto"}
                      </span>
                    </button>
                    {userMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl"
                      >
                        <Link
                          role="menuitem"
                          href={`/account?id=${user.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          <User className="h-4 w-4" /> Mój profil
                        </Link>
                        <Link
                          role="menuitem"
                          href="/favourites"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          <Heart className="h-4 w-4" /> Ulubione
                        </Link>
                        <Link
                          role="menuitem"
                          href="/chat"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          <MessageCircle className="h-4 w-4" /> Wiadomości
                        </Link>
                        <div className="my-1 border-t border-neutral-100" />
                        <button
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-primary-soft"
                        >
                          <LogOut className="h-4 w-4" /> Wyloguj się
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!isLoading && !user && (
                <div className="hidden items-center gap-1 sm:flex">
                  <Link href="/login" className="btn-ghost !px-4 !py-2.5">
                    Zaloguj się
                  </Link>
                  <Link href="/register" className="btn-outline !px-4 !py-2.5">
                    Załóż konto
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Otwórz menu"
                className="rounded-full p-2.5 transition-colors hover:bg-neutral-100 md:hidden"
              >
                <Menu className="h-5 w-5 text-neutral-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobilne */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`fixed right-0 top-0 flex h-full w-[300px] max-w-[85vw] transform flex-col bg-white shadow-2xl transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 p-5">
            <Logo />
            <button onClick={() => setMenuOpen(false)} aria-label="Zamknij menu" className="rounded-full p-2 hover:bg-neutral-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            {searchForm("mobile")}

            <Link href="/listing/create" className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Dodaj ogłoszenie
            </Link>

            <nav className="space-y-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-700 hover:bg-neutral-100">
                  <Icon className="h-5 w-5" /> {label}
                </Link>
              ))}
              {!isLoading && user && (
                <>
                  <Link href={`/account?id=${user.id}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-700 hover:bg-neutral-100">
                    <User className="h-5 w-5" /> Mój profil
                  </Link>
                  <Link href="/favourites" className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-700 hover:bg-neutral-100">
                    <Heart className="h-5 w-5" /> Ulubione
                  </Link>
                  <Link href="/chat" className="flex items-center gap-3 rounded-xl px-3 py-3 text-neutral-700 hover:bg-neutral-100">
                    <MessageCircle className="h-5 w-5" /> Wiadomości
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="space-y-3 border-t border-neutral-200 p-5">
            {!isLoading && user ? (
              <button onClick={handleLogout} className="btn-outline w-full">
                <LogOut className="h-4 w-4" /> Wyloguj się
              </button>
            ) : (
              !isLoading && (
                <>
                  <Link href="/login" className="btn-outline w-full">
                    Zaloguj się
                  </Link>
                  <Link href="/register" className="btn-gradient w-full">
                    Załóż konto
                  </Link>
                </>
              )
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
