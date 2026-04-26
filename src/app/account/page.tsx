"use client";
import { Edit2, MapPin, Star, Heart, Share2, MessageCircle, Eye, Clock, Loader, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {useEffect, useState, Suspense} from 'react';
import {useUser} from "@/context/UserContext";
import {useSearchParams, useRouter} from "next/navigation";
import {AccountDetailDto} from "@/models/user/AccountDetailDto";
import {ShortListingSummaryDto} from "@/models/listing/ListingDto";
import ShareModal from "@/modals/ShareModal";
import EditProfileModal from "@/modals/EditProfileModal";
import api from "@/lib/api";
import Link from 'next/link';

interface GetReviewDto {
  id: number;
  reviewer_name: string;
  comment: string;
  rating: number;
  created_at: string;
}

function UserProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [foundUser, setFoundUser] = useState<AccountDetailDto | null>(null);
  const [foundListings, setFoundListings] = useState<ShortListingSummaryDto[]>([]);
  const [foundReviews, setFoundReviews] = useState<GetReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const profileUserId = searchParams.get('id');

  const fetchData = async () => {
    let targetId = profileUserId;
    
    if (!targetId && user) {
      targetId = user.id.toString();
    }

    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      const [userRes, listingsRes, reviewsRes] = await Promise.all([
        api.get(`/user/${targetId}`),
        api.get(`/user/${targetId}/listings`),
        api.get(`/review/user/${targetId}`)
      ]);

      setFoundUser(userRes.data);
      setFoundListings(listingsRes.data);
      setFoundReviews(reviewsRes.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się pobrać danych profilu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileUserId, user]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        router.push("/login");
        return;
    }
    if (!foundUser) return;

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
        await api.post("/review", {
            rating: newRating,
            comment: newComment,
            reviewed_user_id: foundUser.id
        });
        setNewComment("");
        setNewRating(5);
        // Refresh reviews
        const reviewsRes = await api.get(`/review/user/${foundUser.id}`);
        setFoundReviews(reviewsRes.data.data || []);
        
        // Also refresh user rating
        const userRes = await api.get(`/user/${foundUser.id}`);
        setFoundUser(userRes.data);
    } catch (err: any) {
        setReviewError(err?.response?.data?.message || "Błąd przy dodawaniu opinii");
    } finally {
        setIsSubmittingReview(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
        router.push("/login");
        return;
    }
    if (!foundUser || foundListings.length === 0) {
        alert("Ten użytkownik nie ma żadnych aktywnych ogłoszeń, z którymi można by powiązać czat.");
        return;
    }

    try {
        // Start chat based on the first listing
        const chatRes = await api.post("/chat", {
            listingId: foundListings[0].id
        });
        router.push(`/chat/${chatRes.data.data.id}`);
    } catch (err) {
        console.error("Failed to start chat", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
          <p className="text-neutral-500">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (error || !foundUser) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-red-600 mb-4">{error || "Użytkownik nie znaleziony"}</p>
          <Link href="/" className="text-blue-600 hover:underline">Powrót do strony głównej</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === foundUser?.id;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {isShareOpen && (
          <ShareModal shareUrl={typeof window !== 'undefined' ? window.location.href : ''} onClose={() => setIsShareOpen(false)} />
      )}
      {isEditOpen && (
          <EditProfileModal onClose={() => setIsEditOpen(false)} userId={foundUser.id.toString()}/>
      )}
      <div className="pt-24">
        {/* Profile Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-neutral-200 to-neutral-100 rounded-lg flex items-center justify-center text-6xl shadow-sm overflow-hidden">
                  {foundUser.pictureUrl ? (
                    <img 
                      src={foundUser.pictureUrl.startsWith('http') ? foundUser.pictureUrl : (process.env.NEXT_PUBLIC_SERVER_URL + foundUser.pictureUrl)} 
                      alt={foundUser.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : "👤"}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-4xl font-light mb-2">
                      {foundUser.username}
                      {(foundUser.name || foundUser.surname) && (
                        <span className="text-xl text-neutral-500 ml-3">
                          ({[foundUser.name, foundUser.surname].filter(Boolean).join(" ")})
                        </span>
                      )}
                    </h1>
                    {foundUser.createdAt && (
                        <p className="text-sm text-neutral-600">
                          {`Członek od ${new Date(foundUser.createdAt).toLocaleString('pl-PL', {
                            month: 'long',
                            year: 'numeric'
                          })}`}
                        </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isOwnProfile && (
                      <button className="px-6 py-3 border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2 rounded-lg"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edytuj profil
                      </button>
                    )}
                    <button className="p-3 border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2 rounded-lg"
                      onClick={() => setIsShareOpen(true)}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b border-neutral-200">
                  <div>
                    <p className="text-2xl font-semibold mb-1">{Number(foundUser.rating || 0).toFixed(1)}</p>
                    <div className="text-xs text-neutral-600 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const isFilled = i < Math.round(foundUser.rating || 0);
                          return (
                              <Star
                                  key={i}
                                  className={`w-3 h-3 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 fill-neutral-300'}`}
                              />
                          );
                        })}
                      </div>
                      ({foundUser.reviews || 0} opinii)
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {foundUser.city || foundUser.countryCode
                        ? [foundUser.city, foundUser.countryCode].filter(Boolean).join(", ")
                        : "Brak lokalizacji"}
                    </span>
                  </div>
                </div>

                {/* Bio and Actions */}
                <div className="mb-8 max-w-2xl">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-2">O mnie</h3>
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {foundUser.description || "Ten użytkownik nie dodał jeszcze opisu."}
                  </p>
                </div>
                
                {!isOwnProfile && (
                  <button 
                    onClick={handleContact}
                    className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 rounded-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Skontaktuj się
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16">
          {/* Navigation Tabs */}
          <div className="border-b border-neutral-200 mb-12">
            <div className="flex gap-8">
              {(['listings', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-black text-black'
                      : 'border-transparent text-neutral-600 hover:text-black'
                  }`}
                >
                  {tab === 'listings' ? `Ogłoszenia (${foundListings.length})` : `Opinie (${foundReviews.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div>
              {foundListings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-300">
                  <p className="text-neutral-500">Brak aktywnych ogłoszeń</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {foundListings.map((listing) => (
                    <Link 
                      href={`/listing/${listing.id}`}
                      key={listing.id}
                      className="group border border-neutral-200 bg-white rounded-2xl overflow-hidden hover:border-neutral-400 transition-all hover:shadow-md cursor-pointer"
                    >
                      {/* Image Section */}
                      <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center relative overflow-hidden">
                        {listing.imageUrl ? (
                          <img 
                            src={listing.imageUrl.startsWith('http') ? listing.imageUrl : (process.env.NEXT_PUBLIC_SERVER_URL + listing.imageUrl)} 
                            alt={listing.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <span className="text-5xl">📦</span>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                            {listing.category}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">{listing.title}</h3>
                        <p className="text-xl font-bold mb-4">{listing.price} PLN</p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-50 pt-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {listing.viewsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {listing.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(listing.created_at).toLocaleDateString('pl-PL')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {/* Add Review Form */}
              {!isOwnProfile && (
                <div className="bg-white p-8 rounded-3xl border border-neutral-200 mb-12 shadow-sm">
                  <h3 className="text-xl font-bold mb-6">Dodaj opinię o użytkowniku</h3>
                  <form onSubmit={handleAddReview} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-3">Twoja ocena</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star 
                                        className={`w-8 h-8 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Komentarz (opcjonalnie)</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black min-h-[120px] transition-all"
                            placeholder="Napisz co sądzisz o współpracy z tym użytkownikiem..."
                        />
                    </div>
                    {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                    <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmittingReview ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Opublikuj opinię
                    </button>
                  </form>
                </div>
              )}

              {foundReviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-300">
                  <p className="text-neutral-500">Brak opinii o tym użytkowniku</p>
                </div>
              ) : (
                <div className="space-y-6">
                    {foundReviews.map((review) => (
                    <div key={review.id} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{review.reviewer_name}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                        key={i} 
                                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-neutral-400">{review.created_at}</span>
                        </div>
                        <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                    </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin" /></div>}>
      <UserProfileContent />
    </Suspense>
  );
}
