"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, MessageCircle, Search, Tag, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { CategoryDto } from "@/models";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";

interface TrendingCategoryDto extends CategoryDto {
  trendingPercentage: number;
}

const steps = [
  { icon: Camera, title: "Dodaj ogłoszenie", text: "Zrób zdjęcia, opisz przedmiot i ustal cenę. To zajmuje kilka minut i nic nie kosztuje." },
  { icon: MessageCircle, title: "Porozmawiaj", text: "Kupujący piszą do Ciebie przez bezpieczny czat. Możesz też negocjować cenę." },
  { icon: Tag, title: "Sprzedaj", text: "Umów się na odbiór, zamknij ogłoszenie i zbierz pozytywną opinię." },
];

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<TrendingCategoryDto[]>([]);
  const [listings, setListings] = useState<ShortListingSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, listingsRes] = await Promise.all([
          api.get("/category/trending?limit=6"),
          api.get("/listing?skip=0&take=8"),
        ]);
        setCategories(categoriesRes.data.data || []);
        setListings(listingsRes.data.data || []);
      } catch (err) {
        setError(apiError(err, "Błąd przy pobieraniu danych"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/listing?q=${encodeURIComponent(q)}` : "/listing");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-48 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="container-page relative pb-16 text-center sm:pb-24">
          <span className="chip-primary mb-6">Darmowe ogłoszenia lokalne</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-light leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Znajdź <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-semibold text-transparent">wyjątkowe okazje</span> w swojej okolicy
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
            Kupuj i sprzedawaj używane oraz unikatowe przedmioty bez prowizji i zbędnych formalności.
          </p>

          <form onSubmit={onSearch} role="search" className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-3xl bg-white p-2 shadow-xl shadow-primary/10 ring-1 ring-neutral-200 sm:flex-row sm:rounded-full">
            <label htmlFor="hero-search" className="sr-only">
              Czego szukasz?
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                id="hero-search"
                type="search"
                value={query}
                maxLength={100}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Czego szukasz? np. rower, iPhone, sofa..."
                className="w-full rounded-full bg-transparent py-3.5 pl-13 pr-4 text-base placeholder:text-neutral-400 focus:outline-none"
                style={{ paddingLeft: "3.25rem" }}
              />
            </div>
            <button type="submit" className="btn-gradient !rounded-full !px-8 !py-3.5">
              Szukaj
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link href="/listing" className="inline-flex items-center gap-1 font-medium text-neutral-700 hover:text-primary">
              Przeglądaj wszystko <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-neutral-300">•</span>
            <Link href="/listing/create" className="font-medium text-neutral-700 hover:text-primary">
              Zacznij sprzedawać
            </Link>
          </div>
        </div>
      </section>

      {/* Kategorie */}
      {categories.length > 0 && (
        <section className="container-page mb-16" aria-labelledby="cat-heading">
          <h2 id="cat-heading" className="mb-6 text-2xl font-semibold">
            Popularne kategorie
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/listing?categoryId=${cat.id}`}
                className="card group p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                {cat.trendingPercentage > 0 && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <TrendingUp className="h-3.5 w-3.5" />+{cat.trendingPercentage}% w tym tygodniu
                  </div>
                )}
                <h3 className="font-semibold transition-colors group-hover:text-primary">{cat.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">Przeglądaj →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Najnowsze */}
      <section className="container-page mb-20" aria-labelledby="latest-heading">
        <div className="mb-8 flex items-end justify-between">
          <h2 id="latest-heading" className="text-3xl font-light">
            <span className="font-semibold text-primary">Najnowsze</span> ogłoszenia
          </h2>
          <Link href="/listing" className="text-sm font-medium text-neutral-700 hover:text-primary">
            Zobacz wszystkie →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="alert-error text-center">
            {error}
          </div>
        ) : listings.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <h3 className="mb-2 text-xl font-semibold">Jeszcze nic tu nie ma</h3>
            <p className="mb-6 text-neutral-500">Bądź pierwszą osobą, która doda ogłoszenie!</p>
            <Link href="/listing/create" className="btn-primary">
              Dodaj ogłoszenie
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Jak to działa */}
      <section className="container-page mb-20" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-10 text-center text-3xl font-light">
          Jak to <span className="font-semibold text-primary">działa</span>?
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card p-8">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-2 text-lg font-semibold">
                {i + 1}. {title}
              </h3>
              <p className="leading-relaxed text-neutral-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-10 text-white lg:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="relative max-w-xl">
            <h2 className="mb-4 text-3xl font-light leading-tight lg:text-5xl">
              Zacznij sprzedawać <span className="font-semibold">w kilka minut</span>
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Zamień nieużywane przedmioty na gotówkę. Wystawianie ogłoszeń jest darmowe.
            </p>
            <Link href="/listing/create" className="btn bg-white !px-8 !py-4 text-primary hover:bg-neutral-100">
              Stwórz ogłoszenie <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
