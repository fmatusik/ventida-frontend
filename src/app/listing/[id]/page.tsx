"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderTree,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  PackageOpen,
  Pencil,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import FavouriteButton from "@/components/FavouriteButton";
import { formatPrice } from "@/components/ListingCard";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { mediaUrl } from "@/lib/media";
import { useUser } from "@/context/UserContext";
import { ListingResponseDto } from "@/models/listing/ListingDto";
import { AccountDetailDto } from "@/models/user/AccountDetailDto";

const STATUS: Record<string, { label: string; className: string }> = {
  available: { label: "Dostępne", className: "bg-green-100 text-green-700" },
  reserved: { label: "Zarezerwowane", className: "bg-secondary-soft text-secondary" },
  sold: { label: "Sprzedane", className: "bg-neutral-200 text-neutral-600" },
  archived: { label: "Zakończone", className: "bg-neutral-200 text-neutral-600" },
};

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const listingId = Number(params.id);

  const [listing, setListing] = useState<ListingResponseDto | null>(null);
  const [seller, setSeller] = useState<AccountDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [shared, setShared] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Dane ogłoszenia
  useEffect(() => {
    if (!Number.isInteger(listingId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- walidacja parametru adresu
      setError("Nieprawidłowy adres ogłoszenia");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/listing/${listingId}`);
        if (cancelled) return;
        const data: ListingResponseDto = res.data.data;
        setListing(data);
        api
          .get(`/user/${data.userId}`)
          .then((r) => !cancelled && setSeller(r.data))
          .catch(() => {});
      } catch (err) {
        if (!cancelled) setError(apiError(err, "Błąd przy pobieraniu ogłoszenia"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  // Wyświetlenie liczymy raz, po ustaleniu czy użytkownik jest zalogowany
  useEffect(() => {
    if (!listing || userLoading) return;
    api.post("/view", { listingId }).catch(() => {});
  }, [listing?.id, userLoading, listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Czy ulubione
  useEffect(() => {
    if (!user || !listing) return;
    api
      .get(`/favourite/${listingId}/check`)
      .then((r) => setIsFavourite(r.data.data.isFavourite))
      .catch(() => {});
  }, [user, listing?.id, listingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startChat = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`);
      return;
    }
    setChatError(null);
    try {
      const res = await api.post("/chat", { listingId });
      router.push(`/chat/${res.data.data.id}`);
    } catch (err) {
      setChatError(apiError(err, "Nie udało się rozpocząć rozmowy"));
    }
  };

  const handleShare = async () => {
    if (!listing) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      /* użytkownik anulował udostępnianie */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-page animate-pulse space-y-4 pt-32">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="aspect-square rounded-2xl bg-neutral-200 lg:col-span-2" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-neutral-200" />
              <div className="h-12 w-1/2 rounded bg-neutral-200" />
              <div className="h-40 rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="container-page pt-40 text-center">
          <PackageOpen className="mx-auto mb-4 h-16 w-16 text-neutral-300" strokeWidth={1.25} />
          <p role="alert" className="mb-6 text-lg text-neutral-700">
            {error || "Nie znaleziono ogłoszenia"}
          </p>
          <Link href="/listing" className="btn-primary">
            Wróć do ogłoszeń
          </Link>
        </div>
      </div>
    );
  }

  const images = listing.images || [];
  const current = images[imageIndex];
  const isOwner = user?.id === listing.userId;
  const status = STATUS[listing.status] ?? { label: listing.status, className: "bg-neutral-200 text-neutral-600" };
  const sellerName = seller?.username || listing.user?.username || "Użytkownik";
  const hasContact = listing.contact_person || listing.email || listing.phone_number;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="container-page pb-10 pt-28 sm:pt-32">
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Powrót
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Galeria */}
          <div className="lg:col-span-2">
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm sm:aspect-square">
              {current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(current.url)} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-secondary-soft text-primary/40">
                  <PackageOpen className="h-24 w-24" strokeWidth={1} />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Poprzednie zdjęcie"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    aria-label="Następne zdjęcie"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    {imageIndex + 1} / {images.length}
                  </span>
                </>
              )}

              <FavouriteButton
                listingId={listingId}
                initialIsFavourite={isFavourite}
                className="absolute right-4 top-4"
                size={22}
              />
            </div>

            {images.length > 1 && (
              <ul className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.map((img, idx) => (
                  <li key={img.id ?? idx}>
                    <button
                      onClick={() => setImageIndex(idx)}
                      aria-label={`Zdjęcie ${idx + 1}`}
                      aria-current={imageIndex === idx}
                      className={`aspect-square w-full overflow-hidden rounded-lg border-2 transition-all ${
                        imageIndex === idx ? "border-primary shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(img.url)} alt="" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <section className="card mt-8 p-6 sm:p-8">
              <h2 className="mb-4 text-xl font-bold">Opis</h2>
              <p className="whitespace-pre-wrap break-words leading-relaxed text-neutral-700">{listing.description}</p>
            </section>
          </div>

          {/* Szczegóły */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="card space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                {listing.category && (
                  <Link href={`/listing?categoryId=${listing.category.id}`} className="chip hover:bg-primary-soft hover:text-primary">
                    <FolderTree className="h-3 w-3" />
                    {listing.category.name}
                  </Link>
                )}
              </div>

              <div>
                <h1 className="mb-3 break-words text-2xl font-bold leading-tight sm:text-3xl">{listing.title}</h1>
                <p className="text-4xl font-bold text-primary">{formatPrice(listing.price)}</p>
                {listing.is_negotiable && <p className="mt-1 text-sm text-neutral-500">Cena do negocjacji</p>}
              </div>

              <ul className="space-y-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" /> {listing.location}
                </li>
                <li>Opublikowano: {new Date(listing.created_at).toLocaleDateString("pl-PL")}</li>
                {listing._count && (
                  <li className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {listing._count.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" /> {listing._count.favourites}
                    </span>
                  </li>
                )}
              </ul>

              {chatError && (
                <p role="alert" className="alert-error">
                  {chatError}
                </p>
              )}

              {isOwner ? (
                <Link href={`/listing/${listingId}/edit`} className="btn-primary w-full !py-3.5">
                  <Pencil className="h-4 w-4" /> Edytuj ogłoszenie
                </Link>
              ) : (
                <div className="space-y-3">
                  <button onClick={startChat} className="btn-primary w-full !py-3.5">
                    <MessageCircle className="h-5 w-5" /> Napisz do sprzedającego
                  </button>
                  <button onClick={handleShare} className="btn-outline w-full">
                    {shared ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                    {shared ? "Link skopiowany" : "Udostępnij"}
                  </button>
                </div>
              )}
              {isOwner && (
                <button onClick={handleShare} className="btn-outline w-full">
                  {shared ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                  {shared ? "Link skopiowany" : "Udostępnij"}
                </button>
              )}
            </div>

            <div className="card space-y-4 p-6">
              <h2 className="font-semibold">Sprzedający</h2>
              <Link
                href={`/account?id=${listing.userId}`}
                className="group flex items-center gap-3 rounded-xl border border-neutral-100 p-3 transition-all hover:border-primary/40 hover:bg-primary-soft/40"
              >
                <Avatar name={sellerName} src={seller?.pictureUrl || listing.user?.pictureUrl} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold group-hover:text-primary">{sellerName}</p>
                  {seller ? (
                    <p className="flex items-center gap-1 text-xs text-neutral-500">
                      <Star className="h-3 w-3 fill-secondary text-secondary" />
                      {(seller.rating || 0).toFixed(1)} · {seller.reviews ?? 0} opinii
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500">Zobacz profil →</p>
                  )}
                </div>
              </Link>

              {hasContact && (
                <ul className="space-y-2 text-sm text-neutral-700">
                  {listing.contact_person && <li className="font-medium">{listing.contact_person}</li>}
                  {listing.email && (
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-neutral-400" />
                      <a href={`mailto:${listing.email}`} className="hover:text-primary hover:underline">
                        {listing.email}
                      </a>
                    </li>
                  )}
                  {listing.phone_number && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <a href={`tel:${listing.phone_number.replace(/[^+\d]/g, "")}`} className="hover:text-primary hover:underline">
                        {listing.phone_number}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
