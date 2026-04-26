import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold mb-8 text-neutral-900">Regulamin serwisu Ventida</h1>
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania z platformy Ventida, służącej do publikacji ogłoszeń lokalnych.
              Użytkownik zobowiązuje się do przestrzegania zasad współżycia społecznego oraz obowiązujących przepisów prawa.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Rejestracja i konto</h2>
            <p>
              Korzystanie z niektórych funkcji serwisu wymaga założenia konta. Użytkownik jest odpowiedzialny za bezpieczeństwo swojego hasła oraz za wszelkie działania podejmowane w ramach konta.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Publikacja ogłoszeń</h2>
            <p>
              Zabrania się publikowania treści o charakterze bezprawnym, obraźliwym lub wprowadzającym w błąd. Ventida zastrzega sobie prawo do usuwania ogłoszeń naruszających regulamin.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
