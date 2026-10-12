import Link from "next/link";
import { Eye, Heart, MapPin, PackageOpen } from "lucide-react";
import FavouriteButton from "@/components/FavouriteButton";
import { mediaUrl } from "@/lib/media";
import { ShortListingSummaryDto } from "@/models/listing/ListingDto";

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(price)} zł`;
}

export default function ListingCard({
  item,
  isFavourite = false,
}: {
  item: ShortListingSummaryDto;
  isFavourite?: boolean;
}) {
  const image = mediaUrl(item.imageUrl);

  return (
    <article className="group relative">
      <Link href={`/listing/${item.id}`} className="block rounded-2xl focus-visible:outline-offset-4">
        <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200 transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-secondary-soft text-primary/40">
              <PackageOpen className="h-16 w-16" strokeWidth={1.25} />
            </div>
          )}
          <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 backdrop-blur">
            {item.category}
          </span>
        </div>

        <div className="space-y-1 px-1">
          <h3 className="line-clamp-2 font-medium leading-snug text-neutral-900 transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <p className="text-xl font-bold text-neutral-900">{formatPrice(item.price)}</p>
          <div className="flex items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.location || "Polska"}</span>
            </span>
            <span className="shrink-0">{item.created_at}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {item.viewsCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {item.likesCount}
            </span>
          </div>
        </div>
      </Link>

      <FavouriteButton
        listingId={item.id}
        initialIsFavourite={isFavourite}
        className="absolute right-3 top-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        size={18}
      />
    </article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-3 aspect-[4/5] rounded-2xl bg-neutral-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
      <div className="h-5 w-1/3 rounded bg-neutral-200" />
    </div>
  );
}
