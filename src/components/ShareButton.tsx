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
      className="bg-white border-2 border-gray-900 text-gray-900 font-mono font-bold uppercase tracking-widest py-3 px-6 flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
    >
      <Share2 className="w-4 h-4" /> Share
    </button>
  );
}