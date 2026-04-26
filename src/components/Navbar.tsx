'use client';
import { useState, FormEvent } from "react";
import { Heart, ShoppingBag, Menu, User, Cloud, MessageCircle, Search, X, LogOut } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, setUser, isLoading } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/";
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listing?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-8 lg:gap-12">
              <Logo />
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/listing" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                  Przeglądaj
                </Link>
                <Link href="/listing?type=profiles" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                  Użytkownicy
                </Link>
                <Link href="/listing/create" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                  Sprzedaj
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              <div className="relative hidden sm:flex items-center">
                <form 
                  onSubmit={onSearch}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    searchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Szukaj produktów..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pr-10 bg-neutral-100 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm"
                    autoFocus={searchOpen}
                  />
                </form>
                <button 
                  onClick={() => {
                    if (searchOpen && searchQuery.trim()) {
                      onSearch({ preventDefault: () => {} } as FormEvent);
                    } else {
                      setSearchOpen(!searchOpen);
                    }
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors ml-2"
                >
                  {searchOpen ? (
                    searchQuery.trim() ? <Search className="w-5 h-5 text-neutral-700" /> : <X className="w-5 h-5 text-neutral-700" />
                  ) : (
                    <Search className="w-5 h-5 text-neutral-700" />
                  )}
                </button>
              </div>

              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <button className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <Link href="/chat" className="block">
                          <MessageCircle className="w-5 h-5 text-neutral-700" />
                        </Link>
                      </button>
                      <button className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <Link href="/favourites" className="block">
                          <Heart className="w-5 h-5 text-neutral-700" />
                        </Link>
                      </button>
                      <div className="relative group">
                        <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex items-center gap-2">
                          <Link href={`/account?id=${user.id}`} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center text-xs overflow-hidden border border-neutral-100">
                              {user.pictureUrl ? (
                                <img 
                                  src={user.pictureUrl.startsWith('http') ? user.pictureUrl : (process.env.NEXT_PUBLIC_SERVER_URL + user.pictureUrl)} 
                                  alt={user.username} 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                user.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                              )}
                            </div>
                            <span className="hidden lg:block text-sm font-medium text-neutral-700">{user.username}</span>
                          </Link>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="p-2">
                            <Link href={`/account?id=${user.id}`} className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg">
                              Mój Profil
                            </Link>
                            <button 
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" />
                              Wyloguj się
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link href="/login" className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-black transition-colors">
                        Logowanie
                      </Link>
                      <Link href="/register" className="px-4 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-neutral-800 transition-colors">
                        Rejestracja
                      </Link>
                    </div>
                  )}
                </>
              )}

              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors sm:hidden"
              >
                {menuOpen ? (
                  <X className="w-5 h-5 text-neutral-700" />
                ) : (
                  <Menu className="w-5 h-5 text-neutral-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div 
          className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
              <Logo />
              <button onClick={() => setMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <Link href="/listing" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Przeglądaj</span>
                </Link>
                <Link href="/listing?type=profiles" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                  <User className="w-5 h-5" />
                  <span>Użytkownicy</span>
                </Link>
                <Link href="/listing/create" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                  <Cloud className="w-5 h-5" />
                  <span>Sprzedaj</span>
                </Link>
                
                <div className="pt-4 border-t border-neutral-100">
                  {!isLoading && (
                    <>
                      {user ? (
                        <>
                          <Link href={`/account?id=${user.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                            <User className="w-5 h-5" />
                            <span>Mój Profil</span>
                          </Link>
                          <Link href="/favourites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                            <Heart className="w-5 h-5" />
                            <span>Ulubione</span>
                          </Link>
                          <Link href="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black">
                            <MessageCircle className="w-5 h-5" />
                            <span>Czaty</span>
                          </Link>
                          <button 
                            onClick={() => {
                              handleLogout();
                              setMenuOpen(false);
                            }}
                            className="flex items-center gap-3 py-2 text-red-600 w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Wyloguj się</span>
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full py-3 text-center border border-neutral-200 rounded-xl">
                            Logowanie
                          </Link>
                          <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full py-3 text-center bg-black text-white rounded-xl">
                            Rejestracja
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}