"use client";
import { useState, useEffect, useRef, useEffect as useLayoutEffect } from "react";
import { Send, ArrowLeft, Loader, MessageCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { ChatDto, MessageDto } from "@/models";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chat, setChat] = useState<ChatDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchChat = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        setError(null);

        // Fetch chat data and messages in parallel
        const [chatRes, messagesRes] = await Promise.all([
          api.get(`/chat/${chatId}`),
          api.get(`/message/chat/${chatId}?skip=0&take=50`)
        ]);

        setChat(chatRes.data);
        setMessages(messagesRes.data.data || []);
      } catch (err: any) {
        if (isInitial) {
          setError(err?.response?.data?.message || "Błąd przy pobieraniu czatu");
        }
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    if (chatId) {
      fetchChat(true); // Initial fetch with loader
      
      // Background polling without loader
      const interval = setInterval(() => fetchChat(false), 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, user, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const res = await api.post("/message", {
        message: messageText,
        chatId: parseInt(chatId),
      });

      // The backend returns { success: true, data: message }
      const newMessage = res.data.data || res.data;
      setMessages([...messages, newMessage]);
      setMessageText("");
    } catch (err: any) {
      console.error("Błąd przy wysyłaniu wiadomości", err);
      setError("Nie udało się wysłać wiadomości");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
        {/* Back button and context */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Powrót
          </button>
          
          {chat.listing && (
            <Link href={`/listing/${chat.listing.id}`} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all shadow-sm">
              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
                {chat.listing.images?.[0] ? (
                  <img src={chat.listing.images[0].url.startsWith('http') ? chat.listing.images[0].url : (process.env.NEXT_PUBLIC_SERVER_URL + chat.listing.images[0].url)} className="w-full h-full object-cover" alt="" />
                ) : "📦"}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Dotyczy ogłoszenia</p>
                <p className="text-sm font-semibold text-neutral-900 truncate max-w-[200px]">{chat.listing.title}</p>
              </div>
            </Link>
          )}
        </div>

        {/* Chat container */}
        <div className="flex-1 bg-white rounded-3xl border border-neutral-200 mb-6 flex flex-col overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <h2 className="font-semibold text-neutral-900">
              {chat.userId === user.id ? chat.listing?.user?.username : chat.user?.username}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 opacity-60">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">Brak wiadomości. Zacznij rozmowę!</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
                        message.senderId === user.id
                          ? "bg-black text-white rounded-br-none"
                          : "bg-white text-neutral-900 border border-neutral-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.message}</p>
                      <p
                        className={`text-[9px] font-medium mt-1 uppercase tracking-wider ${
                          message.senderId === user.id
                            ? "text-neutral-400"
                            : "text-neutral-500"
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString(
                          "pl-PL",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-neutral-100"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Napisz wiadomość..."
                disabled={sending}
                className="w-full pl-6 pr-14 py-4 bg-neutral-100 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all disabled:opacity-50 text-sm"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="absolute right-2 p-3 bg-black text-white rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {sending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
