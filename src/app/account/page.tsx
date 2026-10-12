"use client";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit2, Loader2, MapPin, MessageCircle, PackageOpen, Pencil, Plus, Send, Share2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import ListingCard from "@/components/ListingCard";
import ShareModal from "@/modals/ShareModal";
import EditProfileModal from "@/modals/EditProfileModal";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useUser } from "@/context/UserContext";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";

interface ReviewItem {
  id: number;
  reviewer_name: string;
  comment: string;
  rating: number;
  created_at: string;
}

function Stars({ value, size = "h-3.5 w-3.5" }: { value: number; size?: string }) {
  return (
    <span className="flex" role="img" aria-label={`Ocena ${value} na 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? "fill-secondary text-secondary" : "fill-neutral-200 text-neutral-200"}`} />
      ))}
    </span>
  );
}

function UserProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profile, setProfile] = useState<AccountDetailDto | null>(null);
  const [listings, setListings] = useState<ShortListingSummaryDto[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Bez ?id= pokazujemy własny profil
  const paramId = searchParams.get("id");
  const targetId = paramId ?? (user ? String(user.id) : null);

  useEffect(() => {
    if (!paramId && !userLoading && !user) router.replace("/login?next=/account");
  }, [paramId, userLoading, user, router]);

  const load = useCallback(async () => {
    if (!targetId) return;
    try {
      setError(null);
      const [userRes, listingsRes, reviewsRes] = await Promise.all([
        api.get(`/user/${targetId}`),
        api.get(`/user/${targetId}/listings`),
        api.get(`/review/user/${targetId}`),
      ]);
      setProfile(userRes.data);
      setListings(listingsRes.data);
      setReviews(reviewsRes.data.data || []);
    } catch (err) {
      setError(apiError(err, "Nie udało się pobrać danych profilu"));
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    if (userLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ładowanie danych z API po zmianie profilu
    load();
  }, [load, userLoading, user?.id]);

  const isOwnProfile = !!user && user.id === profile?.id;

  const handleAddReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return router.push(`/login?next=${encodeURIComponent(`/account?id=${profile?.id}`)}`);
    if (!profile) return;

    setSubmitting(true);
    setReviewError(null);
    try {
      await api.post("/review", { rating, comment: comment.trim() || undefined, reviewed_user_id: profile.id });
      setComment("");
      setRating(5);
      await load();
    } catch (err) {
      setReviewError(apiError(err, "Błąd przy dodawaniu opinii"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleContact = async () => {
    if (!user) return router.push(`/login?next=${encodeURIComponent(`/account?id=${profile?.id}`)}`);
    if (!profile) return;
    setContactError(null);
    if (listings.length === 0) {
      return setContactError("Ten użytkownik nie ma ogłoszeń, od których można rozpocząć rozmowę.");
    }
    try {
      const res = await api.post("/chat", { listingId: listings[0].id });
      router.push(`/chat/${res.data.data.id}`);
    } catch (err) {
      setContactError(apiError(err, "Nie udało się rozpocząć rozmowy"));
    }
  };

  if (loading || userLoading || (!paramId && !user)) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex flex-col items-center pt-40 text-neutral-500">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
          Ładowanie profilu...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-40 text-center">
          <p role="alert" className="alert-error mx-auto mb-6 max-w-md">
            {error || "Użytkownik nie został znaleziony"}
          </p>
          <Link href="/" className="btn-outline">
            Strona główna
          </Link>
        </div>
      </div>
    );
  }

  const fullName = [profile.name, profile.surname].filter(Boolean).join(" ");
  const location = [profile.city, profile.countryCode].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      {isShareOpen && <ShareModal shareUrl={typeof window !== "undefined" ? window.location.href : ""} onClose={() => setIsShareOpen(false)} />}
      {isEditOpen && <EditProfileModal onClose={() => setIsEditOpen(false)} userId={profile.id} />}

      <div className="pt-16 sm:pt-20">
        <header className="relative overflow-hidden border-b border-neutral-200 bg-white">
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
          <div className="container-page relative pb-10 pt-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
              <Avatar name={profile.username} src={profile.pictureUrl} size={128} className="!ring-4 !ring-white shadow-lg" />

              <div className="flex-1">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      {profile.username || "Użytkownik"}
                      {fullName && <span className="ml-3 text-lg font-normal text-neutral-500">{fullName}</span>}
                    </h1>
                    {profile.createdAt && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Członek od {new Date(profile.createdAt).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile && (
                      <button onClick={() => setIsEditOpen(true)} className="btn-outline">
                        <Edit2 className="h-4 w-4" /> Edytuj profil
                      </button>
                    )}
                    <button onClick={() => setIsShareOpen(true)} aria-label="Udostępnij profil" className="btn-outline !px-3.5">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-neutral-100 pt-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">{Number(profile.rating || 0).toFixed(1)}</span>
                    <div>
                      <Stars value={profile.rating || 0} size="h-4 w-4" />
                      <p className="text-xs text-neutral-500">{profile.reviews || 0} opinii</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4" />
                    {location || "Brak lokalizacji"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-2xl">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">O mnie</h2>
              <p className="whitespace-pre-wrap break-words leading-relaxed text-neutral-700">
                {profile.description || "Ten użytkownik nie dodał jeszcze opisu."}
              </p>
            </div>

            {isOwnProfile && (profile.email || profile.phone_number) && (
              <p className="mt-4 text-xs text-neutral-400">
                Twoje dane kontaktowe ({[profile.email, profile.phone_number].filter(Boolean).join(" · ")}) widzisz tylko Ty.
              </p>
            )}

            {!isOwnProfile && (
              <div className="mt-6">
                <button onClick={handleContact} className="btn-primary">
                  <MessageCircle className="h-4 w-4" /> Skontaktuj się
                </button>
                {contactError && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {contactError}
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="container-page py-10">
          <div role="tablist" className="mb-10 flex gap-8 border-b border-neutral-200">
            {(["listings", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {tab === "listings" ? `Ogłoszenia (${listings.length})` : `Opinie (${reviews.length})`}
              </button>
            ))}
          </div>

          {activeTab === "listings" && (
            <section>
              {isOwnProfile && (
                <div className="mb-6 flex justify-end">
                  <Link href="/listing/create" className="btn-primary">
                    <Plus className="h-4 w-4" /> Dodaj ogłoszenie
                  </Link>
                </div>
              )}
              {listings.length === 0 ? (
                <div className="card border-dashed py-16 text-center">
                  <PackageOpen className="mx-auto mb-3 h-12 w-12 text-neutral-300" strokeWidth={1.25} />
                  <p className="text-neutral-500">Brak ogłoszeń</p>
                </div>
              ) : (
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {listings.map((listing) => (
                    <div key={listing.id}>
                      <ListingCard item={listing} />
                      {isOwnProfile && (
                        <Link
                          href={`/listing/${listing.id}/edit`}
                          className="mt-2 inline-flex items-center gap-1.5 px-1 text-xs font-semibold text-neutral-500 hover:text-primary"
                        >
                          <Pencil className="h-3 w-3" /> Edytuj
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "reviews" && (
            <section className="max-w-3xl">
              {!isOwnProfile && (
                <form onSubmit={handleAddReview} className="card mb-10 space-y-5 p-6 sm:p-8">
                  <h2 className="text-xl font-bold">Dodaj opinię</h2>
                  {!user ? (
                    <p className="text-sm text-neutral-600">
                      <Link href={`/login?next=${encodeURIComponent(`/account?id=${profile.id}`)}`} className="font-semibold text-primary hover:underline">
                        Zaloguj się
                      </Link>
                      , aby ocenić tego użytkownika.
                    </p>
                  ) : (
                    <>
                      <fieldset>
                        <legend className="label">Twoja ocena</legend>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              aria-label={`${star} z 5`}
                              aria-pressed={star <= rating}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star className={`h-8 w-8 ${star <= rating ? "fill-secondary text-secondary" : "text-neutral-200"}`} />
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <div>
                        <label htmlFor="review-comment" className="label">
                          Komentarz (opcjonalnie)
                        </label>
                        <textarea
                          id="review-comment"
                          value={comment}
                          maxLength={1000}
                          onChange={(e) => setComment(e.target.value)}
                          className="input min-h-[110px]"
                          placeholder="Napisz, jak wyglądała współpraca z tym użytkownikiem..."
                        />
                      </div>
                      {reviewError && (
                        <p role="alert" className="text-sm text-red-600">
                          {reviewError}
                        </p>
                      )}
                      <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Opublikuj opinię
                      </button>
                    </>
                  )}
                </form>
              )}

              {reviews.length === 0 ? (
                <div className="card border-dashed py-12 text-center text-neutral-500">Brak opinii o tym użytkowniku</div>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="card p-6">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold">{review.reviewer_name}</h3>
                          <Stars value={review.rating} />
                        </div>
                        <span className="text-xs text-neutral-400">{review.created_at}</span>
                      </div>
                      {review.comment && <p className="whitespace-pre-wrap break-words leading-relaxed text-neutral-700">{review.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}
