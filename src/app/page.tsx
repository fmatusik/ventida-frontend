"use client";
import { Search, ShoppingBag, Heart, User, Menu, TrendingUp, Zap, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useUser } from '@/context/UserContext';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);
  const trendingItems = [
    { 
      id: 1, 
      title: 'Vintage Denim Jacket', 
      price: '299', 
      oldPrice: '599',
      image: '🧥',
      seller: 'StyleHub',
      rating: 4.8,
      badge: 'Hot'
    },
    { 
      id: 2, 
      title: 'Minimalist Desk Lamp', 
      price: '149', 
      oldPrice: '299',
      image: '💡',
      seller: 'HomeEssentials',
      rating: 4.9,
      badge: 'New'
    },
    { 
      id: 3, 
      title: 'Wireless Earbuds Pro', 
      price: '459', 
      oldPrice: '799',
      image: '🎧',
      seller: 'TechWorld',
      rating: 4.7,
      badge: 'Sale'
    },
    { 
      id: 4, 
      title: 'Canvas Sneakers', 
      price: '199', 
      oldPrice: '349',
      image: '👟',
      seller: 'UrbanFeet',
      rating: 4.6,
      badge: 'Hot'
    },
  ];

  const categories = [
    { name: 'Electronics', count: '12.4k', trend: '+12%' },
    { name: 'Fashion', count: '18.2k', trend: '+8%' },
    { name: 'Home', count: '9.7k', trend: '+15%' },
    { name: 'Sports', count: '6.3k', trend: '+5%' },
    { name: 'Books', count: '4.1k', trend: '+3%' },
    { name: 'Motors', count: '3.8k', trend: '+10%' },
  ];

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
              <span>FLASH DEALS</span>
              <span className="ml-1 opacity-70">GET 60% OFF</span>
            </div>
            <h2 className="text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight">
              Discover
              <br />
              <span className="font-semibold text-primary">unique finds</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
              Shop from verified sellers. Quality products at unbeatable prices. Your marketplace for everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                Explore Now →
              </button>
              <button className="px-8 py-4 border border-neutral-300 text-sm font-medium hover:bg-neutral-100 transition-colors">
                Start Selling
              </button>
            </div>
          </div>
          
          {/* Hero Image Card */}
          <div className="relative">
            <div className="aspect-[4/5] bg-neutral-100 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <span className="text-9xl">🎒</span>
              </div>
              <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-medium">Trending</span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Leather Backpack</h3>
                    <p className="text-sm text-neutral-600">Premium Collection</p>
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
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-600">{cat.trend}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-sm text-neutral-500">{cat.count} items</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-light">
            <span className="font-semibold text-primary">Trending</span> this week
          </h3>
          <button className="text-sm font-medium hover:underline">View all →</button>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingItems.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <span className="text-8xl">{item.image}</span>
                </div>
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                  {item.badge}
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span>{item.seller}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <h4 className="font-medium text-neutral-900">{item.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">{item.price} PLN</span>
                  <span className="text-sm text-neutral-400 line-through">{item.oldPrice} PLN</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mb-20">
        <div className="bg-black text-white rounded-3xl p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-xl">
            <h3 className="text-4xl lg:text-5xl font-light mb-4 leading-tight">
              Start selling
              <br />
              <span className="font-semibold">in minutes</span>
            </h3>
            <p className="text-neutral-300 mb-8 text-lg">
              Join 50,000+ sellers and turn your unused items into cash. It's free to list.
            </p>
            <button className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-neutral-100 transition-colors">
              Create Listing →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
        <Footer/>
    </div>
  );
}