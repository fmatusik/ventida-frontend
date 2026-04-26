"use client";
import { useState, useEffect } from "react";
import { Heart, Share2, MapPin, User, Phone, Mail, MessageCircle, ArrowLeft, Loader, FolderTree } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { ListingResponseDto } from "@/models/listing/ListingDto";
import { useUser } from "@/context/UserContext";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";

import FavouriteButton from "@/components/FavouriteButton";

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [listing, setListing] = useState<ListingResponseDto | null>(null);
  const [seller, setSeller] = useState<AccountDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const listingId = params.id as string;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/listing/${listingId}`);
        const listingData = res.data.data;
        setListing(listingData);

        // Fetch seller details
        try {
            const sellerRes = await api.get(`/user/${listingData.userId}`);
            setSeller(sellerRes.data);
        } catch (e) {
            console.error("Failed to fetch seller details");
        }

        // Check if favourite
        if (user) {
          const favRes = await api.get(`/favourite/${listingId}/check`);
          setIsFavourite(favRes.data.data.isFavourite);
        }

        // Add view
        try {
          await api.post("/view", { listingId: parseInt(listingId) });
        } catch (e) {
          console.log("Failed to add view");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Błąd przy pobieraniu ogłoszenia");
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, user]);

  const startChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!listing) return;

    try {
      const chatRes = await api.post("/chat", {
        listingId: parseInt(listingId),
      });
      // The backend returns { success: true, data: chat }
      const chatId = chatRes.data.data.id;
      router.push(`/chat/${chatId}`);
    } catch (err: any) {
      console.error("Błąd przy tworzeniu czatu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-neutral-200 rounded-lg"></div>
            <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/listing" className="text-blue-600 hover:underline">
            Powrót do ogłoszeń
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </button>

        <div className="grid lg:grid-cols-3 gap-8 pt-32">
          {/* Left - Images */}
          <div className="lg:col-span-2">
            {/* Main image */}
            <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm border border-neutral-200">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex].url.startsWith('http') ? images[currentImageIndex].url : (process.env.NEXT_PUBLIC_SERVER_URL + images[currentImageIndex].url)}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-6xl">
                  📦
                </div>
              )}
              <FavouriteButton 
                listingId={parseInt(listingId)} 
                initialIsFavourite={isFavourite}
                className="absolute top-4 right-4"
                size={24}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? "border-black scale-95 shadow-sm" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <img
                      src={img.url.startsWith('http') ? img.url : (process.env.NEXT_PUBLIC_SERVER_URL + img.url)}
                      alt={`${listing.title} ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {listing.status}
              </span>
            </div>

            {/* Title and price */}
            <div>
              {listing.category && (
                <Link 
                  href={`/listing?categoryId=${listing.category.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors mb-3"
                >
                  <FolderTree className="w-3 h-3" />
                  {listing.category.name}
                </Link>
              )}
              <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>
              <div className="space-y-2">
                <p className="text-5xl font-bold">{listing.price} PLN</p>
                {listing.is_negotiable && (
                  <p className="text-sm text-neutral-600">Cena do negocjacji</p>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 py-6 border-y border-neutral-200">
              <div className="flex items-center gap-3 text-neutral-600">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-600">
                <span className="text-sm">Opublikowane: {new Date(listing.created_at).toLocaleDateString("pl-PL")}</span>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-neutral-100 p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Kontakt ze sprzedającym</h3>

              {seller && (
                <Link 
                  href={`/account?id=${seller.id}`}
                  className="flex items-center gap-4 mb-6 p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden flex-shrink-0 border border-neutral-100">
                    {seller.pictureUrl ? (
                      <img 
                        src={seller.pictureUrl.startsWith('http') ? seller.pictureUrl : (process.env.NEXT_PUBLIC_SERVER_URL + seller.pictureUrl)} 
                        alt={seller.username} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold">
                        {seller.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 group-hover:text-black transition-colors">{seller.username}</p>
                    <p className="text-xs text-neutral-500">Zobacz profil →</p>
                  </div>
                </Link>
              )}

              {listing.contact_person && (
                <p className="mb-2 text-neutral-700">{listing.contact_person}</p>
              )}
              {listing.email && (
                <div className="flex items-center gap-2 mb-2 text-neutral-600">
                  <Mail className="w-4 h-4" />
                  <span>{listing.email}</span>
                </div>
              )}
              {listing.phone_number && (
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{listing.phone_number}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {user?.id !== listing.userId ? (
              <div className="space-y-3">
                <button
                  onClick={startChat}
                  className="w-full px-6 py-4 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Skontaktuj się
                </button>
                <button className="w-full px-6 py-4 border border-neutral-300 font-medium rounded-lg hover:bg-neutral-100 transition-colors">
                  Udostępnij
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/listing/${listingId}/edit`}
                  className="block w-full px-6 py-4 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors text-center"
                >
                  Edytuj ogłoszenie
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="text-2xl font-bold mb-4">Opis</h2>
          <p className="text-neutral-700 whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
