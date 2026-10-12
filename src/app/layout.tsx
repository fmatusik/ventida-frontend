import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Ventida – lokalny marketplace",
    template: "%s | Ventida",
  },
  description: "Kupuj i sprzedawaj używane i unikatowe przedmioty. Dodawanie ogłoszeń jest darmowe.",
};

export const viewport: Viewport = {
  themeColor: "#f94144",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
