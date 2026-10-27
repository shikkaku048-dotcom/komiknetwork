import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header"; 
import ConditionalHeader from "@/components/ConditionalHeader";
import Footer from "@/components/Footer"; 
import OptimizationNotice from "@/components/OptimizationNotice"; 
// import DownloadAppModal from "@/components/DownloadAppModal"; // <-- DISEMBUNYIKAN SEMENTARA
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://komiknet.site"), 
  title: {
    default: "KomikNet - Baca Komik, Manga, Manhwa, Manhua Terlengkap",
    template: "%s | KomikNet", 
  },
  description: "Platform baca komik online gratis. Tersedia ribuan Manga, Manhwa, Manhua, dan Komik dari berbagai sumber dengan update chapter terbaru.",
  keywords: ["baca komik", "komik online", "manga", "manhwa", "manhua", "komiknet"],
  authors: [{ name: "KomikNet" }],
  creator: "KomikNet",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://komiknet.site",
    title: "KomikNet - Baca Komik Online",
    description: "Baca ribuan komik, manga, manhwa, dan manhua terlengkap dan terbaru.",
    siteName: "KomikNet",
  },
  twitter: {
    card: "summary_large_image",
    title: "KomikNet - Baca Komik Online",
    description: "Baca ribuan komik, manga, manhwa, dan manhua terlengkap dan terbaru.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#f4f4f4] antialiased`}>
        
        {/* Script Midtrans */}
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive" 
        />
        
        {/* CARD MELAYANG OPTIMALISASI (Aktif) */}
        <OptimizationNotice />

        {/* IKLAN DOWNLOAD APK (Disembunyikan) */}
        {/* <DownloadAppModal /> */}

        {/* Header Utama */}
        <ConditionalHeader>
          <Header />
        </ConditionalHeader>

        {/* Konten Utama Website */}
        <div className="flex-grow flex flex-col w-full bg-[#f4f4f4]">
          {children}
        </div>
        
        {/* Footer */}
        <Footer />
        
      </body>
    </html>
  );
}