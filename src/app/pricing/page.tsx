import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold mb-4 text-neutral-900 text-center">Prosty cennik</h1>
        <p className="text-neutral-500 text-center mb-12">Brak ukrytych opłat. Płacisz tylko za to, czego potrzebujesz.</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-neutral-900">Podstawowe</h3>
            <p className="text-4xl font-black mb-6">0 PLN</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-green-500" />
                Nielimitowane ogłoszenia
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-green-500" />
                Do 10 zdjęć na produkt
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-green-500" />
                Czat z kupującymi
              </li>
            </ul>
          </div>
          
          <div className="bg-primary text-white p-8 rounded-3xl border border-primary shadow-xl flex flex-col transform md:scale-105">
            <div className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-full mb-4 self-start">POLECANE</div>
            <h3 className="text-xl font-bold mb-2">Promowane</h3>
            <p className="text-4xl font-black mb-6">19 PLN <span className="text-sm font-normal text-neutral-400">/ ogłoszenie</span></p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-green-400" />
                Wszystko z planu Podstawowego
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-green-400" />
                Wyróżnienie na liście wyników
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <Check className="w-4 h-4 text-green-400" />
                Pozycjonowanie na górze kategorii
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
