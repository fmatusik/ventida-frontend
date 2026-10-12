"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import CategoryPicker from "@/components/CategoryPicker";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { mediaUrl } from "@/lib/media";
import { CategoryDto } from "@/models";

export type ListingFormValues = {
  title: string;
  description: string;
  price: string;
  is_negotiable: boolean;
  status: string;
  location: string;
  contact_person: string;
  email: string;
  phone_number: string;
  categoryId: string;
};

export const EMPTY_LISTING: ListingFormValues = {
  title: "",
  description: "",
  price: "",
  is_negotiable: false,
  status: "available",
  location: "",
  contact_person: "",
  email: "",
  phone_number: "",
  categoryId: "",
};

export type ListingPayload = {
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  status: string;
  location: string;
  contact_person: string;
  email: string;
  phone_number: string;
  categoryId: number;
  images: { url: string; position: number }[];
};

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const STATUSES = [
  ["available", "Dostępne"],
  ["reserved", "Zarezerwowane"],
  ["sold", "Sprzedane"],
  ["archived", "Zakończone (ukryte na liście)"],
] as const;

type Props = {
  categories: CategoryDto[];
  initialValues?: ListingFormValues;
  initialImages?: string[];
  submitLabel: string;
  submittingLabel: string;
  showStatus?: boolean;
  onSubmit: (payload: ListingPayload) => Promise<void>;
};

