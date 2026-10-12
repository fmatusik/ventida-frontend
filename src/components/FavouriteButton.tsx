'use client';
import { useState } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
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
  size = 20,
}: FavouriteButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isFavourite, setIsFavourite] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  // Synchronizacja ze stanem z rodzica (np. po pobraniu z API) - podczas renderu, nie w efekcie
  const [lastInitial, setLastInitial] = useState(initialIsFavourite);
  if (lastInitial !== initialIsFavourite) {
    setLastInitial(initialIsFavourite);
    setIsFavourite(initialIsFavourite);
  }

  const toggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/favourite/${listingId}/toggle`);
      setIsFavourite(res.data.action === "added");
    } catch {
      console.error("Błąd przy przełączaniu ulubionych");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavourite}
      disabled={loading}
      aria-pressed={isFavourite}
      aria-label={isFavourite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
      className={`rounded-full p-2 shadow-sm transition-all ${
        isFavourite
          ? "bg-primary text-white"
          : "bg-white/90 text-neutral-800 backdrop-blur-sm hover:bg-white hover:text-primary"
      } ${className} ${loading ? "cursor-not-allowed opacity-60" : "hover:scale-110"}`}
    >
      <Heart size={size} fill={isFavourite ? "currentColor" : "none"} />
    </button>
  );
}
