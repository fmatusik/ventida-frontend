"use client";
import { useState, useEffect, Suspense } from "react";
import { Search, User, MapPin, Star, Loader } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";
import { useSearchParams } from "next/navigation";

function ProfilesSearchContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<AccountDetailDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const fetchUsers = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
      setUsers(res.data);
    } catch (err: any) {
      setError("Błąd przy wyszukiwaniu profili");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
      fetchUsers(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchUsers(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8 pt-32">
        <h1 className="text-4xl font-bold mb-8">Wyszukaj profile</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Wpisz nazwę użytkownika..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 transition-all"
            >
              Szukaj
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
            <p className="text-neutral-500">Przeszukiwanie bazy użytkowników...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-red-500">{error}</p>
          </div>
        ) : users.length === 0 && searchQuery ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">Nie znaleziono użytkowników pasujących do "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((profile) => (
              <Link
                key={profile.id}
                href={`/account?id=${profile.id}`}
                className="bg-white p-6 rounded-3xl border border-neutral-200 hover:border-black transition-all group"
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
                    <span>{profile.city || "Brak lokalizacji"}</span>
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
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ProfilesSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin" /></div>}>
      <ProfilesSearchContent />
    </Suspense>
  );
}
