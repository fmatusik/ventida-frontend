"use client";
import { ShoppingBag, Zap, TrendingUp, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';
import api from '@/lib/api';
import { CategoryDto } from '@/models';
import { ShortListingSummaryDto } from '@/models/listing/ListingDto';
import FavouriteButton from '@/components/FavouriteButton';

interface TrendingCategoryDto extends CategoryDto {
  trendingPercentage: number;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<TrendingCategoryDto[]>([]);
  const [listings, setListings] = useState<ShortListingSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending categories
        const categoriesRes = await api.get('/category/trending?limit=6');
        setCategories(categoriesRes.data.data || []);

        // Fetch listings
        const listingsRes = await api.get('/listing?skip=0&take=8');
        setListings(listingsRes.data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Błąd przy pobieraniu danych');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Minimalist Header */}
<Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-full">
              <Zap className="w-3 h-3" />
              <span>OKAZJE DNIA</span>
              <span className="ml-1 opacity-70">ZYSKAJ DO 60% ZNIŻKI</span>
            </div>
            <h2 className="text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              Odkryj
              <br />
              <span className="font-semibold text-primary">wyjątkowe okazje</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
              Kupuj od zweryfikowanych sprzedawców. Produkty wysokiej jakości w bezkonkurencyjnych cenach. Twój rynek na wszystko.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/listing" className="inline-block px-8 py-4 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                Przeglądaj teraz →
              </Link>
              <Link href="/listing/create" className="inline-block px-8 py-4 border border-neutral-300 text-sm font-medium hover:bg-neutral-100 transition-colors">
                Zacznij sprzedawać
              </Link>
            </div>
          </div>
          
          {/* Hero Image Card */}
          <div className="relative">
            <div className="aspect-[4/5] bg-neutral-100 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <span className="text-9xl">🎒</span>
              </div>
              <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-medium">Popularne</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Skórzany plecak</h3>
                    <p className="text-sm text-neutral-600">Kolekcja Premium</p>
                  </div>
                  <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-semibold">349 PLN</span>
                    <span className="ml-2 text-sm text-neutral-400 line-through">699 PLN</span>
                  </div>
                  <button className="p-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link 
              key={cat.id} 
              href={`/listing?categoryId=${cat.id}`}
              className="bg-white p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">+{cat.trendingPercentage}%</span>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-sm text-neutral-500">Przeglądaj</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-light">
            <span className="font-semibold text-primary">Najnowsze</span> ogłoszenia
          </h3>
          <Link href="/listing" className="text-sm font-medium hover:underline">Pokaż więcej →</Link>
        </div>
        
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-neutral-600">
            <p>{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-neutral-600">
            <p>Brak ogłoszeń do wyświetlenia</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div 
                key={item.id} 
                className="group cursor-pointer relative"
              >
                <Link href={`/listing/${item.id}`} className="block">
                  <div className="relative aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl.startsWith('http') ? item.imageUrl : (process.env.NEXT_PUBLIC_SERVER_URL + item.imageUrl)} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-8xl">📦</span>
                      )}
                    </div>
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                      {item.category}
                    </div>
                  </div>

                  <div className="space-y-2 block">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>👁️ {item.viewsCount}</span>
                      <span>•</span>
                      <span>❤️ {item.likesCount}</span>
                    </div>
                    <h4 className="font-medium text-neutral-900 line-clamp-2">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold">{item.price} PLN</span>
                    </div>
                    <p className="text-xs text-neutral-500">{item.created_at}</p>
                  </div>
                </Link>

                <FavouriteButton 
                  listingId={item.id} 
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                  size={16}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="bg-black text-white rounded-3xl p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-xl">
            <h3 className="text-4xl lg:text-5xl font-light mb-4 leading-tight">
              Zacznij sprzedawać
              <br />
              <span className="font-semibold">w kilka minut</span>
            </h3>
            <p className="text-neutral-300 mb-8 text-lg">
              Dołącz do ponad 50 000 sprzedawców i zamień nieużywane przedmioty na gotówkę. Wystawianie jest darmowe.
            </p>
            <Link href="/listing/create" className="inline-block px-8 py-4 bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-colors">
              Stwórz ogłoszenie →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
        <Footer/>
    </div>
  );
}
