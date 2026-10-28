"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const handleBack = () => {
    // TRIK BRUTAL: Paksa pindah ke Katalog dengan Hard Reload.
    // Ini akan memotong semua cache dan bug scroll Next.js.
    window.location.href = "/katalog";
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Kembali
    </button>
  );
}