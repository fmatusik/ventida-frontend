import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Camera, Tag, MessageSquare } from "lucide-react";

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold mb-8 text-neutral-900">Poradnik Sprzedawcy</h1>
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <Camera className="w-8 h-8 mb-4 text-black" />
              <h3 className="text-xl font-bold mb-2">Zrób dobre zdjęcia</h3>
              <p className="text-neutral-600">Jasne, wyraźne zdjęcia z różnych perspektyw zwiększają szansę na szybką sprzedaż o 70%.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <Tag className="w-8 h-8 mb-4 text-black" />
              <h3 className="text-xl font-bold mb-2">Uczciwa wycena</h3>
              <p className="text-neutral-600">Sprawdź ceny podobnych przedmiotów na Ventida, aby wystawić ofertę, która przyciągnie kupujących.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <BookOpen className="w-8 h-8 mb-4 text-black" />
              <h3 className="text-xl font-bold mb-2">Szczegółowy opis</h3>
              <p className="text-neutral-600">Opisz stan przedmiotu, wymiary i wszelkie ślady użytkowania. Szczerość buduje zaufanie.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <MessageSquare className="w-8 h-8 mb-4 text-black" />
              <h3 className="text-xl font-bold mb-2">Szybka komunikacja</h3>
              <p className="text-neutral-600">Odpowiadaj na pytania kupujących najszybciej jak to możliwe. Czas to pieniądz!</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
