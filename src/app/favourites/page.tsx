"use client";
import { useState, useEffect } from "react";
import { Heart, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useUser } from "@/context/UserContext";
import FavouriteButton from "@/components/FavouriteButton";

export default function FavouritesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [favouriteItems, setFavouriteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [take] = useState(12);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/favourite?skip=${skip}&take=${take}`);
      setFavouriteItems(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd przy pobieraniu ulubionych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchFavourites();
    }
  }, [user, skip, take]);

  if (!user && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Powrót
            </button>
            <h1 className="text-5xl font-light">
              Twoje <span className="font-semibold text-primary">ulubione</span>
            </h1>
          </div>
          <div className="text-neutral-500 text-sm font-medium uppercase tracking-wider">
            {favouriteItems.length} zapisanych przedmiotów
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-3xl mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => fetchFavourites()}
              className="mt-4 px-6 py-2 bg-black text-white rounded-xl text-sm font-medium"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : favouriteItems.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-neutral-200 shadow-sm">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-neutral-300" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Twoja lista jest pusta</h2>
            <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
              Nie masz jeszcze żadnych ulubionych ogłoszeń. Przeglądaj oferty i kliknij serduszko, aby je tu zapisać.
            </p>
            <Link 
              href="/listing" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Przeglądaj ogłoszenia
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {favouriteItems.map((item) => {
              const listing = item.listing;
              return (
                <div key={listing.id} className="group">
                  <div className="relative aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <Link href={`/listing/${listing.id}`} className="block w-full h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                        {listing.images && listing.images[0] ? (
                          <img
                            src={listing.images[0].url.startsWith('http') ? listing.images[0].url : (process.env.NEXT_PUBLIC_SERVER_URL + listing.images[0].url)}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-8xl">📦</span>
                        )}
                      </div>
                    </Link>
                    
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                      {listing.category?.name}
                    </div>
                    
                    <FavouriteButton 
                      listingId={listing.id} 
                      initialIsFavourite={true}
                      className="absolute top-4 right-4"
                      size={18}
                    />
                  </div>

                  <Link href={`/listing/${listing.id}`} className="space-y-1 px-1 block">
                    <h4 className="font-medium text-neutral-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">{listing.price} PLN</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">
                       <span className="flex items-center gap-1">
                         📍 {listing.location || "Polska"}
                       </span>
                       <span>•</span>
                       <span>👁️ {listing._count?.views || 0}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination placeholder if needed */}
        {favouriteItems.length >= take && (
           <div className="mt-12 flex justify-center">
             <button
               onClick={() => setSkip(skip + take)}
               className="px-8 py-3 border border-neutral-200 bg-white rounded-xl font-medium hover:bg-neutral-50 transition-all shadow-sm"
             >
               Pokaż więcej
             </button>
           </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
