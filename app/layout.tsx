// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Caveat, Plus_Jakarta_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react"; // 🔑 Import Auth.js session context wrapper
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volume Sanctuary",
  description: "A secure digital bureau for intimate thoughts and shared circles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${caveat.variable} ${jakarta.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        {/* 🛡️ Secure all sub-pages under the global session observer */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}