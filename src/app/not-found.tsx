import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="container-page flex flex-col items-center pt-44 pb-24 text-center">
        <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl font-black text-transparent">404</p>
        <h1 className="mt-4 text-2xl font-semibold">Nie znaleziono strony</h1>
        <p className="mt-2 max-w-md text-neutral-500">Strona, której szukasz, nie istnieje albo została przeniesiona.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn-primary">
            Strona główna
          </Link>
          <Link href="/listing" className="btn-outline">
            Przeglądaj ogłoszenia
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
