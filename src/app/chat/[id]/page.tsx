"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageCircle, PackageOpen, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
import { mediaUrl } from "@/lib/media";
import { useRequireAuth } from "@/context/UserContext";
import { ChatMessage, ChatSummary } from "@/models/chat";

const POLL_MS = 4000;

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useRequireAuth();
  const chatId = Number(params.id);

  const endRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<ChatSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await api.get(`/message/chat/${chatId}?skip=0&take=50`);
    const list: ChatMessage[] = res.data.data || [];
    setMessages((prev) => (prev.length === list.length && prev.at(-1)?.id === list.at(-1)?.id ? prev : list));
    // wiadomości od rozmówcy oznaczamy jako przeczytane
    if (list.some((m) => !m.is_read && m.senderId !== user?.id)) {
      api.post(`/message/chat/${chatId}/read-all`).catch(() => {});
    }
  }, [chatId, user?.id]);

  useEffect(() => {
    if (!ready || !Number.isInteger(chatId)) return;
    let cancelled = false;

    (async () => {
      try {
        const chatRes = await api.get(`/chat/${chatId}`);
        if (cancelled) return;
        setChat(chatRes.data.data);
        await fetchMessages();
      } catch (err) {
        if (!cancelled) setError(apiError(err, "Nie udało się pobrać rozmowy"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    // Odświeżanie tylko gdy karta jest widoczna
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchMessages().catch(() => {});
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ready, chatId, fetchMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const res = await api.post("/message", { message, chatId });
      setMessages((prev) => [...prev, res.data.data]);
      setText("");
    } catch (err) {
      setSendError(apiError(err, "Nie udało się wysłać wiadomości"));
    } finally {
      setSending(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="flex items-center justify-center pt-48">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="mx-auto max-w-md px-6 pt-40 text-center">
          <p role="alert" className="alert-error mb-6">
            {error || "Nie znaleziono rozmowy"}
          </p>
          <Link href="/chat" className="btn-outline">
            Wróć do wiadomości
          </Link>
        </div>
      </div>
    );
  }

  const other = chat.userId === user?.id ? chat.listing?.user : chat.user;
  const listingImage = mediaUrl(chat.listing?.images?.[0]?.url);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-6 pt-24 sm:px-6 sm:pt-28">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/chat")}
            className="group flex items-center gap-2 text-sm text-neutral-600 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Wszystkie rozmowy
          </button>

          {chat.listing && (
            <Link
              href={`/listing/${chat.listing.id}`}
              className="card flex items-center gap-3 px-3 py-2 transition-all hover:border-primary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                {listingImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={listingImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PackageOpen className="h-5 w-5 text-neutral-300" />
                )}
              </span>
              <span className="text-left">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">Ogłoszenie</span>
                <span className="block max-w-[220px] truncate text-sm font-semibold">{chat.listing.title}</span>
              </span>
            </Link>
          )}
        </div>

        <section className="card flex h-[65vh] min-h-[420px] flex-col overflow-hidden" aria-label="Rozmowa">
          <header className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/60 px-5 py-3">
            <Avatar name={other?.username} src={other?.pictureUrl} size={36} />
            {other?.id ? (
              <Link href={`/account?id=${other.id}`} className="font-semibold hover:text-primary">
                {other.username || "Użytkownik"}
              </Link>
            ) : (
              <span className="font-semibold">{other?.username || "Użytkownik"}</span>
            )}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-5" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                <MessageCircle className="mb-2 h-12 w-12" strokeWidth={1.25} />
                <p className="text-sm">Brak wiadomości. Zacznij rozmowę!</p>
              </div>
            ) : (
              messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-md ${
                        mine
                          ? "rounded-br-sm bg-gradient-to-br from-primary to-secondary text-white"
                          : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.message}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/80" : "text-neutral-400"}`}>
                        {new Date(m.created_at).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                        {mine && (m.is_read ? " · Przeczytano" : "")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-neutral-100 bg-white p-3">
            {sendError && (
              <p role="alert" className="mb-2 px-2 text-xs text-red-600">
                {sendError}
              </p>
            )}
            <div className="flex items-center gap-2">
              <label htmlFor="message" className="sr-only">
                Wiadomość
              </label>
              <input
                id="message"
                type="text"
                value={text}
                maxLength={2000}
                autoComplete="off"
                onChange={(e) => setText(e.target.value)}
                placeholder="Napisz wiadomość..."
                className="input !rounded-full !bg-neutral-100 !py-3.5 px-5"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                aria-label="Wyślij"
                className="btn-primary !rounded-full !p-3.5"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
