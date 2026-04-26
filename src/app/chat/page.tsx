"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { ChatDto } from "@/models";
import { useUser } from "@/context/UserContext";

export default function ChatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [chats, setChats] = useState<ChatDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chat");
        setChats(res.data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Błąd przy pobieraniu czatów");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót
        </button>

        <h1 className="text-4xl font-bold mb-8">Moje czaty</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-neutral-200 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-neutral-600 bg-white rounded-2xl border border-neutral-200">
            <p>{error}</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-sm">
            <MessageCircle className="w-16 h-16 mx-auto mb-6 text-neutral-300" />
            <h2 className="text-2xl font-semibold mb-2">Brak czatów</h2>
            <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
              Nie masz jeszcze żadnych aktywnych rozmów. Skontaktuj się ze sprzedawcą, aby zacząć.
            </p>
            <Link
              href="/listing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
            >
              Przeglądaj ogłoszenia
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat: any) => {
              const lastMessage = chat.messages?.[0];
              const isBuyer = chat.userId === user.id;
              const otherUser = isBuyer ? chat.listing?.user : chat.user;
              
              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="block bg-white p-5 rounded-2xl border border-neutral-200 hover:border-black transition-all hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      {chat.listing?.images?.[0]?.url ? (
                        <img 
                          src={chat.listing.images[0].url.startsWith('http') ? chat.listing.images[0].url : (process.env.NEXT_PUBLIC_SERVER_URL + chat.listing.images[0].url)} 
                          alt="" 
                          className="w-full h-full object-cover rounded-xl" 
                        />
                      ) : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-neutral-900 truncate">
                          {chat.listing?.title || `Chat #${chat.id}`}
                        </h3>
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                          {new Date(chat.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 bg-neutral-100 rounded-md text-neutral-600">
                          {otherUser?.username || "Użytkownik"}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 truncate italic">
                        {lastMessage ? lastMessage.message : "Brak wiadomości..."}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
