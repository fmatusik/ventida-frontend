"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingForm, { ListingPayload } from "@/components/ListingForm";
import api from "@/lib/api";
import { useRequireAuth } from "@/context/UserContext";
import { CategoryDto } from "@/models";

export default function CreateListing() {
  const router = useRouter();
  const { user, ready } = useRequireAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (!ready) return;
    api
      .get("/category/root")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => console.error("Error fetching categories"))
      .finally(() => setLoadingCategories(false));
  }, [ready]);

  const create = async (payload: ListingPayload) => {
    const res = await api.post("/listing", payload);
    router.push(`/listing/${res.data.data.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <button
          onClick={() => router.back()}
          className="group mb-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Powrót
        </button>

        <h1 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
          Dodaj <span className="text-primary">ogłoszenie</span>
        </h1>

        {!ready || loadingCategories ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ListingForm
            categories={categories}
            initialValues={{
              title: "",
              description: "",
              price: "",
              is_negotiable: false,
              status: "available",
              location: user?.city ?? "",
              contact_person: user?.name ?? "",
              email: "",
              phone_number: "",
              categoryId: "",
            }}
            submitLabel="Opublikuj ogłoszenie"
            submittingLabel="Publikowanie..."
            onSubmit={create}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
