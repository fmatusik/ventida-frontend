"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, PackageOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { mediaUrl } from "@/lib/media";
import { useRequireAuth } from "@/context/UserContext";
import { ChatSummary } from "@/models/chat";

export default function ChatsPage() {
  const { user, ready } = useRequireAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    api
      .get("/chat")
      .then((res) => setChats(res.data.data || []))
      .catch((err) => setError(apiError(err, "Błąd przy pobieraniu czatów")))
      .finally(() => setLoading(false));
  }, [ready]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">
          Moje <span className="text-primary">wiadomości</span>
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-200" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="alert-error">
            {error}
          </div>
        ) : chats.length === 0 ? (
          <div className="card py-20 text-center">
            <MessageCircle className="mx-auto mb-6 h-16 w-16 text-neutral-300" strokeWidth={1.25} />
            <h2 className="mb-2 text-2xl font-semibold">Brak rozmów</h2>
            <p className="mx-auto mb-8 max-w-sm text-neutral-500">
              Skontaktuj się ze sprzedającym z poziomu ogłoszenia, aby rozpocząć rozmowę.
            </p>
            <Link href="/listing" className="btn-primary">
              Przeglądaj ogłoszenia
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {chats.map((chat) => {
              const last = chat.messages?.[0];
              const isBuyer = chat.userId === user?.id;
              const other = isBuyer ? chat.listing?.user : chat.user;
              const image = mediaUrl(chat.listing?.images?.[0]?.url);
              const unread = chat.unreadCount ?? 0;

              return (
                <li key={chat.id}>
                  <Link
                    href={`/chat/${chat.id}`}
                    className={`card group flex items-center gap-4 p-4 transition-all hover:border-primary/40 hover:shadow-md ${
                      unread > 0 ? "border-primary/30 bg-primary-soft/40" : ""
                    }`}
                  >
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PackageOpen className="h-6 w-6 text-neutral-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-start justify-between gap-2">
                        <h2 className="truncate font-semibold text-neutral-900 group-hover:text-primary">
                          {chat.listing?.title || `Rozmowa #${chat.id}`}
                        </h2>
                        <time className="shrink-0 text-xs text-neutral-400" dateTime={last?.created_at ?? chat.created_at}>
                          {new Date(last?.created_at ?? chat.created_at).toLocaleDateString("pl-PL")}
                        </time>
                      </div>
                      <div className="mb-1 flex items-center gap-2 text-xs text-neutral-600">
                        <Avatar name={other?.username} src={other?.pictureUrl} size={20} />
                        {other?.username || "Użytkownik"}
                      </div>
                      <p className={`truncate text-sm ${unread > 0 ? "font-medium text-neutral-900" : "text-neutral-500"}`}>
                        {last ? (last.senderId === user?.id ? "Ty: " : "") + last.message : "Brak wiadomości"}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span
                        className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white"
                        aria-label={`${unread} nieprzeczytanych`}
                      >
                        {unread}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Footer />
    </div>
  );
}
