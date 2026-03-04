'use client';
import { useState } from "react";
import { Heart, ShoppingBag, Menu, User, Cloud, MessageCircle, Search, X } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

    return (
    <>
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-8 lg:gap-12">
              <Logo />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              
              <div className="relative hidden sm:flex items-center">
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    searchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 pr-10 bg-neutral-100 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm"
                    autoFocus={searchOpen}
                  />
                </div>
                <button 
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors ml-2"
                >
                  {searchOpen ? (
                    <X className="w-5 h-5 text-neutral-700" />
                  ) : (
                    <Search className="w-5 h-5 text-neutral-700" />
                  )}
                </button>
              </div>

              <button className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <MessageCircle className="w-5 h-5 text-neutral-700" />
              </button>
              <button className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-neutral-700" />
              </button>
              <button className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <User className="w-5 h-5 text-neutral-700" />
              </button>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors sm:hidden md:hidden lg:hidden"
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
          className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">Menu</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Search on mobile */}
              <div className="mb-6 sm:hidden">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-400 text-sm"
                />
              </div>

              {/* Actions */}
              <div className="space-y-1 sm:hidden">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Account</h3>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Messages</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    )
  }