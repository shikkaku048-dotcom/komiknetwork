"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const handleShare = async () => {
    const shareData = {
      title: `Baca ${title} di KomikNet`,
      text: `Baca komik ${title} hanya di KomikNet!`,
      url: url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link berhasil disalin ke clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      // REVISI: Gunakan transition-all, samakan efek hover & active dengan tombol lain
      className="bg-white border-2 border-gray-900 text-gray-900 font-mono font-bold uppercase tracking-widest py-3 px-0 md:px-6 w-12 md:w-auto shrink-0 flex items-center justify-center gap-2 transition-all duration-150 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1"
    >
      <Share2 className="w-4 h-4" /> 
      <span className="hidden md:inline">Share</span>
    </button>
  );
}