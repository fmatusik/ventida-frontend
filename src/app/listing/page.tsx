"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Heart, MapPin, User, Star, Loader, Eye, Clock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";
import { CategoryDto } from "@/models";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";
import FavouriteButton from "@/components/FavouriteButton";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import CategoryPicker from "@/components/CategoryPicker";

function ListingBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchType, setSearchType] = useState<'listings' | 'profiles'>(
    (searchParams.get("type") as 'listings' | 'profiles') || 'listings'
  );
  const [listings, setListings] = useState<ShortListingSummaryDto[]>([]);
  const [users, setUsers] = useState<AccountDetailDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [skip, setSkip] = useState(0);
  const [take] = useState(12);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("categoryId") || ""
  );
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [location, setLocation] = useState<string>(searchParams.get("location") || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const type = (searchParams.get("type") as 'listings' | 'profiles') || 'listings';
    const cat = searchParams.get("categoryId") || "";
    const loc = searchParams.get("location") || "";
    
    setSearchQuery(q);
    setSearchType(type);
    setSelectedCategory(cat);
    setLocation(loc);
    setSkip(0);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/category/root");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories");
      }
    };
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (searchType === 'listings') {
        const params = new URLSearchParams();
        params.append("skip", skip.toString());
        params.append("take", take.toString());
        if (selectedCategory) params.append("categoryId", selectedCategory);
        if (searchQuery) params.append("q", searchQuery);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (location) params.append("location", location);

        const res = await api.get(`/listing?${params.toString()}`);
        setListings(res.data.data || []);
        setUsers([]);
      } else {
        const res = await api.get(`/user/search?q=${encodeURIComponent(searchQuery)}`);
        setUsers(res.data || []);
        setListings([]);
      }
    } catch (err: any) {
      setError("Błąd przy pobieraniu danych");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [skip, take, selectedCategory, searchQuery, searchType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchQuery);
    params.set("type", searchType);
    if (location) params.set("location", location);
    else params.delete("location");
    if (selectedCategory) params.set("categoryId", selectedCategory);
    else params.delete("categoryId");
    router.push(`/listing?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8 pt-32">
        {/* Toggle Switch */}
        <div className="flex justify-center mb-8">
          <div className="bg-neutral-200 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => {
                setSearchType('listings');
                const params = new URLSearchParams(searchParams.toString());
                params.set("type", "listings");
                router.push(`/listing?${params.toString()}`);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                searchType === 'listings' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Ogłoszenia
            </button>
            <button
              onClick={() => {
                setSearchType('profiles');
                const params = new URLSearchParams(searchParams.toString());
                params.set("type", "profiles");
                router.push(`/listing?${params.toString()}`);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                searchType === 'profiles' ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Użytkownicy
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder={searchType === 'listings' ? "Czego szukasz?" : "Szukaj użytkownika..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
                />
              </div>
              
              {searchType === 'listings' && (
                <div className="relative md:w-64">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Miejscowość"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                className="px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                Szukaj
              </button>
              
              {searchType === 'listings' && (
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-4 rounded-2xl border border-neutral-200 flex items-center justify-center transition-all ${showFilters ? 'bg-neutral-100' : 'bg-white shadow-sm'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && searchType === 'listings' && (
              <div className="p-6 bg-white border border-neutral-200 rounded-3xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-6">
                  {/* Hierarchical Category Picker */}
                  <div className="pb-6 border-b border-neutral-100">
                    <CategoryPicker 
                        categories={categories}
                        initialCategoryId={selectedCategory}
                        onCategoryChange={(id) => setSelectedCategory(id)}
                        label="Kategoria"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-neutral-700">Cena (PLN)</label>
                        <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="Od"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-neutral-400">-</span>
                        <input
                            type="number"
                            placeholder="Do"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        </div>
                    </div>
                    
                    <div className="flex items-end justify-end">
                        <button 
                        type="button"
                        onClick={() => {
                            setMinPrice("");
                            setMaxPrice("");
                            setLocation("");
                            setSearchQuery("");
                            setSelectedCategory("");
                            const params = new URLSearchParams();
                            params.set("type", searchType);
                            router.push(`/listing?${params.toString()}`);
                        }}
                        className="text-sm text-neutral-500 hover:text-black underline transition-colors"
                        >
                        Wyczyść wszystkie filtry
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
            <p className="text-neutral-500">Ładowanie wyników...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {searchType === 'listings' ? (
              listings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">Brak ogłoszeń</h3>
                  <p className="text-neutral-500">Spróbuj zmienić parametry wyszukiwania</p>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {listings.map((item) => (
                      <div key={item.id} className="group relative">
                        <Link href={`/listing/${item.id}`} className="block">
                          <div className="relative aspect-[3/4] bg-neutral-100 rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
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
                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                              {item.category}
                            </div>
                          </div>

                          <div className="space-y-1 px-1">
                            <h4 className="font-medium text-neutral-900 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-xl font-bold">{item.price} PLN</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-medium uppercase tracking-tighter">
                               <MapPin className="w-3 h-3" />
                               <span>{item.location || "Polska"}</span>
                               <span>•</span>
                               <span>{item.created_at}</span>
                            </div>
                          </div>
                        </Link>
                        <FavouriteButton 
                          listingId={item.id} 
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                          size={18}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex gap-4 justify-center mb-12">
                    <button
                      onClick={() => {
                        setSkip(Math.max(0, skip - take));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={skip === 0}
                      className="px-8 py-3 border border-neutral-200 bg-white rounded-xl font-medium hover:bg-neutral-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      Poprzednia
                    </button>
                    <button
                      onClick={() => {
                        setSkip(skip + take);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={listings.length < take}
                      className="px-8 py-3 border border-neutral-200 bg-white rounded-xl font-medium hover:bg-neutral-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      Następna
                    </button>
                  </div>
                </>
              )
            ) : (
              // Users Results
              users.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold mb-2">Nie znaleziono użytkowników</h3>
                  <p className="text-neutral-500">Spróbuj wyszukać kogoś innego</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {users.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/account?id=${profile.id}`}
                      className="bg-white p-6 rounded-3xl border border-neutral-200 hover:border-black transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200 flex-shrink-0">
                          {profile.pictureUrl ? (
                            <img
                              src={profile.pictureUrl.startsWith('http') ? profile.pictureUrl : (process.env.NEXT_PUBLIC_SERVER_URL + profile.pictureUrl)}
                              alt={profile.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-neutral-400">
                              {profile.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-black">{profile.username}</h3>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="text-sm font-medium text-neutral-600">{profile.rating || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.city || "Polska"}</span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2 italic">
                          {profile.description || "Brak opisu profilu"}
                        </p>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-black transition-colors">Zobacz profil</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ListingBrowse() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin" /></div>}>
      <ListingBrowseContent />
    </Suspense>
  );
}