export default function ListingForm({
  categories,
  initialValues = EMPTY_LISTING,
  initialImages = [],
  submitLabel,
  submittingLabel,
  showStatus = false,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<ListingFormValues>(initialValues);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    set(name as keyof ListingFormValues, (type === "checkbox" ? (e.target as HTMLInputElement).checked : value) as never);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    setError(null);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) return setError(`Możesz dodać maksymalnie ${MAX_IMAGES} zdjęć`);

    setUploading(true);
    try {
      for (const file of files.slice(0, room)) {
        if (!ALLOWED.includes(file.type)) {
          setError(`„${file.name}": dozwolone są tylko pliki JPG, PNG, GIF i WEBP`);
          continue;
        }
        if (file.size > MAX_SIZE) {
          setError(`„${file.name}" jest większy niż 5 MB`);
          continue;
        }
        const body = new FormData();
        body.append("file", file);
        const res = await api.post("/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
        if (res.data.success) setImages((prev) => [...prev, res.data.url]);
      }
      if (files.length > room) setError(`Dodano tylko ${room} zdjęć – limit to ${MAX_IMAGES}`);
    } catch (err) {
      setError(apiError(err, "Błąd przy przesyłaniu zdjęcia"));
    } finally {
      setUploading(false);
    }
  };

  const makeMain = (index: number) =>
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || uploading) return;
    setError(null);

    const price = Number(values.price.replace(",", "."));
    if (!values.categoryId) return setError("Wybierz kategorię");
    if (!Number.isFinite(price) || price < 0) return setError("Podaj poprawną cenę");
    if (values.title.trim().length < 3) return setError("Tytuł musi mieć co najmniej 3 znaki");
    if (values.description.trim().length < 10) return setError("Opis musi mieć co najmniej 10 znaków");

    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        price,
        is_negotiable: values.is_negotiable,
        status: values.status,
        location: values.location.trim(),
        contact_person: values.contact_person.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
        categoryId: Number(values.categoryId),
        images: images.map((url, position) => ({ url, position })),
      });
    } catch (err) {
      setError(apiError(err, "Nie udało się zapisać ogłoszenia"));
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <section className="card p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Zdjęcia</h2>
          <span className="text-xs text-neutral-500">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((url, index) => (
            <li key={url} className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(url)} alt={`Zdjęcie ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Usuń zdjęcie ${index + 1}`}
                className="absolute right-2 top-2 rounded-full bg-neutral-900/70 p-1.5 text-white hover:bg-primary"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 ? (
                <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-1 text-center text-[10px] font-bold tracking-wide text-white">
                  GŁÓWNE
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeMain(index)}
                  className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-lg bg-white/90 py-1 text-[11px] font-semibold text-neutral-700 hover:text-primary"
                >
                  <Star className="h-3 w-3" /> Ustaw jako główne
                </button>
              )}
            </li>
          ))}

          {images.length < MAX_IMAGES && (
            <li>
              <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-500 transition-all focus-within:border-primary hover:border-primary hover:bg-primary-soft/40 hover:text-primary">
                <ImagePlus className="mb-2 h-8 w-8" strokeWidth={1.5} />
                <span className="text-xs font-medium">Dodaj zdjęcia</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={uploading}
                />
                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </span>
                )}
              </label>
            </li>
          )}
        </ul>
        <p className="mt-4 text-xs text-neutral-500">
          Pierwsze zdjęcie jest zdjęciem głównym. Formaty: JPG, PNG, GIF, WEBP – do 5 MB każde.
        </p>
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="text-lg font-semibold">Podstawowe informacje</h2>

        <div>
          <label htmlFor="title" className="label">
            Tytuł
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={120}
            value={values.title}
            onChange={handleChange}
            placeholder="Np. iPhone 13 Pro Max, stan idealny"
            className="input"
          />
        </div>

        <CategoryPicker
          categories={categories}
          initialCategoryId={values.categoryId}
          onCategoryChange={(id) => set("categoryId", id)}
          label="Kategoria"
        />

        <div>
          <label htmlFor="description" className="label">
            Opis
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            value={values.description}
            onChange={handleChange}
            placeholder="Opisz przedmiot, jego zalety, wady i powód sprzedaży..."
            className="input"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">{values.description.length}/5000</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="label">
              Cena (zł)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              inputMode="decimal"
              required
              min={0}
              max={100000000}
              step="0.01"
              value={values.price}
              onChange={handleChange}
              placeholder="0.00"
              className="input"
            />
          </div>
          <label className="flex items-end gap-3 pb-3">
            <input
              type="checkbox"
              name="is_negotiable"
              checked={values.is_negotiable}
              onChange={handleChange}
              className="h-5 w-5 rounded border-neutral-300 accent-primary"
            />
            <span className="text-sm font-medium text-neutral-700">Cena do negocjacji</span>
          </label>
        </div>

        <div className={`grid gap-5 ${showStatus ? "sm:grid-cols-2" : ""}`}>
          <div>
            <label htmlFor="location" className="label">
              Lokalizacja
            </label>
            <input
              id="location"
              name="location"
              required
              minLength={2}
              maxLength={120}
              value={values.location}
              onChange={handleChange}
              placeholder="Np. Warszawa, Mokotów"
              className="input"
            />
          </div>
          {showStatus && (
            <div>
              <label htmlFor="status" className="label">
                Status
              </label>
              <select id="status" name="status" value={values.status} onChange={handleChange} className="input">
                {STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="card space-y-5 p-6">
        <div>
          <h2 className="text-lg font-semibold">Dane kontaktowe</h2>
          <p className="text-sm text-neutral-500">Opcjonalne – będą widoczne publicznie w ogłoszeniu.</p>
        </div>
        <div>
          <label htmlFor="contact_person" className="label">
            Osoba kontaktowa
          </label>
          <input
            id="contact_person"
            name="contact_person"
            maxLength={80}
            value={values.contact_person}
            onChange={handleChange}
            placeholder="Twoje imię"
            className="input"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={254}
              value={values.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="label">
              Telefon
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              maxLength={20}
              value={values.phone_number}
              onChange={handleChange}
              placeholder="+48 123 456 789"
              className="input"
            />
          </div>
        </div>
      </section>

      <div>
        <button type="submit" disabled={submitting || uploading} className="btn-primary w-full !py-4 text-base">
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
        <p className="mt-4 text-center text-xs text-neutral-500">
          Publikując ogłoszenie akceptujesz regulamin serwisu Ventida.
        </p>
      </div>
    </form>
  );
}
