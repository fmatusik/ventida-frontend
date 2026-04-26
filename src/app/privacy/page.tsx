import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-32">
        <h1 className="text-4xl font-bold mb-8 text-neutral-900">Polityka prywatności</h1>
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6 text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Gromadzone dane</h2>
            <p>
              Przetwarzamy dane niezbędne do świadczenia usług, takie jak adres e-mail, nazwa użytkownika oraz dane kontaktowe podawane w ogłoszeniach.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Cel przetwarzania</h2>
            <p>
              Twoje dane są wykorzystywane w celu umożliwienia kontaktu między kupującymi a sprzedającymi oraz w celach technicznych związanych z utrzymaniem konta.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Twoje prawa</h2>
            <p>
              Masz prawo do wglądu w swoje dane, ich poprawiania oraz żądania ich usunięcia (prawo do bycia zapomnianym).
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
