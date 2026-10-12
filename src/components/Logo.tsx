import Link from "next/link";

export default function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Ventida – strona główna" className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg font-black leading-none ${
          light ? "bg-white text-primary" : "bg-gradient-to-br from-primary to-secondary text-white"
        }`}
        aria-hidden="true"
      >
        v
      </span>
      <span className={`text-xl font-semibold tracking-tight sm:text-2xl ${light ? "text-white" : "text-primary"}`}>
        ventida
      </span>
    </Link>
  );
}
