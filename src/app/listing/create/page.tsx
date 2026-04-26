"use client";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { CategoryDto } from "@/models";
import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import CategoryPicker from "@/components/CategoryPicker";

export default function CreateListing() {
  const router = useRouter();
  const { user } = useUser();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await api.get("/category/root");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories");
      }
    };

    fetchCategories();
  }, [user, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        
        const res = await api.post("/upload", formDataUpload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        if (res.data.success) {
          setImages((prev) => [...prev, res.data.url]);
        }
      }
    } catch (err) {
      console.error("Upload error", err);
      setError("Błąd przy przesyłaniu zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
        setError("Proszę wybrać kategorię");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/listing", {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        images: images.map((url, index) => ({
          url,
          position: index
        }))
      });

      router.push(`/listing/${res.data.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd przy tworzeniu ogłoszenia");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8 pt-32">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </button>

        <h1 className="text-4xl font-bold mb-8">Utwórz nowe ogłoszenie</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Upload Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold mb-4 text-neutral-800">Zdjęcia</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img 
                    src={url.startsWith('http') ? url : (process.env.NEXT_PUBLIC_SERVER_URL + url)} 
                    alt={`Podgląd ${index}`} 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl hover:border-black hover:bg-neutral-50 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-xs font-medium text-neutral-500">Dodaj zdjęcie</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </label>
            </div>
            <p className="mt-4 text-xs text-neutral-500">Pierwsze zdjęcie będzie zdjęciem głównym. Maksymalny rozmiar: 5MB.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-800">Podstawowe informacje</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Tytuł</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Np. iPhone 13 Pro Max, stan idealny"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Category */}
            <CategoryPicker 
                categories={categories}
                onCategoryChange={(id) => setFormData(prev => ({ ...prev, categoryId: id }))}
                label="Kategoria"
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Opis</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Opisz swój przedmiot, jego zalety, wady i powód sprzedaży..."
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">Cena (PLN)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="is_negotiable"
                      checked={formData.is_negotiable}
                      onChange={handleChange}
                      className="w-5 h-5 rounded-md border-neutral-300 text-black focus:ring-black cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-black transition-colors">Cena do negocjacji</span>
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Lokalizacja</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="Np. Warszawa, Mokotów"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-800">Dane kontaktowe</h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Osoba kontaktowa</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="Twoje imię"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">Telefon</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+48 123 456 789"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Publikowanie...</span>
                </div>
              ) : "Opublikuj ogłoszenie"}
            </button>
            <p className="mt-4 text-center text-xs text-neutral-500">
              Klikając przycisk "Opublikuj ogłoszenie", akceptujesz regulamin serwisu Ventida.
            </p>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
