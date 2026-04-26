'use client';
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface FavouriteButtonProps {
  listingId: number;
  initialIsFavourite?: boolean;
  className?: string;
  size?: number;
}

export default function FavouriteButton({ 
  listingId, 
  initialIsFavourite = false, 
  className = "",
  size = 20
}: FavouriteButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavourite(initialIsFavourite);
  }, [initialIsFavourite]);

  const toggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/favourite/${listingId}/toggle`);
      // The backend returns { success: true, action: 'added'/'deleted', ... }
      if (res.data.action === 'added') {
        setIsFavourite(true);
      } else if (res.data.action === 'deleted') {
        setIsFavourite(false);
      } else {
        // Fallback for different response structure
        setIsFavourite(!isFavourite);
      }
    } catch (err) {
      console.error("Błąd przy przełączaniu ulubionych", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${
        isFavourite 
          ? "bg-red-500 text-white shadow-md" 
          : "bg-white/90 backdrop-blur-sm text-neutral-900 hover:bg-white"
      } ${className} ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
    >
      <Heart 
        size={size} 
        fill={isFavourite ? "currentColor" : "none"} 
        className={isFavourite ? "animate-in zoom-in-50 duration-300" : ""}
      />
    </button>
  );
}
