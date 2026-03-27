"use client";
import { Edit2, MapPin, Star, Heart, Share2, MessageCircle, Eye, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {useEffect, useState} from 'react';
import {useUser} from "@/context/UserContext";
import {useSearchParams} from "next/navigation";
import {AccountDetailDto} from "@/models/user/AccountDetailDto";
import {ShortListingSummaryDto} from "@/models/listing/ShortListingSummaryDto";
import {GetReviewDto} from "@/models/review/GetReviewDto";

export default function UserProfilePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [foundUser, setFoundUser] = useState<AccountDetailDto | null>(null);
  const [foundListings, setFoundListings] = useState<ShortListingSummaryDto[]>([]);
  const [foundReviews, setFoundReviews] = useState<GetReviewDto[]>([]);
  const { user } = useUser();



  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
        .then((data: AccountDetailDto) => setFoundUser(data))
        .catch((err) => {console.error(err); setFoundUser(null);});

    fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/user/${userId}/listings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
        .then((data: ShortListingSummaryDto[]) => setFoundListings(data))
        .catch((err) => {console.error(err); setFoundListings([]);});

    fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/user/${userId}/reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
        .then((data: GetReviewDto[]) => setFoundReviews(data))
        .catch((err) => {console.error(err); setFoundReviews([]);});
  }, []);

  console.log(foundListings);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="pt-24">
        {/* Profile Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="px-6 lg:px-12 max-w-[1400px] mx-auto py-16">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
              {/* Avatar and Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-neutral-200 to-neutral-100 rounded-lg flex items-center justify-center text-6xl">
                  👤
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-4xl font-light mb-2">{foundUser?.username} {foundUser?.name && (
                          <span>
                        ({[foundUser.name, foundUser.surname].filter(Boolean).join(" ")})
                          </span>
                        )}
                    </h1>
                    {foundUser?.createdAt && (
                        <p className="text-sm text-neutral-600 mb-4">
                          {`Member since ${new Date(foundUser.createdAt).toLocaleString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}`}
                        </p>
                    )}
                  </div>
                  {user?.id == foundUser?.id && (
                  <button className="px-6 py-3 border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 mb-8 pb-8 border-b border-neutral-200">
                  <div>
                    <p className="text-2xl font-semibold mb-1">{foundUser?.rating}</p>
                    <div className="text-xs text-neutral-600 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const isFilled = i < Math.round(foundUser?.rating || 0);
                          return (
                              <Star
                                  key={i}
                                  className={`w-3 h-3 ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 fill-neutral-300'}`}
                              />
                          );
                        })}
                      </div>
                      ({foundUser?.reviews} reviews)
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{foundUser?.city && foundUser?.countryCode
                        ? `${foundUser.city}, ${foundUser.countryCode}`
                        : foundUser?.city
                            ? foundUser.city
                            : foundUser?.countryCode
                                ? foundUser.countryCode
                                : "No location"}</span>
                  </div>
                </div>

                {/* Bio and Actions */}
                <p className="text-neutral-700 mb-6 max-w-2xl">{foundUser?.description ?? "No description"}</p>
                <div className="flex gap-3 flex-wrap">
                  {user?.id != foundUser?.id && (
                  <button className="px-6 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Seller
                  </button>
                      )}
                  <button className="px-6 py-3 border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </button>
                </div>
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
                  {tab === 'listings' ? `Active Listings (${foundListings.length})` : `Reviews (${foundReviews.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundListings.map((listing) => (
                  <div 
                    key={listing.id}
                    className="border border-neutral-200 overflow-hidden hover:border-neutral-400 transition-colors hover:shadow-md cursor-pointer"
                  >
                    {/* Image Section */}
                    <div className="bg-gradient-to-br from-neutral-100 to-neutral-50 p-12 text-5xl flex items-center justify-center min-h-48 relative group">
                      {listing.imageUrl}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Category Badge */}
                      <span className="inline-block text-xs text-neutral-600 mb-3 px-2 py-1 bg-neutral-100 rounded">
                        {listing.category}
                      </span>

                      {/* Title and Price */}
                      <h3 className="font-medium text-base mb-3 line-clamp-2">{listing.title}</h3>
                      <p className="text-2xl font-semibold mb-4">${listing.price}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-neutral-600 border-t border-neutral-100 pt-4 mb-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {listing.viewsCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {listing.likesCount} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {listing.created_at}
                        </span>
                      </div>

                      {/* Hover Action */}
                      <button className="w-full py-2 text-sm border border-neutral-200 hover:bg-neutral-50 transition-colors font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {foundReviews.map((review) => (
                <div key={review.id} className="border-b border-neutral-200 pb-8 mb-8">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">{review.reviewer_name}</h3>
                    <span className="text-xs text-neutral-600">{review.created_at}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-neutral-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
