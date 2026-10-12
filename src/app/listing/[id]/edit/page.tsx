"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingForm, { ListingFormValues, ListingPayload } from "@/components/ListingForm";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { useRequireAuth } from "@/context/UserContext";
import { CategoryDto } from "@/models";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useRequireAuth();
  const listingId = Number(params.id);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [initial, setInitial] = useState<{ values: ListingFormValues; images: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    if (!Number.isInteger(listingId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- walidacja parametru adresu
      setError("Nieprawidłowy adres ogłoszenia");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [categoriesRes, listingRes] = await Promise.all([
          api.get("/category/root"),
          api.get(`/listing/${listingId}`),
        ]);
        const listing = listingRes.data.data;
        if (listing.userId !== user.id && user.role !== "ADMIN") {
          setError("Nie masz uprawnień do edycji tego ogłoszenia");
          return;
        }
        setCategories(categoriesRes.data.data || []);
        setInitial({
          values: {
            title: listing.title,
            description: listing.description,
            price: String(listing.price),
            is_negotiable: listing.is_negotiable,
            status: listing.status,
            location: listing.location,
            contact_person: listing.contact_person || "",
            email: listing.email || "",
            phone_number: listing.phone_number || "",
            categoryId: String(listing.categoryId),
          },
          images: (listing.images || []).map((i: { url: string }) => i.url),
        });
      } catch (err) {
        setError(apiError(err, "Błąd przy pobieraniu danych"));
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, user, listingId]);

  const save = async (payload: ListingPayload) => {
    await api.put(`/listing/${listingId}`, payload);
    router.push(`/listing/${listingId}`);
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz trwale usunąć to ogłoszenie? Tej operacji nie można cofnąć.")) return;
    setDeleting(true);
    try {
      await api.delete(`/listing/${listingId}`);
      router.push(user ? `/account?id=${user.id}` : "/listing");
    } catch (err) {
      setError(apiError(err, "Błąd przy usuwaniu ogłoszenia"));
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-neutral-500">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            Ładowanie ogłoszenia...
          </div>
        ) : !initial ? (
          <div className="py-20 text-center">
            <p role="alert" className="alert-error mx-auto mb-6 max-w-md">
              {error || "Nie znaleziono ogłoszenia"}
            </p>
            <Link href="/listing" className="btn-outline">
              Wróć do ogłoszeń
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="group mb-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Powrót
            </button>

            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Edytuj <span className="text-primary">ogłoszenie</span>
              </h1>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger !px-4 !py-2">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Usuń
              </button>
            </div>

            {error && (
              <div role="alert" className="alert-error mb-6">
                {error}
              </div>
            )}

            <ListingForm
              categories={categories}
              initialValues={initial.values}
              initialImages={initial.images}
              showStatus
              submitLabel="Zapisz zmiany"
              submittingLabel="Zapisywanie..."
              onSubmit={save}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
