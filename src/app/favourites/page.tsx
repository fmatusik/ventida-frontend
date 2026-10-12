"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Loader2, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useRequireAuth } from "@/context/UserContext";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";

const PAGE_SIZE = 12;

type FavouriteRow = {
  listing: {
    id: number;
    title: string;
    price: number;
    location: string;
    created_at: string;
    category?: { name: string };
    images?: { url: string }[];
    _count?: { views: number; favourites: number };
  };
};

function toSummary(row: FavouriteRow): ShortListingSummaryDto {
  const l = row.listing;
  return {
    id: l.id,
    title: l.title,
    category: l.category?.name ?? "",
    price: l.price,
    viewsCount: l._count?.views ?? 0,
    likesCount: l._count?.favourites ?? 0,
    created_at: new Date(l.created_at).toLocaleDateString("pl-PL"),
    imageUrl: l.images?.[0]?.url ?? "",
    location: l.location,
  };
}

export default function FavouritesPage() {
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [items, setItems] = useState<ShortListingSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (skip: number) => {
    try {
      const res = await api.get(`/favourite?skip=${skip}&take=${PAGE_SIZE}`);
      const rows: FavouriteRow[] = res.data.data || [];
      setItems((prev) => (skip === 0 ? rows.map(toSummary) : [...prev, ...rows.map(toSummary)]));
      setHasMore(rows.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError(apiError(err, "Błąd przy pobieraniu ulubionych"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ładowanie danych z API po zalogowaniu
    if (ready) load(0);
  }, [ready, load]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-page pb-10 pt-28 sm:pt-32">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <button
              onClick={() => router.back()}
              className="group mb-4 flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Powrót
            </button>
            <h1 className="text-4xl font-light sm:text-5xl">
              Twoje <span className="font-semibold text-primary">ulubione</span>
            </h1>
          </div>
          {!loading && !error && (
            <p className="text-sm font-medium uppercase tracking-wider text-neutral-500">
              {items.length} zapisanych ogłoszeń
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="card py-16 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <button onClick={() => load(0)} className="btn-primary">
              Spróbuj ponownie
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="card mx-auto max-w-2xl py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Twoja lista jest pusta</h2>
            <p className="mx-auto mb-8 max-w-sm text-neutral-500">
              Przeglądaj oferty i kliknij serduszko, aby zapisać ogłoszenie na później.
            </p>
            <Link href="/listing" className="btn-primary">
              <ShoppingBag className="h-5 w-5" />
              Przeglądaj ogłoszenia
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <ListingCard key={item.id} item={item} isFavourite />
              ))}
            </div>
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => {
                    setLoadingMore(true);
                    load(items.length);
                  }}
                  disabled={loadingMore}
                  className="btn-outline"
                >
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pokaż więcej"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
