import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold mb-8 text-neutral-900">Polityka Cookies</h1>
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Czym są pliki cookies?</h2>
            <p>
              Pliki cookies (tzw. „ciasteczka”) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Dlaczego ich używamy?</h2>
            <p>
              Cookies używamy w celach statystycznych, marketingowych oraz w celu dostosowania zawartości stron internetowych do preferencji użytkownika. Pozwalają one rozpoznać urządzenie użytkownika i odpowiednio wyświetlić stronę internetową.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Zarządzanie plikami cookies</h2>
            <p>
              Użytkownik może w każdej chwili dokonać zmiany ustawień dotyczących plików cookies w swojej przeglądarce internetowej. Wyłączenie cookies może jednak wpłynąć na niektóre funkcjonalności dostępne w naszym serwisie.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
