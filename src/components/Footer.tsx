
import Link from "next/link";

export default function Footer() {

    return (
              <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">ventida</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Twój zaufany rynek do kupowania i sprzedawania przedmiotów wysokiej jakości.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Sklep</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <Link href="/listing" className="block hover:text-black">Wszystkie ogłoszenia</Link>
                <Link href="/listing" className="block hover:text-black">Kategorie</Link>
                <Link href="/listing?type=profiles" className="block hover:text-black">Użytkownicy</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Sprzedaż</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <Link href="/listing/create" className="block hover:text-black">Zacznij sprzedawać</Link>
                <Link href="#" className="block hover:text-black">Poradnik sprzedawcy</Link>
                <Link href="#" className="block hover:text-black">Cennik</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-sm">Pomoc</h4>
              <div className="space-y-2 text-sm text-neutral-600">
                <Link href="#" className="block hover:text-black">Centrum pomocy</Link>
                <Link href="#" className="block hover:text-black">Bezpieczeństwo</Link>
                <Link href="#" className="block hover:text-black">Kontakt</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>© 2026 Ventida. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-6">
                <Link href="/terms" className="hover:text-black transition-colors">Regulamin</Link>
                <Link href="/privacy" className="hover:text-black transition-colors">Polityka prywatności</Link>
                <Link href="#" className="hover:text-black transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    )

}