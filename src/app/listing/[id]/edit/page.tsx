"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader, Upload, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { CategoryDto } from "@/models";
import { useUser } from "@/context/UserContext";
import CategoryPicker from "@/components/CategoryPicker";

export default function EditListing() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const listingId = params.id as string;

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; position: number; id?: number }[]>([]);

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
    if (!user && !loading) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, listingRes] = await Promise.all([
          api.get("/category/root"),
          api.get(`/listing/${listingId}`)
        ]);

        setCategories(categoriesRes.data.data || []);
        
        const listing = listingRes.data.data;
        
        if (user && listing.userId !== user.id) {
          setError("Nie masz uprawnień do edycji tego ogłoszenia");
          return;
        }

        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price.toString(),
          is_negotiable: listing.is_negotiable,
          status: listing.status,
          location: listing.location,
          contact_person: listing.contact_person || "",
          email: listing.email || "",
          phone_number: listing.phone_number || "",
          categoryId: listing.categoryId.toString(),
        });

        setImages(listing.images || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Błąd przy pobieraniu danych");
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      fetchData();
    }
  }, [listingId, user, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        
        const res = await api.post("/upload", formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (res.data.success) {
          setImages((prev) => [
            ...prev, 
            { url: res.data.url, position: prev.length }
          ]);
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
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
        setError("Proszę wybrać kategorię");
        return;
    }
    setSaving(true);
    setError(null);

    try {
      await api.put(`/listing/${listingId}`, {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        images: images.map((img, index) => ({
          url: img.url,
          position: index
        }))
      });

      router.push(`/listing/${listingId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd przy zapisywaniu zmian");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;

    setSaving(true);
    try {
      await api.delete(`/listing/${listingId}`);
      router.push("/listing");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Błąd przy usuwaniu ogłoszenia");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin mb-4" />
          <p className="text-neutral-500">Ładowanie ogłoszenia...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-blue-600 hover:underline flex items-center gap-2 justify-center mx-auto">
            <ArrowLeft className="w-4 h-4" /> Powrót
          </button>
        </div>
      </div>
    );
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

        <div className="flex justify-between items-start mb-8">
          <h1 className="text-4xl font-bold">Edytuj ogłoszenie</h1>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
          >
            Usuń ogłoszenie
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold mb-4 text-neutral-800">Zdjęcia</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img 
                    src={img.url.startsWith('http') ? img.url : (process.env.NEXT_PUBLIC_SERVER_URL + img.url)} 
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
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center font-bold">GŁÓWNE</div>
                  )}
                </div>
              ))}
              
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl hover:border-black hover:bg-neutral-50 transition-all cursor-pointer relative">
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
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-800">Informacje o przedmiocie</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Tytuł</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Categories */}
            <CategoryPicker 
                categories={categories}
                initialCategoryId={formData.categoryId}
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
                  step="0.01"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_negotiable"
                    checked={formData.is_negotiable}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-md border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-neutral-600 group-hover:text-black">Cena do negocjacji</span>
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
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Status ogłoszenia</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
              >
                <option value="available">Dostępne</option>
                <option value="sold">Sprzedane</option>
                <option value="pending">W trakcie</option>
              </select>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-800">Kontakt</h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700">Osoba kontaktowa</label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
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
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : "Zapisz zmiany"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-2xl hover:bg-neutral-50 transition-all shadow-sm"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
