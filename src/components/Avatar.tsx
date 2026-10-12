import { mediaUrl } from "@/lib/media";

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ name, src, size = 40, className = "" }: AvatarProps) {
  const url = mediaUrl(src);
  const initial = (name?.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-soft to-secondary-soft font-bold text-primary ring-1 ring-neutral-200 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name ? `Zdjęcie profilowe: ${name}` : "Zdjęcie profilowe"} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
